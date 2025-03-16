import { supabase } from "./supabase";
import { stockfish, StockfishInfo } from "./stockfish";
import { errorHandler } from "./errorHandler";
import { analytics } from "./analytics";

interface AnalysisResult {
  fen: string;
  depth: number;
  evaluation: number;
  bestMove: string;
  pv: string[];
  timestamp: string;
}

export interface MoveAnalysis {
  moveNumber: number;
  fen: string;
  san: string;
  evaluation?: number;
  bestMove?: string;
  pv?: string[];
  accuracy?: number;
  isBestMove?: boolean;
  isBlunder?: boolean;
  isMistake?: boolean;
  isInaccuracy?: boolean;
}

export class AnalysisService {
  private isAnalyzing = false;
  private currentGameId: string | null = null;
  private moveQueue: MoveAnalysis[] = [];
  private analysisResults: Record<string, AnalysisResult> = {};
  private analysisDepth = 18;
  private analysisCallbacks: {
    onProgress?: (progress: number) => void;
    onComplete?: (moves: MoveAnalysis[]) => void;
  } = {};

  /**
   * Get insights for a player
   */
  async getPlayerInsights(playerId: string): Promise<any> {
    try {
      // In a real implementation, this would query the database for player insights
      // For now, we'll return mock data
      return {
        averageAccuracy: 78,
        blunderRate: 1.2,
        weaknesses: [
          "Difficulty in complex endgames",
          "Tendency to rush moves in time pressure",
        ],
        recommendations: [
          "Practice knight endgames",
          "Focus on calculation in complex positions",
        ],
      };
    } catch (error) {
      console.error("Error getting player insights:", error);
      if (errorHandler) {
        errorHandler.handleError(error, "Failed to get player insights");
      }
      return null;
    }
  }

  /**
   * Generate puzzles from a game
   */
  async generatePuzzlesFromGame(gameId: string): Promise<boolean> {
    try {
      // In a real implementation, this would analyze the game and create puzzles
      // For now, we'll simulate the process

      // Get the game data
      const { data: gameData, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) throw error;

      // Create some mock puzzles based on the game
      const puzzles = [
        {
          source_game_id: gameId,
          fen_position:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
          solution: "d7d5",
          difficulty: "easy",
          created_at: new Date().toISOString(),
        },
        {
          source_game_id: gameId,
          fen_position:
            "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          solution: "f1b5",
          difficulty: "medium",
          created_at: new Date().toISOString(),
        },
      ];

      // Insert the puzzles into the database
      const { error: insertError } = await supabase
        .from("puzzles")
        .insert(puzzles);

      if (insertError) throw insertError;

      return true;
    } catch (error) {
      console.error("Error generating puzzles:", error);
      if (errorHandler) {
        errorHandler.handleError(error, "Failed to generate puzzles");
      }
      return false;
    }
  }

  /**
   * Start analyzing a game
   */
  public startGameAnalysis(
    gameId: string,
    moves: MoveAnalysis[],
    onProgress?: (progress: number) => void,
    onComplete?: (moves: MoveAnalysis[]) => void,
  ) {
    if (this.isAnalyzing) {
      this.stopAnalysis();
    }

    this.currentGameId = gameId;
    this.moveQueue = [...moves];
    this.analysisResults = {};
    this.isAnalyzing = true;
    this.analysisCallbacks = { onProgress, onComplete };
    this.analyzeNextMove();

    // Track analysis start
    if (analytics) {
      analytics.trackEvent("game", "game_analysis_started", {
        gameId,
        moveCount: moves.length,
      });
    }
  }

  /**
   * Analyze a specific position
   */
  public analyzePosition(fen: string): Promise<StockfishInfo> {
    return new Promise((resolve) => {
      stockfish.setPosition(fen);
      stockfish.setAnalysisDepth(this.analysisDepth);
      let latestInfo: StockfishInfo = {};

      const handleInfo = (info: StockfishInfo) => {
        latestInfo = { ...latestInfo, ...info };

        // When we get a bestMove, the analysis is complete
        if (info.bestMove) {
          stockfish.stopAnalysis();
          resolve(latestInfo);
        }
      };

      stockfish.analyze(handleInfo);
    });
  }

  /**
   * Process the analysis queue
   */
  private async analyzeNextMove() {
    if (!this.isAnalyzing || this.moveQueue.length === 0) {
      this.finishAnalysis();
      return;
    }

    const move = this.moveQueue.shift();
    if (!move) return;

    stockfish.setPosition(move.fen);
    stockfish.setAnalysisDepth(this.analysisDepth);

    let latestInfo: StockfishInfo = {};

    const handleAnalysis = (info: StockfishInfo) => {
      latestInfo = { ...latestInfo, ...info };

      // When we get a bestMove, the analysis is complete
      if (info.bestMove) {
        this.saveAnalysisResult(move, latestInfo);
        stockfish.stopAnalysis();

        // Update progress
        const progress = Math.round(
          (this.moveQueue.length / (this.moveQueue.length + 1)) * 100,
        );
        if (this.analysisCallbacks.onProgress) {
          this.analysisCallbacks.onProgress(progress);
        }

        setTimeout(() => this.analyzeNextMove(), 100); // Small delay between analyses
      }
    };

    stockfish.analyze(handleAnalysis);
  }

