import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./session-cookie";

const PUBLIC_PATHS = ["/", "/login", "/s", "/privacy", "/terms"];

// These authenticate their own payload and are how a session is created, so
// guarding them behind a session cookie makes sign-in impossible.
const AUTH_ENDPOINTS = ["/api/session", "/api/login", "/api/signup", "/api/reset"];

function isPublic(pathname: string) {
  if (AUTH_ENDPOINTS.includes(pathname)) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)));
}

// Presence check only. Verifying the cookie needs firebase-admin, which cannot
// be imported here — it, next/headers and server-only all fail at module load
// in the proxy bundle. Real verification happens in the server components:
// /dashboard and /dashboard/settings each call currentUser() and redirect, so
// a forged or expired cookie gets one extra hop and is then rejected.
export function guard(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
