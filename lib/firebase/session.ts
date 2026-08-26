import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./session-cookie";

export { SESSION_COOKIE, SESSION_MAX_AGE, sessionCookieOptions } from "./session-cookie";

// Re-mint once past halfway so an active user is never signed out.
export const SESSION_REFRESH_AFTER = SESSION_MAX_AGE / 2;

export type SessionUser = {
  uid: string;
  email: string | null;
  issuedAt: number;
};

export async function createSessionCookie(idToken: string) {
  return adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE * 1000 });
}

// checkRevoked catches accounts disabled or signed out everywhere.
export async function verifySessionCookie(value: string): Promise<SessionUser | null> {
  try {
    const claims = await adminAuth().verifySessionCookie(value, true);
    return { uid: claims.uid, email: claims.email ?? null, issuedAt: claims.iat };
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return verifySessionCookie(value);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
