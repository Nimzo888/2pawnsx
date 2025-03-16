/**
 * ELO Rating Service
 * Implements the ELO rating system for chess games
 */

import { supabase } from "./supabase";
import { errorHandler } from "./errorHandler";
import { analytics } from "./analytics";
import { GameData } from "../types/database";

interface EloCalculationResult {
  whiteNewRating: number;
  blackNewRating: number;
  whiteRatingChange: number;
  blackRatingChange: number;
}

class EloService {
  // Default K-factor values
  private readonly DEFAULT_K_FACTOR = 20;
  private readonly NEW_PLAYER_K_FACTOR = 40; // Higher K-factor for new players (< 30 games)
  private readonly EXPERIENCED_PLAYER_K_FACTOR = 10; // Lower K-factor for experienced players (> 100 games)

  // Rating floors and ceilings
  private readonly MIN_RATING = 100;
  private readonly MAX_RATING = 3000;

  // Games threshold for provisional status
  private readonly PROVISIONAL_THRESHOLD = 30;

  /**
   * Calculate new ELO ratings after a game
   */
  async calculateNewRatings(
    gameId: string,
  ): Promise<EloCalculationResult | null> {
    try {
      // Get game data
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;
      if (!gameData) throw new Error("Game not found");
      if (!gameData.rated)
        throw new Error("Cannot calculate ELO for unrated games");
      if (gameData.status !== "completed")
        throw new Error("Cannot calculate ELO for incomplete games");
      if (!gameData.result) throw new Error("Game has no result");

      // Get player profiles
      const { data: whitePlayers, error: whiteError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", gameData.white_player_id)
        .single();

      const { data: blackPlayers, error: blackError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", gameData.black_player_id)
        .single();

      if (whiteError) throw whiteError;
      if (blackError) throw blackError;

      const whitePlayer = whitePlayers;
      const blackPlayer = blackPlayers;

      if (!whitePlayer || !blackPlayer)
        throw new Error("Player profiles not found");

      // Calculate K-factors based on experience
      const whiteKFactor = this.getKFactor(whitePlayer.games_played);
      const blackKFactor = this.getKFactor(blackPlayer.games_played);

      // Get current ratings
      const whiteRating = whitePlayer.elo_rating;
      const blackRating = blackPlayer.elo_rating;

      // Calculate expected scores
      const whiteExpected = this.getExpectedScore(whiteRating, blackRating);
      const blackExpected = this.getExpectedScore(blackRating, whiteRating);

      // Calculate actual scores based on game result
      let whiteActual = 0.5; // Draw by default
      let blackActual = 0.5;

      if (gameData.result === "1-0") {
        whiteActual = 1;
        blackActual = 0;
      } else if (gameData.result === "0-1") {
        whiteActual = 0;
        blackActual = 1;
      }

      // Calculate new ratings
      const whiteNewRating = Math.round(
        whiteRating + whiteKFactor * (whiteActual - whiteExpected),
      );
      const blackNewRating = Math.round(
        blackRating + blackKFactor * (blackActual - blackExpected),
      );

      // Apply rating floors and ceilings
      const whiteAdjustedRating = Math.max(
        this.MIN_RATING,
        Math.min(this.MAX_RATING, whiteNewRating),
      );
      const blackAdjustedRating = Math.max(
        this.MIN_RATING,
        Math.min(this.MAX_RATING, blackNewRating),
      );

      // Calculate rating changes
      const whiteRatingChange = whiteAdjustedRating - whiteRating;
      const blackRatingChange = blackAdjustedRating - blackRating;

      // Track the rating changes
      analytics.trackGameEvent("rating_updated", {
        gameId,
        whiteId: whitePlayer.id,
        blackId: blackPlayer.id,
        whiteRatingBefore: whiteRating,
        blackRatingBefore: blackRating,
        whiteRatingAfter: whiteAdjustedRating,
        blackRatingAfter: blackAdjustedRating,
        whiteRatingChange,
        blackRatingChange,
      });

      return {
        whiteNewRating: whiteAdjustedRating,
        blackNewRating: blackAdjustedRating,
        whiteRatingChange,
        blackRatingChange,
      };
    } catch (error) {
      errorHandler.handleError(error, "Failed to calculate ELO ratings", {
        context: { gameId },
      });
      return null;
    }
  }

  /**
   * Update player ratings after a game
   */
  async updatePlayerRatings(gameId: string): Promise<boolean> {
    try {
      const ratingResults = await this.calculateNewRatings(gameId);
      if (!ratingResults) return false;

      // Get game data to update player profiles
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("white_player_id, black_player_id, result")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;

      // Update white player profile
      const { error: whiteUpdateError } = await supabase
        .from("profiles")
        .update({
          elo_rating: ratingResults.whiteNewRating,
          games_played: supabase.rpc("increment", {
            row_id: gameData.white_player_id,
            table_name: "profiles",
            column_name: "games_played",
          }),
          wins:
            gameData.result === "1-0"
              ? supabase.rpc("increment", {
                  row_id: gameData.white_player_id,
                  table_name: "profiles",
                  column_name: "wins",
                })
              : undefined,
          losses:
            gameData.result === "0-1"
              ? supabase.rpc("increment", {
                  row_id: gameData.white_player_id,
                  table_name: "profiles",
                  column_name: "losses",
                })
              : undefined,
          draws:
            gameData.result === "1/2-1/2"
              ? supabase.rpc("increment", {
                  row_id: gameData.white_player_id,
                  table_name: "profiles",
                  column_name: "draws",
                })
              : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameData.white_player_id);

      if (whiteUpdateError) throw whiteUpdateError;

      // Update black player profile
      const { error: blackUpdateError } = await supabase
        .from("profiles")
        .update({
          elo_rating: ratingResults.blackNewRating,
          games_played: supabase.rpc("increment", {
            row_id: gameData.black_player_id,
            table_name: "profiles",
            column_name: "games_played",
          }),
          wins:
            gameData.result === "0-1"
              ? supabase.rpc("increment", {
                  row_id: gameData.black_player_id,
                  table_name: "profiles",
                  column_name: "wins",
                })
              : undefined,
          losses:
            gameData.result === "1-0"
              ? supabase.rpc("increment", {
                  row_id: gameData.black_player_id,
                  table_name: "profiles",
                  column_name: "losses",
                })
              : undefined,
          draws:
            gameData.result === "1/2-1/2"
              ? supabase.rpc("increment", {
                  row_id: gameData.black_player_id,
                  table_name: "profiles",
                  column_name: "draws",
                })
              : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameData.black_player_id);

      if (blackUpdateError) throw blackUpdateError;

      // Update game with rating changes
      const { error: gameUpdateError } = await supabase
        .from("games")
        .update({
          white_rating_change: ratingResults.whiteRatingChange,
          black_rating_change: ratingResults.blackRatingChange,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (gameUpdateError) throw gameUpdateError;

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to update player ratings", {
        context: { gameId },
      });
      return false;
    }
  }

  /**
   * Get player's rating history
   */
  async getRatingHistory(userId: string, limit = 20): Promise<any[] | null> {
    try {
      // Get games where the player participated
      const { data: whiteGames, error: whiteError } = await supabase
        .from("games")
        .select(
          "id, result, created_at, white_rating_change, black_rating_change, black_player_id",
        )
        .eq("white_player_id", userId)
        .eq("status", "completed")
        .eq("rated", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (whiteError) throw whiteError;

      const { data: blackGames, error: blackError } = await supabase
        .from("games")
        .select(
          "id, result, created_at, white_rating_change, black_rating_change, white_player_id",
        )
        .eq("black_player_id", userId)
        .eq("status", "completed")
        .eq("rated", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (blackError) throw blackError;

      // Combine and sort games
      const allGames = [...whiteGames, ...blackGames]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit);

      // Format the rating history
      const ratingHistory = allGames.map((game) => {
        const isWhite = game.black_player_id !== undefined;
        return {
          gameId: game.id,
          date: game.created_at,
          ratingChange: isWhite
            ? game.white_rating_change
            : game.black_rating_change,
          opponentId: isWhite ? game.black_player_id : game.white_player_id,
          result: game.result,
          playerColor: isWhite ? "white" : "black",
        };
      });

      return ratingHistory;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get rating history", {
        context: { userId, limit },
      });
      return null;
    }
  }

  /**
   * Check if a player has a provisional rating (less than threshold games)
   */
  async isProvisionalRating(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("games_played")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return profile.games_played < this.PROVISIONAL_THRESHOLD;
    } catch (error) {
      errorHandler.handleError(
        error,
        "Failed to check provisional rating status",
        {
          context: { userId },
        },
      );
      return true; // Default to provisional if there's an error
    }
  }

  /**
   * Get appropriate K-factor based on player experience
   */
  private getKFactor(gamesPlayed: number): number {
    if (gamesPlayed < this.PROVISIONAL_THRESHOLD) {
      return this.NEW_PLAYER_K_FACTOR;
    } else if (gamesPlayed > 100) {
      return this.EXPERIENCED_PLAYER_K_FACTOR;
    } else {
      return this.DEFAULT_K_FACTOR;
    }
  }

  /**
   * Calculate expected score based on ELO difference
   */
  private getExpectedScore(
    playerRating: number,
    opponentRating: number,
  ): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }
}

// Export a singleton instance
export const eloService = new EloService();
