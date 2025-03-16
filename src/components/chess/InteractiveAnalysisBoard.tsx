import React, { useState, useEffect } from "react";
import ResponsiveChessboard from "./ResponsiveChessboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";

interface InteractiveAnalysisBoardProps {
  initialFen?: string;
  pgn?: string;
  moves?: Array<{
    san: string;
    fen: string;
    moveNumber: number;
    evaluation?: number;
  }>;
  onAnalysisRequest?: () => void;
}

const InteractiveAnalysisBoard: React.FC<InteractiveAnalysisBoardProps> = ({
  initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  pgn,
  moves = [],
  onAnalysisRequest,
}) => {
  const [currentPosition, setCurrentPosition] = useState(initialFen);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  useEffect(() => {
    if (moves.length > 0) {
      setCurrentPosition(moves[0].fen);
      setCurrentMoveIndex(0);
    } else {
      setCurrentPosition(initialFen);
      setCurrentMoveIndex(-1);
    }
  }, [moves, initialFen]);

  const goToMove = (index: number) => {
    if (index >= -1 && index < moves.length) {
      setCurrentMoveIndex(index);
      setCurrentPosition(index === -1 ? initialFen : moves[index].fen);
    }
  };

  const goToNext = () => {
    goToMove(currentMoveIndex + 1);
  };

  const goToPrevious = () => {
    goToMove(currentMoveIndex - 1);
  };

  const goToStart = () => {
    goToMove(-1);
  };

  const goToEnd = () => {
    goToMove(moves.length - 1);
  };

  const flipBoard = () => {
    setOrientation(orientation === "white" ? "black" : "white");
  };

  return (
    <div className="flex flex-col items-center">
      <ResponsiveChessboard
        fen={currentPosition}
        orientation={orientation}
        interactive={false}
        showCoordinates={true}
      />

      <div className="flex justify-center mt-4 space-x-2">
        <Button variant="outline" size="sm" onClick={goToStart}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={currentMoveIndex <= -1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentMoveIndex >= moves.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToEnd}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={flipBoard}>
          Flip Board
        </Button>
      </div>

      {moves.length > 0 && (
        <Card className="w-full mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 text-sm">
              {moves.map((move, index) => (
                <Button
                  key={index}
                  variant={currentMoveIndex === index ? "default" : "ghost"}
                  size="sm"
                  className="justify-start h-auto py-1 px-2"
                  onClick={() => goToMove(index)}
                >
                  <span className="mr-2 text-muted-foreground">
                    {Math.floor(index / 2) + 1}
                    {index % 2 === 0 ? "." : "..."}
                  </span>
                  {move.san}
                  {move.evaluation !== undefined && (
                    <span
                      className={`ml-auto ${move.evaluation > 0 ? "text-green-500" : move.evaluation < 0 ? "text-red-500" : "text-gray-500"}`}
                    >
                      {(move.evaluation / 100).toFixed(1)}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveAnalysisBoard;
