import { beforeEach, describe, expect, it } from "vitest";

import {
  LOG_STORAGE_KEY,
  loadFoodLog,
  saveFoodLog,
} from "../src/features/log/data/logStorage";
import type { FoodLog } from "../src/features/log/types";

beforeEach(() => {
  window.localStorage.clear();
});

describe("logStorage", () => {
  it("round-trips a valid log", () => {
    const log: FoodLog = {
      "2026-06-21": [
        { id: "x", title: "Apple", createdAt: 1, mode: "total", calories: 95 },
      ],
    };
    saveFoodLog(window.localStorage, log);
    expect(loadFoodLog(window.localStorage)).toEqual(log);
  });

  it("returns an empty log when nothing is stored", () => {
    expect(loadFoodLog(window.localStorage)).toEqual({});
  });

  it("drops malformed entries and invalid date keys", () => {
    window.localStorage.setItem(
      LOG_STORAGE_KEY,
      JSON.stringify({
        "not-a-date": [
          { id: "a", title: "x", createdAt: 1, mode: "total", calories: 1 },
        ],
        "2026-06-21": [
          { id: "ok", title: "Egg", createdAt: 1, mode: "total", calories: 78 },
          { id: "bad", title: "broken", mode: "total" },
        ],
      }),
    );

    expect(loadFoodLog(window.localStorage)).toEqual({
      "2026-06-21": [
        { id: "ok", title: "Egg", createdAt: 1, mode: "total", calories: 78 },
      ],
    });
  });
});
