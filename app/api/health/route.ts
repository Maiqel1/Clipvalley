import { NextResponse } from "next/server";

// Diagnostic only. Reports the SHAPE of configuration, never its values.
// Dynamic imports so a module-load failure is catchable and reportable
// instead of surfacing as an empty 500.
export async function GET() {
  const env = {
    FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  };

  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const privateKeyShape = {
    length: raw.length,
    startsWithBegin: raw.trimStart().startsWith("-----BEGIN"),
    wrappedInQuotes: raw.startsWith('"') || raw.startsWith("'"),
    hasEscapedNewlines: raw.includes("\n"),
    hasRealNewlines: raw.includes("\n"),
    endsWithEnd: raw.trimEnd().endsWith("-----END PRIVATE KEY-----"),
  };

  let adminImport = "not attempted";
  let adminInit = "not attempted";
  let tokenVerify = "not attempted";

  try {
    const mod = await import("@/lib/firebase/admin");
    adminImport = "ok";

    try {
      const auth = mod.adminAuth();
      adminInit = "ok";

      try {
        await auth.listUsers(1);
        tokenVerify = "ok — credentials accepted by Google";
      } catch (error) {
        tokenVerify = error instanceof Error ? error.message.slice(0, 300) : String(error);
      }
    } catch (error) {
      adminInit = error instanceof Error ? error.message.slice(0, 300) : String(error);
    }
  } catch (error) {
    adminImport = error instanceof Error ? error.message.slice(0, 300) : String(error);
  }

  return NextResponse.json(
    { env, privateKeyShape, adminImport, adminInit, tokenVerify },
    { status: 200 },
  );
}
