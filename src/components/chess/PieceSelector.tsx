import React from "react";
import { Card } from "@/components/ui/card";
import { getPiecePath } from "@/lib/chessPieces";

interface PieceSelectorProps {
  onSelect: (piece: string) => void;
  theme?: string;
}

const PieceSelector = ({ onSelect, theme = "lichess" }: PieceSelectorProps) => {
  // Standard chess pieces in FEN notation
  const whitePieces = ["K", "Q", "R", "B", "N", "P"];
  const blackPieces = ["k", "q", "r", "b", "n", "p"];

  return (
    <Card className="p-4 bg-card shadow-md">
      <div className="mb-2 font-medium">White Pieces</div>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {whitePieces.map((piece) => (
          <div
            key={piece}
            className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-muted rounded-md"
            onClick={() => onSelect(piece)}
          >
            <img
              src={getPiecePath(piece, theme)}
              alt={`White ${piece.toLowerCase()}`}
              className="w-10 h-10 object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="mb-2 font-medium">Black Pieces</div>
      <div className="grid grid-cols-6 gap-2">
        {blackPieces.map((piece) => (
          <div
            key={piece}
            className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-muted rounded-md"
            onClick={() => onSelect(piece)}
          >
            <img
              src={getPiecePath(piece, theme)}
              alt={`Black ${piece}`}
              className="w-10 h-10 object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PieceSelector;
