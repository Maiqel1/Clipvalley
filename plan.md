# Clipsense — Product Plan

## Overview
2-way clipboard web app. Paste text or an image on one device, log in on another, copy it back. Content shown as cards. Optional public share link per item.

**How sync works:** sync is identity-based, not device-based. Items are tied to `user_id`. Log into the same account (email/password or Google) on any device and the dashboard fetches that user's items. No separate pairing/sync step.

## Stack
- Next.js (frontend + API routes)
- Supabase (Auth, Postgres, Storage for images)

## Data model (Supabase)

**users** — handled by Supabase Auth (`auth.users`), extended with a `profiles` table:
```
profiles
  id          uuid (FK -> auth.users.id, PK)
  username    text unique nullable
  has_password boolean default true
  created_at  timestamptz
```

**clipboard_items**
```
clipboard_items
  id          uuid PK default gen_random_uuid()
  user_id     uuid FK -> auth.users.id
  type        text  -- 'text' | 'image'
  content     text  -- raw text, or storage path for images
  is_public   boolean default false
  share_slug  text unique nullable  -- short id used in /s/[slug]
  created_at  timestamptz default now()
```

**Storage**
- bucket `clipboard-images`, path `{user_id}/{item_id}.{ext}`
- RLS: users can only read/write their own rows/files unless `is_public = true`

## Auth flow
- Email/username/password signup via Supabase Auth
- Google OAuth via Supabase Auth provider
- Single account per email: Supabase Auth already merges by email if "link identities" is enabled — confirm this setting on the project
- Post-signup via Google: prompt to set username + password (updates `profiles.username`, sets password via `updateUser`)
- Post-signup via email/password: username set at signup; no Google linking needed unless they choose to link later (optional, skip for MVP)

## MVP scope
- [ ] Email/password + Google auth, single account per email
- [ ] Paste text → card created, drop-in animation
- [ ] Paste/upload image → card created
- [ ] Card actions: copy (top-right), edit, delete (bottom-right), fade-out on delete
- [ ] Cross-device sync (just Supabase real-time or refetch on load — no need for websockets complexity at MVP)
- [ ] Public share link per item (`/s/[slug]`), read-only view
- [ ] Prompt (banner/toast, dismissible) suggesting users pin/bookmark the site for quick access — "Add to Home Screen" copy on mobile, "press Ctrl/Cmd+D to bookmark" copy on desktop

## Phase 2 (not MVP)
- Real-time live sync (Supabase Realtime subscriptions) instead of refetch-on-load
- Expiring share links
- Search/filter cards
- Tags/folders
- Paste history limit / auto-cleanup

## Build order (solo, no deadline)
1. Supabase project: auth providers + `profiles` + `clipboard_items` tables + RLS policies
2. Next.js scaffold + Supabase client + auth screens (email/password, Google button)
3. Post-Google-signup username/password prompt flow
4. Dashboard: fetch + render cards (text only first)
5. Paste-to-create-card flow + drop-in animation
6. Copy / edit / delete actions + fade-out animation
7. Image paste/upload → Storage bucket + card rendering
8. Public share link generation + `/s/[slug]` page
9. Polish pass: empty states, error states, mobile layout

## Decisions
- Image size cap: 5MB (enforce client-side before upload + Supabase Storage bucket policy)
- Delete strategy: hard delete for MVP (no trash/undo). Revisit if an "undo" feature is wanted later.