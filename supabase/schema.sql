-- Roles and profile model
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'writer' check (role in ('owner', 'editor', 'sub-editor', 'writer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- News workflow model
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,
  category text not null,
  tags text[] not null default '{}',
  author_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  rejection_reason text,
  placement text not null default 'none' check (placement in ('none', 'lead', 'brief', 'latest')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_author_id on public.articles(author_id);
create index if not exists idx_articles_created_at on public.articles(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  if exists (select 1 from public.profiles limit 1) then
    assigned_role := 'writer';
  else
    assigned_role := 'owner';
  end if;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_owner" on public.profiles;
create policy "profiles_update_self_or_owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.current_user_role() = 'owner')
with check (
  (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  )
  or public.current_user_role() = 'owner'
);

-- Articles policies
create policy "articles_public_read_published"
on public.articles
for select
to anon
using (status = 'published');

create policy "articles_auth_read_scoped"
on public.articles
for select
to authenticated
using (
  status = 'published'
  or author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
);

create policy "articles_insert_writer_or_owner"
on public.articles
for insert
to authenticated
with check (
  author_id = auth.uid()
  and public.current_user_role() in ('writer', 'owner')
);

create policy "articles_update_owner_editor_or_author"
on public.articles
for update
to authenticated
using (
  author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
)
with check (
  author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
);

create policy "articles_delete_owner_editor_or_author"
on public.articles
for delete
to authenticated
using (
  author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
);
