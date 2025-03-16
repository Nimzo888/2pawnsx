/**
 * Service worker registration and management
 */

// Check if service workers are supported
const isServiceWorkerSupported = "serviceWorker" in navigator;

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if (!isServiceWorkerSupported) {
    console.log("Service workers are not supported in this browser");
    return false;
  }

  try {
    // Use relative path for service worker to work in all environments
    const swPath = `${import.meta.env.BASE_URL || "/"}sw.js`;
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: import.meta.env.BASE_URL || "/",
    });
    console.log("Service worker registered:", registration.scope);
    return true;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return false;
  }
};

/**
 * Unregister all service workers
 */
export const unregisterServiceWorker = async () => {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log("Service worker unregistered");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Service worker unregistration failed:", error);
    return false;
  }
};

/**
 * Check if the app is installed (PWA)
 */
export const isPWAInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Update the service worker
 */
export const updateServiceWorker = async () => {
  if (!isServiceWorkerSupported) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Service worker update failed:", error);
    return false;
  }
};

/**
 * Add a listener for service worker updates
 */
export const addUpdateListener = (callback: () => void) => {
  if (!isServiceWorkerSupported) return () => {};

  const listener = () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        callback();
      }
    });
  };

  navigator.serviceWorker.addEventListener("controllerchange", listener);

  return () => {
    navigator.serviceWorker.removeEventListener("controllerchange", listener);
  };
};
