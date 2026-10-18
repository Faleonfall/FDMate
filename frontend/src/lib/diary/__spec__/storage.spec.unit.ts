import { beforeEach, describe, expect, it } from "vitest";

import { createMemoryStorage } from "./storageHelpers";
import { LOG_STORAGE_KEY, loadFoodLog, saveFoodLog } from "../storage";
import type { FoodLog } from "../types";

let storage: Storage;

beforeEach(() => {
  storage = createMemoryStorage();
});

describe("storage", () => {
  it("round-trips a valid log", () => {
    const log: FoodLog = {
      "2026-06-21": [
        { id: "x", title: "Apple", createdAt: 1, mode: "total", calories: 95 },
      ],
    };
    saveFoodLog(storage, log);
    expect(loadFoodLog(storage)).toEqual(log);
  });

  it("returns an empty log when nothing is stored", () => {
    expect(loadFoodLog(storage)).toEqual({});
  });

  it("drops malformed entries and invalid date keys", () => {
    storage.setItem(
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

    expect(loadFoodLog(storage)).toEqual({
      "2026-06-21": [
        { id: "ok", title: "Egg", createdAt: 1, mode: "total", calories: 78 },
      ],
    });
  });
});
