import { dayTotalCalories } from "../lib/calorieMath";
import {
  WEEKDAY_INITIALS,
  dayOfMonth,
  isToday,
  monthMatrix,
} from "../lib/dateUtils";
import type { FoodLog } from "../types";

type MonthCalendarProps = {
  monthAnchor: string;
  log: FoodLog;
  onSelectDay: (date: string) => void;
};

export function MonthCalendar({
  monthAnchor,
  log,
  onSelectDay,
}: MonthCalendarProps) {
  const weeks = monthMatrix(monthAnchor);

  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {WEEKDAY_INITIALS.map((day) => (
          <span key={day} className="calendar-weekday">
            {day}
          </span>
        ))}
      </div>
      <div className="calendar-grid">
        {weeks.flatMap((week) =>
          week.map((cell) => {
            const entries = log[cell.key];
            const hasEntries = Boolean(entries && entries.length > 0);
            const total = entries ? dayTotalCalories(entries) : 0;
            const today = isToday(cell.key);

            return (
              <button
                key={cell.key}
                type="button"
                className="calendar-cell"
                data-outside={!cell.inMonth}
                data-today={today}
                data-has-entries={hasEntries}
                disabled={!hasEntries}
                onClick={() => onSelectDay(cell.key)}
                title={hasEntries ? `${total} kcal` : undefined}
                aria-label={
                  hasEntries
                    ? `${cell.key}, ${total} kcal`
                    : `${cell.key}, no entries`
                }
              >
                <span className="calendar-cell-day">
                  {dayOfMonth(cell.key)}
                </span>
                {hasEntries ? (
                  <span className="calendar-cell-dot" aria-hidden="true" />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
