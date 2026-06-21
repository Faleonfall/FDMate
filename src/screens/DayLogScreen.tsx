import { useMemo, useState } from "react";

import { PlusIcon } from "../ui/AppIcons";
import { AddEntryForm } from "../features/log/components/AddEntryForm";
import { DataMenu } from "../features/log/components/DataMenu";
import {
  DailyView,
  MonthView,
  WeekView,
} from "../features/log/components/LogViews";
import { RangeNavigator } from "../features/log/components/RangeNavigator";
import { ViewToggle, type ViewMode } from "../features/log/components/ViewToggle";
import { dayTotalCalories } from "../features/log/lib/calorieMath";
import {
  addDays,
  addMonths,
  formatLongDate,
  formatMonth,
  formatWeekRange,
  todayKey,
  weekKeys,
} from "../features/log/lib/dateUtils";
import { useFoodLog } from "../features/log/useFoodLog";
import type { EntryDraft } from "../features/log/useFoodLog";
import type { FoodEntry } from "../features/log/types";

type FormState =
  | { mode: "add" }
  | { mode: "edit"; date: string; entry: FoodEntry };

export function DayLogScreen({ uid }: { uid: string }) {
  const { log, days, addEntry, updateEntry, deleteEntry, importDays } =
    useFoodLog(uid);
  const [form, setForm] = useState<FormState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [anchor, setAnchor] = useState(todayKey());

  function handleSubmit(date: string, draft: EntryDraft) {
    if (form?.mode === "edit") {
      updateEntry(form.date, form.entry.id, date, draft);
    } else {
      addEntry(date, draft);
    }
    setForm(null);
  }

  const todayTotal = useMemo(() => {
    const today = todayKey();
    const todayDay = days.find((day) => day.date === today);
    return todayDay ? dayTotalCalories(todayDay.entries) : 0;
  }, [days]);

  const weekAverage = useMemo(() => {
    const totals = weekKeys(anchor)
      .map((date) => log[date] ?? [])
      .filter((entries) => entries.length > 0)
      .map((entries) => dayTotalCalories(entries));
    if (totals.length === 0) return null;
    return {
      value: Math.round(
        totals.reduce((sum, total) => sum + total, 0) / totals.length,
      ),
      days: totals.length,
    };
  }, [log, anchor]);

  const step = viewMode === "weekly" ? 7 : 1;
  const navLabel =
    viewMode === "daily"
      ? formatLongDate(anchor)
      : viewMode === "weekly"
        ? formatWeekRange(anchor)
        : formatMonth(anchor);

  function shiftAnchor(direction: 1 | -1) {
    setAnchor((current) =>
      viewMode === "monthly"
        ? addMonths(current, direction)
        : addDays(current, direction * step),
    );
  }

  function jumpToDay(date: string) {
    setAnchor(date);
    setViewMode("daily");
  }

  return (
    <main className="app-main">
      <section className="today-summary">
        <span className="today-summary-label">
          {viewMode === "weekly" ? "Today / Weekly avg" : "Today"}
        </span>
        <span>
          <span className="today-summary-value">{todayTotal}</span>
          {viewMode === "weekly" ? (
            <>
              <span className="today-summary-sep">/</span>
              <span className="today-summary-value">
                {weekAverage ? weekAverage.value : 0}
              </span>
            </>
          ) : null}
          <span className="today-summary-unit">kcal</span>
        </span>
      </section>

      <div className="log-toolbar">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <DataMenu log={log} onImport={importDays} />
      </div>

      <RangeNavigator
        label={navLabel}
        onPrev={() => shiftAnchor(-1)}
        onNext={() => shiftAnchor(1)}
        onToday={() => setAnchor(todayKey())}
      />

      {viewMode === "daily" ? (
        <DailyView
          date={anchor}
          log={log}
          onEditEntry={(date, entry) => setForm({ mode: "edit", date, entry })}
          onDeleteEntry={deleteEntry}
        />
      ) : viewMode === "weekly" ? (
        <WeekView
          weekAnchor={anchor}
          log={log}
          onEditEntry={(date, entry) => setForm({ mode: "edit", date, entry })}
          onDeleteEntry={deleteEntry}
        />
      ) : (
        <MonthView
          monthAnchor={anchor}
          log={log}
          onSelectDay={jumpToDay}
          onEditEntry={(date, entry) => setForm({ mode: "edit", date, entry })}
          onDeleteEntry={deleteEntry}
        />
      )}

      <button
        className="fab"
        type="button"
        onClick={() => setForm({ mode: "add" })}
        aria-label="Add entry"
        title="Add entry"
      >
        <PlusIcon className="fab-icon" />
      </button>

      {form ? (
        <AddEntryForm
          defaultDate={form.mode === "edit" ? form.date : anchor}
          {...(form.mode === "edit" ? { editing: form.entry } : {})}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
      ) : null}
    </main>
  );
}
