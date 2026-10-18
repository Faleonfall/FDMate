import { evalExpression } from "./calcExpression";
import type { EntryDraft, EntryMode, FoodEntry } from "./types";

export const ENTRY_FORM_ERRORS = {
  title: "Enter a name.",
  total: "Enter a non-zero amount, e.g. 56 + 45 * 2 or -200.",
  per100g: "Enter calories per 100 g and grams eaten.",
} as const;

/** Raw text of every form input, kept as typed until submit. */
export type EntryFormFields = {
  date: string;
  title: string;
  mode: EntryMode;
  calories: string;
  per100g: string;
  grams: string;
};

export type EntryFormResult = { draft: EntryDraft } | { error: string };

/** Form values for a new entry on `date`, or prefilled from `editing`. */
export function initialEntryFields(
  date: string,
  editing?: FoodEntry,
): EntryFormFields {
  return {
    date,
    title: editing?.title ?? "",
    mode: editing?.mode ?? "per100g",
    calories: editing?.mode === "total" ? String(editing.calories) : "",
    per100g: editing?.mode === "per100g" ? String(editing.caloriesPer100g) : "",
    grams: editing?.mode === "per100g" ? String(editing.grams) : "",
  };
}

export function parsePositive(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/**
 * Evaluate an arithmetic total (e.g. "56+45*2"), rounded up. Negatives are
 * allowed (e.g. "-200" to log burned calories). Null if invalid or zero.
 */
export function parseTotalExpression(value: string): number | null {
  const result = evalExpression(value);
  if (result === null || result === 0) {
    return null;
  }
  return Math.ceil(result);
}

/** Validate the form, returning the draft to save or the message to show. */
export function buildEntryDraft(fields: EntryFormFields): EntryFormResult {
  const title = fields.title.trim();
  if (!title) {
    return { error: ENTRY_FORM_ERRORS.title };
  }

  if (fields.mode === "total") {
    const calories = parseTotalExpression(fields.calories);
    if (calories === null) {
      return { error: ENTRY_FORM_ERRORS.total };
    }
    return { draft: { title, mode: "total", calories } };
  }

  const caloriesPer100g = parsePositive(fields.per100g);
  const grams = parsePositive(fields.grams);
  if (caloriesPer100g === null || grams === null) {
    return { error: ENTRY_FORM_ERRORS.per100g };
  }
  return { draft: { title, mode: "per100g", caloriesPer100g, grams } };
}
