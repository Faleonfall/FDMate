import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { removeDay, subscribeLog, writeDay } from "../../lib/diary/cloudSync";
import {
  addEntryToLog,
  buildEntry,
  mergeRemoteWithDirty,
  removeEntryFromLog,
  sortedDays,
  updateEntryInLog,
} from "../../lib/diary/entries";
import { loadFoodLog, saveFoodLog } from "../../lib/diary/storage";
import type { DayLog, EntryDraft, FoodLog } from "../../lib/diary/types";
import { getLocalStorage } from "../../lib/app/storageCache";

/** Debounce window before dirty days are flushed to the cloud. */
const PUSH_DELAY_MS = 600;

export function useFoodLog(uid: string) {
  // Seed from the local cache for an instant, offline-capable first paint.
  const [log, setLog] = useState<FoodLog>(() => {
    const storage = getLocalStorage();
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

  const days = useMemo<DayLog[]>(() => sortedDays(log), [log]);

  // Mirror every change into the local cache.
  useEffect(() => {
    const storage = getLocalStorage();
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
      setLog((current) => addEntryToLog(current, date, entry));
    },
    [markDirty],
  );

  const deleteEntry = useCallback(
    (date: string, entryId: string) => {
      markDirty(date);
      setLog((current) => removeEntryFromLog(current, date, entryId));
    },
    [markDirty],
  );

  const updateEntry = useCallback(
    (
      originalDate: string,
      entryId: string,
      nextDate: string,
      draft: EntryDraft,
    ) => {
      markDirty(originalDate, nextDate);
      setLog((current) =>
        updateEntryInLog(current, originalDate, entryId, nextDate, draft),
      );
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

  return { log, days, addEntry, updateEntry, deleteEntry, importDays };
}
