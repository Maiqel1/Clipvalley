import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { createSessionCookie, sessionCookieOptions, SESSION_COOKIE } from "@/lib/firebase/session";
import { ensureProfile } from "@/lib/actions/profile-bootstrap";

export async function POST(request: NextRequest) {
  const { idToken } = (await request.json().catch(() => ({}))) as { idToken?: string };

  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true);

    // Replaces the old handle_new_user Postgres trigger; no Cloud Function needed.
    await ensureProfile(decoded.uid, decoded.email ?? null);

    const cookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ ...sessionCookieOptions(), value: cookie });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return response;
}

export { SESSION_COOKIE };
