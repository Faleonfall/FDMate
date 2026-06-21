import { onValue, ref, set } from "firebase/database";

import { db } from "../../../lib/firebase";
import type { FoodLog } from "../types";

function logRef(uid: string) {
  return ref(db, `users/${uid}/log`);
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

/** Overwrite the remote log with the full local blob. */
export function pushLog(uid: string, log: FoodLog): Promise<void> {
  return set(logRef(uid), log);
}
