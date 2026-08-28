import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { usernameTaken, verifyPassword } from "@/lib/firebase/identity";
import { PROFILES, USERNAMES } from "@/lib/firebase/paths";

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export async function POST(request: NextRequest) {
  const { username, email, password } = (await request.json().catch(() => ({}))) as {
    username?: string;
    email?: string;
    password?: string;
  };

  const name = username?.trim() ?? "";
  const address = email?.trim() ?? "";

  if (!USERNAME_RE.test(name)) {
    return NextResponse.json(
      { error: "Usernames are 3–24 characters, letters, numbers and underscores only." },
      { status: 400 },
    );
  }
  if (!address.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Passwords need at least 8 characters." }, { status: 400 });
  }

  if (await usernameTaken(name)) {
    return NextResponse.json({ error: `"${name}" is already taken.` }, { status: 409 });
  }

  let uid: string;
  try {
    const record = await adminAuth().createUser({ email: address, password });
    uid = record.uid;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "An account already exists for that email. Try signing in." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not create that account." }, { status: 500 });
  }

  const db = adminDb();
  const lockRef = db.collection(USERNAMES).doc(name.toLowerCase());

  try {
    // The transaction failing on an existing lock IS the uniqueness check —
    // Firestore has no unique constraint to lean on.
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(lockRef);
      if (existing.exists) throw new Error("TAKEN");
      tx.set(lockRef, { uid, createdAt: FieldValue.serverTimestamp() });
      tx.set(db.collection(PROFILES).doc(uid), {
        username: name,
        hasPassword: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch {
    await adminAuth().deleteUser(uid).catch(() => {});
    return NextResponse.json({ error: `"${name}" is already taken.` }, { status: 409 });
  }

  const customToken = await adminAuth().createCustomToken(uid);
  const response = NextResponse.json({ customToken });

  // Mint the session cookie server-side too, so signing up works on networks
  // that block identitytoolkit.googleapis.com from the browser.
  const verified = await verifyPassword(address, password);
  if (verified) {
    const { createSessionCookie, sessionCookieOptions } = await import("@/lib/firebase/session");
    response.cookies.set({
      ...sessionCookieOptions(),
      value: await createSessionCookie(verified.idToken),
    });
  }

  return response;
}
