import { useEffect, useState } from "react";

import { CloseIcon } from "../../../ui/AppIcons";
import { evalExpression } from "../lib/calcExpression";
import { todayKey } from "../lib/dateUtils";
import type { EntryDraft } from "../useFoodLog";
import type { EntryMode, FoodEntry } from "../types";

type AddEntryFormProps = {
  defaultDate: string;
  editing?: FoodEntry;
  onSubmit: (date: string, draft: EntryDraft) => void;
  onClose: () => void;
};

function parsePositive(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/**
 * Evaluate an arithmetic total (e.g. "56+45*2"), rounded up. Negatives are
 * allowed (e.g. "-200" to log burned calories). Null if invalid or zero.
 */
function parseTotalExpression(value: string): number | null {
  const result = evalExpression(value);
  if (result === null || result === 0) {
    return null;
  }
  return Math.ceil(result);
}

export function AddEntryForm({
  defaultDate,
  editing,
  onSubmit,
  onClose,
}: AddEntryFormProps) {
  const [date, setDate] = useState(defaultDate || todayKey());
  const [title, setTitle] = useState(editing?.title ?? "");
  const [mode, setMode] = useState<EntryMode>(editing?.mode ?? "per100g");
  const [calories, setCalories] = useState(
    editing?.mode === "total" ? String(editing.calories) : "",
  );
  const [per100g, setPer100g] = useState(
    editing?.mode === "per100g" ? String(editing.caloriesPer100g) : "",
  );
  const [grams, setGrams] = useState(
    editing?.mode === "per100g" ? String(editing.grams) : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function buildDraft(): EntryDraft | null {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a name.");
      return null;
    }

    if (mode === "total") {
      const total = parseTotalExpression(calories);
      if (total === null) {
        setError("Enter a non-zero amount, e.g. 56 + 45 * 2 or -200.");
        return null;
      }
      return { title: trimmedTitle, mode: "total", calories: total };
    }

    const per = parsePositive(per100g);
    const amount = parsePositive(grams);
    if (per === null || amount === null) {
      setError("Enter calories per 100 g and grams eaten.");
      return null;
    }
    return {
      title: trimmedTitle,
      mode: "per100g",
      caloriesPer100g: per,
      grams: amount,
    };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const draft = buildDraft();
    if (!draft) {
      return;
    }
    onSubmit(date, draft);
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit entry" : "Add entry"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit entry" : "Add entry"}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="entry-title">
              Name
            </label>
            <input
              id="entry-title"
              className="field-input"
              placeholder="Banana"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="entry-date">
              Date
            </label>
            <input
              id="entry-date"
              className="field-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="field">
            <span className="field-label">How are calories entered?</span>
            <div className="mode-toggle" role="group">
              <button
                type="button"
                className="mode-toggle-option"
                data-active={mode === "per100g"}
                onClick={() => setMode("per100g")}
              >
                Per 100 g
              </button>
              <button
                type="button"
                className="mode-toggle-option"
                data-active={mode === "total"}
                onClick={() => setMode("total")}
              >
                Total
              </button>
            </div>
          </div>

          {mode === "total" ? (
            <div className="field">
              <label className="field-label" htmlFor="entry-calories">
                Calories eaten (kcal)
              </label>
              <input
                id="entry-calories"
                className="field-input"
                type="text"
                inputMode="text"
                placeholder="0"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
              />
            </div>
          ) : (
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="entry-per100g">
                  kcal / 100 g
                </label>
                <input
                  id="entry-per100g"
                  className="field-input"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  value={per100g}
                  onChange={(event) => setPer100g(event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="entry-grams">
                  Grams eaten
                </label>
                <input
                  id="entry-grams"
                  className="field-input"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  value={grams}
                  onChange={(event) => setGrams(event.target.value)}
                />
              </div>
            </div>
          )}

          {error ? <p className="entry-form-error">{error}</p> : null}

          <div className="entry-form-actions">
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="app-button app-button--primary">
              {editing ? "Save" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
