import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Dynamically import the AuthProvider to avoid HMR issues
const AuthProvider = React.lazy(() =>
  import("./AuthProvider").then((module) => ({
    default: module.AuthProvider,
  })),
);

/**
 * This wrapper component helps prevent HMR issues with the AuthProvider
 * by loading it lazily and providing a suspense fallback
 */
export const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
};

// Re-export the useAuth hook for convenience
export { useAuth } from "./AuthProvider";
