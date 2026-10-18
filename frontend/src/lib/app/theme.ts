import {
  getLocalStorage,
  readStorageItem,
  removeStorageItem,
  writeStorageItem,
} from "./storageCache";

export type ThemePreference = "system" | "light" | "dark";
export type ThemeScheme = "light" | "dark";

export const THEME_STORAGE_KEY = "fdmate:theme-preference";

const themePreferences: ThemePreference[] = ["system", "light", "dark"];

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && themePreferences.includes(value as ThemePreference);
}

export function getSystemThemeScheme(): ThemeScheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function getInitialThemePreference(): ThemePreference {
  const storage = getLocalStorage();
  const stored = storage ? readStorageItem(storage, THEME_STORAGE_KEY) : null;
  return isThemePreference(stored) ? stored : "system";
}

export function getNextThemePreference(
  preference: ThemePreference,
): ThemePreference {
  const index = themePreferences.indexOf(preference);
  return themePreferences[(index + 1) % themePreferences.length] ?? "system";
}

// System is the default, so it is stored as no value at all.
export function persistThemePreference(preference: ThemePreference) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  if (preference === "system") {
    removeStorageItem(storage, THEME_STORAGE_KEY);
    return;
  }

  writeStorageItem(storage, THEME_STORAGE_KEY, preference);
}

export function applyTheme(preference: ThemePreference, scheme: ThemeScheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = scheme;
}
