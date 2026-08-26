import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./admin";

export const SESSION_COOKIE = "clipvalley_session";

// 14 days is Firebase's hard maximum for a session cookie.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

// Re-mint once past halfway so an active user is never signed out.
export const SESSION_REFRESH_AFTER = SESSION_MAX_AGE / 2;

export type SessionUser = {
  uid: string;
  email: string | null;
  issuedAt: number;
};

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

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
