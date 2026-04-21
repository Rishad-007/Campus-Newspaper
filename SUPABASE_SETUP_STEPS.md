## Supabase Setup Steps (Owner-First Flow)

Follow these steps in Supabase Dashboard.

### 1. Create project

1. Go to Supabase and create a new project.
2. Wait for database provisioning to finish.

### 2. Enable email authentication

1. Open Authentication -> Providers.
2. Enable `Email` provider.
3. Turn on `Allow email signups`.
4. Save.

### 3. Run SQL for auth-linked user/profile tables and RLS

1. Open SQL Editor.
2. Open [supabase/schema.sql](supabase/schema.sql).
3. Run the full script.

What this does:

1. Creates `profiles` and `articles` tables.
2. Links profile to `auth.users`.
3. Creates trigger so:
4. first registered user becomes `owner`
5. every later user becomes `writer`
6. Enables and configures RLS policies.

If you already have a live Supabase database, also run [supabase/migrations/20260422_add_hide_byline.sql](supabase/migrations/20260422_add_hide_byline.sql) after the base schema so the writer byline toggle works.

### 4. Add app environment keys

1. Open Project Settings -> API.
2. Copy:
3. Project URL
4. `anon` public key
5. `service_role` key
6. Put values in `.env.local` (from [.env.example](.env.example)):
7. `NEXT_PUBLIC_SUPABASE_URL`
8. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
9. `SUPABASE_SERVICE_ROLE_KEY`

### 5. First owner creation

1. Start app and open `/auth`.
2. Register first account.
3. That account is automatically `owner` by SQL trigger.

### 6. Add other users

1. Sign in as owner.
2. Open `/admin` -> Users / Journalists.
3. Add users from owner controls.
4. Non-owner users cannot create journalist accounts from API.

### 7. Verification SQL (optional)

Run this query in SQL Editor to verify roles:

```sql
select id, full_name, email, role, created_at
from public.profiles
order by created_at asc;
```

Expected:

1. First row role = `owner`
2. Later rows default = `writer` unless owner changes role

## 8. Writer Byline Toggle Migration

If public articles show a schema cache error when hiding a writer name, run this SQL in Supabase:

```sql
alter table public.profiles
add column if not exists hide_byline boolean not null default false;

update public.profiles
set hide_byline = coalesce(hide_byline, false);
```
