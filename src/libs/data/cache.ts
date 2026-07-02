// Small request cache. It keeps results in memory for the life of the page,
// de-duplicates concurrent calls for the same key, and can optionally persist
// to sessionStorage so a value survives navigation within the same tab.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memory = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const STORAGE_PREFIX = "kmitlx:cache:";

function readPersisted<T>(key: string, now: number): T | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt > now) return entry.value;
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // sessionStorage may be unavailable or hold invalid data; ignore.
  }
  return undefined;
}

function writePersisted<T>(key: string, entry: CacheEntry<T>): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable; the memory cache still applies.
  }
}

export interface CacheOptions {
  persist?: boolean;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
  opts: CacheOptions = {}
): Promise<T> {
  const now = Date.now();

  const hit = memory.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  if (opts.persist) {
    const persisted = readPersisted<T>(key, now);
    if (persisted !== undefined) {
      memory.set(key, { value: persisted, expiresAt: now + ttlMs });
      return persisted;
    }
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = (async () => {
    try {
      const value = await loader();
      const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
      memory.set(key, entry);
      if (opts.persist) writePersisted(key, entry);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export function clearCache(): void {
  memory.clear();
  inflight.clear();
}
