export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          difficulty: string | null
          icon_url: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          difficulty?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          difficulty?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analysis: {
        Row: {
          comments: string | null
          created_at: string
          depth: number | null
          engine_name: string | null
          evaluation_data: Json | null
          game_id: string
          id: string
          is_public: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          depth?: number | null
          engine_name?: string | null
          evaluation_data?: Json | null
          game_id: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          depth?: number | null
          engine_name?: string | null
          evaluation_data?: Json | null
          game_id?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_cache: {
        Row: {
          analysis: Json
          created_at: string | null
          fen: string
          id: string
        }
        Insert: {
          analysis: Json
          created_at?: string | null
          fen: string
          id?: string
        }
        Update: {
          analysis?: Json
          created_at?: string | null
          fen?: string
          id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_analyses: {
        Row: {
          analysis_data: Json
          created_at: string | null
          game_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          analysis_data: Json
          created_at?: string | null
          game_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          game_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_analyses_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_analysis: {
        Row: {
          analyzed_at: string | null
          black_accuracy: number | null
          black_blunders: number | null
          game_id: string | null
          id: string
          white_accuracy: number | null
          white_blunders: number | null
        }
        Insert: {
          analyzed_at?: string | null
          black_accuracy?: number | null
          black_blunders?: number | null
          game_id?: string | null
          id?: string
          white_accuracy?: number | null
          white_blunders?: number | null
        }
        Update: {
          analyzed_at?: string | null
          black_accuracy?: number | null
          black_blunders?: number | null
          game_id?: string | null
          id?: string
          white_accuracy?: number | null
          white_blunders?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_analysis_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_chat: {
        Row: {
          created_at: string
          game_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_chat_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_moves: {
        Row: {
          created_at: string | null
          evaluation: number | null
          game_id: string
          id: string
          move_number: number
          move_san: string
          player_id: string | null
          position_fen: string
          time_spent: number | null
        }
        Insert: {
          created_at?: string | null
          evaluation?: number | null
          game_id: string
          id?: string
          move_number: number
          move_san: string
          player_id?: string | null
          position_fen: string
          time_spent?: number | null
        }
        Update: {
          created_at?: string | null
          evaluation?: number | null
          game_id?: string
          id?: string
          move_number?: number
          move_san?: string
          player_id?: string | null
          position_fen?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_states: {
        Row: {
          created_at: string | null
          game_id: string
          state: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          state: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          state?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_states_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_viewers: {
        Row: {
          game_id: string
          id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          game_id: string
          id?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          game_id?: string
          id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_viewers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          ai_level: number | null
          analysis_complete: boolean | null
          analysis_depth: number | null
          black_id: string | null
          black_player_id: string | null
          black_rating_change: number | null
          created_at: string | null
          id: string
          is_live: boolean | null
          is_public: boolean | null
          is_rated: boolean | null
          last_activity: string | null
          loser_id: string | null
          pgn: string | null
          result: Database["public"]["Enums"]["game_result"] | null
          spectator_count: number | null
          status: Database["public"]["Enums"]["game_status"]
          time_control: Json
          updated_at: string | null
          white_id: string | null
          white_player_id: string | null
          white_rating_change: number | null
          winner_id: string | null
        }
        Insert: {
          ai_level?: number | null
          analysis_complete?: boolean | null
          analysis_depth?: number | null
          black_id?: string | null
          black_player_id?: string | null
          black_rating_change?: number | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          is_public?: boolean | null
          is_rated?: boolean | null
          last_activity?: string | null
          loser_id?: string | null
          pgn?: string | null
          result?: Database["public"]["Enums"]["game_result"] | null
          spectator_count?: number | null
          status?: Database["public"]["Enums"]["game_status"]
          time_control?: Json
          updated_at?: string | null
          white_id?: string | null
          white_player_id?: string | null
          white_rating_change?: number | null
          winner_id?: string | null
        }
        Update: {
          ai_level?: number | null
          analysis_complete?: boolean | null
          analysis_depth?: number | null
          black_id?: string | null
          black_player_id?: string | null
          black_rating_change?: number | null
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          is_public?: boolean | null
          is_rated?: boolean | null
          last_activity?: string | null
          loser_id?: string | null
          pgn?: string | null
          result?: Database["public"]["Enums"]["game_result"] | null
          spectator_count?: number | null
          status?: Database["public"]["Enums"]["game_status"]
          time_control?: Json
          updated_at?: string | null
          white_id?: string | null
          white_player_id?: string | null
          white_rating_change?: number | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_black_player_id_fkey"
            columns: ["black_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_loser_id_fkey"
            columns: ["loser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_white_player_id_fkey"
            columns: ["white_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_pgn: {
        Row: {
          id: string
          imported_at: string | null
          name: string
          pgn: string
          tags: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          imported_at?: string | null
          name: string
          pgn: string
          tags?: Json | null
          user_id: string
        }
        Update: {
          id?: string
          imported_at?: string | null
          name?: string
          pgn?: string
          tags?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          game_id: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      move_analysis: {
        Row: {
          accuracy: number | null
          best_move: string | null
          created_at: string | null
          depth: number | null
          evaluation: number | null
          fen_position: string
          game_id: string
          id: string
          is_best_move: boolean | null
          is_blunder: boolean | null
          is_inaccuracy: boolean | null
          is_mistake: boolean | null
          move_number: number
          principal_variation: string | null
          san_notation: string
        }
        Insert: {
          accuracy?: number | null
          best_move?: string | null
          created_at?: string | null
          depth?: number | null
          evaluation?: number | null
          fen_position: string
          game_id: string
          id?: string
          is_best_move?: boolean | null
          is_blunder?: boolean | null
          is_inaccuracy?: boolean | null
          is_mistake?: boolean | null
          move_number: number
          principal_variation?: string | null
          san_notation: string
        }
        Update: {
          accuracy?: number | null
          best_move?: string | null
          created_at?: string | null
          depth?: number | null
          evaluation?: number | null
          fen_position?: string
          game_id?: string
          id?: string
          is_best_move?: boolean | null
          is_blunder?: boolean | null
          is_inaccuracy?: boolean | null
          is_mistake?: boolean | null
          move_number?: number
          principal_variation?: string | null
          san_notation?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_analysis_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      move_annotations: {
        Row: {
          annotation: string
          created_at: string
          evaluation_symbol: string | null
          id: string
          move_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annotation: string
          created_at?: string
          evaluation_symbol?: string | null
          id?: string
          move_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annotation?: string
          created_at?: string
          evaluation_symbol?: string | null
          id?: string
          move_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_annotations_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moves: {
        Row: {
          best_line: string | null
          best_move: string | null
          created_at: string
          evaluation: number | null
          fen_position: string
          game_id: string
          id: string
          is_capture: boolean | null
          is_check: boolean | null
          is_checkmate: boolean | null
          move_number: number
          piece_moved: string | null
          player_id: string | null
          principal_variation: string | null
          san_notation: string
          time_spent: number | null
        }
        Insert: {
          best_line?: string | null
          best_move?: string | null
          created_at?: string
          evaluation?: number | null
          fen_position: string
          game_id: string
          id?: string
          is_capture?: boolean | null
          is_check?: boolean | null
          is_checkmate?: boolean | null
          move_number: number
          piece_moved?: string | null
          player_id?: string | null
          principal_variation?: string | null
          san_notation: string
          time_spent?: number | null
        }
        Update: {
          best_line?: string | null
          best_move?: string | null
          created_at?: string
          evaluation?: number | null
          fen_position?: string
          game_id?: string
          id?: string
          is_capture?: boolean | null
          is_check?: boolean | null
          is_checkmate?: boolean | null
          move_number?: number
          piece_moved?: string | null
          player_id?: string | null
          principal_variation?: string | null
          san_notation?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moves_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments: number | null
          created_at: string
          description: string | null
          id: string
          likes: number | null
          pgn: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments?: number | null
          created_at?: string
          description?: string | null
          id?: string
          likes?: number | null
          pgn?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments?: number | null
          created_at?: string
          description?: string | null
          id?: string
          likes?: number | null
          pgn?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          draws: number | null
          elo: number | null
          elo_rating: number | null
          email: string | null
          full_name: string | null
          games_played: number | null
          id: string
          is_premium: boolean | null
          losses: number | null
          rating: number | null
          updated_at: string
          user_id: string | null
          username: string
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          draws?: number | null
          elo?: number | null
          elo_rating?: number | null
          email?: string | null
          full_name?: string | null
          games_played?: number | null
          id?: string
          is_premium?: boolean | null
          losses?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          username: string
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          draws?: number | null
          elo?: number | null
          elo_rating?: number | null
          email?: string | null
          full_name?: string | null
          games_played?: number | null
          id?: string
          is_premium?: boolean | null
          losses?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      puzzles: {
        Row: {
          continuation: string | null
          created_at: string | null
          difficulty: string | null
          fen_position: string
          id: string
          rating: number | null
          solution: string
          source_game_id: string | null
          source_move_number: number | null
          times_attempted: number | null
          times_solved: number | null
          updated_at: string | null
        }
        Insert: {
          continuation?: string | null
          created_at?: string | null
          difficulty?: string | null
          fen_position: string
          id?: string
          rating?: number | null
          solution: string
          source_game_id?: string | null
          source_move_number?: number | null
          times_attempted?: number | null
          times_solved?: number | null
          updated_at?: string | null
        }
        Update: {
          continuation?: string | null
          created_at?: string | null
          difficulty?: string | null
          fen_position?: string
          id?: string
          rating?: number | null
          solution?: string
          source_game_id?: string | null
          source_move_number?: number | null
          times_attempted?: number | null
          times_solved?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puzzles_source_game_id_fkey"
            columns: ["source_game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_history: {
        Row: {
          change: number
          created_at: string
          game_id: string | null
          id: string
          new_rating: number
          prev_rating: number
          user_id: string
        }
        Insert: {
          change: number
          created_at?: string
          game_id?: string | null
          id?: string
          new_rating: number
          prev_rating: number
          user_id: string
        }
        Update: {
          change?: number
          created_at?: string
          game_id?: string | null
          id?: string
          new_rating?: number
          prev_rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          expires_at: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_games: {
        Row: {
          board_number: number | null
          created_at: string
          game_id: string
          id: string
          round: number
          tournament_id: string
        }
        Insert: {
          board_number?: number | null
          created_at?: string
          game_id: string
          id?: string
          round: number
          tournament_id: string
        }
        Update: {
          board_number?: number | null
          created_at?: string
          game_id?: string
          id?: string
          round?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_games_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          final_rank: number | null
          id: string
          score: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          final_rank?: number | null
          id?: string
          score?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          final_rank?: number | null
          id?: string
          score?: number | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          creator_id: string | null
          description: string | null
          end_date: string | null
          format: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          name: string
          prize: string | null
          start_date: string | null
          status: string
          time_control: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          end_date?: string | null
          format: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          name: string
          prize?: string | null
          start_date?: string | null
          status: string
          time_control?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          end_date?: string | null
          format?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          name?: string
          prize?: string | null
          start_date?: string | null
          status?: string
          time_control?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          notification_settings: Json | null
          preferred_time_control: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          preferred_time_control?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          preferred_time_control?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          average_game_length: number | null
          created_at: string | null
          current_streak: number | null
          favorite_opening: string | null
          id: string
          longest_win_streak: number | null
          puzzle_rating: number | null
          puzzles_solved: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_game_length?: number | null
          created_at?: string | null
          current_streak?: number | null
          favorite_opening?: string | null
          id?: string
          longest_win_streak?: number | null
          puzzle_rating?: number | null
          puzzles_solved?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_game_length?: number | null
          created_at?: string | null
          current_streak?: number | null
          favorite_opening?: string | null
          id?: string
          longest_win_streak?: number | null
          puzzle_rating?: number | null
          puzzles_solved?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          draws: number | null
          elo_rating: number | null
          email: string
          friends: string[] | null
          games_played: number | null
          id: string
          is_private: boolean | null
          losses: number | null
          tournament_wins: number | null
          updated_at: string | null
          username: string
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          draws?: number | null
          elo_rating?: number | null
          email: string
          friends?: string[] | null
          games_played?: number | null
          id?: string
          is_private?: boolean | null
          losses?: number | null
          tournament_wins?: number | null
          updated_at?: string | null
          username: string
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          draws?: number | null
          elo_rating?: number | null
          email?: string
          friends?: string[] | null
          games_played?: number | null
          id?: string
          is_private?: boolean | null
          losses?: number | null
          tournament_wins?: number | null
          updated_at?: string | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_post_likes: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: Json
      }
      increment: {
        Args: {
          row_id: string
          table_name: string
          column_name: string
        }
        Returns: number
      }
      increment_post_comments: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      increment_post_likes: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      game_result: "1-0" | "0-1" | "1/2-1/2"
      game_status: "waiting" | "active" | "completed" | "abandoned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
