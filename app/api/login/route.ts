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

    const uid = await verifyPassword(email, password);
    if (!uid) return REJECTED.clone();

    // A custom token lets the browser complete sign-in itself, so the client
    // SDK is authenticated for direct-to-Storage uploads.
    const customToken = await adminAuth().createCustomToken(uid);
    return NextResponse.json({ customToken });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
