import { useLogScreen } from "../../hooks/diary/useLogScreen";
import { rangeLabel, summaryLabel } from "../../lib/diary/display";
import { PlusIcon } from "../app/AppIcons";
import { AddEntryForm } from "./AddEntryForm";
import { DataMenu } from "./DataMenu";
import { DailyView, MonthView, WeekView } from "./LogViews";
import { RangeNavigator } from "./RangeNavigator";
import { ViewToggle } from "./ViewToggle";

export function DayLogScreen({ uid }: { uid: string }) {
  const screen = useLogScreen(uid);
  const { log, form, viewMode, anchor, totals } = screen;

  return (
    <main className="app-main">
      <section className="today-summary">
        <span className="today-summary-label">{summaryLabel(viewMode)}</span>
        <span>
          <span className="today-summary-value">{totals.today}</span>
          {viewMode === "weekly" ? (
            <>
              <span className="today-summary-sep">/</span>
              <span className="today-summary-value">{totals.weekAverage}</span>
            </>
          ) : null}
          <span className="today-summary-unit">kcal</span>
        </span>
      </section>

      <div className="log-toolbar">
        <ViewToggle value={viewMode} onChange={screen.setViewMode} />
        <DataMenu log={log} onImport={screen.importDays} />
      </div>

      <RangeNavigator
        label={rangeLabel(viewMode, anchor)}
        onPrev={() => screen.shift(-1)}
        onNext={() => screen.shift(1)}
        onToday={screen.goToToday}
      />

      {viewMode === "daily" ? (
        <DailyView
          date={anchor}
          log={log}
          onEditEntry={screen.openEditForm}
          onDeleteEntry={screen.deleteEntry}
        />
      ) : viewMode === "weekly" ? (
        <WeekView
          weekAnchor={anchor}
          log={log}
          onEditEntry={screen.openEditForm}
          onDeleteEntry={screen.deleteEntry}
        />
      ) : (
        <MonthView
          monthAnchor={anchor}
          log={log}
          onSelectDay={screen.jumpToDay}
          onEditEntry={screen.openEditForm}
          onDeleteEntry={screen.deleteEntry}
        />
      )}

      <button
        className="button-fab"
        type="button"
        onClick={screen.openAddForm}
        aria-label="Add entry"
        title="Add entry"
      >
        <PlusIcon className="button-fab-icon" />
      </button>

      {form ? (
        <AddEntryForm
          defaultDate={form.mode === "edit" ? form.date : anchor}
          {...(form.mode === "edit" ? { editing: form.entry } : {})}
          onSubmit={screen.submitEntry}
          onClose={screen.closeForm}
        />
      ) : null}
    </main>
  );
}
