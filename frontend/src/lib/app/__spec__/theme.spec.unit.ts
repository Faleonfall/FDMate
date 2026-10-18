import { describe, expect, it } from "vitest";

import {
  getInitialThemePreference,
  getNextThemePreference,
  getSystemThemeScheme,
} from "../theme";

describe("theme", () => {
  it("cycles system, light, dark and back", () => {
    expect(getNextThemePreference("system")).toBe("light");
    expect(getNextThemePreference("light")).toBe("dark");
    expect(getNextThemePreference("dark")).toBe("system");
  });

  it("defaults to system and dark without a window", () => {
    expect(getInitialThemePreference()).toBe("system");
    expect(getSystemThemeScheme()).toBe("dark");
  });
});
