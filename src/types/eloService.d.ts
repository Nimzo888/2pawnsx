/**
 * Type definitions for the ELO rating service
 */

export interface EloCalculationResult {
  whiteNewRating: number;
  blackNewRating: number;
  whiteRatingChange: number;
  blackRatingChange: number;
}

export interface RatingHistoryItem {
  gameId: string;
  date: string;
  ratingChange: number;
  opponentId: string;
  result: string;
  playerColor: "white" | "black";
}

export interface RatingPoint {
  date: string;
  rating: number;
  formattedDate: string;
}
