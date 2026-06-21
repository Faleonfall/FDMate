import { describe, expect, it } from "vitest";

import {
  buildExport,
  filterLogByRange,
  parseImport,
} from "../src/features/log/lib/exportImport";
import { toDateKey } from "../src/features/log/lib/dateUtils";
import type { FoodLog } from "../src/features/log/types";

function keyDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateKey(date);
}

function entry(id: string) {
  return { id, title: "Food", createdAt: 1, mode: "total" as const, calories: 100 };
}

const log: FoodLog = {
  [keyDaysAgo(0)]: [entry("today")],
  [keyDaysAgo(3)]: [entry("recent")],
  [keyDaysAgo(40)]: [entry("month-old")],
  [keyDaysAgo(200)]: [entry("year-old")],
};

describe("filterLogByRange", () => {
  it("keeps everything for all-time", () => {
    expect(Object.keys(filterLogByRange(log, "all"))).toHaveLength(4);
  });

  it("keeps only the last 7 days", () => {
    const keys = Object.keys(filterLogByRange(log, "7days"));
    expect(keys).toContain(keyDaysAgo(0));
    expect(keys).toContain(keyDaysAgo(3));
    expect(keys).not.toContain(keyDaysAgo(40));
  });

  it("keeps the last month but not older", () => {
    const keys = Object.keys(filterLogByRange(log, "month"));
    expect(keys).toContain(keyDaysAgo(3));
    expect(keys).not.toContain(keyDaysAgo(40));
  });
});

describe("export -> import round trip", () => {
  it("re-imports exported entries", () => {
    const text = buildExport(log, "all", "2026-06-21T00:00:00.000Z");
    expect(parseImport(text)).toEqual(log);
  });

  it("accepts a bare date->entries map", () => {
    expect(parseImport(JSON.stringify(log))).toEqual(log);
  });

  it("throws on JSON with no valid entries", () => {
    expect(() => parseImport(JSON.stringify({ days: {} }))).toThrow();
  });

  it("throws on non-JSON", () => {
    expect(() => parseImport("not json")).toThrow();
  });
});
