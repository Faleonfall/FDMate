import { describe, expect, it } from "vitest";

import {
  dayTotalCalories,
  entryCalories,
} from "../src/features/log/lib/calorieMath";
import type { FoodEntry } from "../src/features/log/types";

const totalEntry: FoodEntry = {
  id: "a",
  title: "Snack bar",
  createdAt: 1,
  mode: "total",
  calories: 240,
};

const per100gEntry: FoodEntry = {
  id: "b",
  title: "Greek yogurt",
  createdAt: 2,
  mode: "per100g",
  caloriesPer100g: 59,
  grams: 250,
};

describe("entryCalories", () => {
  it("returns the total directly for total entries", () => {
    expect(entryCalories(totalEntry)).toBe(240);
  });

  it("scales per-100g entries by grams eaten", () => {
    // 59 kcal/100g * 250g / 100 = 147.5 -> rounds to 148
    expect(entryCalories(per100gEntry)).toBe(148);
  });
});

describe("dayTotalCalories", () => {
  it("sums all entries in a day", () => {
    expect(dayTotalCalories([totalEntry, per100gEntry])).toBe(388);
  });

  it("returns 0 for an empty day", () => {
    expect(dayTotalCalories([])).toBe(0);
  });
});
