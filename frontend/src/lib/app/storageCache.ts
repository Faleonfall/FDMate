/** The browser's localStorage, or null where access throws (privacy modes). */
export function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJsonStorage<TValue>(
  storage: Storage,
  key: string,
  fallback: TValue,
) {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as TValue) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(
  storage: Storage,
  key: string,
  value: unknown,
) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; callers should keep working from memory.
  }
}

export function readStorageItem(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Persistence is best-effort; callers should keep working from memory.
  }
}

export function removeStorageItem(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage failures; cache cleanup is best-effort.
  }
}

export function isStorageRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
