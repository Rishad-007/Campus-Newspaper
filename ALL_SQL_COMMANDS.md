# All SQL Commands

```sql
create extension if not exists pgcrypto;

-- -----------------------------
-- Core tables
-- -----------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'writer' check (role in ('owner', 'editor', 'sub-editor', 'writer')),
  requested_role text check (requested_role in ('writer', 'editor')),
  access_request_status text not null default 'none' check (access_request_status in ('none', 'pending', 'rejected')),
  access_request_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null unique,
  name_bn text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en' check (locale in ('en', 'bn')),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,
  hero_image_url text default '/newsroom.jpg',
  category_id uuid not null references public.categories(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  rejection_reason text,
  placement text not null default 'none' check (placement in ('none', 'lead', 'brief', 'latest')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_author_id on public.articles(author_id);
create index if not exists idx_articles_category_id on public.articles(category_id);
create index if not exists idx_articles_published_at on public.articles(published_at desc);
create index if not exists idx_article_tags_article_id on public.article_tags(article_id);
create index if not exists idx_article_tags_tag_id on public.article_tags(tag_id);

-- -----------------------------
-- Functions and triggers
-- -----------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_articles_updated_at on public.articles;
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

-- -----------------------------
-- RLS
-- -----------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;

-- Profiles
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

-- Categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_manage_editorial" on public.categories;
create policy "categories_manage_editorial"
on public.categories
for all
to authenticated
using (public.current_user_role() in ('owner', 'editor', 'sub-editor'))
with check (public.current_user_role() in ('owner', 'editor', 'sub-editor'));

-- Tags
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
on public.tags
for select
to anon, authenticated
using (true);

drop policy if exists "tags_insert_authenticated" on public.tags;
create policy "tags_insert_authenticated"
on public.tags
for insert
to authenticated
with check (true);

drop policy if exists "tags_manage_editorial" on public.tags;
create policy "tags_manage_editorial"
on public.tags
for update
to authenticated
using (public.current_user_role() in ('owner', 'editor', 'sub-editor'))
with check (public.current_user_role() in ('owner', 'editor', 'sub-editor'));

drop policy if exists "tags_delete_editorial" on public.tags;
create policy "tags_delete_editorial"
on public.tags
for delete
to authenticated
using (public.current_user_role() in ('owner', 'editor', 'sub-editor'));

-- Articles
drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published"
on public.articles
for select
to anon
using (status = 'published');

drop policy if exists "articles_auth_read_scoped" on public.articles;
create policy "articles_auth_read_scoped"
on public.articles
for select
to authenticated
using (
  status = 'published'
  or author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
);

drop policy if exists "articles_insert_writer_or_owner" on public.articles;
create policy "articles_insert_writer_or_owner"
on public.articles
for insert
to authenticated
with check (
  author_id = auth.uid()
  and public.current_user_role() in ('writer', 'owner')
);

drop policy if exists "articles_update_owner_editor_or_author" on public.articles;
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

drop policy if exists "articles_delete_owner_editor_or_author" on public.articles;
create policy "articles_delete_owner_editor_or_author"
on public.articles
for delete
to authenticated
using (
  author_id = auth.uid()
  or public.current_user_role() in ('owner', 'editor', 'sub-editor')
);

-- Article tags
drop policy if exists "article_tags_public_read_published" on public.article_tags;
create policy "article_tags_public_read_published"
on public.article_tags
for select
to anon
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and a.status = 'published'
  )
);

drop policy if exists "article_tags_auth_read_scoped" on public.article_tags;
create policy "article_tags_auth_read_scoped"
on public.article_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and (
        a.status = 'published'
        or a.author_id = auth.uid()
        or public.current_user_role() in ('owner', 'editor', 'sub-editor')
      )
  )
);

drop policy if exists "article_tags_insert_owner_editor_or_author" on public.article_tags;
create policy "article_tags_insert_owner_editor_or_author"
on public.article_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and (
        a.author_id = auth.uid()
        or public.current_user_role() in ('owner', 'editor', 'sub-editor')
      )
  )
);

drop policy if exists "article_tags_delete_owner_editor_or_author" on public.article_tags;
create policy "article_tags_delete_owner_editor_or_author"
on public.article_tags
for delete
to authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_id
      and (
        a.author_id = auth.uid()
        or public.current_user_role() in ('owner', 'editor', 'sub-editor')
      )
  )
);

-- -----------------------------
-- Seed categories
-- -----------------------------

insert into public.categories (slug, name_en, name_bn)
values
  ('city', 'City', 'সিটি'),
  ('sports', 'Sports', 'খেলা'),
  ('health', 'Health', 'স্বাস্থ্য'),
  ('education', 'Education', 'শিক্ষা'),
  ('economy', 'Economy', 'অর্থনীতি')
on conflict (slug) do update
set
  name_en = excluded.name_en,
  name_bn = excluded.name_bn;

-- -----------------------------
-- Storage (article images)
-- -----------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  524288,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "article_images_public_read" on storage.objects;
create policy "article_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'article-images');

drop policy if exists "article_images_authenticated_upload" on storage.objects;
create policy "article_images_authenticated_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "article_images_owner_update" on storage.objects;
create policy "article_images_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'article-images'
  and owner = auth.uid()
)
with check (
  bucket_id = 'article-images'
  and owner = auth.uid()
);

drop policy if exists "article_images_owner_delete" on storage.objects;
create policy "article_images_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'article-images'
  and owner = auth.uid()
);
```
