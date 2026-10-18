export type ThemePreference = "system" | "light" | "dark";
export type ThemeScheme = "light" | "dark";

export const THEME_STORAGE_KEY = "fdmate:theme-preference";

const themePreferences: ThemePreference[] = ["system", "light", "dark"];

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && themePreferences.includes(value as ThemePreference);
}

function readThemePreference(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedPreference = readThemePreference();
  return isThemePreference(storedPreference) ? storedPreference : "system";
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
  return getStoredThemePreference();
}

export function getNextThemePreference(
  preference: ThemePreference,
): ThemePreference {
  const index = themePreferences.indexOf(preference);
  return themePreferences[(index + 1) % themePreferences.length] ?? "system";
}

export function persistThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") {
    return;
  }

  writeThemePreference(preference);
}

export function applyTheme(preference: ThemePreference, scheme: ThemeScheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = scheme;
}
