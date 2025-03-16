import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface ChessboardProps {
  fen?: string;
  orientation?: "white" | "black";
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  interactive?: boolean;
  size?: number;
  highlightedSquares?: {
    square: string;
    type: "move" | "good" | "bad";
  }[];
  lastMove?: {
    from: string;
    to: string;
  };
  showCoordinates?: boolean;
}

const Chessboard = ({
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
  orientation = "white",
  onMove,
  interactive = true,
  size = 400,
  highlightedSquares = [],
}: ChessboardProps) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [board, setBoard] = useState<string[][]>([]);

  // Parse FEN string to get board position
  useEffect(() => {
    const parseFen = (fenString: string) => {
      const fenBoard = fenString.split(" ")[0];
      const rows = fenBoard.split("/");
      const newBoard: string[][] = [];

      rows.forEach((row) => {
        const newRow: string[] = [];
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (isNaN(parseInt(char))) {
            // It's a piece
            newRow.push(char);
          } else {
            // It's a number (empty squares)
            for (let j = 0; j < parseInt(char); j++) {
              newRow.push("");
            }
          }
        }
        newBoard.push(newRow);
      });

      setBoard(newBoard);
    };

    parseFen(fen);
  }, [fen]);

  const handleSquareClick = (row: number, col: number) => {
    if (!interactive) return;

    const file = String.fromCharCode(97 + col); // 'a' through 'h'
    const rank = 8 - row; // 1 through 8
    const square = `${file}${rank}`;

    if (selectedSquare) {
      // Second click - attempt to move
      if (selectedSquare !== square) {
        onMove?.({ from: selectedSquare, to: square });
      }
      setSelectedSquare(null);
    } else {
      // First click - select piece
      const piece = board[row][col];
      if (piece) {
        setSelectedSquare(square);
      }
    }
  };

  const getPieceImage = (piece: string) => {
    if (!piece) return null;

    const color = piece === piece.toUpperCase() ? "white" : "black";
    const pieceType = piece.toLowerCase();

    // Map FEN notation to piece names
    const pieceMap: Record<string, string> = {
      k: "king",
      q: "queen",
      r: "rook",
      b: "bishop",
      n: "knight",
      p: "pawn",
    };

    return `/assets/pieces/lichess/svg/${color}-${pieceMap[pieceType]}.svg`;
  };

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? "chess-white-square" : "chess-black-square";
  };

  const getSquareNotation = (row: number, col: number) => {
    const file = String.fromCharCode(97 + col); // 'a' through 'h'
    const rank = 8 - row; // 1 through 8
    return `${file}${rank}`;
  };

  const isSquareSelected = (row: number, col: number) => {
    if (!selectedSquare) return false;
    const square = getSquareNotation(row, col);
    return square === selectedSquare;
  };

  const getSquareHighlight = (row: number, col: number) => {
    const square = getSquareNotation(row, col);
    const highlight = highlightedSquares.find((h) => h.square === square);

    if (!highlight) return "";

    switch (highlight.type) {
      case "move":
        return "move-highlight";
      case "good":
        return "good-move-highlight";
      case "bad":
        return "bad-move-highlight";
      default:
        return "";
    }
  };

  // Render the board based on orientation
  const renderBoard = () => {
    const rows = [...Array(8).keys()];
    const cols = [...Array(8).keys()];

    const orderedRows = orientation === "white" ? rows : [...rows].reverse();
    const orderedCols = orientation === "white" ? cols : [...cols].reverse();

    return (
      <div className="grid grid-cols-8" style={{ width: size, height: size }}>
        {orderedRows.flatMap((row) =>
          orderedCols.map((col) => {
            const actualRow = orientation === "white" ? row : 7 - row;
            const actualCol = orientation === "white" ? col : 7 - col;
            const piece = board[actualRow]?.[actualCol] || "";
            const selected = isSquareSelected(actualRow, actualCol);
            const highlightClass = getSquareHighlight(actualRow, actualCol);

            return (
              <div
                key={`${row}-${col}`}
                className={`flex items-center justify-center relative ${getSquareColor(actualRow, actualCol)} ${highlightClass} ${selected ? "ring-2 ring-primary ring-inset" : ""}`}
                style={{ width: size / 8, height: size / 8 }}
                onClick={() => handleSquareClick(actualRow, actualCol)}
              >
                {piece && (
                  <img
                    src={getPieceImage(piece)}
                    alt={piece}
                    className="w-full h-full p-1 object-contain"
                    draggable={false}
                  />
                )}

                {/* Rank labels (1-8) on the first column */}
                {col === 0 && (
                  <div className="absolute top-0 left-0 text-xs p-0.5 font-bold font-mono">
                    {8 - actualRow}
                  </div>
                )}

                {/* File labels (a-h) on the last row */}
                {row === 7 && (
                  <div className="absolute bottom-0 right-0 text-xs p-0.5 font-bold font-mono">
                    {String.fromCharCode(97 + actualCol)}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
    );
  };

  return (
    <Card className="p-3 bg-card shadow-chess overflow-hidden rounded-lg border border-border chess-board-container">
      {board.length > 0 ? renderBoard() : <div>Loading chessboard...</div>}
    </Card>
  );
};

export default Chessboard;
