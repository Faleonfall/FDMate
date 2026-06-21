import { onValue, ref, remove, set } from "firebase/database";

import { db } from "../../../lib/firebase";
import type { FoodEntry, FoodLog } from "../types";

function logRef(uid: string) {
  return ref(db, `users/${uid}/log`);
}

function dayRef(uid: string, date: string) {
  return ref(db, `users/${uid}/log/${date}`);
}

/** Subscribe to the remote log; fires now and on every remote change. */
export function subscribeLog(
  uid: string,
  onChange: (log: FoodLog) => void,
): () => void {
  return onValue(logRef(uid), (snapshot) => {
    onChange((snapshot.val() as FoodLog | null) ?? {});
  });
}

/** Write a single day's entries to the cloud (one path, not the whole blob). */
export function writeDay(
  uid: string,
  date: string,
  entries: FoodEntry[],
): Promise<void> {
  return set(dayRef(uid, date), entries);
}

/** Remove a single day from the cloud. */
export function removeDay(uid: string, date: string): Promise<void> {
  return remove(dayRef(uid, date));
}
