/**
 * Social service for the chess platform
 * Handles social interactions, posts, follows, and notifications
 */

import { supabase } from "./supabase";
import { chessCache } from "./cache";
import { errorHandler } from "./errorHandler";
import { analytics } from "./analytics";
import { PostData, NotificationData } from "../types/database";

interface Post {
  id: string;
  userId: string;
  content: string;
  gameId?: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  username?: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  username?: string;
  avatarUrl?: string;
}

interface Notification {
  id: string;
  userId: string;
  type:
    | "follow"
    | "like"
    | "comment"
    | "game_invite"
    | "game_turn"
    | "friend_request";
  actorId?: string;
  postId?: string;
  gameId?: string;
  content: string;
  read: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatar?: string;
}

class SocialService {
  /**
   * Create a new post
   */
  async createPost(
    content: string,
    gameId?: string,
    imageUrl?: string,
  ): Promise<Post | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const postData = {
        user_id: userData.user.id,
        content,
        game_id: gameId,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = (await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single()) as { data: PostData | null; error: any };

      if (error) throw error;

      // Format the response
      const post: Post = {
        id: data.id,
        userId: data.user_id,
        content: data.content || "",
        gameId: data.game_id || null,
        imageUrl: data.image_url || null,
        createdAt: data.created_at,
        likes: 0,
        comments: 0,
      };

      // Track post creation
      analytics.trackSocialInteraction("post_created", {
        postId: post.id,
        hasGame: !!gameId,
        hasImage: !!imageUrl,
        contentLength: content.length,
      });

      return post;
    } catch (error) {
      errorHandler.handleError(error, "Failed to create post", {
        context: { content, gameId },
      });
      return null;
    }
  }

  /**
   * Get social feed
   */
  async getFeed(limit: number = 10, offset: number = 0): Promise<Post[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Get users the current user follows
      const { data: followsData, error: followsError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userData.user.id);

      if (followsError) throw followsError;

      const followingIds = followsData.map((follow) => follow.following_id);
      followingIds.push(userData.user.id); // Include user's own posts

      // Get posts from followed users
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, profiles:user_id(username, avatar_url)")
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) throw postsError;

      // Format the response
      const posts: Post[] = postsData.map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        content: post.content || post.description || "",
        gameId: post.game_id || null,
        imageUrl: post.image_url || null,
        createdAt: post.created_at,
        likes: post.likes || post.likes_count || 0,
        comments: post.comments || post.comments_count || 0,
        username:
          post.profiles &&
          typeof post.profiles === "object" &&
          post.profiles.username
            ? post.profiles.username
            : undefined,
        avatarUrl:
          post.profiles &&
          typeof post.profiles === "object" &&
          post.profiles.avatar_url
            ? post.profiles.avatar_url
            : undefined,
      }));

      return posts;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get feed", {
        context: { limit, offset },
      });
      return [];
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingLike) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);

        if (unlikeError) throw unlikeError;

        // Update post likes count
        await supabase.rpc("decrement_post_likes", { post_id: postId });

        // Track unlike
        analytics.trackSocialInteraction("post_unliked", { postId });
      } else {
        // Like
        const { error: likeError } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: userData.user.id,
          created_at: new Date().toISOString(),
        });

        if (likeError) throw likeError;

        // Update post likes count
        await supabase.rpc("increment_post_likes", { post_id: postId });

        // Create notification for post owner
        const { data: postData } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (postData && postData.user_id !== userData.user.id) {
          await this.createNotification({
            userId: postData.user_id,
            type: "like",
            actorId: userData.user.id,
            postId,
            content: "liked your post",
          });
        }

        // Track like
        analytics.trackSocialInteraction("post_liked", { postId });
      }

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to like post", {
        context: { postId },
      });
      return false;
    }
  }

  /**
   * Comment on a post
   */
  async commentOnPost(
    postId: string,
    content: string,
  ): Promise<Comment | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const commentData = {
        post_id: postId,
        user_id: userData.user.id,
        content,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("comments")
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;

      // Update post comments count
      await supabase.rpc("increment_post_comments", { post_id: postId });

      // Create notification for post owner
      const { data: postData } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (postData && postData.user_id !== userData.user.id) {
        await this.createNotification({
          userId: postData.user_id,
          type: "comment",
          actorId: userData.user.id,
          postId,
          content: "commented on your post",
        });
      }

      // Format the response
      const comment: Comment = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        content: data.content,
        createdAt: data.created_at,
      };

      // Track comment
      analytics.trackSocialInteraction("comment_created", {
        postId,
        commentId: comment.id,
        contentLength: content.length,
      });

      return comment;
    } catch (error) {
      errorHandler.handleError(error, "Failed to comment on post", {
        context: { postId, content },
      });
      return null;
    }
  }

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      if (userId === userData.user.id)
        throw new Error("Cannot follow yourself");

      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", userData.user.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingFollow) {
        // Unfollow
        const { error: unfollowError } = await supabase
          .from("follows")
          .delete()
          .eq("id", existingFollow.id);

        if (unfollowError) throw unfollowError;

        // Track unfollow
        analytics.trackSocialInteraction("user_unfollowed", {
          targetUserId: userId,
        });
      } else {
        // Follow
        const { error: followError } = await supabase.from("follows").insert({
          follower_id: userData.user.id,
          following_id: userId,
          created_at: new Date().toISOString(),
        });

        if (followError) throw followError;

        // Create notification
        await this.createNotification({
          userId,
          type: "follow",
          actorId: userData.user.id,
          content: "started following you",
        });

        // Track follow
        analytics.trackSocialInteraction("user_followed", {
          targetUserId: userId,
        });
      }

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to follow user", {
        context: { userId },
      });
      return false;
    }
  }

  /**
   * Get notifications for the current user
   */
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
  ): Promise<Notification[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notifications")
        .select("*, actor:actor_id(username, avatar_url)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Format the response
      const notifications: Notification[] = data.map((notification: any) => ({
        id: notification.id,
        userId: notification.user_id,
        type: (notification.type || "follow") as
          | "follow"
          | "like"
          | "comment"
          | "game_invite"
          | "game_turn"
          | "friend_request",
        actorId: notification.actor_id || undefined,
        postId: notification.post_id || undefined,
        gameId: notification.game_id || undefined,
        content: notification.content || notification.message || "",
        read: notification.read || notification.is_read || false,
        createdAt: notification.created_at,
        actorName:
          notification.actor &&
          typeof notification.actor === "object" &&
          notification.actor.username
            ? notification.actor.username
            : undefined,
        actorAvatar:
          notification.actor &&
          typeof notification.actor === "object" &&
          notification.actor.avatar_url
            ? notification.actor.avatar_url
            : undefined,
      }));

      return notifications;
    } catch (error) {
      errorHandler.handleError(error, "Failed to get notifications", {
        context: { limit, offset },
      });
      return [];
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", notificationIds)
        .eq("user_id", userData.user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to mark notifications as read", {
        context: { notificationIds },
      });
      return false;
    }
  }

  /**
   * Create a notification
   */
  private async createNotification(notification: {
    userId: string;
    type: Notification["type"];
    actorId?: string;
    postId?: string;
    gameId?: string;
    content: string;
  }): Promise<boolean> {
    try {
      const notificationData = {
        user_id: notification.userId,
        message: notification.content, // Use message field as required by the schema
        type: notification.type,
        actor_id: notification.actorId,
        post_id: notification.postId,
        game_id: notification.gameId,
        is_read: false, // Use is_read instead of read to match schema
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("notifications")
        .insert(notificationData);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Failed to create notification:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const socialService = new SocialService();
