import { useEffect, useRef, useState } from "react";

import { MoreIcon } from "../../../ui/AppIcons";
import { entryCalories } from "../lib/calorieMath";
import type { FoodEntry } from "../types";

type EntryRowProps = {
  entry: FoodEntry;
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entryId: string) => void;
};

function entryDetail(entry: FoodEntry): string {
  if (entry.mode === "total") {
    return "";
  }

  return `${entry.grams} g at ${entry.caloriesPer100g} kcal/100g`;
}

export function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const detail = entryDetail(entry);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <li className="entry-row">
      <div className="entry-row-main">
        <span className="entry-row-title">{entry.title}</span>
        {detail ? <span className="entry-row-detail">{detail}</span> : null}
      </div>
      <span className="entry-row-calories">
        {entryCalories(entry)}
        <span className="entry-row-calories-unit">kcal</span>
      </span>
      <div className="entry-row-menu" ref={menuRef}>
        <button
          className="entry-row-action"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Actions for ${entry.title}`}
          title="More"
        >
          <MoreIcon />
        </button>

        {open ? (
          <div className="entry-row-popover" role="menu">
            <button
              className="entry-row-option"
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit(entry);
              }}
            >
              Edit
            </button>
            <button
              className="entry-row-option entry-row-option--danger"
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(entry.id);
              }}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
