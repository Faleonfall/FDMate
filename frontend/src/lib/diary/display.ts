import { dayTotalCalories } from "./calories";
import {
  dayOfMonth,
  formatLongDate,
  formatMonth,
  formatWeekRange,
  isToday,
  monthMatrix,
} from "./dates";
import type { FoodEntry, FoodLog, ViewMode } from "./types";

export const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
];

export type CalendarDay = {
  key: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  hasEntries: boolean;
  total: number;
  label: string;
};

/** Position of `mode` in the view toggle, for its sliding highlight. */
export function viewIndex(mode: ViewMode): number {
  return Math.max(
    0,
    VIEW_OPTIONS.findIndex((option) => option.value === mode),
  );
}

/** Portion detail under an entry title, empty for a plain total. */
export function entryDetail(entry: FoodEntry): string {
  if (entry.mode === "total") {
    return "";
  }

  return `${entry.grams} g at ${entry.caloriesPer100g} kcal/100g`;
}

/** Navigator label for the range `mode` shows around `anchor`. */
export function rangeLabel(mode: ViewMode, anchor: string): string {
  if (mode === "daily") {
    return formatLongDate(anchor);
  }
  if (mode === "weekly") {
    return formatWeekRange(anchor);
  }
  return formatMonth(anchor);
}

export function summaryLabel(mode: ViewMode): string {
  return mode === "weekly" ? "Today / Weekly avg" : "Today";
}

export function importedDaysText(dayCount: number): string {
  return `Imported ${dayCount} day${dayCount === 1 ? "" : "s"}`;
}

export function dayCardClassName(today: boolean, empty = false): string {
  return [
    "day-card",
    empty ? "day-card--empty" : "",
    today ? "day-card--today" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Every cell of the month grid around `monthAnchor`, with its day total. */
export function calendarDays(monthAnchor: string, log: FoodLog): CalendarDay[] {
  return monthMatrix(monthAnchor).flatMap((week) =>
    week.map((cell) => {
      const entries = log[cell.key] ?? [];
      const hasEntries = entries.length > 0;
      const total = dayTotalCalories(entries);

      return {
        key: cell.key,
        day: dayOfMonth(cell.key),
        inMonth: cell.inMonth,
        today: isToday(cell.key),
        hasEntries,
        total,
        label: hasEntries
          ? `${cell.key}, ${total} kcal`
          : `${cell.key}, no entries`,
      };
    }),
  );
}
