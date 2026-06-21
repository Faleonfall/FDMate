import { sanitizeFoodLog } from "../data/logStorage";
import type { FoodLog } from "../types";
import { todayKey, toDateKey } from "./dateUtils";

export type ExportRange = "all" | "7days" | "month" | "year";

export const EXPORT_RANGES: { value: ExportRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "year", label: "Last year" },
  { value: "month", label: "Last month" },
  { value: "7days", label: "Last 7 days" },
];

const RANGE_DAYS: Record<Exclude<ExportRange, "all">, number> = {
  "7days": 7,
  month: 30,
  year: 365,
};

const EXPORT_FORMAT = "fdmate-log";
const EXPORT_VERSION = 1;

/** Earliest date key (inclusive) for a rolling range, or null for "all". */
function rangeCutoffKey(range: ExportRange): string | null {
  if (range === "all") {
    return null;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (RANGE_DAYS[range] - 1));
  return toDateKey(cutoff);
}

/** Subset of the log whose dates fall inside the rolling range. */
export function filterLogByRange(log: FoodLog, range: ExportRange): FoodLog {
  const cutoff = rangeCutoffKey(range);
  if (cutoff === null) {
    return { ...log };
  }

  const filtered: FoodLog = {};
  for (const [date, entries] of Object.entries(log)) {
    // ISO YYYY-MM-DD compares lexicographically in chronological order.
    if (date >= cutoff) {
      filtered[date] = entries;
    }
  }
  return filtered;
}

/** Serialize a range of the log to a compact, self-describing JSON string. */
export function buildExport(
  log: FoodLog,
  range: ExportRange,
  exportedAt: string,
): string {
  const days = filterLogByRange(log, range);
  return JSON.stringify({
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt,
    range,
    days,
  });
}

export function exportFileName(range: ExportRange): string {
  return `fdmate-export-${range}-${todayKey()}.json`;
}

/**
 * Parse an exported file back into a log. Accepts both the wrapped export
 * envelope ({ days: {...} }) and a bare date->entries map. Throws on input
 * that contains no recognizable entries.
 */
export function parseImport(text: string): FoodLog {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }

  const candidate =
    parsed &&
    typeof parsed === "object" &&
    "days" in parsed &&
    (parsed as { days: unknown }).days
      ? (parsed as { days: unknown }).days
      : parsed;

  const log = sanitizeFoodLog(candidate);
  if (Object.keys(log).length === 0) {
    throw new Error("No valid entries found in this file.");
  }

  return log;
}

/** Trigger a browser download of text content. */
export function downloadTextFile(
  fileName: string,
  text: string,
  mimeType = "application/json",
) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
