/**
 * Session management utilities for handling authentication state
 */

import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

// Session refresh interval (15 minutes)
const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000;

// Session timeout warning (5 minutes before expiry)
const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000;

let refreshTimer: number | null = null;
let warningTimer: number | null = null;
let sessionExpiryListeners: Array<(timeRemaining: number) => void> = [];

/**
 * Initialize session management
 * @param session Current session
 */
export const initSessionManager = (session: Session | null) => {
  if (session) {
    scheduleRefresh(session);
  }
};

/**
 * Schedule session refresh based on expiry time
 * @param session Current session
 */
const scheduleRefresh = (session: Session) => {
  clearTimers();

  if (!session.expires_at) return;

  const expiresAt = new Date(session.expires_at).getTime();
  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;

  // Schedule refresh at halfway point to expiry
  const refreshTime = Math.max(timeUntilExpiry / 2, 1000);

  // Schedule warning when approaching expiry
  const warningTime = Math.max(
    timeUntilExpiry - SESSION_WARNING_THRESHOLD,
    1000,
  );

  refreshTimer = window.setTimeout(() => refreshSession(), refreshTime);
  warningTimer = window.setTimeout(
    () => notifySessionExpiringSoon(SESSION_WARNING_THRESHOLD),
    warningTime,
  );

  console.log(
    `Session refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`,
  );
};

/**
 * Clear all session timers
 */
const clearTimers = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
};

/**
 * Refresh the current session
 */
export const refreshSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    if (data.session) {
      scheduleRefresh(data.session);
      return data.session;
    }

    return null;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return null;
  }
};

/**
 * Notify listeners that session is expiring soon
 * @param timeRemaining Time remaining in milliseconds
 */
const notifySessionExpiringSoon = (timeRemaining: number) => {
  sessionExpiryListeners.forEach((listener) => listener(timeRemaining));
};

/**
 * Add a listener for session expiry warnings
 * @param listener Function to call when session is expiring
 */
export const addSessionExpiryListener = (
  listener: (timeRemaining: number) => void,
) => {
  sessionExpiryListeners.push(listener);
};

/**
 * Remove a session expiry listener
 * @param listener Listener to remove
 */
export const removeSessionExpiryListener = (
  listener: (timeRemaining: number) => void,
) => {
  sessionExpiryListeners = sessionExpiryListeners.filter((l) => l !== listener);
};

/**
 * Get estimated time remaining for current session
 * @returns Time remaining in milliseconds, or null if no session
 */
export const getSessionTimeRemaining = async (): Promise<number | null> => {
  const { data } = await supabase.auth.getSession();

  if (!data.session || !data.session.expires_at) return null;

  const expiresAt = new Date(data.session.expires_at).getTime();
  return Math.max(0, expiresAt - Date.now());
};

/**
 * Clean up session management (call on unmount)
 */
export const cleanupSessionManager = () => {
  clearTimers();
  sessionExpiryListeners = [];
};
