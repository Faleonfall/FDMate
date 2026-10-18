import { describe, expect, it } from "vitest";

import {
  isStorageRecord,
  readJsonStorage,
  readStorageItem,
  removeStorageItem,
  writeJsonStorage,
  writeStorageItem,
} from "../storageCache";
import { createFailingStorage, createMemoryStorage } from "./storageHelpers";

describe("storageCache", () => {
  it("round-trips JSON values", () => {
    const storage = createMemoryStorage();
    writeJsonStorage(storage, "key", { a: [1, 2] });
    expect(readJsonStorage(storage, "key", null)).toEqual({ a: [1, 2] });
  });

  it("falls back when the key is missing or holds invalid JSON", () => {
    const storage = createMemoryStorage();
    expect(readJsonStorage(storage, "missing", "fallback")).toBe("fallback");

    storage.setItem("broken", "{not json");
    expect(readJsonStorage(storage, "broken", "fallback")).toBe("fallback");
  });

  it("never throws when storage access fails", () => {
    const storage = createFailingStorage();
    expect(readJsonStorage(storage, "key", 7)).toBe(7);
    expect(() => writeJsonStorage(storage, "key", 1)).not.toThrow();
    expect(readStorageItem(storage, "key")).toBeNull();
    expect(() => writeStorageItem(storage, "key", "value")).not.toThrow();
    expect(() => removeStorageItem(storage, "key")).not.toThrow();
  });

  it("reads, writes and removes plain string values", () => {
    const storage = createMemoryStorage();
    writeStorageItem(storage, "key", "light");
    expect(readStorageItem(storage, "key")).toBe("light");

    removeStorageItem(storage, "key");
    expect(readStorageItem(storage, "key")).toBeNull();
  });

  it("treats only plain objects as records", () => {
    expect(isStorageRecord({ a: 1 })).toBe(true);
    expect(isStorageRecord([])).toBe(false);
    expect(isStorageRecord(null)).toBe(false);
    expect(isStorageRecord("text")).toBe(false);
  });
});
