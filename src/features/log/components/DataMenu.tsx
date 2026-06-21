import { useEffect, useRef, useState } from "react";

import { CheckIcon } from "../../../ui/AppIcons";
import {
  EXPORT_RANGES,
  buildExport,
  downloadTextFile,
  exportFileName,
  parseImport,
  type ExportRange,
} from "../lib/exportImport";
import type { FoodLog } from "../types";

type DataMenuProps = {
  log: FoodLog;
  onImport: (incoming: FoodLog) => void;
};

export function DataMenu({ log, onImport }: DataMenuProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleExport(range: ExportRange) {
    const text = buildExport(log, range, new Date().toISOString());
    downloadTextFile(exportFileName(range), text);
    setOpen(false);
  }

  async function handleFile(file: File) {
    try {
      const incoming = parseImport(await file.text());
      onImport(incoming);
      const dayCount = Object.keys(incoming).length;
      setToast({
        ok: true,
        text: `Imported ${dayCount} day${dayCount === 1 ? "" : "s"}`,
      });
    } catch (error) {
      setToast({
        ok: false,
        text: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
    // Reset so importing the same file twice still fires change.
    event.target.value = "";
    setOpen(false);
  }

  return (
    <div className="data-menu" ref={menuRef}>
      <button
        className="app-button app-button--ghost data-menu-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Data
        <span className="data-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className="data-menu-popover" role="menu">
          <p className="data-menu-section">Export</p>
          {EXPORT_RANGES.map((range) => (
            <button
              key={range.value}
              className="data-menu-option"
              type="button"
              role="menuitem"
              onClick={() => handleExport(range.value)}
            >
              {range.label}
            </button>
          ))}

          <p className="data-menu-section">Import</p>
          <button
            className="data-menu-option"
            type="button"
            role="menuitem"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose file…
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        className="data-menu-file"
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
      />

      {toast ? (
        <div
          className="toast"
          data-ok={toast.ok}
          role="status"
          aria-live="polite"
        >
          {toast.ok ? <CheckIcon className="toast-icon" /> : null}
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
