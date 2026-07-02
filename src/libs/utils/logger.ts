const DEBUG_KEY = "kmitlx:debug";

// Logging is off in production so nothing is written to the Registrar page
// console. It turns on in dev builds, or when a user sets localStorage
// kmitlx:debug = "1" to help report an issue.
function debugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

const PREFIX = "[KMITL-X]";

export const logger = {
  log(...args: unknown[]): void {
    if (debugEnabled()) console.log(PREFIX, ...args);
  },
  warn(...args: unknown[]): void {
    if (debugEnabled()) console.warn(PREFIX, ...args);
  },
  error(...args: unknown[]): void {
    if (debugEnabled()) console.error(PREFIX, ...args);
  },
};
