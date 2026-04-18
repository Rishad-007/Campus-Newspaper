## Work Summary

### 2026-04-18

#### Completed

1. Added Supabase client helpers:

- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts

2. Added production-oriented SQL schema and RLS baseline:

- supabase/schema.sql
- profiles table with roles
- articles table with workflow fields
- auto profile creation trigger from auth.users
- row-level security policies for public, writer, editor/sub-editor, and owner

3. Added real auth and admin backend endpoints:

- app/auth/page.tsx
- app/api/admin/change-password/route.ts
- app/api/admin/journalists/route.ts

4. Converted admin from local mock state to Supabase-backed persistent state:

- app/admin/page.tsx
- loads signed-in profile and role
- persistent role assignment
- persistent journalist create/remove
- persistent story create/edit/delete/submit/approve/reject
- persistent placement controls (lead/brief/latest)

5. Started public side database integration:

- lib/news-service.ts
- app/page.tsx now reads published stories from Supabase with mock fallback

6. Added environment and setup docs:

- .env.example
- README.md rewritten for Supabase setup and role workflow

7. Validation checkpoint:

- No current compile/type errors in updated files:
  - app/admin/page.tsx
  - app/auth/page.tsx
  - app/page.tsx
  - components/site-header.tsx
  - lib/news-service.ts
  - app/api/admin/change-password/route.ts
  - app/api/admin/journalists/route.ts

8. Owner-first governance update:

- Updated `supabase/schema.sql` so first registered account is auto-assigned `owner`.
- All subsequent registered accounts default to `writer`.
- Tightened profile update RLS check so users cannot self-promote role.
- Restricted journalist account creation/removal API to owner-only.

9. Added explicit Supabase dashboard + SQL setup guide:

- SUPABASE_SETUP_STEPS.md
- Includes authentication setup, SQL execution, env setup, and verification query.

10. Refactored login system to requested authentication pattern:

- Added browser client helper: lib/supabase/browser-client.ts (`getSupabaseBrowserClient`).
- Added server client helper: lib/supabase/server-client.ts (`createSupabaseServerClient`).
- Converted auth page into server + client composition:
  - app/auth/page.tsx
  - app/auth/components/AuthDemoPage.tsx
  - app/auth/components/EmailPasswordDemo.tsx
- Added `onAuthStateChange` listener and live session info panel.
- Updated app consumers (header/admin) to use the browser helper.

#### In Progress

1. Connect category, tag, and article detail pages to Supabase source.
2. Add middleware-based route protection and redirect behavior.
3. Add owner bootstrap helper script (optional first-owner setup).

#### Notes

1. Admin dashboard now uses real persistence and role-based permissions enforced by RLS.
2. Owner password change and journalist add/remove use server API routes with service role key.
3. This file will be updated at each milestone.
