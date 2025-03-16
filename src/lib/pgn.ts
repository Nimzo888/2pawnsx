/**
 * PGN utility for the chess platform
 * Handles PGN parsing, importing, and exporting
 */

import { supabase } from "./supabase";
import { errorHandler } from "./errorHandler";

interface PgnTags {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  WhiteElo?: string;
  BlackElo?: string;
  TimeControl?: string;
  [key: string]: string | undefined;
}

interface ParsedPgn {
  tags: PgnTags;
  moves: string[];
  result: string;
  fen?: string;
}

class PgnService {
  /**
   * Parse a PGN string into structured data
   */
  parsePgn(pgn: string): ParsedPgn {
    const tags: PgnTags = {};
    const moves: string[] = [];
    let result = "*";

    // Extract tags
    const tagRegex = /\[(\w+)\s+"([^"]*)"]\s*/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(pgn)) !== null) {
      const [, name, value] = tagMatch;
      tags[name] = value;
      if (name === "Result") {
        result = value;
      }
    }

    // Extract moves
    const moveTextRegex = /\]\s*\n\s*\n(.*)/s;
    const moveTextMatch = moveTextRegex.exec(pgn);
    if (moveTextMatch) {
      const moveText = moveTextMatch[1];
      // Remove comments, variations, and result
      const cleanedMoveText = moveText
        .replace(/\{[^}]*\}/g, "") // Remove comments
        .replace(/\([^)]*\)/g, "") // Remove variations
        .replace(/\s*(?:1-0|0-1|1\/2-1\/2|\*)\s*$/, ""); // Remove result

      // Extract moves
      const moveRegex = /\d+\.\s*([\w-=+#]+)(?:\s*([\w-=+#]+))?/g;
      let moveMatch;
      while ((moveMatch = moveRegex.exec(cleanedMoveText)) !== null) {
        if (moveMatch[1]) moves.push(moveMatch[1]);
        if (moveMatch[2]) moves.push(moveMatch[2]);
      }
    }

    return { tags, moves, result };
  }

  /**
   * Import a PGN file for a user
   */
  async importPgn(
    userId: string,
    pgn: string,
    name?: string,
  ): Promise<boolean> {
    try {
      const parsedPgn = this.parsePgn(pgn);
      const pgnName = name || parsedPgn.tags.Event || "Imported Game";

      const { error } = await supabase.from("imported_pgn").insert({
        user_id: userId,
        name: pgnName,
        pgn,
        tags: parsedPgn.tags,
        imported_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to import PGN", {
        context: { userId },
      });
      return false;
    }
  }

  /**
   * Export a game as PGN
   */
  async exportGameAsPgn(gameId: string): Promise<string | null> {
    try {
      const { data, error } = (await supabase
        .from("games")
        .select(
          `
          id, 
          white_player_id, 
          black_player_id, 
          result, 
          created_at, 
          time_control,
          pgn,
          game_type,
          rated,
          white_profile:profiles!games_white_player_id_fkey(username, elo_rating),
          black_profile:profiles!games_black_player_id_fkey(username, elo_rating)
        `,
        )
        .eq("id", gameId)
        .single()) as { data: any; error: any };

      if (error) throw error;

      // If the game already has a PGN, return it
      if (data && data.pgn) return data.pgn;

      // Otherwise, construct a basic PGN
      const tags: PgnTags = {
        Event: `2pawns ${data?.game_type || "casual"} game`,
        Site: "2pawns.com",
        Date: new Date(data?.created_at || new Date())
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "."),
        White: data?.white_profile?.username || "Anonymous",
        Black: data?.black_profile?.username || "Anonymous",
        Result: data?.result || "*",
        TimeControl: `${data?.time_control?.minutes || 5}+${data?.time_control?.increment || 0}`,
      };

      if (data?.white_profile?.elo_rating) {
        tags.WhiteElo = data.white_profile.elo_rating.toString();
      }

      if (data?.black_profile?.elo_rating) {
        tags.BlackElo = data.black_profile.elo_rating.toString();
      }

      if (data?.rated) {
        tags.Rated = "Yes";
      }

      // Format the PGN
      let pgn = "";
      for (const [key, value] of Object.entries(tags)) {
        if (value) pgn += `[${key} "${value}"]\n`;
      }
      pgn += "\n";

      // Get moves
      const { data: moves, error: movesError } = await supabase
        .from("game_moves")
        .select("move_number, move_san")
        .eq("game_id", gameId)
        .order("move_number", { ascending: true });

      if (movesError) throw movesError;

      // Format moves
      if (moves && moves.length > 0) {
        let currentMoveNumber = 1;
        for (let i = 0; i < moves.length; i++) {
          const move = moves[i];
          if (i % 2 === 0) {
            pgn += `${currentMoveNumber}. ${move.move_san} `;
          } else {
            pgn += `${move.move_san} `;
            currentMoveNumber++;
          }

          // Add line breaks for readability
          if (i % 10 === 9) pgn += "\n";
        }
      }

      // Add result
      pgn += data?.result || "*";

      return pgn;
    } catch (error) {
      errorHandler.handleError(error, "Failed to export game as PGN", {
        context: { gameId },
      });
      return null;
    }
  }
}

// Export a singleton instance
export const pgnService = new PgnService();
