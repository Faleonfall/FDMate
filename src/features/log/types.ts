/** How the calories for a food entry were specified. */
export type EntryMode = "total" | "per100g";

type BaseEntry = {
  id: string;
  title: string;
  /** Epoch ms when the entry was created; used for stable ordering. */
  createdAt: number;
};

/** Calories entered directly as a single total for the portion eaten. */
export type TotalEntry = BaseEntry & {
  mode: "total";
  calories: number;
};

/** Calories entered per 100 g, multiplied by the grams actually eaten. */
export type Per100gEntry = BaseEntry & {
  mode: "per100g";
  caloriesPer100g: number;
  grams: number;
};

export type FoodEntry = TotalEntry | Per100gEntry;

/** All entries for a single calendar date, keyed by ISO `YYYY-MM-DD`. */
export type FoodLog = Record<string, FoodEntry[]>;

/** A day plus its entries, ready to render. */
export type DayLog = {
  date: string;
  entries: FoodEntry[];
};
