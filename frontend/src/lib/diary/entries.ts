import type { DayLog, EntryDraft, FoodEntry, FoodLog } from "./types";

export function createEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function entryFromDraft(
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

export function buildEntry(draft: EntryDraft): FoodEntry {
  return entryFromDraft({ id: createEntryId(), createdAt: Date.now() }, draft);
}

/**
 * Take a remote snapshot as the base, then overlay only the days the user has
 * edited locally but not yet flushed (`dirty`). Un-edited days always fall back
 * to the remote value, so a stale local cache can never resurrect or clobber
 * cloud data, only days actively changed this session survive.
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

export function addEntryToLog(
  log: FoodLog,
  date: string,
  entry: FoodEntry,
): FoodLog {
  return { ...log, [date]: [...(log[date] ?? []), entry] };
}

/** Drop one entry, and the whole day once it has no entries left. */
export function removeEntryFromLog(
  log: FoodLog,
  date: string,
  entryId: string,
): FoodLog {
  const existing = log[date];
  if (!existing) {
    return log;
  }

  const remaining = existing.filter((entry) => entry.id !== entryId);
  const next = { ...log };
  if (remaining.length > 0) {
    next[date] = remaining;
  } else {
    delete next[date];
  }
  return next;
}

// Edit an entry in place, preserving id/createdAt. Moving it to a different
// date removes it from the original day and appends to the target day.
export function updateEntryInLog(
  log: FoodLog,
  originalDate: string,
  entryId: string,
  nextDate: string,
  draft: EntryDraft,
): FoodLog {
  const source = log[originalDate];
  const target = source?.find((entry) => entry.id === entryId);
  if (!source || !target) {
    return log;
  }

  const updated = entryFromDraft(
    { id: target.id, createdAt: target.createdAt },
    draft,
  );

  if (nextDate === originalDate) {
    return {
      ...log,
      [originalDate]: source.map((entry) =>
        entry.id === entryId ? updated : entry,
      ),
    };
  }

  return addEntryToLog(
    removeEntryFromLog(log, originalDate, entryId),
    nextDate,
    updated,
  );
}

/** Days newest-first, entries within a day oldest-first (as logged). */
export function sortedDays(log: FoodLog): DayLog[] {
  return Object.keys(log)
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .map((date) => ({
      date,
      entries: [...(log[date] ?? [])].sort((a, b) => a.createdAt - b.createdAt),
    }));
}
