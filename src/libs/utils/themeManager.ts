export type Theme = "light" | "dark";

const STORAGE_KEY = "kmitlx:theme";

function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch (e) {
    // ignore (private mode, storage errors)
  }
}

/**
 * Read the user's OS/browser preferred color scheme.
 */
export function getPreferredTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Get the currently stored theme or fallback to system preference.
 */
export function getTheme(): Theme {
  const stored = safeLocalStorageGet(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return getPreferredTheme();
}

/**
 * Set the theme and broadcast a composed CustomEvent so listeners (including
 * shadow-root mounted apps) can update.
 */
export function setTheme(theme: Theme) {
  safeLocalStorageSet(STORAGE_KEY, theme);

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("kmitlx:theme-change", {
          detail: theme,
          bubbles: true,
          composed: true,
        })
      );
    } catch (e) {
      // ignore dispatch errors in unusual environments
    }
  }
}

/**
 * Toggle theme (light <-> dark) and return the new theme.
 */
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Convenience: expose a global setter so external scripts can call it easily.
if (typeof window !== "undefined") {
  try {
    (window as any).kmitlxSetTheme = setTheme;
  } catch (e) {
    /* ignore */
  }
}

export default { getTheme, setTheme, toggleTheme, getPreferredTheme };
