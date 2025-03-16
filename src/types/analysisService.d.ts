import { StockfishInfo } from "../lib/stockfish";

declare module "../lib/analysisService" {
  export interface MoveAnalysis {
    fen: string;
    san: string;
    move: string;
    evaluation?: number;
    bestMove?: string;
    isBlunder?: boolean;
    isMistake?: boolean;
    isInaccuracy?: boolean;
    isBestMove?: boolean;
  }

  export interface AnalysisService {
    getPlayerInsights(playerId: string): Promise<any>;
    generatePuzzlesFromGame(gameId: string): Promise<boolean>;
    startGameAnalysis(
      gameId: string,
      moves: MoveAnalysis[],
      onProgress?: (progress: number) => void,
      onComplete?: (moves: MoveAnalysis[]) => void,
    ): void;
    analyzePosition(fen: string): Promise<StockfishInfo>;
    stopAnalysis(): void;
  }
}
