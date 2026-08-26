import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { isFirebaseConfigured } from "./config";
import { SESSION_COOKIE, sessionCookieOptions, verifySessionCookie } from "./session";

const PUBLIC_PATHS = ["/", "/login", "/s", "/privacy", "/terms"];

// These authenticate their own payload (an ID token, or credentials) and are how
// a session is established in the first place. Guarding them behind a session
// cookie makes sign-in impossible: the request that mints the cookie gets
// redirected to /login, which returns 200, so the client sees a false success.
const AUTH_ENDPOINTS = ["/api/session", "/api/login", "/api/signup"];

function isPublic(pathname: string) {
  if (AUTH_ENDPOINTS.includes(pathname)) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)));
}

export async function guard(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Misconfiguration must not take down pages that need no backend at all.
  // Public routes still render; anything requiring a session goes to /login,
  // which surfaces the problem without 500-ing the whole site.
  if (!isFirebaseConfigured) {
    console.error(
      "Firebase environment variables are not set. See docs/FIREBASE_SETUP.md — " +
        "signed-in routes are unavailable until they are configured.",
    );

    if (isPublic(pathname)) return NextResponse.next({ request });

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const user = cookie ? await verifySessionCookie(cookie) : null;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    if (cookie) redirect.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
    return redirect;
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Session cookies cap at 14 days and can only be re-minted from a fresh ID
  // token, which only the client holds. SessionKeeper does that on every load
  // via onIdTokenChanged, so an active user's cookie never ages out.
  return NextResponse.next({ request });
}
