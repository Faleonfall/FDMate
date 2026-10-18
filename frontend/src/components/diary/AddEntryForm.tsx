import type { CSSProperties } from "react";

import { useEntryForm } from "../../hooks/diary/useEntryForm";
import { useEscapeKey } from "../../hooks/app/useEscapeKey";
import { useLiquidMorph } from "../../hooks/diary/useLiquidMorph";
import { useScrollLock } from "../../hooks/app/useScrollLock";
import type { EntryDraft, FoodEntry } from "../../lib/diary/types";
import { CloseIcon } from "../app/AppIcons";

type AddEntryFormProps = {
  defaultDate: string;
  editing?: FoodEntry;
  onSubmit: (date: string, draft: EntryDraft) => void;
  onClose: () => void;
};

export function AddEntryForm({
  defaultDate,
  editing,
  onSubmit,
  onClose,
}: AddEntryFormProps) {
  const { fields, error, setField, handleSubmit } = useEntryForm({
    defaultDate,
    editing,
    onSubmit,
    onClose,
  });
  const { fieldsRef, blurRef } = useLiquidMorph(
    fields.mode === "per100g" ? 1 : 0,
  );
  useScrollLock();
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit entry" : "Add entry"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {editing ? "Edit entry" : "Add entry"}
          </h2>
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
              value={fields.title}
              onChange={(event) => setField("title", event.target.value)}
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
              value={fields.date}
              onChange={(event) => setField("date", event.target.value)}
            />
          </div>

          <div className="field">
            <span className="field-label">Calorie input</span>
            <div
              className="mode-toggle"
              role="group"
              style={
                {
                  "--active-index": fields.mode === "total" ? 1 : 0,
                } as CSSProperties
              }
            >
              <button
                type="button"
                className="mode-toggle-option"
                data-active={fields.mode === "per100g"}
                onClick={() => setField("mode", "per100g")}
              >
                Per 100 g
              </button>
              <button
                type="button"
                className="mode-toggle-option"
                data-active={fields.mode === "total"}
                onClick={() => setField("mode", "total")}
              >
                Total
              </button>
            </div>
          </div>

          {/* Fluid morph: all three inputs always mounted so the DOM shape
              never changes. Decorative goo blobs sit behind transparent
              inputs and form a pinching liquid neck as the spring drives --p
              (0 = total, one wide pill; 1 = per100g, two half pills). */}
          <div
            className="liquid-fields"
            ref={fieldsRef}
            data-mode={fields.mode}
          >
            <svg
              className="liquid-goo-defs"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <filter id="fdmate-goo" colorInterpolationFilters="sRGB">
                  <feGaussianBlur
                    ref={blurRef}
                    in="SourceGraphic"
                    stdDeviation="0"
                    result="blur"
                  />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                    result="goo"
                  />
                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
              </defs>
            </svg>

            <div className="liquid-body" aria-hidden="true">
              <span className="blob blob-a" />
              <span className="blob blob-b" />
            </div>

            <div className="liquid-field liquid-field--calories">
              <label className="field-label" htmlFor="entry-calories">
                Calories eaten (kcal)
              </label>
              <input
                id="entry-calories"
                className="field-input"
                type="text"
                inputMode="text"
                placeholder="0"
                value={fields.calories}
                onChange={(event) => setField("calories", event.target.value)}
                tabIndex={fields.mode === "total" ? 0 : -1}
                aria-hidden={fields.mode === "total" ? undefined : true}
              />
            </div>

            <div className="liquid-field liquid-field--per100g">
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
                value={fields.per100g}
                onChange={(event) => setField("per100g", event.target.value)}
                tabIndex={fields.mode === "per100g" ? 0 : -1}
                aria-hidden={fields.mode === "per100g" ? undefined : true}
              />
            </div>

            <div className="liquid-field liquid-field--grams">
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
                value={fields.grams}
                onChange={(event) => setField("grams", event.target.value)}
                tabIndex={fields.mode === "per100g" ? 0 : -1}
                aria-hidden={fields.mode === "per100g" ? undefined : true}
              />
            </div>
          </div>

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
