// Supabase compares the ID token's nonce claim against SHA-256 of what we pass
// it, so Google gets the hash and signInWithIdToken gets the raw value.
export async function createNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");

  return { raw, hashed };
}
