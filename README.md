# Clipvalley

Two-way clipboard sync. Paste text or an image on one device, sign in on another, copy it back. Sync is tied to your **account**, not your devices — there is no pairing step. Any clip can get a public read-only share link.

## Getting started

1. **Set up Supabase** — follow [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md). Nothing works until this is done; it takes about ten minutes and creates the database, RLS policies, storage bucket, and auth providers.
2. Copy `.env.local.example` to `.env.local` and fill in the three Supabase values.
3. Install and run:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, design tokens as `@theme` variables in `app/globals.css` |
| Motion | Motion for React (`motion`) for list enter/exit and layout; CSS for everything else |
| Backend | Supabase — Auth, Postgres, Storage |

## Layout

```
app/
  page.tsx              landing (redirects to /dashboard when signed in)
  login/                log in + sign up
  onboarding/           username + password for Google signups
  dashboard/            the clip grid
  dashboard/settings/   username, password, sign out
  s/[slug]/             public read-only share view
  auth/callback/        OAuth code exchange
components/             app shell, clip cards, dialogs, primitives
  ui/dialog.tsx         portalled sheet (mobile) / modal (desktop) primitive
lib/
  supabase/             browser / server / proxy / admin clients
  actions/              server actions (clips, auth, profile)
  motion.ts             shared springs, variants, stagger helpers
supabase/migrations/    schema, RLS, storage policies
proxy.ts                session refresh + route guards
```

## Design

The visual system comes from `stitch_clipsense_clipboard_sync/vivid_purple_minimalist/DESIGN.md` — Poppins, primary `#630ed4`, 8px grid. Tokens are ported verbatim into `app/globals.css` so `bg-primary`, `text-on-surface`, `shadow-level-1` etc. all work as named in the design doc.

The brand mark is `public/logo.png`, derived from the source `LOGO.png`. The blue logo baked into the Stitch mocks is not used.

## Things worth knowing

- **Sessions are permanent by design.** Supabase refresh tokens don't expire, and the session-timeout settings are deliberately left off. `proxy.ts` refreshes the access token on every request — if it stops running, users get logged out after an hour.
- **`clipboard_items` has no `anon` RLS policy.** Share links are read server-side by slug through the service-role client in `lib/supabase/admin.ts` (marked `server-only`). A blanket anon read policy would let anyone enumerate every public clip.
- **Images upload straight from the browser** to Supabase Storage, then a server action inserts the row. Routing 5MB files through a server action would blow past its 1MB body limit.
- **Firefox can't copy images to the clipboard** (`ClipboardItem` is off by default), so image cards feature-detect and offer Download instead.
- **URLs are auto-detected.** A clip whose content is a bare URL renders as a Link card but is still stored as `type = 'text'` — no separate type.
- **Google sign-in is never interrupted.** A username is derived from the email by a database trigger, and setting a password is optional and lives in Settings. Nothing blocks the way to the dashboard.
- **Dialogs must portal to `document.body`.** `ClipCard` is a transformed `motion` element, and a transformed ancestor traps `position: fixed` children inside its own clipped box. The share popover this replaced was invisible for exactly this reason. `components/ui/dialog.tsx` handles it; build new overlays on that, not on bare `fixed`.
- **`lib/cn.ts` extends tailwind-merge.** The theme's custom `text-*` font sizes collide with `text-*` colours; without the override, twMerge silently deletes the colour and buttons render with near-black text.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm start        # serve the production build
npx eslint .     # lint
npx tsc --noEmit # typecheck
```