  /**
   * Save analysis results to memory and database
   */
  private async saveAnalysisResult(move: MoveAnalysis, info: StockfishInfo) {
    if (!this.currentGameId || !info.score || !info.depth) return;

    // Update the move with analysis data
    move.evaluation =
      info.score.type === "cp"
        ? info.score.value
        : info.score.type === "mate"
          ? 10000 * Math.sign(info.score.value)
          : undefined;
    move.bestMove = info.bestMove;
    move.pv = info.pv;

    // Determine move quality
    if (move.moveNumber > 1) {
      this.evaluateMoveQuality(move);
    }

    // Save to in-memory cache
    this.analysisResults[move.fen] = {
      fen: move.fen,
      depth: info.depth || 0,
      evaluation: move.evaluation || 0,
      bestMove: move.bestMove || "",
      pv: move.pv || [],
      timestamp: new Date().toISOString(),
    };

    // Save to database
    try {
      await supabase.from("move_analysis").upsert({
        game_id: this.currentGameId,
        move_number: move.moveNumber,
        fen_position: move.fen,
        san_notation: move.san,
        evaluation: move.evaluation,
        best_move: move.bestMove,
        principal_variation: move.pv?.join(" "),
        accuracy: move.accuracy,
        is_best_move: move.isBestMove,
        is_blunder: move.isBlunder,
        is_mistake: move.isMistake,
        is_inaccuracy: move.isInaccuracy,
        depth: info.depth,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving analysis to database:", error);
      if (errorHandler) {
        errorHandler.handleError(error, "Failed to save analysis to database");
      }
    }
  }

  /**
   * Evaluate the quality of a move based on evaluation difference
   */
  private evaluateMoveQuality(move: MoveAnalysis) {
    // In a real implementation, this would compare the current move's evaluation
    // with the previous move and the best move to determine quality
    // For now, we'll use a simplified approach

    // Simulate move quality based on evaluation
    if (!move.evaluation) return;

    const evalAbs = Math.abs(move.evaluation);

    // Simplified logic - in a real implementation this would be more sophisticated
    move.isBestMove = Math.random() > 0.7;
    move.isBlunder = evalAbs > 300 && Math.random() > 0.7;
    move.isMistake = !move.isBlunder && evalAbs > 100 && Math.random() > 0.6;
    move.isInaccuracy =
      !move.isBlunder && !move.isMistake && evalAbs > 50 && Math.random() > 0.5;

    // Calculate move accuracy (0-100)
    move.accuracy = Math.max(0, Math.min(100, 100 - Math.floor(evalAbs / 10)));
  }

  /**
   * Stop the current analysis
   */
  public stopAnalysis() {
    this.isAnalyzing = false;
    stockfish.stopAnalysis();
    this.moveQueue = [];
  }

  /**
   * Finish analysis and save complete game analysis
   */
  private async finishAnalysis() {
    if (!this.currentGameId) return;

    try {
      // Calculate game statistics
      const moves = Object.values(this.analysisResults).map((result) => ({
        fen: result.fen,
        evaluation: result.evaluation,
        accuracy: 0, // Will be calculated below
      }));

      // Calculate accuracy scores
      this.calculateAccuracyScores(moves);

      // Update the game record to indicate analysis is complete
      await supabase
        .from("games")
        .update({ analysis_complete: true, analysis_depth: this.analysisDepth })
        .eq("id", this.currentGameId);

      // Notify completion
      if (this.analysisCallbacks.onComplete) {
        // Convert the moves back to the expected format
        const analyzedMoves = Object.values(this.analysisResults).map(
          (result) => ({
            moveNumber: 0, // This would be set properly in a real implementation
            fen: result.fen,
            san: "", // This would be set properly in a real implementation
            evaluation: result.evaluation,
            bestMove: result.bestMove,
            pv: result.pv,
            accuracy: 85, // Placeholder
          }),
        );

        this.analysisCallbacks.onComplete(analyzedMoves);
      }

      // Track analysis completion
      if (analytics) {
        analytics.trackEvent("game", "game_analysis_completed", {
          gameId: this.currentGameId,
          moveCount: Object.keys(this.analysisResults).length,
        });
      }

      console.log(`Analysis complete for game ${this.currentGameId}`);
    } catch (error) {
      console.error("Error updating game analysis status:", error);
      if (errorHandler) {
        errorHandler.handleError(
          error,
          "Failed to update game analysis status",
        );
      }
    }

    this.currentGameId = null;
    this.analysisResults = {};
    this.analysisCallbacks = {};
  }

  /**
   * Calculate accuracy scores for the entire game
   */
  private calculateAccuracyScores(moves: any[]) {
    // In a real implementation, this would calculate accuracy based on evaluation differences
    // For now, we'll use a simplified approach
    moves.forEach((move) => {
      if (!move.accuracy) {
        move.accuracy = Math.floor(Math.random() * 100);
      }
    });
  }
}

export const analysisService = new AnalysisService();
