import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Cpu, Info } from "lucide-react";
import { stockfish, StockfishInfo } from "@/lib/stockfish";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnalysisPanelProps {
  fen: string;
  onBestMoveFound?: (move: string) => void;
}

const AnalysisPanel = ({ fen, onBestMoveFound }: AnalysisPanelProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState<StockfishInfo | null>(null);
  const [analysisDepth, setAnalysisDepth] = useState(18);

  useEffect(() => {
    if (isAnalyzing) {
      stockfish.setPosition(fen);
      stockfish.setAnalysisDepth(analysisDepth);

      const handleAnalysis = (info: StockfishInfo) => {
        setAnalysisInfo((prev) => ({ ...prev, ...info }));

        // Notify parent component when best move is found
        if (info.bestMove && onBestMoveFound) {
          onBestMoveFound(info.bestMove);
        }
      };

      stockfish.analyze(handleAnalysis);
    } else {
      stockfish.stopAnalysis();
    }

    return () => {
      stockfish.stopAnalysis();
    };
  }, [isAnalyzing, fen, analysisDepth, onBestMoveFound]);

  const toggleAnalysis = () => {
    setIsAnalyzing(!isAnalyzing);
  };

  const formatEvaluation = (info: StockfishInfo | null) => {
    if (!info || !info.score) return "0.0";

    if (info.score.type === "mate") {
      return `M${info.score.value}`;
    } else {
      const evalValue = info.score.value / 100;
      const sign = evalValue > 0 ? "+" : "";
      return `${sign}${evalValue.toFixed(1)}`;
    }
  };

  const getEvaluationColor = (info: StockfishInfo | null) => {
    if (!info || !info.score) return "text-muted-foreground";
    if (info.score.type === "mate") {
      return info.score.value > 0 ? "text-secondary" : "text-destructive";
    }
    if (info.score.value > 50) return "text-secondary";
    if (info.score.value < -50) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card className="bg-card shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Engine Analysis</CardTitle>
        <Button
          variant={isAnalyzing ? "default" : "outline"}
          size="sm"
          onClick={toggleAnalysis}
          className="h-8 flex items-center gap-1"
        >
          <Cpu className="h-4 w-4" />
          {isAnalyzing ? "Stop Engine" : "Start Engine"}
        </Button>
      </CardHeader>
      <CardContent>
        {isAnalyzing && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  Depth: {analysisInfo?.depth || 0}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Higher depth = stronger analysis but slower
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span
                className={`font-mono text-lg font-bold ${getEvaluationColor(analysisInfo)}`}
              >
                {formatEvaluation(analysisInfo)}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analysis Depth</span>
                <span>{analysisDepth}</span>
              </div>
              <Slider
                value={[analysisDepth]}
                min={8}
                max={24}
                step={1}
                onValueChange={(value) => {
                  setAnalysisDepth(value[0]);
                  stockfish.setAnalysisDepth(value[0]);
                }}
              />
            </div>

            {analysisInfo?.pv && analysisInfo.pv.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Best line:</p>
                <div className="text-sm font-mono overflow-x-auto whitespace-nowrap bg-muted p-2 rounded-md">
                  {analysisInfo.pv.slice(0, 5).join(" ")}
                </div>
              </div>
            )}

            {analysisInfo?.bestMove && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Best move:</p>
                <Badge className="font-mono">{analysisInfo.bestMove}</Badge>
              </div>
            )}
          </div>
        )}

        {!isAnalyzing && (
          <div className="py-8 text-center text-muted-foreground">
            <Cpu className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Click "Start Engine" to analyze this position</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
