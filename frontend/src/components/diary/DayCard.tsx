import { dayTotalCalories } from "../../lib/diary/calories";
import {
  formatLongDate,
  isToday,
  relativeDayLabel,
} from "../../lib/diary/dates";
import { dayCardClassName } from "../../lib/diary/display";
import type { DayLog, FoodEntry } from "../../lib/diary/types";
import { EntryRow } from "./EntryRow";

type DayCardProps = {
  day: DayLog;
  onEditEntry: (date: string, entry: FoodEntry) => void;
  onDeleteEntry: (date: string, entryId: string) => void;
};

export function DayCard({ day, onEditEntry, onDeleteEntry }: DayCardProps) {
  const total = dayTotalCalories(day.entries);

  return (
    <article className={dayCardClassName(isToday(day.date))}>
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
