import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addDays,
  addMonths,
  formatLongDate,
  formatWeekRange,
  isDateKey,
  monthMatrix,
  relativeDayLabel,
  startOfWeek,
  todayKey,
  weekKeys,
} from "../dates";

beforeEach(() => {
  vi.useFakeTimers();
  // A Sunday, so the week runs Monday 12 to Sunday 18 October.
  vi.setSystemTime(new Date(2026, 9, 18, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("dates", () => {
  it("validates date keys", () => {
    expect(isDateKey("2026-10-18")).toBe(true);
    expect(isDateKey("2026-1-8")).toBe(false);
    expect(isDateKey("not-a-date")).toBe(false);
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("moves months onto their first day", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-01");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-01");
  });

  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-10-18")).toBe("2026-10-12");
    expect(startOfWeek("2026-10-12")).toBe("2026-10-12");
    expect(weekKeys("2026-10-14")).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
  });

  it("builds a six week month grid from the Monday before the first", () => {
    const cells = monthMatrix("2026-10-18").flat();

    expect(cells).toHaveLength(42);
    expect(cells[0]).toEqual({ key: "2026-09-28", inMonth: false });
    expect(cells[3]).toEqual({ key: "2026-10-01", inMonth: true });
    expect(cells.at(-1)).toEqual({ key: "2026-11-08", inMonth: false });
  });

  it("formats fixed numeric labels", () => {
    expect(formatLongDate("2026-10-18")).toBe("18.10.2026");
    expect(formatWeekRange("2026-10-14")).toBe("12.10 – 18.10.2026");
  });

  it("labels days relative to today", () => {
    expect(todayKey()).toBe("2026-10-18");
    expect(relativeDayLabel("2026-10-18")).toBe("Today");
    expect(relativeDayLabel("2026-10-17")).toBe("Yesterday");
    expect(relativeDayLabel("2026-10-15")).toBe("Thursday");
  });
});
