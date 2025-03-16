/**
 * Game service for the chess platform
 * Handles game creation, moves, state management, and analysis
 */

import { supabase } from "./supabase";
import { chessCache } from "./cache";
import { errorHandler } from "./errorHandler";
import { analytics } from "./analytics";
import { stockfish } from "./stockfish";
import { GameData, TimeControl, GameType } from "../types/database";

// Types are now imported from types/database.ts

interface GameOptions {
  opponent?: string; // User ID of opponent, or 'bot' for computer
  timeControl: TimeControl;
  color?: "white" | "black" | "random";
  rated?: boolean;
  gameType?: GameType;
  botLevel?: number; // 1-8 for bot games
}

interface GameState {
  id: string;
  fen: string;
  pgn: string;
  moves: any[];
  whitePlayer: string;
  blackPlayer: string;
  status: "waiting" | "active" | "completed" | "abandoned";
  result?: "1-0" | "0-1" | "1/2-1/2" | "*";
  timeControl: TimeControl;
  whiteTime: number;
  blackTime: number;
  lastMoveTime?: string;
  gameType: GameType;
  rated: boolean;
}

class GameService {
  /**
   * Create a new game
   */
  async createGame(options: GameOptions): Promise<GameState | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const userId = userData.user.id;
      const color = options.color || "random";
      const actualColor =
        color === "random" ? (Math.random() > 0.5 ? "white" : "black") : color;

