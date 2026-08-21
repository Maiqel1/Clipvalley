"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { MAX_TEXT_LENGTH, SIGNED_URL_TTL, type ActionResult, type ClipResult } from "./types";

const slugId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function createTextClip(content: string): Promise<ClipResult> {
  const value = content.trim();
  if (!value) return { ok: false, error: "Nothing to paste." };
  if (value.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: "That text is too long to store." };
  }

  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("clipboard_items")
    .insert({ user_id: user.id, type: "text", content: value })
    .select()
    .single();

  if (error) return { ok: false, error: "Could not save that clip." };

  revalidatePath("/dashboard");
  return { ok: true, clip: data };
}

export async function createImageClip(storagePath: string): Promise<ClipResult> {
  const { supabase, user } = await requireUser();

  if (!storagePath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Invalid upload path." };
  }

  const { data, error } = await supabase
    .from("clipboard_items")
    .insert({ user_id: user.id, type: "image", content: storagePath })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("clipboard-images").remove([storagePath]);
    return { ok: false, error: "Could not save that image." };
  }

  revalidatePath("/dashboard");
  return { ok: true, clip: data };
}

export async function updateTextClip(id: string, content: string): Promise<ClipResult> {
  const value = content.trim();
  if (!value) return { ok: false, error: "Clip cannot be empty." };
  if (value.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: "That text is too long to store." };
  }

  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("clipboard_items")
    .update({ content: value })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("type", "text")
    .select()
    .single();

  if (error || !data) return { ok: false, error: "Could not update that clip." };

  revalidatePath("/dashboard");
  return { ok: true, clip: data };
}

export async function deleteClip(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("clipboard_items")
    .select("id, type, content")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "That clip is already gone." };

  const { error } = await supabase
    .from("clipboard_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not delete that clip." };

  if (existing.type === "image") {
    await supabase.storage.from("clipboard-images").remove([existing.content]);
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setClipShared(id: string, shared: boolean): Promise<ClipResult> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("clipboard_items")
    .select("share_slug")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "That clip no longer exists." };

  const { data, error } = await supabase
    .from("clipboard_items")
    .update({
      is_public: shared,
      share_slug: shared ? (existing.share_slug ?? slugId()) : existing.share_slug,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) return { ok: false, error: "Could not update sharing." };

  revalidatePath("/dashboard");
  return { ok: true, clip: data };
}

export async function refreshImageUrl(path: string): Promise<string | null> {
  const { supabase, user } = await requireUser();

  if (!path.startsWith(`${user.id}/`)) return null;

  const { data } = await supabase.storage
    .from("clipboard-images")
    .createSignedUrl(path, SIGNED_URL_TTL);

  return data?.signedUrl ?? null;
}
