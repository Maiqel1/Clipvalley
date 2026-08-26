"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/firebase/session";
import { CLIPS, ownsPath } from "@/lib/firebase/paths";
import { toClip, type ClipDoc } from "@/lib/firebase/types";
import { MAX_TEXT_LENGTH, SIGNED_URL_TTL, type ActionResult, type ClipResult } from "./types";

const slugId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

const MAX_TITLE_LENGTH = 80;

function cleanTitle(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed.slice(0, MAX_TITLE_LENGTH) : null;
}

function clips() {
  return adminDb().collection(CLIPS);
}

async function readOwned(id: string, uid: string) {
  const snapshot = await clips().doc(id).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() as ClipDoc;
  if (data.userId !== uid) return null;
  return { ref: snapshot.ref, data };
}

async function signedUrl(path: string) {
  const [url] = await adminBucket()
    .file(path)
    .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL * 1000 });
  return url;
}

export async function createTextClip(content: string, title?: string): Promise<ClipResult> {
  const value = content.trim();
  if (!value) return { ok: false, error: "Nothing to paste." };
  if (value.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: "That text is too long to store." };
  }

  const user = await requireUser();
  const ref = clips().doc();

  const doc = {
    userId: user.uid,
    type: "text" as const,
    content: value,
    title: cleanTitle(title),
    isPublic: false,
    shareSlug: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await ref.set(doc);
  } catch {
    return { ok: false, error: "Could not save that clip." };
  }

  const saved = await ref.get();
  revalidatePath("/dashboard");
  return { ok: true, clip: toClip(ref.id, saved.data() as ClipDoc) };
}

export async function createImageClip(storagePath: string, title?: string): Promise<ClipResult> {
  const user = await requireUser();

  if (!ownsPath(user.uid, storagePath)) {
    return { ok: false, error: "Invalid upload path." };
  }

  const ref = clips().doc();

  try {
    await ref.set({
      userId: user.uid,
      type: "image" as const,
      content: storagePath,
      title: cleanTitle(title),
      isPublic: false,
      shareSlug: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch {
    await adminBucket().file(storagePath).delete().catch(() => {});
    return { ok: false, error: "Could not save that image." };
  }

  const saved = await ref.get();
  revalidatePath("/dashboard");
  return { ok: true, clip: toClip(ref.id, saved.data() as ClipDoc) };
}

export async function updateTextClip(
  id: string,
  content: string,
  title?: string,
): Promise<ClipResult> {
  const value = content.trim();
  if (!value) return { ok: false, error: "Clip cannot be empty." };
  if (value.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: "That text is too long to store." };
  }

  const user = await requireUser();
  const owned = await readOwned(id, user.uid);
  if (!owned || owned.data.type !== "text") {
    return { ok: false, error: "Could not update that clip." };
  }

  await owned.ref.update({
    content: value,
    title: cleanTitle(title),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await owned.ref.get();
  revalidatePath("/dashboard");
  return { ok: true, clip: toClip(id, saved.data() as ClipDoc) };
}

// Separate from updateTextClip so an image clip can be titled without sending
// content, and so renaming never risks overwriting the body.
export async function updateClipTitle(id: string, title: string): Promise<ClipResult> {
  const user = await requireUser();
  const owned = await readOwned(id, user.uid);
  if (!owned) return { ok: false, error: "That clip no longer exists." };

  await owned.ref.update({
    title: cleanTitle(title),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await owned.ref.get();
  revalidatePath("/dashboard");
  return { ok: true, clip: toClip(id, saved.data() as ClipDoc) };
}

export async function deleteClip(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const owned = await readOwned(id, user.uid);
  if (!owned) return { ok: false, error: "That clip is already gone." };

  try {
    await owned.ref.delete();
  } catch {
    return { ok: false, error: "Could not delete that clip." };
  }

  if (owned.data.type === "image") {
    await adminBucket().file(owned.data.content).delete().catch(() => {});
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setClipShared(id: string, shared: boolean): Promise<ClipResult> {
  const user = await requireUser();
  const owned = await readOwned(id, user.uid);
  if (!owned) return { ok: false, error: "That clip no longer exists." };

  await owned.ref.update({
    isPublic: shared,
    shareSlug: shared ? (owned.data.shareSlug ?? slugId()) : owned.data.shareSlug,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await owned.ref.get();
  revalidatePath("/dashboard");
  return { ok: true, clip: toClip(id, saved.data() as ClipDoc) };
}

export async function refreshImageUrl(path: string): Promise<string | null> {
  const user = await requireUser();
  if (!ownsPath(user.uid, path)) return null;

  try {
    return await signedUrl(path);
  } catch {
    return null;
  }
}
