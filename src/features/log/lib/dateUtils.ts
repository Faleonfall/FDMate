/** ISO `YYYY-MM-DD` key for a Date in the user's local timezone. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's date key in local time. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Validate an ISO `YYYY-MM-DD` string. */
export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

/** Parse a date key into a local Date at midnight. */
function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

/** Add `count` days (may be negative) to a date key. */
export function addDays(key: string, count: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + count);
  return toDateKey(date);
}

/** Add `count` calendar months, clamping the day to the month length. */
export function addMonths(key: string, count: number): string {
  const date = parseDateKey(key);
  date.setDate(1);
  date.setMonth(date.getMonth() + count);
  return toDateKey(date);
}

/** Monday-anchored start of the week containing `key`. */
export function startOfWeek(key: string): string {
  const date = parseDateKey(key);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return toDateKey(date);
}

/** The 7 day keys (Mon–Sun) of the week containing `key`. */
export function weekKeys(key: string): string[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export type CalendarCell = { key: string; inMonth: boolean };

/** Calendar matrix (weeks of 7 Mon–Sun cells) covering the month of `key`. */
export function monthMatrix(key: string): CalendarCell[][] {
  const date = parseDateKey(key);
  const month = date.getMonth();
  const firstOfMonth = toDateKey(new Date(date.getFullYear(), month, 1));
  const gridStart = startOfWeek(firstOfMonth);

  const weeks: CalendarCell[][] = [];
  let cursor = gridStart;
  // Six rows always covers any month layout.
  for (let week = 0; week < 6; week += 1) {
    const row: CalendarCell[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      row.push({
        key: cursor,
        inMonth: parseDateKey(cursor).getMonth() === month,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

export function dayOfMonth(key: string): number {
  return parseDateKey(key).getDate();
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function formatMonth(key: string): string {
  return monthFormatter.format(parseDateKey(key));
}

/** Range label like "15.06 – 21.06.2026" for the week containing `key`. */
export function formatWeekRange(key: string): string {
  const keys = weekKeys(key);
  const start = (keys[0] ?? key).split("-");
  const end = (keys[6] ?? key).split("-");
  return `${start[2]}.${start[1]} – ${end[2]}.${end[1]}.${end[0]}`;
}

export const WEEKDAY_INITIALS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Fixed numeric `DD.MM.YYYY`, locale-independent. */
export function formatLongDate(key: string): string {
  const [year, month, day] = key.split("-");
  return `${day}.${month}.${year}`;
}

export function formatWeekday(key: string): string {
  return weekdayFormatter.format(parseDateKey(key));
}

/** Human label for the date relative to today (Today / Yesterday / weekday). */
export function relativeDayLabel(key: string): string {
  if (key === todayKey()) {
    return "Today";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === toDateKey(yesterday)) {
    return "Yesterday";
  }

  return formatWeekday(key);
}
