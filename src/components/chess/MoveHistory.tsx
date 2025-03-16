import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Move {
  san: string;
  fen: string;
  moveNumber: number;
  timeSpent?: number;
  evaluation?: number;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCapture?: boolean;
}

interface MoveHistoryProps {
  moves?: Move[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

const MoveHistory = ({
  moves = [],
  currentMoveIndex = -1,
  onMoveClick,
}: MoveHistoryProps) => {
  // Group moves into pairs (white and black)
  const groupedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Format evaluation as +/- with 2 decimal places
  const formatEvaluation = (evaluation?: number) => {
    if (evaluation === undefined) return "";
    const sign = evaluation > 0 ? "+" : "";
    return `${sign}${evaluation.toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Move History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="w-[15%] pb-2">#</th>
                <th className="w-[40%] pb-2">White</th>
                <th className="w-[40%] pb-2">Black</th>
              </tr>
            </thead>
            <tbody>
              {groupedMoves.map((group, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 text-muted-foreground">
                    {group.number}.
                  </td>
                  <td className="py-2">
                    {group.white && (
                      <button
                        className={`px-2 py-1 rounded ${index * 2 === currentMoveIndex ? "bg-primary/20 font-medium" : "hover:bg-gray-100"}`}
                        onClick={() => onMoveClick?.(index * 2)}
                      >
                        <span className="mr-1">{group.white.san}</span>
                        {group.white.evaluation !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {formatEvaluation(group.white.evaluation)}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-2">
                    {group.black && (
                      <button
                        className={`px-2 py-1 rounded ${index * 2 + 1 === currentMoveIndex ? "bg-primary/20 font-medium" : "hover:bg-gray-100"}`}
                        onClick={() => onMoveClick?.(index * 2 + 1)}
                      >
                        <span className="mr-1">{group.black.san}</span>
                        {group.black.evaluation !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {formatEvaluation(group.black.evaluation)}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {moves.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No moves yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MoveHistory;
