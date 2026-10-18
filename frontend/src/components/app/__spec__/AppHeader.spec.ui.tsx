import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppHeader } from "../AppHeader";

describe("AppHeader", () => {
  it("names the current theme and cycles it on click", async () => {
    const user = userEvent.setup();
    const onCycle = vi.fn();
    render(
      <AppHeader themePreference="dark" onCycleThemePreference={onCycle} />,
    );

    await user.click(screen.getByRole("button", { name: "Theme: dark" }));
    expect(onCycle).toHaveBeenCalledTimes(1);
  });

  it("offers sign out only when signed in", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    const { rerender } = render(
      <AppHeader themePreference="system" onCycleThemePreference={vi.fn()} />,
    );
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();

    rerender(
      <AppHeader
        themePreference="system"
        onCycleThemePreference={vi.fn()}
        onSignOut={onSignOut}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
