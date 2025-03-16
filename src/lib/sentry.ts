import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: "YOUR_SENTRY_DSN", // Replace with your actual Sentry DSN when available
      integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
      // Performance Monitoring
      tracesSampleRate: 0.5, // Capture 50% of transactions for performance monitoring
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample rate for session replay is 10%
      replaysOnErrorSampleRate: 1.0, // Capture all sessions that have errors
    });
  }
};

export const captureException = (error: any, context?: Record<string, any>) => {
  console.error("Error captured:", error);

  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

export const captureMessage = (
  message: string,
  level?: Sentry.SeverityLevel,
) => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  }
};

export const setUserContext = (
  userId: string,
  email?: string,
  username?: string,
) => {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
};

export const clearUserContext = () => {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
};
