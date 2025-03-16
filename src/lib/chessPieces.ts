// Chess piece mapping utility

// Map FEN piece notation to piece names for SVG files
export const getPieceName = (piece: string): string => {
  if (!piece) return "";

  const color = piece === piece.toUpperCase() ? "white" : "black";
  let pieceType = piece.toLowerCase();

  // Map from FEN notation to piece names
  const pieceMap: Record<string, string> = {
    k: "king",
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
    p: "pawn",
  };

  return `${color}-${pieceMap[pieceType]}`;
};

// Get the path to the piece SVG
export const getPiecePath = (
  piece: string,
  theme: string = "lichess",
): string => {
  if (!piece) return "";

  const pieceName = getPieceName(piece);
  return `/assets/pieces/${theme}/svg/${pieceName}.svg`;
};
