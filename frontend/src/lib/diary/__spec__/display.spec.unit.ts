import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  calendarDays,
  dayCardClassName,
  entryDetail,
  importedDaysText,
  rangeLabel,
  summaryLabel,
  viewIndex,
} from "../display";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 18, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("display", () => {
  it("indexes each view for the toggle highlight", () => {
    expect(viewIndex("daily")).toBe(0);
    expect(viewIndex("weekly")).toBe(1);
    expect(viewIndex("monthly")).toBe(2);
  });

  it("describes per 100 g portions only", () => {
    expect(
      entryDetail({
        id: "a",
        title: "Apple",
        createdAt: 1,
        mode: "per100g",
        caloriesPer100g: 52,
        grams: 180,
      }),
    ).toBe("180 g at 52 kcal/100g");
    expect(
      entryDetail({
        id: "b",
        title: "Toast",
        createdAt: 1,
        mode: "total",
        calories: 90,
      }),
    ).toBe("");
  });

  it("labels the range and summary for each view", () => {
    expect(rangeLabel("daily", "2026-10-18")).toBe("18.10.2026");
    expect(rangeLabel("weekly", "2026-10-18")).toBe("12.10 – 18.10.2026");
    expect(rangeLabel("monthly", "2026-10-18")).toBe("October 2026");
    expect(summaryLabel("weekly")).toBe("Today / Weekly avg");
    expect(summaryLabel("daily")).toBe("Today");
  });

  it("pluralizes the import toast", () => {
    expect(importedDaysText(1)).toBe("Imported 1 day");
    expect(importedDaysText(3)).toBe("Imported 3 days");
  });

  it("builds day card class names", () => {
    expect(dayCardClassName(false)).toBe("day-card");
    expect(dayCardClassName(true, true)).toBe(
      "day-card day-card--empty day-card--today",
    );
  });

  it("marks logged, outside and today cells in the month grid", () => {
    const cells = calendarDays("2026-10-18", {
      "2026-10-18": [
        { id: "a", title: "x", createdAt: 1, mode: "total", calories: 420 },
      ],
    });
    const today = cells.find((cell) => cell.key === "2026-10-18");
    const outside = cells[0];

    expect(today).toMatchObject({
      day: 18,
      inMonth: true,
      today: true,
      hasEntries: true,
      total: 420,
      label: "2026-10-18, 420 kcal",
    });
    expect(outside).toMatchObject({
      key: "2026-09-28",
      inMonth: false,
      hasEntries: false,
      label: "2026-09-28, no entries",
    });
  });
});
