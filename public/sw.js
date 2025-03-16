// Service Worker for offline support and caching

const CACHE_NAME = "chess-app-v2";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/assets/index.css",
  "/assets/index.js",
  "/assets/pieces/lichess/svg/white-king.svg",
  "/assets/pieces/lichess/svg/white-queen.svg",
  "/assets/pieces/lichess/svg/white-rook.svg",
  "/assets/pieces/lichess/svg/white-bishop.svg",
  "/assets/pieces/lichess/svg/white-knight.svg",
  "/assets/pieces/lichess/svg/white-pawn.svg",
  "/assets/pieces/lichess/svg/black-king.svg",
  "/assets/pieces/lichess/svg/black-queen.svg",
  "/assets/pieces/lichess/svg/black-rook.svg",
  "/assets/pieces/lichess/svg/black-bishop.svg",
  "/assets/pieces/lichess/svg/black-knight.svg",
  "/assets/pieces/lichess/svg/black-pawn.svg",
  "/stockfish.js",
  "/stockfish.wasm",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );

  // Take control of clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests and non-GET requests
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Skip API requests and authentication endpoints
  if (
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("/auth/") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response to cache it and return it
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, return a fallback for HTML requests
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html");
          }

          return new Response("Network error occurred", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
    }),
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
