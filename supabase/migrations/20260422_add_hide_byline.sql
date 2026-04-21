alter table public.profiles
add column if not exists hide_byline boolean not null default false;

update public.profiles
set hide_byline = coalesce(hide_byline, false);

comment on column public.profiles.hide_byline is 'Controls whether a writer is shown by name or as Staff Reporter in public articles.';
