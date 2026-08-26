import "server-only";
import { adminAuth, adminDb } from "./admin";
import { PROFILES, USERNAMES } from "./paths";

const IDENTITY_BASE = "https://identitytoolkit.googleapis.com/v1/accounts";

function apiKey() {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");
  return key;
}

// Firestore doc id is the lowercased username, so this is an exact lookup with
// none of the LIKE-wildcard hazard the Postgres version had to guard against.
export async function uidForUsername(username: string): Promise<string | null> {
  const snapshot = await adminDb().collection(USERNAMES).doc(username.toLowerCase()).get();
  return snapshot.exists ? ((snapshot.get("uid") as string) ?? null) : null;
}

export async function emailForIdentifier(identifier: string): Promise<string | null> {
  if (identifier.includes("@")) return identifier;
  if (!/^[A-Za-z0-9_]{3,24}$/.test(identifier)) return null;

  const uid = await uidForUsername(identifier);
  if (!uid) return null;

  try {
    const record = await adminAuth().getUser(uid);
    return record.email ?? null;
  } catch {
    return null;
  }
}

// The Admin SDK cannot verify a password, so this uses the Identity Toolkit
// REST endpoint server-side. The email never reaches the browser.
export async function verifyPassword(email: string, password: string): Promise<string | null> {
  const response = await fetch(`${IDENTITY_BASE}:signInWithPassword?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { localId?: string };
  return data.localId ?? null;
}

export async function usernameTaken(username: string) {
  const snapshot = await adminDb().collection(USERNAMES).doc(username.toLowerCase()).get();
  return snapshot.exists;
}

export async function profileFor(uid: string) {
  const snapshot = await adminDb().collection(PROFILES).doc(uid).get();
  return snapshot.exists ? snapshot.data() : null;
}
