import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { PROFILES, USERNAMES } from "@/lib/firebase/paths";

function baseUsername(email: string | null) {
  const local = (email ?? "").split("@")[0] ?? "";
  const cleaned = local.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleaned.length >= 3) return cleaned.slice(0, 20);
  return `user${cleaned}`.slice(0, 20);
}

async function hasPasswordProvider(uid: string) {
  try {
    const record = await adminAuth().getUser(uid);
    return record.providerData.some((p) => p.providerId === "password");
  } catch {
    return false;
  }
}

// Firestore has no unique constraint, so usernames/{lowercased} is the lock:
// the transaction failing on an existing doc IS the uniqueness check.
async function claimUsername(uid: string, desired: string) {
  const db = adminDb();

  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = attempt === 0 ? desired : `${desired}${attempt + 1}`;
    const lockRef = db.collection(USERNAMES).doc(candidate);

    try {
      const claimed = await db.runTransaction(async (tx) => {
        const existing = await tx.get(lockRef);
        if (existing.exists) return null;
        tx.set(lockRef, { uid, createdAt: FieldValue.serverTimestamp() });
        return candidate;
      });

      if (claimed) return claimed;
    } catch {
      // Contention on the same candidate — try the next one.
    }
  }

  return null;
}

export async function ensureProfile(uid: string, email: string | null): Promise<void> {
  const db = adminDb();
  const profileRef = db.collection(PROFILES).doc(uid);
  const snapshot = await profileRef.get();

  const hasPassword = await hasPasswordProvider(uid);

  if (snapshot.exists) {
    if (snapshot.get("hasPassword") !== hasPassword) {
      await profileRef.update({ hasPassword });
    }
    return;
  }

  const username = await claimUsername(uid, baseUsername(email));

  await profileRef.set({
    username,
    hasPassword,
    createdAt: FieldValue.serverTimestamp(),
  });
}
