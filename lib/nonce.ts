// Google receives the SHA-256 hash so it can bind the ID token to this request.
// Firebase verifies the token signature rather than the nonce, so only the
// hashed value is ever used.
export async function createNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");

  return { raw, hashed };
}
