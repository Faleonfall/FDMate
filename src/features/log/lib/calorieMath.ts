import type { FoodEntry } from "../types";

/** Calories contributed by a single entry, rounded to a whole number. */
export function entryCalories(entry: FoodEntry): number {
  if (entry.mode === "total") {
    return Math.round(entry.calories);
  }

  return Math.round((entry.caloriesPer100g * entry.grams) / 100);
}

/** Sum of calories across all entries in a day. */
export function dayTotalCalories(entries: readonly FoodEntry[]): number {
  return entries.reduce((total, entry) => total + entryCalories(entry), 0);
}
