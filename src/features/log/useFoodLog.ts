import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { removeDay, subscribeLog, writeDay } from "./data/cloudSync";
import { loadFoodLog, saveFoodLog } from "./data/logStorage";
import type { DayLog, FoodEntry, FoodLog } from "./types";

/** Debounce window before dirty days are flushed to the cloud. */
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

/**
 * Take a remote snapshot as the base, then overlay only the days the user has
 * edited locally but not yet flushed (`dirty`). Un-edited days always fall back
 * to the remote value, so a stale local cache can never resurrect or clobber
 * cloud data — only days actively changed this session survive.
 */
export function mergeRemoteWithDirty(
  remote: FoodLog,
  local: FoodLog,
  dirty: Iterable<string>,
): FoodLog {
  const merged: FoodLog = { ...remote };
  for (const date of dirty) {
    const entries = local[date];
    if (entries && entries.length > 0) {
      merged[date] = entries;
    } else {
      delete merged[date];
    }
  }
  return merged;
}

export function useFoodLog(uid: string) {
  // Seed from the local cache for an instant, offline-capable first paint.
  const [log, setLog] = useState<FoodLog>(() => {
    const storage = getStorage();
    return storage ? loadFoodLog(storage) : {};
  });

  // Always-current snapshot of `log` for async flushes (avoids stale closures).
  const logRef = useRef(log);
  logRef.current = log;

  // Days changed locally but not yet confirmed written to the cloud. Pushes are
  // driven by this set, so remote snapshots never echo back as writes.
  const dirty = useRef<Set<string>>(new Set());
  // Becomes true after the first remote snapshot. Gates flushes so the local
  // cache can never clobber cloud data before we have loaded it.
  const hydrated = useRef(false);

  // Mirror every change into the local cache.
  useEffect(() => {
    const storage = getStorage();
    if (storage) {
      saveFoodLog(storage, log);
    }
  }, [log]);

  // Flush each dirty day to its own path. Failures keep the day dirty so it is
  // retried on the next flush (e.g. after the connection returns).
  const flush = useCallback(async () => {
    if (!hydrated.current) {
      return;
    }
    const dates = [...dirty.current];
    await Promise.all(
      dates.map(async (date) => {
        const entries = logRef.current[date];
        try {
          if (entries && entries.length > 0) {
            await writeDay(uid, date, entries);
          } else {
            await removeDay(uid, date);
          }
          dirty.current.delete(date);
        } catch {
          // Keep the day dirty; a later flush retries it.
        }
      }),
    );
  }, [uid]);

  // Subscribe to the signed-in user's cloud log. Remote is the base; locally
  // edited (dirty) days are overlaid so un-flushed edits are never lost.
  useEffect(() => {
    hydrated.current = false;
    dirty.current.clear();
    const unsubscribe = subscribeLog(uid, (remote) => {
      hydrated.current = true;
      setLog((local) => mergeRemoteWithDirty(remote, local, dirty.current));
    });
    return unsubscribe;
  }, [uid]);

  // Debounced flush of any pending dirty days, once hydrated.
  useEffect(() => {
    if (!hydrated.current || dirty.current.size === 0) {
      return;
    }
    const timer = setTimeout(() => {
      void flush();
    }, PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [log, flush]);

  const markDirty = useCallback((...dates: string[]) => {
    for (const date of dates) {
      dirty.current.add(date);
    }
  }, []);

  const addEntry = useCallback(
    (date: string, draft: EntryDraft) => {
      const entry = buildEntry(draft);
      markDirty(date);
      setLog((current) => {
        const existing = current[date] ?? [];
        return { ...current, [date]: [...existing, entry] };
      });
    },
    [markDirty],
  );

  const deleteEntry = useCallback(
    (date: string, entryId: string) => {
      markDirty(date);
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
    },
    [markDirty],
  );

  // Edit an entry in place, preserving id/createdAt. Moving it to a different
  // date removes it from the original day and appends to the target day.
  const updateEntry = useCallback(
    (
      originalDate: string,
      entryId: string,
      nextDate: string,
      draft: EntryDraft,
    ) => {
      markDirty(originalDate, nextDate);
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
    [markDirty],
  );

  // Merge imported days, overriding any day that already exists.
  const importDays = useCallback(
    (incoming: FoodLog) => {
      markDirty(...Object.keys(incoming));
      setLog((current) => ({ ...current, ...incoming }));
    },
    [markDirty],
  );

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
