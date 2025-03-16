/**
 * Error handling utility for the chess platform
 * Provides consistent error handling, logging, and user feedback
 */

import { toast } from "@/components/ui/use-toast";
import { captureException } from "@/lib/sentry";

type ErrorOptions = {
  silent?: boolean; // Don't show to user
  retry?: () => Promise<any>; // Function to retry the operation
  fallback?: any; // Fallback value to return
  context?: Record<string, any>; // Additional context for logging
  level?: "error" | "warning" | "info"; // Severity level
};

type ErrorCategory =
  | "auth"
  | "network"
  | "database"
  | "game"
  | "validation"
  | "unknown";

class ChessErrorHandler {
  /**
   * Handle an error with consistent logging and user feedback
   */
  handleError(error: any, message: string, options: ErrorOptions = {}): void {
    // Determine error category
    const category = this.categorizeError(error);

    // Log the error with context
    this.logError(error, message, category, options.context, options.level);

    // Show user feedback unless silent
    if (!options.silent) {
      this.showUserFeedback(message, category, options.retry);
    }
  }

  /**
   * Categorize an error based on its properties
   */
  private categorizeError(error: any): ErrorCategory {
    if (!error) return "unknown";

    // Check for auth errors
    if (
      error.message?.includes("auth") ||
      error.message?.includes("unauthorized") ||
      error.message?.includes("unauthenticated") ||
      error.status === 401 ||
      error.status === 403
    ) {
      return "auth";
    }

    // Check for network errors
    if (
      error.message?.includes("network") ||
      error.message?.includes("connection") ||
      error.name === "NetworkError" ||
      error.name === "AbortError" ||
      error.status === 0 ||
      error.status === 504
    ) {
      return "network";
    }

    // Check for database errors
    if (
      error.code?.startsWith("PGRST") ||
      error.message?.includes("database") ||
      error.message?.includes("constraint") ||
      error.status === 409
    ) {
      return "database";
    }

    // Check for game logic errors
    if (
      error.message?.includes("game") ||
      error.message?.includes("move") ||
      error.message?.includes("chess")
    ) {
      return "game";
    }

    // Check for validation errors
    if (
      error.message?.includes("validation") ||
      error.message?.includes("invalid") ||
      error.status === 400 ||
      error.status === 422
    ) {
      return "validation";
    }

    return "unknown";
  }

  /**
   * Log an error with context
   */
  private logError(
    error: any,
    message: string,
    category: ErrorCategory,
    context?: Record<string, any>,
    level: "error" | "warning" | "info" = "error",
  ): void {
    console.error(`[${category.toUpperCase()}] ${message}`, {
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to Sentry
    captureException(error, {
      category,
      message,
      level,
      ...context,
    });
  }

  /**
   * Show user feedback based on error category
   */
  private showUserFeedback(
    message: string,
    category: ErrorCategory,
    retry?: () => Promise<any>,
  ): void {
    let title = "Error";
    let description = message;
    let variant: "default" | "destructive" = "destructive";

    switch (category) {
      case "auth":
        title = "Authentication Error";
        description = message || "Please sign in again to continue.";
        break;
      case "network":
        title = "Connection Error";
        description =
          message || "Please check your internet connection and try again.";
        break;
      case "database":
        title = "Data Error";
        description =
          message || "There was an issue saving your data. Please try again.";
        break;
      case "game":
        title = "Game Error";
        description =
          message || "There was an issue with the game. Please try again.";
        break;
      case "validation":
        title = "Invalid Input";
        description = message || "Please check your input and try again.";
        break;
      default:
        title = "Unexpected Error";
        description =
          message || "Something went wrong. Please try again later.";
    }

    toast({
      title,
      description,
      variant,
      action: retry
        ? {
            label: "Retry",
            onClick: () => retry(),
          }
        : undefined,
    });
  }

  /**
   * Wrap an async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    errorMessage: string,
    options: ErrorOptions = {},
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, errorMessage, options);
      return options.fallback || null;
    }
  }

  /**
   * Track a user action or event
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
  ): void {
    // Log the event
    console.info(`[EVENT] ${category}:${action}`, { label, value });

    // In production, this would send to analytics
    // analytics.trackEvent(category, action, label, value);
  }
}

// Export a singleton instance
export const errorHandler = new ChessErrorHandler();
