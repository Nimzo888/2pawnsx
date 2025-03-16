/**
 * Custom HMR handler to bypass SWC refresh issues
 * This provides a workaround for the "RefreshRuntime.getRefreshReg is not a function" error
 */

let isHmrSetup = false;

export function setupHmr() {
  if (isHmrSetup || !import.meta.hot) return;

  // Set up custom HMR handling
  import.meta.hot.on("vite:beforeUpdate", () => {
    console.log("🔄 HMR update detected");
  });

  // Handle module updates
  import.meta.hot.on("vite:afterUpdate", () => {
    // Force a full page reload for auth-related changes
    // This is a workaround for the SWC refresh issues
    if (
      document.location.pathname.includes("/login") ||
      document.location.pathname.includes("/register")
    ) {
      console.log("🔄 Auth-related update detected, performing full reload");
      document.location.reload();
    }
  });

  isHmrSetup = true;
  console.log("✅ Custom HMR handler initialized");
}
