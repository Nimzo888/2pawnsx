import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  initSessionManager,
  refreshSession,
  addSessionExpiryListener,
  removeSessionExpiryListener,
  cleanupSessionManager,
} from "@/lib/sessionManager";
import { chessCache } from "@/lib/cache";
import { errorHandler } from "@/lib/errorHandler";
import { analytics } from "@/lib/analytics";
import { setUserContext, clearUserContext } from "@/lib/sentry";
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
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
  preferences?: Record<string, any>;
  is_premium?: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
};

// Create a default context value to avoid the "must be used within a provider" error
const defaultContextValue: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => false,
  resetPassword: async () => ({ error: null }),
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const sessionExpiryListenerRef = useRef<
    ((timeRemaining: number) => void) | null
  >(null);
  const navigate = useNavigate();

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);

      // Try to get from cache first
      const cachedProfile = chessCache.get<UserProfile>(`profile:${userId}`);
      if (cachedProfile) {
        setProfile(cachedProfile);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Create profile if it doesn't exist
        if (error.code === "PGRST116") {
          await createNewProfile(userId);
        } else {
          throw error;
        }
      } else if (data) {
        setProfile(data);
        // Cache the profile
        chessCache.set(`profile:${userId}`, data, { expiry: 5 * 60 * 1000 }); // 5 minutes
      }
    } catch (error) {
      errorHandler.handleError(error, "Error fetching user profile", {
        silent: true,
        context: { userId },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new profile for a user
  const createNewProfile = async (userId: string) => {
    try {
      const userData = await supabase.auth.getUser();
      const username = userData.data.user?.user_metadata?.username || "Player";
      const email = userData.data.user?.email;

      const newProfile = {
        id: userId,
        username,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elo_rating: 1200,
        wins: 0,
        losses: 0,
        draws: 0,
        games_played: 0,
        is_premium: false,
      };

      const { error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile);

      if (insertError) {
        throw insertError;
      } else {
        setProfile(newProfile as UserProfile);
        // Cache the profile
        chessCache.set(`profile:${userId}`, newProfile, {
          expiry: 5 * 60 * 1000,
        }); // 5 minutes
      }
    } catch (error) {
      errorHandler.handleError(error, "Error creating user profile", {
        context: { userId },
      });
    }
  };

  // Handle session expiry warning
  const handleSessionExpiring = useCallback((timeRemaining: number) => {
    setSessionExpiring(true);

    // Show a toast notification
    toast({
      title: "Session Expiring Soon",
      description: `Your session will expire in ${Math.round(timeRemaining / 1000 / 60)} minutes. Would you like to stay logged in?`,
      action: {
        label: "Stay Logged In",
        onClick: async () => {
          const newSession = await refreshSession();
          if (newSession) {
            setSessionExpiring(false);
            toast({
              title: "Session Extended",
              description: "Your session has been extended.",
            });
          }
        },
      },
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Initialize session manager
        if (data.session) {
          initSessionManager(data.session);
        }

        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
          // Initialize analytics with user ID
          analytics.init(data.session.user.id);
          // Set user context for Sentry
          setUserContext(
            data.session.user.id,
            data.session.user.email,
            profile?.username,
          );
        } else {
          setLoading(false);
          // Initialize analytics without user ID
          analytics.init();
          // Clear user context for Sentry
          clearUserContext();
        }
      } catch (error) {
        errorHandler.handleError(error, "Error initializing authentication", {
          silent: true,
        });
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
        // Update analytics user ID
        analytics.setUserId(session.user.id);
        // Update Sentry user context
        setUserContext(session.user.id, session.user.email, profile?.username);

        // Track auth events
        if (event === "SIGNED_IN") {
          analytics.trackEvent("auth", "sign_in");
        }
      } else {
        setProfile(null);
        setLoading(false);

        // Track sign out
        if (event === "SIGNED_OUT") {
          analytics.trackEvent("auth", "sign_out");
          // Clear Sentry user context
          clearUserContext();
        }
      }
    });

    // Set up session expiry listener
    sessionExpiryListenerRef.current = handleSessionExpiring;
    addSessionExpiryListener(handleSessionExpiring);

    return () => {
      subscription.unsubscribe();
      if (sessionExpiryListenerRef.current) {
        removeSessionExpiryListener(sessionExpiryListenerRef.current);
      }
      cleanupSessionManager();
    };
  }, [fetchProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      errorHandler.handleError(error, "Failed to sign in", {
        context: { email },
      });
      return { error, data: null };
    }
  };

  // Sign up with email, password and username
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (response.error) {
        throw response.error;
      }

      // If signup is successful, create a profile record
      if (response.data.user) {
        const newProfile = {
          id: response.data.user.id,
          username,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          elo_rating: 1200, // Default starting ELO
          wins: 0,
          losses: 0,
          draws: 0,
          games_played: 0,
          is_premium: false,
        };

        const { error } = await supabase.from("profiles").insert(newProfile);

        if (error) {
          throw error;
        }

        // Track signup
        analytics.trackEvent("auth", "sign_up");
      }

      return response;
    } catch (error) {
      errorHandler.handleError(error, "Failed to sign up", {
        context: { email, username },
      });
      return { error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear cache
      chessCache.clear();
      // Navigate to login
      navigate("/login");
      // Show success message
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      errorHandler.handleError(error, "Failed to sign out");
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      // Format the update data
      const updateData: Record<string, any> = {};
      if (updates.username !== undefined)
        updateData.username = updates.username;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatar_url !== undefined)
        updateData.avatar_url = updates.avatar_url;
      if (updates.preferences !== undefined)
        updateData.preferences = updates.preferences;
      if (updates.is_premium !== undefined)
        updateData.is_premium = updates.is_premium;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      // Remove from cache and refresh
      chessCache.remove(`profile:${user.id}`);
      await refreshProfile();

      // Track profile update
      analytics.trackEvent("profile", "profile_updated", {
        fieldsUpdated: Object.keys(updates),
      });

      return true;
    } catch (error) {
      errorHandler.handleError(error, "Failed to update profile", {
        context: { updates },
      });
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Track password reset request
      analytics.trackEvent("auth", "password_reset_requested");

      return { error: null };
    } catch (error) {
      errorHandler.handleError(error, "Failed to send password reset email", {
        context: { email },
      });
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook as a named function declaration for better HMR compatibility
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
