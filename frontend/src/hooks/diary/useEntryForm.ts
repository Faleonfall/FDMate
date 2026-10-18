import { useEffect, useState, type FormEvent } from "react";

import {
  buildEntryDraft,
  initialEntryFields,
  type EntryFormFields,
} from "../../lib/diary/entryForm";
import { todayKey } from "../../lib/diary/dates";
import type { EntryDraft, FoodEntry } from "../../lib/diary/types";

type EntryFormOptions = {
  defaultDate: string;
  editing?: FoodEntry | undefined;
  onSubmit: (date: string, draft: EntryDraft) => void;
  onClose: () => void;
};

export function useEntryForm({
  defaultDate,
  editing,
  onSubmit,
  onClose,
}: EntryFormOptions) {
  const [fields, setFields] = useState<EntryFormFields>(() =>
    initialEntryFields(defaultDate || todayKey(), editing),
  );
  const [error, setError] = useState<string | null>(null);

  // Clear the validation error as soon as the user edits anything, so a
  // message like "Enter a name." disappears once they start fixing it.
  useEffect(() => {
    setError(null);
  }, [fields]);

  function setField<TKey extends keyof EntryFormFields>(
    key: TKey,
    value: EntryFormFields[TKey],
  ) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = buildEntryDraft(fields);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onSubmit(fields.date, result.draft);
    onClose();
  }

  return { fields, error, setField, handleSubmit };
}
