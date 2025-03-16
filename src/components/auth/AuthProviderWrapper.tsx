import React from "react";
import { AuthProvider } from "./AuthProvider";

/**
 * This wrapper component helps maintain a consistent API
 * while removing the lazy loading that was causing HMR issues
 *
 * It also provides a stable reference that won't be affected by HMR
 */
export const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Using a simple wrapper with no state or effects to avoid HMR issues
  return <AuthProvider>{children}</AuthProvider>;
};

// Re-export the useAuth hook for convenience
export { useAuth } from "./AuthProvider";
