import {
  formatLongDate,
  isToday,
  relativeDayLabel,
  weekKeys,
} from "../lib/dateUtils";
import type { FoodEntry, FoodLog } from "../types";
import { DayCard } from "./DayCard";
import { DayRow } from "./DayRow";
import { MonthCalendar } from "./MonthCalendar";

type EditHandler = (date: string, entry: FoodEntry) => void;
type DeleteHandler = (date: string, entryId: string) => void;

function EmptyDay({ date }: { date: string }) {
  const today = isToday(date);
  return (
    <div
      className={`day-card day-card--empty ${today ? "day-card--today" : ""}`}
    >
      <header className="day-card-header">
        <h2 className="day-card-date">
          {relativeDayLabel(date)}
          <span className="day-card-weekday">{formatLongDate(date)}</span>
        </h2>
        <span className="day-card-total day-card-total--empty">0 kcal</span>
      </header>
      <p className="day-card-empty-note">No food logged.</p>
    </div>
  );
}

export function DailyView({
  date,
  log,
  onEditEntry,
  onDeleteEntry,
}: {
  date: string;
  log: FoodLog;
  onEditEntry: EditHandler;
  onDeleteEntry: DeleteHandler;
}) {
  const entries = log[date] ?? [];
  if (entries.length === 0) {
    return <EmptyDay date={date} />;
  }
  return (
    <DayCard
      day={{ date, entries }}
      onEditEntry={onEditEntry}
      onDeleteEntry={onDeleteEntry}
    />
  );
}

export function WeekView({
  weekAnchor,
  log,
  onEditEntry,
  onDeleteEntry,
}: {
  weekAnchor: string;
  log: FoodLog;
  onEditEntry: EditHandler;
  onDeleteEntry: DeleteHandler;
}) {
  const days = weekKeys(weekAnchor);

  return (
    <>
      <div className="day-list">
        {days.map((date) => (
          <DayRow
            key={date}
            day={{ date, entries: log[date] ?? [] }}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
        ))}
      </div>
    </>
  );
}

export function MonthView({
  monthAnchor,
  log,
  onSelectDay,
  onEditEntry,
  onDeleteEntry,
}: {
  monthAnchor: string;
  log: FoodLog;
  onSelectDay: (date: string) => void;
  onEditEntry: EditHandler;
  onDeleteEntry: DeleteHandler;
}) {
  const monthPrefix = monthAnchor.slice(0, 7);
  const loggedDays = Object.keys(log)
    .filter((key) => key.startsWith(monthPrefix))
    .sort((a, b) => (a < b ? 1 : -1));

  return (
    <>
      <MonthCalendar
        monthAnchor={monthAnchor}
        log={log}
        onSelectDay={onSelectDay}
      />
      {loggedDays.length > 0 ? (
        <div className="day-list">
          {loggedDays.map((date) => (
            <DayRow
              key={date}
              day={{ date, entries: log[date] ?? [] }}
              onEditEntry={onEditEntry}
              onDeleteEntry={onDeleteEntry}
            />
          ))}
        </div>
      ) : (
        <p className="month-empty-note">No food logged this month.</p>
      )}
    </>
  );
}
