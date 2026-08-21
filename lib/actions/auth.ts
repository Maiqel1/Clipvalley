"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "./types";

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password.", notice: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "That email and password don't match an account.", notice: null };
  }

  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_RE.test(username)) {
    return {
      error: "Usernames are 3–24 characters, letters, numbers and underscores only.",
      notice: null,
    };
  }
  if (password.length < 8) {
    return { error: "Passwords need at least 8 characters.", notice: null };
  }

  const supabase = await createClient();

  const { data: available, error: rpcError } = await supabase.rpc("username_available", {
    candidate: username,
  });

  if (rpcError) {
    return { error: "Could not check that username. Try again.", notice: null };
  }
  if (!available) {
    return { error: `"${username}" is already taken.`, notice: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return { error: error.message, notice: null };
  }

  if (!data.session) {
    return {
      error: null,
      notice: "Check your inbox to confirm your email, then sign in.",
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
