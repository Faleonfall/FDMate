import { describe, expect, it } from "vitest";

import {
  ENTRY_FORM_ERRORS,
  buildEntryDraft,
  initialEntryFields,
  parsePositive,
  parseTotalExpression,
  type EntryFormFields,
} from "../entryForm";

const blank: EntryFormFields = {
  date: "2026-10-18",
  title: "",
  mode: "per100g",
  calories: "",
  per100g: "",
  grams: "",
};

describe("entryForm", () => {
  it("prefills fields from the entry being edited", () => {
    expect(
      initialEntryFields("2026-10-18", {
        id: "a",
        title: "Rice",
        createdAt: 1,
        mode: "per100g",
        caloriesPer100g: 130,
        grams: 200,
      }),
    ).toEqual({ ...blank, title: "Rice", per100g: "130", grams: "200" });

    expect(
      initialEntryFields("2026-10-18", {
        id: "b",
        title: "Toast",
        createdAt: 1,
        mode: "total",
        calories: 146,
      }),
    ).toEqual({ ...blank, title: "Toast", mode: "total", calories: "146" });
  });

  it("starts a new entry empty in per 100 g mode", () => {
    expect(initialEntryFields("2026-10-18")).toEqual(blank);
  });

  it("accepts only finite positive numbers", () => {
    expect(parsePositive("12.5")).toBe(12.5);
    expect(parsePositive("0")).toBeNull();
    expect(parsePositive("-3")).toBeNull();
    expect(parsePositive("abc")).toBeNull();
  });

  it("evaluates totals rounded up and rejects zero", () => {
    expect(parseTotalExpression("56 + 45 * 2")).toBe(146);
    expect(parseTotalExpression("10 / 3")).toBe(4);
    expect(parseTotalExpression("-200")).toBe(-200);
    expect(parseTotalExpression("5 - 5")).toBeNull();
    expect(parseTotalExpression("2 +")).toBeNull();
  });

  it("requires a name", () => {
    expect(buildEntryDraft({ ...blank, title: "   " })).toEqual({
      error: ENTRY_FORM_ERRORS.title,
    });
  });

  it("builds a trimmed total draft", () => {
    expect(
      buildEntryDraft({
        ...blank,
        title: "  Toast ",
        mode: "total",
        calories: "56+45*2",
      }),
    ).toEqual({ draft: { title: "Toast", mode: "total", calories: 146 } });

    expect(
      buildEntryDraft({ ...blank, title: "Toast", mode: "total" }),
    ).toEqual({ error: ENTRY_FORM_ERRORS.total });
  });

  it("builds a per 100 g draft only with both numbers", () => {
    expect(
      buildEntryDraft({
        ...blank,
        title: "Rice",
        per100g: "130",
        grams: "200",
      }),
    ).toEqual({
      draft: {
        title: "Rice",
        mode: "per100g",
        caloriesPer100g: 130,
        grams: 200,
      },
    });

    expect(
      buildEntryDraft({ ...blank, title: "Rice", per100g: "130" }),
    ).toEqual({ error: ENTRY_FORM_ERRORS.per100g });
  });
});
