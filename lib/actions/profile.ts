"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/firebase/session";
import { PROFILES, USERNAMES } from "@/lib/firebase/paths";
import type { ProfileState } from "./types";

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export async function updateUsername(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const username = String(formData.get("username") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return {
      error: "Usernames are 3–24 characters, letters, numbers and underscores only.",
      notice: null,
    };
  }

  const user = await requireUser();
  const db = adminDb();
  const profileRef = db.collection(PROFILES).doc(user.uid);
  const current = (await profileRef.get()).get("username") as string | null;

  if (current?.toLowerCase() === username.toLowerCase()) {
    await profileRef.update({ username });
    revalidatePath("/dashboard/settings");
    return { error: null, notice: "Username updated." };
  }

  const nextLock = db.collection(USERNAMES).doc(username.toLowerCase());

  try {
    // Claim the new lock and release the old one atomically, so a crash can
    // never leave the username orphaned or double-held.
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(nextLock);
      if (existing.exists) throw new Error("TAKEN");

      tx.set(nextLock, { uid: user.uid, createdAt: FieldValue.serverTimestamp() });
      if (current) tx.delete(db.collection(USERNAMES).doc(current.toLowerCase()));
      tx.update(profileRef, { username });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TAKEN") {
      return { error: `"${username}" is already taken.`, notice: null };
    }
    return { error: "Could not save that username.", notice: null };
  }

  revalidatePath("/dashboard/settings");
  return { error: null, notice: "Username updated." };
}

export async function updatePassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Passwords need at least 8 characters.", notice: null };
  if (password !== confirm) return { error: "Those passwords don't match.", notice: null };

  const user = await requireUser();

  let customToken: string | undefined;

  try {
    await adminAuth().updateUser(user.uid, { password });
    await adminDb().collection(PROFILES).doc(user.uid).update({ hasPassword: true });

    // Firebase revokes every existing session on a password change, which would
    // otherwise log the user out of the very page they are standing on. Minting
    // a custom token lets the client rebuild its session immediately.
    customToken = await adminAuth().createCustomToken(user.uid);
  } catch {
    return { error: "Could not update your password.", notice: null };
  }

  // Deliberately no revalidatePath here. The password change has just revoked
  // this session, so re-rendering now would run with a dead cookie and bounce
  // the user to /login. The client refreshes once it has rebuilt the session.
  return { error: null, notice: "Password updated.", customToken };
}
