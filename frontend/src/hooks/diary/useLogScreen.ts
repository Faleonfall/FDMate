import { useMemo, useState } from "react";

import { todayKey } from "../../lib/diary/dates";
import { shiftAnchor, todayTotal, weekAverage } from "../../lib/diary/range";
import type { EntryDraft, FoodEntry, ViewMode } from "../../lib/diary/types";
import { useFoodLog } from "./useFoodLog";

type FormState =
  { mode: "add" } | { mode: "edit"; date: string; entry: FoodEntry };

/** Food log plus the screen's view mode, anchor date and open form. */
export function useLogScreen(uid: string) {
  const { log, addEntry, updateEntry, deleteEntry, importDays } =
    useFoodLog(uid);
  const [form, setForm] = useState<FormState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [anchor, setAnchor] = useState(todayKey());

  const totals = useMemo(
    () => ({ today: todayTotal(log), weekAverage: weekAverage(log, anchor) }),
    [log, anchor],
  );

  function submitEntry(date: string, draft: EntryDraft) {
    if (form?.mode === "edit") {
      updateEntry(form.date, form.entry.id, date, draft);
    } else {
      addEntry(date, draft);
    }
    setForm(null);
  }

  return {
    log,
    form,
    viewMode,
    anchor,
    totals,
    setViewMode,
    deleteEntry,
    importDays,
    submitEntry,
    openAddForm: () => setForm({ mode: "add" }),
    openEditForm: (date: string, entry: FoodEntry) =>
      setForm({ mode: "edit", date, entry }),
    closeForm: () => setForm(null),
    shift: (direction: 1 | -1) =>
      setAnchor((current) => shiftAnchor(viewMode, current, direction)),
    goToToday: () => setAnchor(todayKey()),
    jumpToDay: (date: string) => {
      setAnchor(date);
      setViewMode("daily");
    },
  };
}
