import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieOptions } from "@/lib/firebase/session-cookie";

export async function POST(request: NextRequest) {
  const { idToken } = (await request.json().catch(() => ({}))) as { idToken?: string };

  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const [{ adminAuth }, { createSessionCookie }, { ensureProfile }] = await Promise.all([
      import("@/lib/firebase/admin"),
      import("@/lib/firebase/session"),
      import("@/lib/actions/profile-bootstrap"),
    ]);

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
