import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  monthLoggedDays,
  shiftAnchor,
  todayTotal,
  weekAverage,
} from "../range";
import type { FoodEntry, FoodLog } from "../types";

function total(calories: number): FoodEntry {
  return {
    id: String(calories),
    title: "x",
    createdAt: 1,
    mode: "total",
    calories,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 18, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("range", () => {
  it("shifts the anchor by the step of each view", () => {
    expect(shiftAnchor("daily", "2026-10-18", 1)).toBe("2026-10-19");
    expect(shiftAnchor("weekly", "2026-10-18", -1)).toBe("2026-10-11");
    expect(shiftAnchor("monthly", "2026-10-18", 1)).toBe("2026-11-01");
  });

  it("totals today only", () => {
    const log: FoodLog = {
      "2026-10-18": [total(300), total(200)],
      "2026-10-17": [total(999)],
    };

    expect(todayTotal(log)).toBe(500);
    expect(todayTotal({})).toBe(0);
  });

  it("averages the logged days of the anchor week", () => {
    const log: FoodLog = {
      "2026-10-12": [total(1000)],
      "2026-10-14": [total(1500), total(500)],
      "2026-10-19": [total(9999)],
    };

    expect(weekAverage(log, "2026-10-18")).toBe(1500);
    expect(weekAverage(log, "2026-09-01")).toBe(0);
  });

  it("lists the logged days of the anchor month newest first", () => {
    const log: FoodLog = {
      "2026-10-02": [total(1)],
      "2026-10-20": [total(1)],
      "2026-11-01": [total(1)],
    };

    expect(monthLoggedDays(log, "2026-10-18")).toEqual([
      "2026-10-20",
      "2026-10-02",
    ]);
  });
});
