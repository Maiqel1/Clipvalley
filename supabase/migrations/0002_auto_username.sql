-- Google sign-in must not be interrupted, so derive a username instead of demanding one. Safe to re-run.

create or replace function public.generate_username(seed text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base      text;
  candidate text;
  suffix    int := 0;
begin
  base := regexp_replace(coalesce(split_part(seed, '@', 1), ''), '[^A-Za-z0-9_]', '', 'g');
  base := left(base, 18);

  if length(base) < 3 then
    base := 'user';
  end if;

  candidate := base;

  while exists (select 1 from public.profiles where lower(username) = lower(candidate)) loop
    suffix := suffix + 1;
    candidate := left(base, 18) || suffix::text;
  end loop;

  return candidate;
end;
$$;

revoke all on function public.generate_username(text) from public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen text;
begin
  chosen := nullif(new.raw_user_meta_data ->> 'username', '');

  if chosen is null then
    chosen := public.generate_username(coalesce(new.email, new.id::text));
  end if;

  insert into public.profiles (id, username, has_password)
  values (
    new.id,
    chosen,
    new.encrypted_password is not null and new.encrypted_password <> ''
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

update public.profiles p
set username = public.generate_username(coalesce(u.email, p.id::text))
from auth.users u
where u.id = p.id and p.username is null;
