import type { ClipboardItem } from "@/lib/supabase/types";

export const MAX_TEXT_LENGTH = 100_000;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const SIGNED_URL_TTL = 60 * 60 * 8;

export type ClipResult = { ok: true; clip: ClipboardItem } | { ok: false; error: string };
export type ActionResult = { ok: true } | { ok: false; error: string };

export type AuthState = { error: string | null; notice: string | null };
export const emptyAuthState: AuthState = { error: null, notice: null };

export type ProfileState = { error: string | null; notice: string | null };
export const emptyProfileState: ProfileState = { error: null, notice: null };
