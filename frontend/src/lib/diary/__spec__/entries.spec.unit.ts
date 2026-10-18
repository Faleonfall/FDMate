import { describe, expect, it } from "vitest";

import {
  addEntryToLog,
  buildEntry,
  mergeRemoteWithDirty,
  removeEntryFromLog,
  sortedDays,
  updateEntryInLog,
} from "../entries";
import type { FoodEntry, FoodLog } from "../types";

function entry(id: string, createdAt = 1): FoodEntry {
  return { id, title: id, createdAt, mode: "total", calories: 100 };
}

describe("entries", () => {
  it("builds an entry with a fresh id and a trimmed title", () => {
    const first = buildEntry({ title: " Egg ", mode: "total", calories: 78 });
    const second = buildEntry({ title: "Egg", mode: "total", calories: 78 });

    expect(first).toMatchObject({ title: "Egg", mode: "total", calories: 78 });
    expect(first.id).not.toBe(second.id);
  });

  it("overlays only dirty days on the remote log", () => {
    const remote: FoodLog = {
      "2026-10-17": [entry("r1")],
      "2026-10-18": [entry("r2")],
    };
    const local: FoodLog = {
      "2026-10-17": [entry("stale")],
      "2026-10-18": [entry("edit")],
    };

    expect(mergeRemoteWithDirty(remote, local, ["2026-10-18"])).toEqual({
      "2026-10-17": [entry("r1")],
      "2026-10-18": [entry("edit")],
    });
  });

  it("drops a dirty day that was emptied locally", () => {
    const remote: FoodLog = { "2026-10-18": [entry("r")] };

    expect(mergeRemoteWithDirty(remote, {}, ["2026-10-18"])).toEqual({});
  });

  it("appends entries and removes empty days", () => {
    const log = addEntryToLog({}, "2026-10-18", entry("a"));
    expect(log).toEqual({ "2026-10-18": [entry("a")] });
    expect(removeEntryFromLog(log, "2026-10-18", "a")).toEqual({});
    expect(removeEntryFromLog(log, "2026-10-01", "a")).toBe(log);
  });

  it("updates an entry in place and keeps its identity", () => {
    const log: FoodLog = { "2026-10-18": [entry("a", 5), entry("b")] };
    const next = updateEntryInLog(log, "2026-10-18", "a", "2026-10-18", {
      title: "Apple",
      mode: "per100g",
      caloriesPer100g: 52,
      grams: 180,
    });

    expect(next["2026-10-18"]).toEqual([
      {
        id: "a",
        title: "Apple",
        createdAt: 5,
        mode: "per100g",
        caloriesPer100g: 52,
        grams: 180,
      },
      entry("b"),
    ]);
  });

  it("moves an edited entry to its new date", () => {
    const log: FoodLog = {
      "2026-10-17": [entry("a")],
      "2026-10-18": [entry("b")],
    };
    const next = updateEntryInLog(log, "2026-10-17", "a", "2026-10-18", {
      title: "a",
      mode: "total",
      calories: 100,
    });

    expect(next).toEqual({ "2026-10-18": [entry("b"), entry("a")] });
  });

  it("ignores updates to unknown entries", () => {
    const log: FoodLog = { "2026-10-18": [entry("a")] };
    const draft = { title: "x", mode: "total" as const, calories: 1 };

    expect(
      updateEntryInLog(log, "2026-10-18", "zzz", "2026-10-18", draft),
    ).toBe(log);
  });

  it("sorts days newest first and entries oldest first", () => {
    const log: FoodLog = {
      "2026-10-16": [entry("x")],
      "2026-10-18": [entry("late", 9), entry("early", 2)],
    };

    expect(sortedDays(log)).toEqual([
      { date: "2026-10-18", entries: [entry("early", 2), entry("late", 9)] },
      { date: "2026-10-16", entries: [entry("x")] },
    ]);
  });
});
