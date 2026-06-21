import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Shared mock handles for the cloud layer (hoisted above the vi.mock call).
const cloud = vi.hoisted(() => ({
  subscribers: [] as Array<(log: unknown) => void>,
  writeDay: vi.fn(() => Promise.resolve()),
  removeDay: vi.fn(() => Promise.resolve()),
}));

vi.mock("../src/features/log/data/cloudSync", () => ({
  subscribeLog: (_uid: string, onChange: (log: unknown) => void) => {
    cloud.subscribers.push(onChange);
    return () => {
      cloud.subscribers = cloud.subscribers.filter((fn) => fn !== onChange);
    };
  },
  writeDay: cloud.writeDay,
  removeDay: cloud.removeDay,
}));

import { saveFoodLog } from "../src/features/log/data/logStorage";
import type { FoodEntry, FoodLog } from "../src/features/log/types";
import { useFoodLog } from "../src/features/log/useFoodLog";

const entry = (id: string): FoodEntry => ({
  id,
  title: "x",
  createdAt: 1,
  mode: "total",
  calories: 10,
});

/** Deliver a remote snapshot to all live subscribers. */
function emitRemote(log: FoodLog) {
  act(() => {
    cloud.subscribers.forEach((fn) => fn(log));
  });
}

/** Advance past the debounce and let the async flush settle. */
async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700);
  });
}

beforeEach(() => {
  window.localStorage.clear();
  cloud.subscribers = [];
  cloud.writeDay.mockClear();
  cloud.removeDay.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useFoodLog cloud sync", () => {
  it("stale local cache is replaced by remote on load and never pushed", async () => {
    // A cache left over from a previous session, now out of date.
    const stale: FoodLog = { "2026-06-01": [entry("stale")] };
    saveFoodLog(window.localStorage, stale);

    const { result } = renderHook(() => useFoodLog("u1"));
    // Instant paint shows the cache before the cloud answers.
    expect(result.current.log).toEqual(stale);

    // First cloud snapshot arrives with different (newer) data.
    const remote: FoodLog = { "2026-06-10": [entry("remote")] };
    emitRemote(remote);

    // Remote wins; the stale day is gone, not merged back.
    expect(result.current.log).toEqual(remote);

    await flush();
    // The cache was never the user's edit, so nothing is written back.
    expect(cloud.writeDay).not.toHaveBeenCalled();
    expect(cloud.removeDay).not.toHaveBeenCalled();
  });

  it("an edit made before hydration survives the snapshot and is flushed", async () => {
    const { result } = renderHook(() => useFoodLog("u1"));

    // Edit while still offline / pre-hydration.
    act(() => {
      result.current.addEntry("2026-06-21", {
        title: "Egg",
        mode: "total",
        calories: 78,
      });
    });
    // Not hydrated yet → nothing pushed.
    await flush();
    expect(cloud.writeDay).not.toHaveBeenCalled();

    // Snapshot arrives without the edited day.
    emitRemote({ "2026-06-20": [entry("remote")] });

    // Local edit is preserved and remote day is merged in.
    expect(result.current.log["2026-06-21"]).toHaveLength(1);
    expect(result.current.log["2026-06-20"]).toEqual([entry("remote")]);

    await flush();
    // Only the edited day is written; the remote day is untouched.
    expect(cloud.writeDay).toHaveBeenCalledWith(
      "u1",
      "2026-06-21",
      expect.any(Array),
    );
    expect(cloud.writeDay).not.toHaveBeenCalledWith(
      "u1",
      "2026-06-20",
      expect.anything(),
    );
  });

  it("edits write only the touched day, not the whole blob", async () => {
    const { result } = renderHook(() => useFoodLog("u1"));
    emitRemote({
      "2026-06-10": [entry("a")],
      "2026-06-11": [entry("b")],
    });

    act(() => {
      result.current.addEntry("2026-06-12", {
        title: "New",
        mode: "total",
        calories: 5,
      });
    });
    await flush();

    expect(cloud.writeDay).toHaveBeenCalledTimes(1);
    expect(cloud.writeDay).toHaveBeenCalledWith(
      "u1",
      "2026-06-12",
      expect.any(Array),
    );
  });

  it("clearing a day's last entry removes just that day's path", async () => {
    const { result } = renderHook(() => useFoodLog("u1"));
    emitRemote({ "2026-06-10": [entry("only")] });

    act(() => {
      result.current.deleteEntry("2026-06-10", "only");
    });
    await flush();

    expect(cloud.removeDay).toHaveBeenCalledWith("u1", "2026-06-10");
    expect(cloud.writeDay).not.toHaveBeenCalled();
  });
});
