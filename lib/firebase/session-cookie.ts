// Deliberately dependency-free: proxy.ts imports this, and pulling in
// firebase-admin, next/headers or server-only there fails at module load.
export const SESSION_COOKIE = "clipvalley_session";

// 14 days is Firebase's hard maximum for a session cookie.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

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
