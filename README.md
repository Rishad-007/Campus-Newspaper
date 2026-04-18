## Daily Darpan Newsroom

Role-based bilingual newspaper built with Next.js and Supabase.

### Implemented backend features

1. Supabase Auth email/password sign in and sign up.
2. Role-aware admin desk backed by database tables.
3. Owner role management and password reset endpoint.
4. Editor/Sub Editor journalist creation and removal endpoint.
5. Writer draft, submit, edit, delete workflow persisted in database.
6. Pending approval and publish flow for Editor/Sub Editor/Owner.
7. Front page placement controls persisted in database.
8. Public homepage fetches published stories from Supabase with fallback to mock data.

### Environment setup

1. Copy [.env.example](.env.example) to `.env.local`.
2. Fill the values:
3. `NEXT_PUBLIC_SUPABASE_URL`
4. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. `SUPABASE_SERVICE_ROLE_KEY`

### Database setup

1. Open Supabase SQL editor.
2. Run [supabase/schema.sql](supabase/schema.sql).
3. Confirm tables `profiles` and `articles` are created.
4. Confirm RLS policies are enabled.

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Auth and admin flow

1. Go to `/auth` and create an account.
2. First account becomes `writer` by default.
3. Promote an account to `owner` directly in Supabase table editor (`profiles.role`) once.
4. Sign in as owner and use `/admin` for role and journalist management.

### Important files

1. [app/admin/page.tsx](app/admin/page.tsx)
2. [app/auth/page.tsx](app/auth/page.tsx)
3. [app/auth/components/EmailPasswordDemo.tsx](app/auth/components/EmailPasswordDemo.tsx)
4. [app/api/admin/change-password/route.ts](app/api/admin/change-password/route.ts)
5. [app/api/admin/journalists/route.ts](app/api/admin/journalists/route.ts)
6. [lib/supabase/browser-client.ts](lib/supabase/browser-client.ts)
7. [lib/supabase/server-client.ts](lib/supabase/server-client.ts)
8. [lib/supabase/admin.ts](lib/supabase/admin.ts)
9. [lib/news-service.ts](lib/news-service.ts)
10. [supabase/schema.sql](supabase/schema.sql)

### Work log

Detailed running implementation summary is tracked in [WORK_SUMMARY.md](WORK_SUMMARY.md).
