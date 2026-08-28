import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieOptions, SESSION_COOKIE } from "@/lib/firebase/session-cookie";

// Pages redirect here — not straight to /login — when they find a session
// cookie that is present but no longer valid.
//
// The proxy only checks that the cookie EXISTS, while pages check that it is
// VALID. A present-but-invalid cookie makes them disagree forever: the page
// sends you to /login, the proxy sees a cookie and sends you back. Clearing it
// here is what breaks that loop.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const notice = request.nextUrl.searchParams.get("notice");

  url.pathname = "/login";
  url.search = "";
  if (notice) url.searchParams.set("notice", notice);

  const response = NextResponse.redirect(url);
  response.cookies.set({ ...sessionCookieOptions(), name: SESSION_COOKIE, value: "", maxAge: 0 });
  return response;
}
