/**
 * Enhanced HMR handler to bypass React refresh issues
 * This provides a comprehensive workaround for the "RefreshRuntime.getRefreshReg is not a function" error
 */

let isHmrSetup = false;

// List of paths that should trigger a full page reload
const FORCE_RELOAD_PATHS = ["/login", "/register", "/auth", "/profile"];

// List of file patterns that should trigger a full page reload
const FORCE_RELOAD_FILE_PATTERNS = [
  "auth",
  "provider",
  "context",
  "store",
  "redux",
  "zustand",
];

export function setupHmr() {
  if (isHmrSetup || !import.meta.hot) return;

  // Set up custom HMR handling
  import.meta.hot.on("vite:beforeUpdate", (payload) => {
    console.log("🔄 HMR update detected", payload);
  });

  // Handle module updates
  import.meta.hot.on("vite:afterUpdate", (payload) => {
    const currentPath = document.location.pathname;

    // Check if we're on a path that should force reload
    const isOnForcePath = FORCE_RELOAD_PATHS.some((path) =>
      currentPath.includes(path),
    );

    // Check if updated files match patterns that should force reload
    const shouldForceReload = payload.updates.some((update) => {
      return FORCE_RELOAD_FILE_PATTERNS.some((pattern) =>
        update.path.toLowerCase().includes(pattern.toLowerCase()),
      );
    });

    // Force a full page reload for specific paths or file patterns
    if (isOnForcePath || shouldForceReload) {
      console.log("🔄 Critical update detected, performing full reload");
      console.log(
        "Updated files:",
        payload.updates.map((u) => u.path).join(", "),
      );

      // Use a small timeout to ensure all updates are processed
      setTimeout(() => {
        document.location.reload();
      }, 50);
    }
  });

  // Handle errors during HMR
  import.meta.hot.on("vite:error", (error) => {
    console.error("❌ HMR error detected:", error);

    // If we get specific React refresh errors, force reload
    if (
      error.message &&
      (error.message.includes("RefreshRuntime") ||
        error.message.includes("getRefreshReg") ||
        error.message.includes("Cannot read properties of undefined"))
    ) {
      console.log("🔄 React refresh error detected, performing full reload");
      document.location.reload();
    }
  });

  isHmrSetup = true;
  console.log("✅ Enhanced HMR handler initialized");
}
