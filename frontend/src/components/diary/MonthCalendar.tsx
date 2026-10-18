import { WEEKDAY_INITIALS } from "../../lib/diary/dates";
import { calendarDays } from "../../lib/diary/display";
import type { FoodLog } from "../../lib/diary/types";

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
        {calendarDays(monthAnchor, log).map((cell) => (
          <button
            key={cell.key}
            type="button"
            className="calendar-cell"
            data-outside={!cell.inMonth}
            data-today={cell.today}
            data-has-entries={cell.hasEntries}
            disabled={!cell.hasEntries}
            onClick={() => onSelectDay(cell.key)}
            title={cell.hasEntries ? `${cell.total} kcal` : undefined}
            aria-label={cell.label}
          >
            <span className="calendar-cell-day">{cell.day}</span>
            {cell.hasEntries ? (
              <span className="calendar-cell-dot" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
