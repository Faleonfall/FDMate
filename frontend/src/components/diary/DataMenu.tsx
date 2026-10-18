import { useDataMenu } from "../../hooks/diary/useDataMenu";
import { EXPORT_RANGES } from "../../lib/diary/exportImport";
import type { FoodLog } from "../../lib/diary/types";
import { CheckIcon } from "../app/AppIcons";

type DataMenuProps = {
  log: FoodLog;
  onImport: (incoming: FoodLog) => void;
};

export function DataMenu({ log, onImport }: DataMenuProps) {
  const menu = useDataMenu(log, onImport);

  return (
    <div className="data-menu" ref={menu.menuRef}>
      <button
        className="button button--ghost data-menu-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          menu.toggle();
        }}
        aria-expanded={menu.open}
        aria-haspopup="menu"
      >
        Data
        <span className="data-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {menu.open ? (
        <div className="data-menu-popover" role="menu">
          <p className="data-menu-section">Export</p>
          {EXPORT_RANGES.map((range) => (
            <button
              key={range.value}
              className="data-menu-option"
              type="button"
              role="menuitem"
              onClick={() => menu.exportRange(range.value)}
            >
              {range.label}
            </button>
          ))}

          <p className="data-menu-section">Import</p>
          <button
            className="data-menu-option"
            type="button"
            role="menuitem"
            onClick={menu.chooseFile}
          >
            Choose file…
          </button>
        </div>
      ) : null}

      <input
        ref={menu.fileInputRef}
        className="data-menu-file"
        type="file"
        accept="application/json,.json"
        onChange={menu.handleFileChange}
      />

      {menu.toast ? (
        <div
          className="toast"
          data-ok={menu.toast.ok}
          role="status"
          aria-live="polite"
        >
          {menu.toast.ok ? <CheckIcon className="toast-icon" /> : null}
          <span>{menu.toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
