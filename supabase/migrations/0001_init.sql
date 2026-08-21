-- Clipsense initial schema. Safe to re-run.

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text,
  has_password  boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint profiles_username_format
    check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$')
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

create table if not exists public.clipboard_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('text', 'image')),
  content     text not null,
  is_public   boolean not null default false,
  share_slug  text unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists clipboard_items_user_created_idx
  on public.clipboard_items (user_id, created_at desc);

create index if not exists clipboard_items_share_slug_idx
  on public.clipboard_items (share_slug)
  where share_slug is not null;

-- has_password is derived from Supabase's stored password so Google-only signups route to /onboarding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, has_password)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'username', ''),
    new.encrypted_password is not null and new.encrypted_password <> ''
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clipboard_items_touch_updated_at on public.clipboard_items;
create trigger clipboard_items_touch_updated_at
  before update on public.clipboard_items
  for each row execute function public.touch_updated_at();

-- SECURITY DEFINER so signup can check a username without any read grant on profiles.
create or replace function public.username_available(candidate text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(candidate)
  );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.clipboard_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No anon policy here on purpose: share links are read server-side by slug, so anon cannot enumerate.
drop policy if exists "clips_select_own" on public.clipboard_items;
create policy "clips_select_own" on public.clipboard_items
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "clips_insert_own" on public.clipboard_items;
create policy "clips_insert_own" on public.clipboard_items
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "clips_update_own" on public.clipboard_items;
create policy "clips_update_own" on public.clipboard_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "clips_delete_own" on public.clipboard_items;
create policy "clips_delete_own" on public.clipboard_items
  for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clipboard-images',
  'clipboard-images',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "clip_images_select_own" on storage.objects;
create policy "clip_images_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'clipboard-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "clip_images_insert_own" on storage.objects;
create policy "clip_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'clipboard-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "clip_images_delete_own" on storage.objects;
create policy "clip_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'clipboard-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
