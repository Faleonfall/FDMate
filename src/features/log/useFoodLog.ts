import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { subscribeLog, pushLog } from "./data/cloudSync";
import { loadFoodLog, saveFoodLog } from "./data/logStorage";
import type { DayLog, FoodEntry, FoodLog } from "./types";

/** Debounce window before a local change is pushed to the cloud. */
const PUSH_DELAY_MS = 600;

/** New-entry payload without the generated id/timestamp fields. */
export type EntryDraft =
  | { title: string; mode: "total"; calories: number }
  | { title: string; mode: "per100g"; caloriesPer100g: number; grams: number };

function createEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function entryFromDraft(
  base: { id: string; createdAt: number },
  draft: EntryDraft,
): FoodEntry {
  const common = { ...base, title: draft.title.trim() };

  if (draft.mode === "total") {
    return { ...common, mode: "total", calories: draft.calories };
  }

  return {
    ...common,
    mode: "per100g",
    caloriesPer100g: draft.caloriesPer100g,
    grams: draft.grams,
  };
}

function buildEntry(draft: EntryDraft): FoodEntry {
  return entryFromDraft({ id: createEntryId(), createdAt: Date.now() }, draft);
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useFoodLog(uid: string) {
  // Seed from the local cache for an instant, offline-capable first paint.
  const [log, setLog] = useState<FoodLog>(() => {
    const storage = getStorage();
    return storage ? loadFoodLog(storage) : {};
  });

  // True only for the setLog triggered by a remote snapshot, so the push
  // effect can skip re-uploading data that just came down from the cloud.
  const applyingRemote = useRef(false);
  // Becomes true after the first remote snapshot. Gates pushes so the local
  // cache can never clobber newer cloud data before we have loaded it.
  const hydrated = useRef(false);

  // Mirror every change into the local cache.
  useEffect(() => {
    const storage = getStorage();
    if (storage) {
      saveFoodLog(storage, log);
    }
  }, [log]);

  // Subscribe to the signed-in user's cloud log. Remote is the source of
  // truth; its snapshots replace local state without echoing back.
  useEffect(() => {
    hydrated.current = false;
    const unsubscribe = subscribeLog(uid, (remote) => {
      applyingRemote.current = true;
      hydrated.current = true;
      setLog(remote);
    });
    return unsubscribe;
  }, [uid]);

  // Push local edits to the cloud (debounced). Skips remote-originated
  // updates and waits until the initial snapshot has hydrated.
  useEffect(() => {
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    if (!hydrated.current) {
      return;
    }
    const timer = setTimeout(() => {
      void pushLog(uid, log);
    }, PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [log, uid]);

  const addEntry = useCallback((date: string, draft: EntryDraft) => {
    const entry = buildEntry(draft);
    setLog((current) => {
      const existing = current[date] ?? [];
      return { ...current, [date]: [...existing, entry] };
    });
  }, []);

  const deleteEntry = useCallback((date: string, entryId: string) => {
    setLog((current) => {
      const existing = current[date];
      if (!existing) {
        return current;
      }

      const remaining = existing.filter((entry) => entry.id !== entryId);
      const next = { ...current };
      if (remaining.length > 0) {
        next[date] = remaining;
      } else {
        delete next[date];
      }
      return next;
    });
  }, []);

  // Edit an entry in place, preserving id/createdAt. Moving it to a different
  // date removes it from the original day and appends to the target day.
  const updateEntry = useCallback(
    (
      originalDate: string,
      entryId: string,
      nextDate: string,
      draft: EntryDraft,
    ) => {
      setLog((current) => {
        const source = current[originalDate];
        const target = source?.find((entry) => entry.id === entryId);
        if (!source || !target) {
          return current;
        }

        const updated = entryFromDraft(
          { id: target.id, createdAt: target.createdAt },
          draft,
        );

        if (nextDate === originalDate) {
          return {
            ...current,
            [originalDate]: source.map((entry) =>
              entry.id === entryId ? updated : entry,
            ),
          };
        }

        const next = { ...current };
        const remaining = source.filter((entry) => entry.id !== entryId);
        if (remaining.length > 0) {
          next[originalDate] = remaining;
        } else {
          delete next[originalDate];
        }
        next[nextDate] = [...(next[nextDate] ?? []), updated];
        return next;
      });
    },
    [],
  );

  // Merge imported days, overriding any day that already exists.
  const importDays = useCallback((incoming: FoodLog) => {
    setLog((current) => ({ ...current, ...incoming }));
  }, []);

  // Days newest-first; entries within a day oldest-first (as logged).
  const days = useMemo<DayLog[]>(() => {
    return Object.keys(log)
      .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
      .map((date) => ({
        date,
        entries: [...(log[date] ?? [])].sort(
          (a, b) => a.createdAt - b.createdAt,
        ),
      }));
  }, [log]);

  return { log, days, addEntry, updateEntry, deleteEntry, importDays };
}
