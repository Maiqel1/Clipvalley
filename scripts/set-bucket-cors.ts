/**
 * Applies cors.json to the Storage bucket.
 *
 *   npx tsx scripts/set-bucket-cors.ts
 *
 * Without this, signed URLs answer a plain GET but send no
 * Access-Control-Allow-Origin, so <img> works while fetch() is blocked —
 * which is what breaks Copy and Download.
 *
 * Bucket metadata, not per-file: run once, it persists.
 */
import { existsSync, readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}

const REQUIRED = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const key of missing) console.error(`  - ${key}`);
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\n/g, "\n"),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
});

async function main() {
  const bucket = getStorage(app).bucket();
  const config = JSON.parse(readFileSync("cors.json", "utf8"));

  const [before] = await bucket.getMetadata();
  console.log(`bucket: ${bucket.name}`);
  console.log(`  before: ${JSON.stringify(before.cors ?? "none")}`);

  await bucket.setCorsConfiguration(config);

  const [after] = await bucket.getMetadata();
  console.log(`  after : ${JSON.stringify(after.cors)}`);
  console.log("\nCopy and Download should now work for stored images.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
