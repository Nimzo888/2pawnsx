/**
 * Simple cache utility for the chess platform
 * Handles caching of API responses, game states, and user data
 */

type CacheOptions = {
  expiry?: number; // Time in milliseconds until cache expires
  staleWhileRevalidate?: boolean; // Whether to return stale data while fetching fresh data
};

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiry: number | null;
};

class ChessCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultExpiry = 5 * 60 * 1000; // 5 minutes default

  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}) {
    const expiry =
      options.expiry === undefined ? this.defaultExpiry : options.expiry;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry === null ? null : expiry,
    });

    return data;
  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if item is expired
    if (item.expiry !== null && Date.now() > item.timestamp + item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Remove an item from the cache
   */
  remove(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get an item from the cache, or fetch it if not present
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cachedItem = this.get<T>(key);

    if (cachedItem !== null) {
      return cachedItem;
    }

    const data = await fetchFn();
    this.set(key, data, options);
    return data;
  }

  /**
   * Specialized method for caching game states
   */
  cacheGameState(gameId: string, state: any): void {
    this.set(`game:${gameId}`, state, { expiry: 30 * 60 * 1000 }); // 30 minutes
  }

  /**
   * Specialized method for caching user profiles
   */
  cacheUserProfile(userId: string, profile: any): void {
    this.set(`profile:${userId}`, profile, { expiry: 15 * 60 * 1000 }); // 15 minutes
  }

  /**
   * Specialized method for caching leaderboard data
   */
  cacheLeaderboard(leaderboard: any): void {
    this.set("leaderboard", leaderboard, { expiry: 60 * 60 * 1000 }); // 1 hour
  }
}

// Export a singleton instance
export const chessCache = new ChessCache();
