import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

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

  // --- fluid morph: refs + spring state ---
  const fieldsRef = useRef<HTMLDivElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const springRef = useRef<{ p: number; v: number } | null>(null);
  const targetRef = useRef<number>(mode === "per100g" ? 1 : 0);
  const rafRef = useRef<number | null>(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialise --p once so the first paint matches the current mode (no flash).
  useEffect(() => {
    const el = fieldsRef.current;
    if (!el) {
      return;
    }
    const initial = mode === "per100g" ? 1 : 0;
    springRef.current = { p: initial, v: 0 };
    el.style.setProperty("--p", String(initial));
    el.style.setProperty("--wob", "0");
    if (blurRef.current) {
      blurRef.current.setAttribute("stdDeviation", "0");
    }
    // run once on mount; mode read intentionally only for the first frame
  }, []);

  // Drive the spring toward the new target whenever mode changes.
  useEffect(() => {
    const el = fieldsRef.current;
    if (!el) {
      return;
    }
    const target = mode === "per100g" ? 1 : 0;
    targetRef.current = target;

    if (reduceMotion) {
      springRef.current = { p: target, v: 0 };
      el.style.setProperty("--p", String(target));
      el.style.setProperty("--wob", "0");
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", "0");
      }
      el.classList.remove("is-morphing");
      return;
    }

    const STIFF = 170;
    const DAMP = 17;
    const start = performance.now();
    let last = start;
    el.classList.add("is-morphing");

    const tick = (now: number) => {
      const s = springRef.current;
      if (!s) {
        rafRef.current = null;
        return;
      }
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.032) {
        dt = 0.032; // clamp large frame gaps (tab refocus etc.)
      }

      const tgt = targetRef.current;
      const accel = STIFF * (tgt - s.p) - DAMP * s.v;
      s.v += accel * dt;
      s.p += s.v * dt;

      const settleAmt = Math.min(1, Math.abs(s.v) + Math.abs(tgt - s.p) * 4);
      const wob = Math.sin((now - start) / 90) * 0.5 * settleAmt;
      // Blur peaks mid-morph and is ~0 at both ends, so the single opaque
      // body keeps constant opacity (no surface flicker) while the corners
      // round smoothly into the neck and back. Starting/ending at blur 0
      // means toggling the filter on/off is visually seamless.
      const pc = Math.min(1, Math.max(0, s.p));
      const blur = 6 * Math.sin(Math.PI * pc);
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", blur.toFixed(2));
      }

      el.style.setProperty("--p", s.p.toFixed(4));
      el.style.setProperty("--wob", wob.toFixed(3));

      if (Math.abs(s.v) < 0.001 && Math.abs(tgt - s.p) < 0.001) {
        s.p = tgt;
        s.v = 0;
        el.style.setProperty("--p", String(tgt));
        el.style.setProperty("--wob", "0");
        if (blurRef.current) {
          blurRef.current.setAttribute("stdDeviation", "0");
        }
        el.classList.remove("is-morphing");
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // Retarget the existing spring if one is already running; never stack loops.
    if (rafRef.current == null) {
      last = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      el.classList.remove("is-morphing");
    };
  }, [mode, reduceMotion]);

  // Lock body scroll while the modal is open. position:fixed is the reliable
  // way to stop iOS Safari from scrolling the page behind the popover; restore
  // the scroll position on close.
  useEffect(() => {
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Clear the validation error as soon as the user edits anything, so a
  // message like "Enter a name." disappears once they start fixing it.
  useEffect(() => {
    setError(null);
  }, [title, date, mode, calories, per100g, grams]);

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
            <span className="field-label">Calorie input</span>
            <div
              className="mode-toggle"
              role="group"
              style={
                { "--active-index": mode === "total" ? 1 : 0 } as CSSProperties
              }
            >
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

          {/* Fluid morph: all three inputs always mounted so the DOM shape
              never changes. Decorative goo blobs sit behind transparent
              inputs and form a pinching liquid neck as the spring drives --p
              (0 = total, one wide pill; 1 = per100g, two half pills). */}
          <div className="liquid-fields" ref={fieldsRef} data-mode={mode}>
            <svg className="liquid-goo-defs" aria-hidden="true" focusable="false">
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
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                tabIndex={mode === "total" ? 0 : -1}
                aria-hidden={mode === "total" ? undefined : true}
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
                value={per100g}
                onChange={(event) => setPer100g(event.target.value)}
                tabIndex={mode === "per100g" ? 0 : -1}
                aria-hidden={mode === "per100g" ? undefined : true}
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
                value={grams}
                onChange={(event) => setGrams(event.target.value)}
                tabIndex={mode === "per100g" ? 0 : -1}
                aria-hidden={mode === "per100g" ? undefined : true}
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
