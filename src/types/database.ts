/**
 * Database types for the chess platform
 */

export interface UserProfileData {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  elo_rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
  premium_until?: string;
  preferences?: Record<string, any>;
}

export interface PostData {
  id: string;
  user_id: string;
  content?: string;
  description?: string;
  game_id?: string;
  image_url?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  likes?: number;
  comments?: number;
  profiles?: any[];
}

export interface NotificationData {
  id: string;
  user_id: string;
  type?:
    | "follow"
    | "like"
    | "comment"
    | "game_invite"
    | "game_turn"
    | "friend_request";
  actor_id?: string;
  post_id?: string;
  game_id?: string;
  content?: string;
  message: string;
  read?: boolean;
  is_read: boolean;
  created_at: string;
}

export interface GameData {
  id: string;
  white_player_id: string;
  black_player_id: string;
  status: "waiting" | "active" | "completed" | "abandoned";
  result?: "1-0" | "0-1" | "1/2-1/2" | "*";
  time_control: TimeControl;
  white_time_left?: number;
  black_time_left?: number;
  game_type?: GameType;
  rated?: boolean;
  initial_fen?: string;
  pgn?: string;
  created_at: string;
  updated_at: string;
  bot_level?: number;
  white_rating_change?: number;
  black_rating_change?: number;
  // Supabase generated fields
  ai_level?: number;
  analysis_complete?: boolean;
  analysis_depth?: number;
  black_id?: string;
  is_live?: boolean;
  is_public?: boolean;
  is_rated?: boolean;
  white_id?: string;
  winner_id?: string;
}

export interface TimeControl {
  minutes: number;
  increment: number;
}

export type GameType = "casual" | "rated" | "tournament" | "analysis";
