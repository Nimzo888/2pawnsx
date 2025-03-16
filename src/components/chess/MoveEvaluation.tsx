import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoveEvaluationProps {
  evaluation?: number | null;
  bestMove?: string;
  isBestMove?: boolean;
  isBlunder?: boolean;
  isMistake?: boolean;
  isInaccuracy?: boolean;
}

const MoveEvaluation = ({
  evaluation,
  bestMove,
  isBestMove = false,
  isBlunder = false,
  isMistake = false,
  isInaccuracy = false,
}: MoveEvaluationProps) => {
  const formatEvaluation = (eval_?: number | null) => {
    if (eval_ === undefined || eval_ === null) return "0.0";

    // Convert to white's perspective
    const evalValue = eval_ / 100;
    const sign = evalValue > 0 ? "+" : "";
    return `${sign}${evalValue.toFixed(1)}`;
  };

  const getEvaluationColor = (eval_?: number | null) => {
    if (eval_ === undefined || eval_ === null) return "text-muted-foreground";
    if (eval_ > 50) return "text-secondary";
    if (eval_ < -50) return "text-destructive";
    return "text-muted-foreground";
  };

  const getMoveQualityBadge = () => {
    if (isBestMove) {
      return (
        <Badge
          variant="outline"
          className="bg-secondary/10 text-secondary border-secondary/20"
        >
          Best
        </Badge>
      );
    } else if (isBlunder) {
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          Blunder
        </Badge>
      );
    } else if (isMistake) {
      return (
        <Badge
          variant="outline"
          className="bg-warning/10 text-warning border-warning/20"
        >
          Mistake
        </Badge>
      );
    } else if (isInaccuracy) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          Inaccuracy
        </Badge>
      );
    }
    return null;
  };

  const badge = getMoveQualityBadge();

  return (
    <div className="flex items-center space-x-2">
      <span className={`font-mono ${getEvaluationColor(evaluation)}`}>
        {formatEvaluation(evaluation)}
      </span>
      {badge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{badge}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {isBestMove && "This is the best move in this position"}
                {isBlunder && "This move loses significant advantage"}
                {isMistake && "This move loses some advantage"}
                {isInaccuracy && "This move is slightly suboptimal"}
                {bestMove && ` (Best: ${bestMove})`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default MoveEvaluation;
