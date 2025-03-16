import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from "lucide-react";
import Chessboard from "./Chessboard";
import { stockfish, StockfishInfo } from "@/lib/stockfish";
import { analysisService, MoveAnalysis } from "@/lib/analysisService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

interface AnalysisBoardProps {
  pgn?: string;
  fen?: string;
  gameId?: string;
  moves?: Array<{
    san: string;
    fen: string;
    moveNumber: number;
    evaluation?: number;
    bestMove?: string;
    pv?: string[];
  }>;
  onMoveSelect?: (index: number) => void;
  onAnalysisComplete?: (moves: MoveAnalysis[]) => void;
}

const AnalysisBoard = ({
  pgn,
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  gameId,
  moves = [],
  onMoveSelect,
  onAnalysisComplete,
}: AnalysisBoardProps) => {
  const { user } = useAuth();
  const [currentPosition, setCurrentPosition] = useState(fen);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState<StockfishInfo | null>(null);
  const [autoplaySpeed, setAutoplaySpeed] = useState(1000); // ms between moves
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [highlightedSquares, setHighlightedSquares] = useState<
    Array<{ square: string; type: "move" | "good" | "bad" }>
  >([]);

  // Initialize with moves if provided
  useEffect(() => {
    if (moves.length > 0) {
      setCurrentPosition(moves[0].fen);
      setCurrentMoveIndex(0);
    } else {
      setCurrentPosition(fen);
      setCurrentMoveIndex(-1);
    }
  }, [moves, fen]);

  // Handle autoplay
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying && currentMoveIndex < moves.length - 1) {
      interval = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= moves.length) {
            setIsAutoPlaying(false);
            return prev;
          }
          setCurrentPosition(moves[nextIndex].fen);
          return nextIndex;
        });
      }, autoplaySpeed);
    }

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentMoveIndex, moves, autoplaySpeed]);

  // Handle Stockfish analysis
  useEffect(() => {
    if (isAnalyzing) {
      // For single position analysis
      const analyzeCurrentPosition = async () => {
        try {
          const info = await analysisService.analyzePosition(currentPosition);
          setAnalysisInfo(info);

          // Set move highlights based on analysis
          if (info.pv && info.pv.length > 0) {
            const bestMove = info.pv[0].substring(0, 4); // e.g., "e2e4"
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);

            setHighlightedSquares([
              { square: from, type: "move" },
              { square: to, type: "good" },
            ]);

            // Save this analysis to the database if we have a gameId and user
            if (gameId && user && currentMoveIndex >= 0) {
              const currentMove = moves[currentMoveIndex];
              await supabase.from("move_analysis").upsert({
                game_id: gameId,
                move_number: currentMove.moveNumber,
                fen_position: currentPosition,
                san_notation: currentMove.san,
                evaluation: info.score?.value,
                best_move: info.bestMove,
                principal_variation: info.pv?.join(" "),
                depth: info.depth,
                created_at: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error("Error analyzing position:", error);
        }
      };

      analyzeCurrentPosition();
    } else {
      stockfish.stopAnalysis();
      setHighlightedSquares([]);
    }

    return () => {
      stockfish.stopAnalysis();
    };
  }, [isAnalyzing, currentPosition, currentMoveIndex, gameId, moves, user]);

  const handleMoveChange = (index: number) => {
    if (index >= -1 && index < moves.length) {
      setCurrentMoveIndex(index);
      setCurrentPosition(index === -1 ? fen : moves[index].fen);
      onMoveSelect?.(index);

      // Set highlights based on move evaluation
      if (index >= 0 && moves[index].evaluation !== undefined) {
        const evaluation = moves[index].evaluation || 0;
        // This is simplified - in a real app you'd determine the actual squares involved in the move
        const highlightType =
          evaluation > 50 ? "good" : evaluation < -50 ? "bad" : "move";
        setHighlightedSquares([{ square: "e4", type: highlightType }]); // Example square
      } else {
        setHighlightedSquares([]);
      }
    }
  };

  const toggleAnalysis = () => {
    setIsAnalyzing(!isAnalyzing);
  };

  // Analyze the entire game
  const analyzeFullGame = async () => {
    if (!gameId || moves.length === 0) return;

    // Convert moves to the format expected by analysisService
    const movesToAnalyze: MoveAnalysis[] = moves.map((move) => ({
      moveNumber: move.moveNumber,
      fen: move.fen,
      san: move.san,
      evaluation: move.evaluation,
      bestMove: move.bestMove,
      pv: move.pv,
    }));

    // Start the analysis
    analysisService.startGameAnalysis(gameId, movesToAnalyze);

    // Show a notification or update UI to indicate analysis is in progress
    // This would typically be handled by a toast notification
    alert("Full game analysis started. This may take several minutes.");
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const flipBoard = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  const formatEvaluation = (evaluation?: number | null) => {
    if (evaluation === undefined || evaluation === null) return "0.0";

    // Convert to white's perspective
    const evalValue = evaluation / 100;
    const sign = evalValue > 0 ? "+" : "";
    return `${sign}${evalValue.toFixed(1)}`;
  };

  const formatStockfishEval = (info: StockfishInfo | null) => {
    if (!info || !info.score) return "0.0";

    if (info.score.type === "mate") {
      return `M${info.score.value}`;
    } else {
      const evalValue = info.score.value / 100;
      const sign = evalValue > 0 ? "+" : "";
      return `${sign}${evalValue.toFixed(1)}`;
    }
  };

  const getEvaluationColor = (evaluation?: number | null) => {
    if (evaluation === undefined || evaluation === null)
      return "text-muted-foreground";
    if (evaluation > 50) return "text-secondary";
    if (evaluation < -50) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-card shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Analysis Board</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={flipBoard}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant={isAnalyzing ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAnalysis}
                  className="h-8 flex items-center gap-1"
                >
                  <Cpu className="h-4 w-4" />
                  {isAnalyzing ? "Stop Engine" : "Start Engine"}
                </Button>
                {gameId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeFullGame}
                    className="h-8 flex items-center gap-1"
                  >
                    <Cpu className="h-4 w-4" />
                    Analyze Game
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="flex w-full">
                {/* Evaluation bar */}
                <div className="w-4 h-[400px] mr-2 bg-muted rounded-sm overflow-hidden relative">
                  <div
                    className="absolute bottom-0 left-0 w-full evaluation-bar"
                    style={{
                      height: "50%", // Default to 50% (equal position)
                      // In a real app, calculate this based on evaluation
                    }}
                  />
                </div>

                <Chessboard
                  fen={currentPosition}
                  orientation={orientation}
                  size={400}
                  interactive={false}
                  highlightedSquares={highlightedSquares}
                />
              </div>

              {isAnalyzing && analysisInfo && (
                <div className="mt-3 w-full bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="font-mono">
                      Depth: {analysisInfo.depth || 0}
                    </Badge>
                    <span
                      className={`font-mono text-lg font-bold ${getEvaluationColor(analysisInfo.score?.value)}`}
                    >
                      {formatStockfishEval(analysisInfo)}
                    </span>
                  </div>
                  {analysisInfo.pv && analysisInfo.pv.length > 0 && (
                    <div className="mt-2 text-sm font-mono overflow-x-auto whitespace-nowrap">
                      Best line: {analysisInfo.pv.slice(0, 5).join(" ")}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 w-full flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveChange(-1)}
                  disabled={currentMoveIndex === -1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveChange(currentMoveIndex - 1)}
                  disabled={currentMoveIndex <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={isAutoPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAutoplay}
                  disabled={currentMoveIndex >= moves.length - 1}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveChange(currentMoveIndex + 1)}
                  disabled={currentMoveIndex >= moves.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveChange(moves.length - 1)}
                  disabled={
                    currentMoveIndex === moves.length - 1 || moves.length === 0
                  }
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Autoplay speed slider */}
              {isAutoPlaying && (
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Slow</span>
                    <span className="text-xs text-muted-foreground">Fast</span>
                  </div>
                  <Slider
                    value={[autoplaySpeed]}
                    min={200}
                    max={2000}
                    step={100}
                    onValueChange={(value) => setAutoplaySpeed(2200 - value[0])} // Invert so higher = faster
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="bg-card shadow-md h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Move Analysis</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[500px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 w-[15%] font-medium">#</th>
                  <th className="pb-2 w-[35%] font-medium">White</th>
                  <th className="pb-2 w-[35%] font-medium">Black</th>
                  <th className="pb-2 w-[15%] font-medium">Eval</th>
                </tr>
              </thead>
              <tbody>
                {moves.length > 0 ? (
                  Array.from({ length: Math.ceil(moves.length / 2) }).map(
                    (_, i) => {
                      const whiteIndex = i * 2;
                      const blackIndex = i * 2 + 1;
                      const whiteMove = moves[whiteIndex];
                      const blackMove = moves[blackIndex];

                      return (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-2 text-muted-foreground font-mono">
                            {i + 1}.
                          </td>
                          <td className="py-2">
                            <button
                              className={`px-2 py-1 rounded text-left w-full font-mono ${currentMoveIndex === whiteIndex ? "bg-primary/20 font-medium" : "hover:bg-muted"}`}
                              onClick={() => handleMoveChange(whiteIndex)}
                            >
                              {whiteMove.san}
                            </button>
                          </td>
                          <td className="py-2">
                            {blackMove && (
                              <button
                                className={`px-2 py-1 rounded text-left w-full font-mono ${currentMoveIndex === blackIndex ? "bg-primary/20 font-medium" : "hover:bg-muted"}`}
                                onClick={() => handleMoveChange(blackIndex)}
                              >
                                {blackMove.san}
                              </button>
                            )}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {blackMove ? (
                              <span
                                className={getEvaluationColor(
                                  blackMove.evaluation,
                                )}
                              >
                                {formatEvaluation(blackMove.evaluation)}
                              </span>
                            ) : (
                              <span
                                className={getEvaluationColor(
                                  whiteMove.evaluation,
                                )}
                              >
                                {formatEvaluation(whiteMove.evaluation)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No moves to analyze
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisBoard;
