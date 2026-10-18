import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  buildExport,
  downloadTextFile,
  exportFileName,
  parseImport,
  type ExportRange,
} from "../../lib/diary/exportImport";
import { importedDaysText } from "../../lib/diary/display";
import type { FoodLog } from "../../lib/diary/types";
import { usePopoverMenu } from "../app/usePopoverMenu";

const TOAST_MS = 2500;

type Toast = { ok: boolean; text: string };

/** Export and import actions for the data menu, with a result toast. */
export function useDataMenu(
  log: FoodLog,
  onImport: (incoming: FoodLog) => void,
) {
  const menu = usePopoverMenu();
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  function exportRange(range: ExportRange) {
    const text = buildExport(log, range, new Date().toISOString());
    downloadTextFile(exportFileName(range), text);
    menu.close();
  }

  async function importFile(file: File) {
    try {
      const incoming = parseImport(await file.text());
      onImport(incoming);
      setToast({
        ok: true,
        text: importedDaysText(Object.keys(incoming).length),
      });
    } catch (error) {
      setToast({
        ok: false,
        text: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void importFile(file);
    }
    // Reset so importing the same file twice still fires change.
    event.target.value = "";
    menu.close();
  }

  return {
    ...menu,
    toast,
    fileInputRef,
    exportRange,
    chooseFile: () => fileInputRef.current?.click(),
    handleFileChange,
  };
}
