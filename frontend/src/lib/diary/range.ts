import { dayTotalCalories } from "./calories";
import { addDays, addMonths, todayKey, weekKeys } from "./dates";
import type { FoodLog, ViewMode } from "./types";

/** Move the anchor one day, week or month in `direction`. */
export function shiftAnchor(
  mode: ViewMode,
  anchor: string,
  direction: 1 | -1,
): string {
  if (mode === "monthly") {
    return addMonths(anchor, direction);
  }
  return addDays(anchor, direction * (mode === "weekly" ? 7 : 1));
}

export function todayTotal(log: FoodLog): number {
  return dayTotalCalories(log[todayKey()] ?? []);
}

/** Mean daily total over the logged days of the week around `anchor`. */
export function weekAverage(log: FoodLog, anchor: string): number {
  const totals = weekKeys(anchor)
    .map((date) => log[date] ?? [])
    .filter((entries) => entries.length > 0)
    .map((entries) => dayTotalCalories(entries));
  if (totals.length === 0) {
    return 0;
  }
  return Math.round(
    totals.reduce((sum, total) => sum + total, 0) / totals.length,
  );
}

/** Logged dates in the month of `anchor`, newest first. */
export function monthLoggedDays(log: FoodLog, anchor: string): string[] {
  const monthPrefix = anchor.slice(0, 7);
  return Object.keys(log)
    .filter((key) => key.startsWith(monthPrefix))
    .sort((a, b) => (a < b ? 1 : -1));
}
