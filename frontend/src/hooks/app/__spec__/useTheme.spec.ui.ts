import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY } from "../../../lib/app/theme";
import { useTheme } from "../useTheme";

// Controllable prefers-color-scheme query, since jsdom has no matchMedia.
function mockSystemScheme(initial: "light" | "dark") {
  let light = initial === "light";
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return light;
      },
      addEventListener: (_type: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) =>
        listeners.delete(listener),
    })),
  );
  return (next: "light" | "dark") => {
    light = next === "light";
    listeners.forEach((listener) => listener());
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themePreference;
});

describe("useTheme", () => {
  it("restores a saved preference and applies it to the page", () => {
    mockSystemScheme("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe("light");
    expect(result.current.scheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("cycles and saves the preference, forgetting it on system", () => {
    mockSystemScheme("light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");

    act(() => result.current.cycleThemePreference());
    expect(result.current.preference).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    act(() => result.current.cycleThemePreference());
    expect(result.current.scheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => result.current.cycleThemePreference());
    expect(result.current.preference).toBe("system");
    expect(result.current.scheme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("follows the system scheme while on system", () => {
    const setSystemScheme = mockSystemScheme("dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.scheme).toBe("dark");

    act(() => setSystemScheme("light"));
    expect(result.current.scheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("ignores an unknown saved value", () => {
    mockSystemScheme("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe("system");
  });
});
