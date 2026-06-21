import { useEffect, useMemo, useState } from "react";

import {
  applyTheme,
  getInitialThemePreference,
  getNextThemePreference,
  getSystemThemeScheme,
  persistThemePreference,
  type ThemePreference,
  type ThemeScheme,
} from "./theme";

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const [systemScheme, setSystemScheme] =
    useState<ThemeScheme>(getSystemThemeScheme);
  const scheme = preference === "system" ? systemScheme : preference;

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

    const handleChange = () => {
      setSystemScheme(getSystemThemeScheme());
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    persistThemePreference(preference);
    applyTheme(preference, scheme);
  }, [preference, scheme]);

  return useMemo(
    () => ({
      preference,
      scheme,
      cycleThemePreference: () => {
        setPreference((currentPreference) =>
          getNextThemePreference(currentPreference),
        );
      },
    }),
    [preference, scheme],
  );
}
