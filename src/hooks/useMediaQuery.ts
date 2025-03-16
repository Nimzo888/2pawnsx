import { useState, useEffect } from "react";

/**
 * Hook to check if a media query matches
 * @param query Media query string (e.g. '(max-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks based on Tailwind CSS defaults
 */

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery("(min-width: 1280px)");
}

export function useIsDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
