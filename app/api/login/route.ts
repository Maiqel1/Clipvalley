import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { emailForIdentifier, verifyPassword } from "@/lib/firebase/identity";

// Identical response for "no such account" and "wrong password" so the form
// cannot be used to discover which usernames or emails exist.
const REJECTED = NextResponse.json(
  { error: "That doesn't match an account. Check your details and try again." },
  { status: 401 },
);

export async function POST(request: NextRequest) {
  const { identifier, password } = (await request.json().catch(() => ({}))) as {
    identifier?: string;
    password?: string;
  };

  if (!identifier?.trim() || !password) {
    return NextResponse.json(
      { error: "Enter your email or username, and your password." },
      { status: 400 },
    );
  }

  try {
    const email = await emailForIdentifier(identifier.trim());
    if (!email) return REJECTED.clone();

    const verified = await verifyPassword(email, password);
    if (!verified) return REJECTED.clone();

    const { createSessionCookie, sessionCookieOptions } = await import("@/lib/firebase/session");
    const { ensureProfile } = await import("@/lib/actions/profile-bootstrap");

    await ensureProfile(verified.uid, email);

    // The session cookie is minted here, from the server's own idToken, so
    // sign-in completes without the browser ever contacting Google. Users whose
    // network blocks identitytoolkit.googleapis.com can still log in.
    const cookie = await createSessionCookie(verified.idToken);

    // Still returned so the browser can authenticate its own Firebase SDK,
    // which direct-to-Storage image uploads need. Best-effort on the client:
    // if it fails, the user is signed in regardless.
    const customToken = await adminAuth().createCustomToken(verified.uid);

    const response = NextResponse.json({ customToken });
    response.cookies.set({ ...sessionCookieOptions(), value: cookie });
    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
