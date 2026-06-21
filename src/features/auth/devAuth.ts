import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

// Fixed throwaway credentials for the Auth emulator. Never used against prod
// (this only runs in DEV, where the SDK is pointed at the local emulator).
const DEV_EMAIL = "dev@fdmate.test";
const DEV_PASSWORD = "devpassword";

/** Sign in to the Auth emulator as a stable dev user, creating it if needed. */
export async function devSignIn(): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  } catch {
    await createUserWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  }
}
