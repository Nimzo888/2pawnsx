import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Cpu,
  BarChart3,
  Lightbulb,
  Puzzle,
  BookOpen,
  Zap,
} from "lucide-react";
import Chessboard from "./Chessboard";
import MoveEvaluation from "./MoveEvaluation";
import { stockfish, StockfishInfo } from "@/lib/stockfish";
import { analysisService, MoveAnalysis } from "@/lib/analysisService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdvancedAnalysisBoardProps {
  pgn?: string;
  fen?: string;
  gameId?: string;
  moves?: MoveAnalysis[];
  onMoveSelect?: (index: number) => void;
  onAnalysisComplete?: (moves: MoveAnalysis[]) => void;
}

const AdvancedAnalysisBoard = ({
  pgn,
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  gameId,
  moves = [],
  onMoveSelect,
  onAnalysisComplete,
}: AdvancedAnalysisBoardProps) => {
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
  const [analysisDepth, setAnalysisDepth] = useState(18);
  const [activeTab, setActiveTab] = useState("moves");
  const [playerInsights, setPlayerInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [generatedPuzzles, setGeneratedPuzzles] = useState<any[]>([]);

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
      stockfish.setPosition(currentPosition);
      stockfish.setAnalysisDepth(analysisDepth);

      const handleAnalysis = (info: StockfishInfo) => {
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
        }
      };

      stockfish.analyze(handleAnalysis);
    } else {
      stockfish.stopAnalysis();
      setHighlightedSquares([]);
    }

    return () => {
      stockfish.stopAnalysis();
    };
  }, [isAnalyzing, currentPosition, analysisDepth]);

  const handleMoveChange = (index: number) => {
    if (index >= -1 && index < moves.length) {
      setCurrentMoveIndex(index);
      setCurrentPosition(index === -1 ? fen : moves[index].fen);
      onMoveSelect?.(index);

      // Set highlights based on move evaluation
      if (index >= 0 && moves[index].evaluation !== undefined) {
        const move = moves[index];
        let highlightType: "move" | "good" | "bad" = "move";

        if (move.isBlunder || move.isMistake) {
          highlightType = "bad";
        } else if (move.isBestMove) {
          highlightType = "good";
        }

        // In a real implementation, you'd determine the actual squares involved
        setHighlightedSquares([{ square: "e4", type: highlightType }]);
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

    setIsAnalyzing(false);

    // Start the analysis
    analysisService.startGameAnalysis(
      gameId,
      moves,
      (progress) => {
        // Handle progress updates if needed
        console.log(`Analysis progress: ${progress}%`);
      },
      (analyzedMoves) => {
        // Handle analysis completion
        onAnalysisComplete?.(analyzedMoves);
      },
    );

    // Show a notification or update UI to indicate analysis is in progress
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

  const loadPlayerInsights = async () => {
    if (!user) return;

    setIsLoadingInsights(true);
    try {
      const insights = await analysisService.getPlayerInsights(user.id);
      setPlayerInsights(insights);
    } catch (error) {
      console.error("Error loading player insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generatePuzzles = async () => {
    if (!gameId) return;

    try {
      await analysisService.generatePuzzlesFromGame(gameId);

      // Fetch the generated puzzles
      const { data, error } = await supabase
        .from("puzzles")
        .select("*")
        .eq("source_game_id", gameId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGeneratedPuzzles(data || []);

      alert("Puzzles generated successfully!");
    } catch (error) {
      console.error("Error generating puzzles:", error);
      alert("Failed to generate puzzles.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-card shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">
              Advanced Analysis
            </CardTitle>
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
                    <BarChart3 className="h-4 w-4" />
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
                      height: analysisInfo?.score
                        ? `${Math.min(
                            Math.max(
                              50 +
                                (analysisInfo.score.value /
                                  (analysisInfo.score.type === "mate"
                                    ? 1000
                                    : 100)) *
                                  5,
                              0,
                            ),
                            100,
                          )}%`
                        : "50%",
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="moves">Moves</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="puzzles">Puzzles</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[500px]">
            <TabsContent value="moves" className="mt-0">
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
                                {(whiteMove.isBlunder ||
                                  whiteMove.isMistake ||
                                  whiteMove.isInaccuracy ||
                                  whiteMove.isBestMove) && (
                                  <span className="ml-1">
                                    {whiteMove.isBlunder && "??"}
                                    {whiteMove.isMistake && "?"}
                                    {whiteMove.isInaccuracy && "!?"}
                                    {whiteMove.isBestMove && "!"}
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="py-2">
                              {blackMove && (
                                <button
                                  className={`px-2 py-1 rounded text-left w-full font-mono ${currentMoveIndex === blackIndex ? "bg-primary/20 font-medium" : "hover:bg-muted"}`}
                                  onClick={() => handleMoveChange(blackIndex)}
                                >
                                  {blackMove.san}
                                  {(blackMove.isBlunder ||
                                    blackMove.isMistake ||
                                    blackMove.isInaccuracy ||
                                    blackMove.isBestMove) && (
                                    <span className="ml-1">
                                      {blackMove.isBlunder && "??"}
                                      {blackMove.isMistake && "?"}
                                      {blackMove.isInaccuracy && "!?"}
                                      {blackMove.isBestMove && "!"}
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                            <td className="py-2 text-right">
                              {blackMove ? (
                                <MoveEvaluation
                                  evaluation={blackMove.evaluation}
                                  bestMove={blackMove.bestMove}
                                  isBlunder={blackMove.isBlunder}
                                  isMistake={blackMove.isMistake}
                                  isInaccuracy={blackMove.isInaccuracy}
                                  isBestMove={blackMove.isBestMove}
                                />
                              ) : (
                                <MoveEvaluation
                                  evaluation={whiteMove.evaluation}
                                  bestMove={whiteMove.bestMove}
                                  isBlunder={whiteMove.isBlunder}
                                  isMistake={whiteMove.isMistake}
                                  isInaccuracy={whiteMove.isInaccuracy}
                                  isBestMove={whiteMove.isBestMove}
                                />
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
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              {!playerInsights && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-center text-muted-foreground mb-4">
                    Get AI-powered insights about your chess style and
                    performance
                  </p>
                  <Button
                    onClick={loadPlayerInsights}
                    disabled={isLoadingInsights}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isLoadingInsights ? "Loading..." : "Generate Insights"}
                  </Button>
                </div>
              )}

              {playerInsights && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Player Insights</h3>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      AI-Powered
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                      <div className="text-2xl font-bold">
                        {playerInsights.averageAccuracy}%
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Blunder Rate
                      </div>
                      <div className="text-2xl font-bold">
                        {playerInsights.blunderRate}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      {playerInsights.averageAccuracy > 80 && (
                        <li>High accuracy in move selection</li>
                      )}
                      {playerInsights.blunderRate < 1 && (
                        <li>Excellent tactical awareness</li>
                      )}
                      <li>Solid endgame technique</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" /> Areas for Improvement
                    </h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      {playerInsights.weaknesses.map(
                        (weakness: string, i: number) => (
                          <li key={i}>{weakness}</li>
                        ),
                      )}
                      {playerInsights.weaknesses.length === 0 && (
                        <li>Continue practicing to maintain your level</li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Recommendations
                    </h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      {playerInsights.recommendations.map(
                        (rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ),
                      )}
                      {playerInsights.recommendations.length === 0 && (
                        <li>Study advanced positional concepts</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="puzzles" className="mt-0">
              <div className="space-y-4">
                {generatedPuzzles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Puzzle className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <p className="text-center text-muted-foreground mb-4">
                      Generate puzzles from the mistakes in this game
                    </p>
                    <Button
                      onClick={generatePuzzles}
                      className="flex items-center gap-2"
                    >
                      <Puzzle className="h-4 w-4" />
                      Generate Puzzles
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Generated Puzzles</h3>
                      <Badge variant="outline">
                        {generatedPuzzles.length} puzzles
                      </Badge>
                    </div>

                    {generatedPuzzles.map((puzzle, index) => (
                      <div key={index} className="bg-muted p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="capitalize">
                            {puzzle.difficulty}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Lightbulb className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Find the best move in this position</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <span>View Puzzle</span>
                              <Puzzle className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                Puzzle #{index + 1}
                              </h4>
                              <div className="aspect-square w-full max-w-[250px] mx-auto">
                                <Chessboard
                                  fen={puzzle.fen_position}
                                  size={250}
                                  interactive={false}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Find the best move for{" "}
                                {puzzle.fen_position.includes(" w ")
                                  ? "White"
                                  : "Black"}
                              </p>
                              <div className="pt-2 border-t border-border mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  Solve in Puzzle Mode
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalysisBoard;
