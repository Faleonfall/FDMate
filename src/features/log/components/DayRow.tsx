import { useState } from "react";

import { ChevronRightIcon } from "../../../ui/AppIcons";
import { dayTotalCalories } from "../lib/calorieMath";
import { formatLongDate, isToday, relativeDayLabel } from "../lib/dateUtils";
import type { DayLog, FoodEntry } from "../types";
import { EntryRow } from "./EntryRow";

type DayRowProps = {
  day: DayLog;
  onEditEntry: (date: string, entry: FoodEntry) => void;
  onDeleteEntry: (date: string, entryId: string) => void;
};

export function DayRow({ day, onEditEntry, onDeleteEntry }: DayRowProps) {
  const [open, setOpen] = useState(false);
  const total = dayTotalCalories(day.entries);
  const today = isToday(day.date);
  const hasEntries = day.entries.length > 0;

  const header = (
    <>
      <span className="day-row-date">
        {relativeDayLabel(day.date)}
        <span className="day-row-weekday">{formatLongDate(day.date)}</span>
      </span>
      <span className="day-row-total" data-empty={!hasEntries}>
        {total}
        <span className="day-row-total-unit">kcal</span>
      </span>
    </>
  );

  return (
    <article
      className="day-row"
      data-today={today}
      data-empty={!hasEntries}
      data-open={open}
    >
      {hasEntries ? (
        <button
          className="day-row-header"
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          {header}
          <ChevronRightIcon className="day-row-chevron" />
        </button>
      ) : (
        <div className="day-row-header day-row-header--static">{header}</div>
      )}

      {open && hasEntries ? (
        <ul className="day-row-entries">
          {day.entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onEdit={(target) => onEditEntry(day.date, target)}
              onDelete={(entryId) => onDeleteEntry(day.date, entryId)}
            />
          ))}
        </ul>
      ) : null}
    </article>
  );
}
