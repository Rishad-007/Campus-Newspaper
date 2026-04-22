# Supabase SQL Commands (Normalized)

This file contains the full SQL setup for this project with normalized and connected tables.

## 1) Full Setup SQL (Fresh Database)

Run everything from [supabase/schema.sql](supabase/schema.sql).

## 2) Upgrade Existing Old Schema To Normalized

Use this migration if your existing project still uses `articles.category` and `articles.tags`.

```sql
create extension if not exists pgcrypto;

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

create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

insert into public.categories (slug, name_en, name_bn)
values
  ('city', 'City', 'সিটি'),
  ('sports', 'Sports', 'খেলা'),
  ('health', 'Health', 'স্বাস্থ্য'),
  ('education', 'Education', 'শিক্ষা'),
  ('economy', 'Economy', 'অর্থনীতি'),
  ('column', 'Column', 'কলাম'),
  ('feature', 'Feature', 'ফিচার'),
  ('hall', 'Hall', 'হল')
on conflict (slug) do nothing;

alter table public.articles
  add column if not exists category_id uuid,
  add column if not exists locale text,
  add column if not exists hero_image_url text;

update public.articles
set locale = coalesce(locale, 'en');

update public.articles
set hero_image_url = coalesce(hero_image_url, '/newsroom.jpg');

alter table public.articles
  alter column locale set default 'en',
  alter column locale set not null;

alter table public.articles
  drop constraint if exists articles_locale_check;

alter table public.articles
  add constraint articles_locale_check
  check (locale in ('en', 'bn'));

update public.articles a
set category_id = c.id
from public.categories c
where c.slug = lower(a.category)
  and a.category_id is null;

update public.articles a
set category_id = c.id
from public.categories c
where a.category_id is null
  and c.slug = 'city';

alter table public.articles
  alter column category_id set not null;

alter table public.articles
  add constraint articles_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete restrict;

insert into public.tags (slug, name)
select distinct lower(trim(tag_item)), lower(trim(tag_item))
from public.articles,
unnest(coalesce(tags, '{}'::text[])) as tag_item
where trim(tag_item) <> ''
on conflict (slug) do nothing;

insert into public.article_tags (article_id, tag_id)
select a.id, t.id
from public.articles a,
unnest(coalesce(a.tags, '{}'::text[])) as tag_item
join public.tags t
  on t.slug = lower(trim(tag_item))
where trim(tag_item) <> ''
on conflict do nothing;

alter table public.articles
  drop column if exists category,
  drop column if exists tags;
```

## 3) Verification Queries

```sql
select id, slug, name_en, name_bn from public.categories order by name_en;

select id, slug, name from public.tags order by slug;

select a.id, a.title, a.slug, c.slug as category_slug, p.full_name as author
from public.articles a
join public.categories c on c.id = a.category_id
join public.profiles p on p.id = a.author_id
order by a.updated_at desc;

select a.slug as article_slug, t.slug as tag_slug
from public.article_tags at
join public.articles a on a.id = at.article_id
join public.tags t on t.id = at.tag_id
order by a.slug, t.slug;
```

## 4) Optional Cleanup (Duplicate Tags)

```sql
-- Example: merge 'ai-news' into 'ai'
with old_tag as (
  select id from public.tags where slug = 'ai-news'
),
new_tag as (
  select id from public.tags where slug = 'ai'
)
insert into public.article_tags (article_id, tag_id)
select at.article_id, n.id
from public.article_tags at
cross join new_tag n
where at.tag_id = (select id from old_tag)
on conflict do nothing;

delete from public.article_tags where tag_id = (select id from old_tag);
delete from public.tags where id = (select id from old_tag);
```

## 5) Storage Setup For Story Images

```sql
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

select id, name, public, file_size_limit
from storage.buckets
where id = 'article-images';
```
