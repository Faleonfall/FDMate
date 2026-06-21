import { dayTotalCalories } from "../lib/calorieMath";
import { formatLongDate, isToday, relativeDayLabel } from "../lib/dateUtils";
import type { DayLog, FoodEntry } from "../types";
import { EntryRow } from "./EntryRow";

type DayCardProps = {
  day: DayLog;
  onEditEntry: (date: string, entry: FoodEntry) => void;
  onDeleteEntry: (date: string, entryId: string) => void;
};

export function DayCard({ day, onEditEntry, onDeleteEntry }: DayCardProps) {
  const total = dayTotalCalories(day.entries);
  const today = isToday(day.date);

  return (
    <article className={`day-card ${today ? "day-card--today" : ""}`}>
      <header className="day-card-header">
        <h2 className="day-card-date">
          {relativeDayLabel(day.date)}
          <span className="day-card-weekday">{formatLongDate(day.date)}</span>
        </h2>
        <span className="day-card-total">
          {total}
          <span className="day-card-total-unit">kcal</span>
        </span>
      </header>
      <ul className="day-card-entries">
        {day.entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onEdit={(target) => onEditEntry(day.date, target)}
            onDelete={(entryId) => onDeleteEntry(day.date, entryId)}
          />
        ))}
      </ul>
    </article>
  );
}
