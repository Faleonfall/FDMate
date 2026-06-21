import {
  isStorageRecord,
  readJsonStorage,
  writeJsonStorage,
} from "../../../lib/storageCache";
import { isDateKey } from "../lib/dateUtils";
import type { FoodEntry, FoodLog } from "../types";

export const LOG_STORAGE_KEY = "fdmate:food-log:v1";

function isFoodEntry(value: unknown): value is FoodEntry {
  if (!isStorageRecord(value)) {
    return false;
  }

  if (typeof value.id !== "string" || typeof value.title !== "string") {
    return false;
  }

  if (typeof value.createdAt !== "number") {
    return false;
  }

  if (value.mode === "total") {
    return typeof value.calories === "number";
  }

  if (value.mode === "per100g") {
    return (
      typeof value.caloriesPer100g === "number" &&
      typeof value.grams === "number"
    );
  }

  return false;
}

/** Coerce arbitrary parsed JSON into a clean log; drops malformed dates/entries. */
export function sanitizeFoodLog(raw: unknown): FoodLog {
  if (!isStorageRecord(raw)) {
    return {};
  }

  const log: FoodLog = {};
  for (const [date, entries] of Object.entries(raw)) {
    if (!isDateKey(date) || !Array.isArray(entries)) {
      continue;
    }

    const valid = entries.filter(isFoodEntry);
    if (valid.length > 0) {
      log[date] = valid;
    }
  }

  return log;
}

/** Read and sanitize the stored log; drops any malformed entries/dates. */
export function loadFoodLog(storage: Storage): FoodLog {
  return sanitizeFoodLog(readJsonStorage<unknown>(storage, LOG_STORAGE_KEY, {}));
}

export function saveFoodLog(storage: Storage, log: FoodLog) {
  writeJsonStorage(storage, LOG_STORAGE_KEY, log);
}
