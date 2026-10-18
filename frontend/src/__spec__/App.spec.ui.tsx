import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import type { AuthState } from "../hooks/app/useAuth";

const auth = vi.hoisted(() => ({
  state: {} as AuthState,
}));

// Firebase stays out of the spec: auth state is set per test, and the diary
// screen is a stub that only reports which user it was given.
vi.mock("../hooks/app/useAuth", () => ({
  useAuth: () => auth.state,
}));
vi.mock("../components/diary/DayLogScreen", () => ({
  DayLogScreen: ({ uid }: { uid: string }) => <p>Diary for {uid}</p>,
}));

function setAuth(state: Partial<AuthState>) {
  auth.state = {
    user: null,
    loading: false,
    signIn: vi.fn(() => Promise.resolve()),
    logOut: vi.fn(() => Promise.resolve()),
    ...state,
  };
}

beforeEach(() => {
  setAuth({});
});

describe("App", () => {
  it("shows only the header while auth is loading", () => {
    setAuth({ loading: true });
    render(<App />);

    expect(screen.getByRole("heading", { name: "FDMate" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign in with Google" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Diary for/)).not.toBeInTheDocument();
  });

  it("asks a signed out user to sign in", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Sign in with Google" }),
    );
    expect(auth.state.signIn).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("opens the diary for a signed in user", async () => {
    const user = userEvent.setup();
    setAuth({ user: { uid: "u1" } as AuthState["user"] });
    render(<App />);

    expect(screen.getByText("Diary for u1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(auth.state.logOut).toHaveBeenCalledTimes(1);
  });
});
