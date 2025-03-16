import React from "react";
import { AuthContext } from "./AuthProvider";

// This component provides a mock AuthProvider for storyboards and testing
export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mockAuthValue = {
    session: null,
    user: {
      id: "mock-user-id",
      email: "user@example.com",
      user_metadata: { username: "ChessMaster" },
    } as any,
    profile: {
      id: "mock-user-id",
      username: "ChessMaster",
      email: "user@example.com",
      elo_rating: 1200,
      wins: 10,
      losses: 5,
      draws: 3,
      games_played: 18,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    loading: false,
    signIn: async () => ({ error: null, data: { user: null, session: null } }),
    signUp: async () => ({ error: null, data: { user: null, session: null } }),
    signOut: async () => {},
    refreshProfile: async () => {},
    updateProfile: async () => false,
    resetPassword: async () => ({ error: null }),
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default MockAuthProvider;
