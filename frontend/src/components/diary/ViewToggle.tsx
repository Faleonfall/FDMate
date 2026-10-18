import type { CSSProperties } from "react";

import { VIEW_OPTIONS, viewIndex } from "../../lib/diary/display";
import type { ViewMode } from "../../lib/diary/types";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      className="view-toggle"
      role="group"
      aria-label="View mode"
      style={{ "--active-index": viewIndex(value) } as CSSProperties}
    >
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="view-toggle-option"
          data-active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