      const gameData = {
        white_player_id: actualColor === "white" ? userId : options.opponent,
        black_player_id: actualColor === "black" ? userId : options.opponent,
        time_control: options.timeControl,
        status:
          options.opponent === "bot"
            ? "active"
            : ("waiting" as "waiting" | "active" | "completed" | "abandoned"),
        game_type: options.gameType || "casual",
        rated: options.rated || false,
        bot_level: options.opponent === "bot" ? options.botLevel || 3 : null,
        initial_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = (await supabase
        .from("games")
        .insert({
          ...gameData,
          time_control: JSON.stringify(gameData.time_control),
        })
        .select()
        .single()) as { data: GameData | null; error: any };

      if (error) throw error;

      // Format the response
      const gameState: GameState = {
        id: data.id,
        fen:
          data.initial_fen ||
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        pgn: "",
        moves: [],
        whitePlayer: data.white_player_id,
        blackPlayer: data.black_player_id,
        status: data.status,
        timeControl: data.time_control as TimeControl,
        whiteTime: (data.time_control as TimeControl).minutes * 60,
        blackTime: (data.time_control as TimeControl).minutes * 60,
        gameType: data.game_type || "casual",
        rated: data.rated || false,
      };

      // Cache the game state
      chessCache.cacheGameState(gameState.id, gameState);

      // Track game creation
      analytics.trackGameEvent("game_created", {
        gameId: gameState.id,
        gameType: options.gameType,
        timeControl: `${options.timeControl.minutes}+${options.timeControl.increment}`,
        opponent: options.opponent,
        color: actualColor,
      });

      return gameState;
    } catch (error) {
      errorHandler.handleError(error, "Failed to create game", {
        context: { options },
      });
      return null;
    }
  }

  /**
   * Make a move in a game
   */
  async makeMove(
    gameId: string,
    move: { from: string; to: string; promotion?: string },
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Get current game state
      const { data: gameData, error: gameError } = (await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single()) as { data: GameData | null; error: any };

      if (gameError) throw gameError;
      if (gameData.status !== "active") throw new Error("Game is not active");

      // In a real implementation, validate the move with chess.js
      // For now, we'll just create a move record

      const moveData = {
        game_id: gameId,
        player_id: userData.user.id,
        move_uci: `${move.from}${move.to}${move.promotion || ""}`,
        move_san: `${move.from}-${move.to}`, // This would be properly formatted in a real implementation
        position_fen:
          "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2", // Example FEN
        move_number: 1, // This would be calculated in a real implementation
        created_at: new Date().toISOString(),
      };

      const { error: moveError } = await supabase
        .from("game_moves")
        .insert(moveData);

      if (moveError) throw moveError;

      // Track the move
      analytics.trackGameEvent("move_made", {
        gameId,
        move: `${move.from}-${move.to}`,
        moveNumber: 1,
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to make move", {
        context: { gameId, move },
      });
      return false;
    }
  }

  /**
   * Get a game by ID
   */
  async getGame(gameId: string): Promise<GameState | null> {
    try {
      // Try to get from cache first
      const cachedGame = chessCache.get<GameState>(`game:${gameId}`);
      if (cachedGame) return cachedGame;

      // Fetch from database
      const { data: gameData, error: gameError } = (await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single()) as { data: GameData | null; error: any };

      if (gameError) throw gameError;

      // Fetch moves
      const { data: movesData, error: movesError } = await supabase
        .from("game_moves")
        .select("*")
        .eq("game_id", gameId)
        .order("move_number", { ascending: true });

      if (movesError) throw movesError;

      // Format the response
      const gameState: GameState = {
        id: gameData.id,
        fen:
          movesData.length > 0
            ? movesData[movesData.length - 1].position_fen
            : gameData.initial_fen ||
              "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        pgn: "", // This would be generated in a real implementation
        moves: movesData,
        whitePlayer: gameData.white_player_id,
        blackPlayer: gameData.black_player_id,
        status: gameData.status,
        result: gameData.result,
        timeControl: gameData.time_control as TimeControl,
        whiteTime:
          gameData.white_time_left ||
          (gameData.time_control as TimeControl).minutes * 60,
        blackTime:
          gameData.black_time_left ||
          (gameData.time_control as TimeControl).minutes * 60,
        lastMoveTime:
          movesData.length > 0
            ? movesData[movesData.length - 1].created_at
            : null,
        gameType: gameData.game_type || "casual",
        rated: gameData.rated || false,
      };

      // Cache the game state
      chessCache.cacheGameState(gameId, gameState);

      return gameState;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get game", {
        context: { gameId },
      });
      return null;
    }
  }

  /**
   * Resign a game
   */
  async resignGame(gameId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("white_player_id, black_player_id, status, rated")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;
      if (gameData.status !== "active") throw new Error("Game is not active");

      const isWhite = gameData.white_player_id === userData.user.id;
      const isBlack = gameData.black_player_id === userData.user.id;

      if (!isWhite && !isBlack)
        throw new Error("You are not a player in this game");

      const result = isWhite ? "0-1" : "1-0";

      const { error: updateError } = await supabase
        .from("games")
        .update({
          status: "completed",
          result,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (updateError) throw updateError;

      // Remove from cache to force a refresh
      chessCache.remove(`game:${gameId}`);

      // Update ELO ratings if this was a rated game
      if (gameData.rated) {
        // Import dynamically to avoid circular dependency
        const { eloService } = await import("./eloService");
        await eloService.updatePlayerRatings(gameId);
      }

      // Track resignation
      analytics.trackGameEvent("game_resigned", {
        gameId,
        player: isWhite ? "white" : "black",
        result,
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to resign game", {
        context: { gameId },
      });
      return false;
    }
  }

  /**
   * Offer a draw in a game
   */
  async offerDraw(gameId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // In a real implementation, this would create a draw offer record
      // and notify the opponent

      // For now, we'll just log it
      console.log(`Draw offered in game ${gameId} by ${userData.user.id}`);

      // Track draw offer
      analytics.trackGameEvent("draw_offered", {
        gameId,
        player: userData.user.id,
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to offer draw", {
        context: { gameId },
      });
      return false;
    }
  }

  /**
   * Analyze a game with Stockfish
   */
  async analyzeGame(gameId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Get the game moves
      const { data: movesData, error: movesError } = await supabase
        .from("game_moves")
        .select("*")
        .eq("game_id", gameId)
        .order("move_number", { ascending: true });

      if (movesError) throw movesError;

      // Format moves for analysis
      const formattedMoves = movesData.map((move) => ({
        moveNumber: move.move_number,
        fen: move.position_fen,
        san: move.move_san,
      }));

      // Start analysis in the background
      stockfish.setAnalysisDepth(18);

      // In a real implementation, this would be handled by a background process
      // For now, we'll just analyze the first few moves as an example
      for (let i = 0; i < Math.min(formattedMoves.length, 3); i++) {
        const move = formattedMoves[i];
        stockfish.setPosition(move.fen);

        const analysisPromise = new Promise<void>((resolve) => {
          stockfish.analyze((info) => {
            if (info.bestMove) {
              console.log(`Analysis for move ${move.moveNumber}:`, info);
              resolve();
            }
          });
        });

        await analysisPromise;
      }

      // Track analysis request
      analytics.trackGameEvent("game_analyzed", {
        gameId,
        moveCount: formattedMoves.length,
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to analyze game", {
        context: { gameId },
      });
      return false;
    }
  }
}

// Export a singleton instance
export const gameService = new GameService();
