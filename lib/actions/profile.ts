"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileState } from "./types";

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export async function updateUsername(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const username = String(formData.get("username") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return {
      error: "Usernames are 3–24 characters, letters, numbers and underscores only.",
      notice: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: current } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (current?.username?.toLowerCase() !== username.toLowerCase()) {
    const { data: available } = await supabase.rpc("username_available", { candidate: username });
    if (!available) return { error: `"${username}" is already taken.`, notice: null };
  }

  const { error } = await supabase.from("profiles").update({ username }).eq("id", user.id);
  if (error) return { error: "Could not save that username.", notice: null };

  revalidatePath("/dashboard/settings");
  return { error: null, notice: "Username updated." };
}

export async function updatePassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Passwords need at least 8 characters.", notice: null };
  if (password !== confirm) return { error: "Those passwords don't match.", notice: null };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message, notice: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.from("profiles").update({ has_password: true }).eq("id", user.id);

  return { error: null, notice: "Password updated." };
}
