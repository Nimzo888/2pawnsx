/**
 * Analytics utility for the chess platform
 * Tracks user behavior, game statistics, and platform usage
 */

type EventCategory =
  | "auth"
  | "game"
  | "social"
  | "profile"
  | "subscription"
  | "navigation"
  | "analysis"
  | "puzzles";

type EventData = Record<string, any>;

class ChessAnalytics {
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private initialized: boolean = false;

  /**
   * Initialize analytics with user information
   */
  init(userId?: string): void {
    if (userId) {
      this.userId = userId;
    }
    this.initialized = true;
    this.trackEvent("navigation", "app_start");
  }

  /**
   * Set or update the user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    // Update user identity in analytics service
    this.trackEvent("auth", "identify", { userId });
  }

  /**
   * Track an event
   */
  trackEvent(
    category: EventCategory,
    action: string,
    data: EventData = {},
  ): void {
    if (!this.initialized) {
      console.warn("Analytics not initialized");
      return;
    }

    const eventData = {
      ...data,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.pathname : "",
    };

    // Log the event (in production this would send to an analytics service)
    console.log(`[Analytics] ${category}:${action}`, eventData);

    // Here you would typically send to your analytics service
    // Example: window.gtag('event', action, { event_category: category, ...eventData });
  }

  /**
   * Track a page view
   */
  trackPageView(pageName: string, properties: Record<string, any> = {}): void {
    this.trackEvent("navigation", "page_view", { pageName, ...properties });
  }

  /**
   * Track a game event
   */
  trackGameEvent(action: string, gameData: Record<string, any>): void {
    this.trackEvent("game", action, gameData);
  }

  /**
   * Track a social interaction
   */
  trackSocialInteraction(action: string, data: Record<string, any>): void {
    this.trackEvent("social", action, data);
  }

  /**
   * Track a subscription event
   */
  trackSubscriptionEvent(action: string, data: Record<string, any>): void {
    this.trackEvent("subscription", action, data);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Export a singleton instance
export const analytics = new ChessAnalytics();
