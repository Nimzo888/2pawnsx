/**
 * User service for the chess platform
 * Handles user profiles, authentication, and preferences
 */

import { supabase } from "./supabase";
import { chessCache } from "./cache";
import { errorHandler } from "./errorHandler";
import { analytics } from "./analytics";
import { UserProfileData } from "../types/database";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  eloRating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
  premiumUntil?: string;
  preferences?: Record<string, any>;
}

interface UserStats {
  eloRating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameLength?: number;
  favoriteOpening?: string;
  longestWinStreak?: number;
  currentStreak?: number;
  puzzlesSolved?: number;
  puzzleRating?: number;
}

class UserService {
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      return this.getUserProfile(userData.user.id);
    } catch (error) {
      errorHandler.handleError(error, "Failed to get current user profile", {
        silent: true,
      });
      return null;
    }
  }

  /**
   * Get a user's profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Try to get from cache first
      const cachedProfile = chessCache.get<UserProfile>(`profile:${userId}`);
      if (cachedProfile) return cachedProfile;

      // Fetch from database
      const { data, error } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()) as { data: UserProfileData | null; error: any };

      if (error) throw error;

      // Check premium status
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (subscriptionError) throw subscriptionError;

      // Safely check expiration date with optional chaining
      const expiresAt =
        subscriptionData?.expires_at || subscriptionData?.current_period_end;
      const isPremium =
        subscriptionData && expiresAt && new Date(expiresAt) > new Date();

      // Format the response
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        bio: data.bio || "", // Provide default value if bio doesn't exist
        avatarUrl: data.avatar_url,
        eloRating: data.elo_rating || 1200, // Default to 1200 if not set
        gamesPlayed: data.games_played,
        wins: data.wins,
        losses: data.losses,
        draws: data.draws,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isPremium,
        premiumUntil:
          subscriptionData?.expires_at || subscriptionData?.current_period_end,
        preferences: data.preferences || {},
      };

      // Cache the profile
      chessCache.cacheUserProfile(userId, profile);

      return profile;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get user profile", {
        context: { userId },
        silent: true,
      });
      return null;
    }
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(updates: {
    username?: string;
    bio?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
  }): Promise<UserProfile | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const userId = userData.user.id;

      // Format the update data
      const updateData: Record<string, any> = {};
      if (updates.username !== undefined)
        updateData.username = updates.username;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatarUrl !== undefined)
        updateData.avatar_url = updates.avatarUrl;
      if (updates.preferences !== undefined)
        updateData.preferences = updates.preferences;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      // Remove from cache to force a refresh
      chessCache.remove(`profile:${userId}`);

      // Track profile update
      analytics.trackEvent("profile", "profile_updated", {
        fieldsUpdated: Object.keys(updates),
      });

      // Get the updated profile
      return this.getUserProfile(userId);
    } catch (error) {
      errorHandler.handleError(error, "Failed to update profile", {
        context: { updates },
      });
      return null;
    }
  }

  /**
   * Get a user's statistics
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return null;

      // Get additional stats from the database
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (statsError) throw statsError;

      // Format the response with safe access to potentially missing properties
      const stats: UserStats = {
        eloRating: profile.eloRating,
        gamesPlayed: profile.gamesPlayed,
        wins: profile.wins,
        losses: profile.losses,
        draws: profile.draws,
        winRate:
          profile.gamesPlayed > 0
            ? (profile.wins / profile.gamesPlayed) * 100
            : 0,
        // Safely access properties that might not exist in the database yet
        averageGameLength: statsData
          ? (statsData as any).average_game_length
          : undefined,
        favoriteOpening: statsData
          ? (statsData as any).favorite_opening
          : undefined,
        longestWinStreak: statsData
          ? (statsData as any).longest_win_streak
          : undefined,
        currentStreak: statsData
          ? (statsData as any).current_streak
          : undefined,
        puzzlesSolved: statsData
          ? (statsData as any).puzzles_solved
          : undefined,
        puzzleRating: statsData ? (statsData as any).puzzle_rating : undefined,
      };

      return stats;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get user stats", {
        context: { userId },
        silent: true,
      });
      return null;
    }
  }

  /**
   * Get a user's recent games
   */
  async getUserRecentGames(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          id, 
          white_player_id, 
          black_player_id, 
          result, 
          created_at, 
          time_control,
          white_profile:profiles!games_white_player_id_fkey(username),
          black_profile:profiles!games_black_player_id_fkey(username)
        `,
        )
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Format the response
      return data.map((game) => {
        const isWhite = game.white_player_id === userId;
        const opponent = isWhite
          ? game.black_profile.username
          : game.white_profile.username;
        const opponentId = isWhite
          ? game.black_player_id
          : game.white_player_id;

        let result: "win" | "loss" | "draw";
        if (game.result === "1-0") {
          result = isWhite ? "win" : "loss";
        } else if (game.result === "0-1") {
          result = isWhite ? "loss" : "win";
        } else {
          result = "draw";
        }

        return {
          id: game.id,
          opponent,
          opponentId,
          userColor: isWhite ? "white" : "black",
          result,
          date: game.created_at,
          timeControl: `${(game.time_control as any).minutes}+${(game.time_control as any).increment}`,
        };
      });
    } catch (error) {
      errorHandler.handleError(error, "Failed to get user recent games", {
        context: { userId, limit },
        silent: true,
      });
      return [];
    }
  }

  /**
   * Subscribe to premium
   */
  async subscribeToPremium(
    planId: string,
    paymentMethodId: string,
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // In a real implementation, this would integrate with a payment processor
      // For now, we'll just create a subscription record

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(now.getMonth() + 1); // 1 month subscription

      const { error } = await supabase.from("subscriptions").insert({
        user_id: userData.user.id,
        plan_id: planId,
        status: "active",
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_method_id: paymentMethodId,
      });

      if (error) throw error;

      // Remove profile from cache to force a refresh
      chessCache.remove(`profile:${userData.user.id}`);

      // Track subscription
      analytics.trackSubscriptionEvent("subscription_created", {
        planId,
        expiresAt: expiresAt.toISOString(),
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to subscribe to premium", {
        context: { planId, paymentMethodId },
      });
      return false;
    }
  }

  /**
   * Cancel premium subscription
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Get the active subscription
      const { data: subscriptionData, error: fetchError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      // Update the subscription status
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionData.id);

      if (updateError) throw updateError;

      // Remove profile from cache to force a refresh
      chessCache.remove(`profile:${userData.user.id}`);

      // Track cancellation
      analytics.trackSubscriptionEvent("subscription_cancelled", {
        subscriptionId: subscriptionData.id,
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to cancel subscription");
      return false;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
