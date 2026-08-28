import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

// Firebase only sends reset mail to accounts that already have a password
// provider. Migrated users were created with createUser({ email }) and have
// none, so a reset would silently send nothing. This bootstraps one first.
//
// Safe: the random password is never disclosed, and the reset link Firebase
// sends afterwards only reaches the real inbox — so requesting a reset for
// someone else's address gains an attacker nothing.
export async function POST(request: NextRequest) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const address = email?.trim();

  // Always 200, whatever happens — found, missing, or already has a password.
  // Anything else turns this into an account-enumeration oracle.
  const ok = NextResponse.json({ ok: true });

  if (!address?.includes("@")) return ok;

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    const auth = adminAuth();

    const user = await auth.getUserByEmail(address);
    const hasPassword = user.providerData.some((p) => p.providerId === "password");

    if (!hasPassword) {
      await auth.updateUser(user.uid, { password: randomBytes(32).toString("hex") });
    }
  } catch {
    // No such user, or Firebase is unreachable. Either way the response is
    // identical, and the client still shows the same confirmation.
  }

  return ok;
}
