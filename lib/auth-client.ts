"use client";

import {
  sendPasswordResetEmail,
  signInWithCustomToken,
  signOut as fbSignOut,
  type UserCredential,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

async function mintSessionCookie(credential: UserCredential) {
  const idToken = await credential.user.getIdToken(true);

  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    redirect: "error",
  });

  // A guard redirect would land on an HTML page that still answers 200, so
  // check the payload rather than trusting the status alone.
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error("Could not start your session.");
  }
}

async function exchange(endpoint: string, body: unknown) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    customToken?: string;
    error?: string;
  };

  if (!response.ok || !data.customToken) {
    throw new Error(data.error ?? "Something went wrong. Try again.");
  }

  // Completing sign-in in the browser leaves the client SDK authenticated,
  // which the direct-to-Storage image upload depends on.
  const credential = await signInWithCustomToken(clientAuth(), data.customToken);
  await mintSessionCookie(credential);
}

export async function signInWithPassword(identifier: string, password: string) {
  await exchange("/api/login", { identifier, password });
}

export async function signUpWithPassword(username: string, email: string, password: string) {
  await exchange("/api/signup", { username, email, password });
}

export async function completeGoogleSignIn(credential: UserCredential) {
  await mintSessionCookie(credential);
}

// Never throws and never reports whether the address has an account — the
// caller shows one confirmation either way, so this cannot be used to
// enumerate users.
export async function requestPasswordReset(email: string) {
  // Creates a password provider first where one is missing, otherwise Firebase
  // sends nothing to accounts that only ever signed in with Google.
  await fetch("/api/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).catch(() => {});

  try {
    await sendPasswordResetEmail(clientAuth(), email);
  } catch {
    // auth/user-not-found and friends are swallowed deliberately.
  }
}

export async function signOutEverywhere() {
  await fbSignOut(clientAuth()).catch(() => {});
  await fetch("/api/session", { method: "DELETE" }).catch(() => {});
}
