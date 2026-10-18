import { usePopoverMenu } from "../../hooks/app/usePopoverMenu";
import { entryCalories } from "../../lib/diary/calories";
import { entryDetail } from "../../lib/diary/display";
import type { FoodEntry } from "../../lib/diary/types";
import { MoreIcon } from "../app/AppIcons";

type EntryRowProps = {
  entry: FoodEntry;
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entryId: string) => void;
};

export function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const menu = usePopoverMenu();
  const detail = entryDetail(entry);

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
      <div className="entry-row-menu" ref={menu.menuRef}>
        <button
          className="entry-row-action"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            menu.toggle();
          }}
          aria-haspopup="menu"
          aria-expanded={menu.open}
          aria-label={`Actions for ${entry.title}`}
          title="More"
        >
          <MoreIcon />
        </button>

        {menu.open ? (
          <div className="entry-row-popover" role="menu">
            <button
              className="entry-row-option"
              type="button"
              role="menuitem"
              onClick={() => {
                menu.close();
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
                menu.close();
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
