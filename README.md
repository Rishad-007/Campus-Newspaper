# Daily Darpan Newsroom

Daily Darpan is a bilingual, role-based digital newspaper built with Next.js and Supabase.
It includes a public news site, a newsroom admin desk, moderated publishing workflow, and placement-driven homepage sections.

## 1. Project Goals

- Provide a responsive public newspaper UI in English and Bangla.
- Support role-based editorial operations:
  - Owner
  - Editor
  - Sub Editor
  - Writer (Journalist)
- Enforce moderation before publishing.
- Let editorial users manage front-page placements:
  - Lead Story
  - Frontline Briefs
  - Latest Reports
- Keep workflows database-driven with Supabase Auth + Postgres + RLS.

## 2. Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Auth + Database + Storage: Supabase
- Runtime: Node.js

Key dependencies are listed in [package.json](package.json).

## 3. Core Features

### 3.1 Public site

- Homepage sections rendered from placement values in database.
- Story details page with print/share support.
- Category page and tag page.
- All News page with:
  - Date sorting (newest/oldest)
  - Category filter
  - Date range filter

### 3.2 Authentication and access

- Email/password sign up and sign in.
- Access request flow for Journalist/Editor.
- Session-aware header actions.

### 3.3 Admin newsroom desk

- Role-based tabs and controls.
- User access request approvals/rejections.
- Owner-level role assignment and password reset.
- Journalist management (create/remove).
- Story lifecycle management:
  - Draft
  - Submit for review
  - Accept and publish
  - Reject to draft with reason
- Front page placement assignment.
- Tag management:
  - Hide tag from stories
  - Remove tag permanently

### 3.4 Content safety and moderation UX

- Pending queue includes full article reading.
- Pending queue includes story images for editorial review.
- Role protection in admin UI for owner account updates.

## 4. Repository Structure

High-value paths:

- App routes:
  - [app/page.tsx](app/page.tsx)
  - [app/news/page.tsx](app/news/page.tsx)
  - [app/news/[slug]/page.tsx](app/news/[slug]/page.tsx)
  - [app/category/[slug]/page.tsx](app/category/[slug]/page.tsx)
  - [app/tag/[slug]/page.tsx](app/tag/[slug]/page.tsx)
  - [app/admin/page.tsx](app/admin/page.tsx)
  - [app/auth/page.tsx](app/auth/page.tsx)

- Admin APIs:
  - [app/api/admin/access-requests/route.ts](app/api/admin/access-requests/route.ts)
  - [app/api/admin/change-password/route.ts](app/api/admin/change-password/route.ts)
  - [app/api/admin/journalists/route.ts](app/api/admin/journalists/route.ts)

- Data and auth services:
  - [lib/news-service.ts](lib/news-service.ts)
  - [lib/supabase/admin.ts](lib/supabase/admin.ts)
  - [lib/supabase/browser-client.ts](lib/supabase/browser-client.ts)
  - [lib/supabase/server-client.ts](lib/supabase/server-client.ts)
  - [lib/supabase/config.ts](lib/supabase/config.ts)

- Database:
  - [supabase/schema.sql](supabase/schema.sql)

## 5. Local Setup

### 5.1 Prerequisites

- Node.js 20+
- npm
- Supabase project (URL + anon key + service role key)

### 5.2 Install dependencies

```bash
npm install
```

### 5.3 Environment variables

Create `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_*` values are required for browser + SSR clients.
- `SUPABASE_SERVICE_ROLE_KEY` is required for server admin endpoints.
- Never expose service role key in browser code.

### 5.4 Database bootstrap

1. Open Supabase SQL Editor.
2. Run [supabase/schema.sql](supabase/schema.sql).
3. Confirm tables exist:
   - `profiles`
   - `categories`
   - `tags`
   - `articles`
   - `article_tags`
4. Confirm RLS is enabled and policies created.
5. Confirm storage bucket `article-images` exists and policies are applied.

### 5.5 Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

## 6. Scripts

Defined in [package.json](package.json):

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## 7. Role Matrix

### Owner

- Full access across admin areas.
- Manage user roles.
- Change user passwords.
- Create/remove journalists.
- Moderate and publish stories.
- Manage placements and tags.

### Editor

- Access request approvals.
- Moderate submitted stories.
- Manage placements.
- Manage tags.
- Remove journalist accounts (writer-only), with option to keep or delete stories.

### Sub Editor

- Moderate submitted stories.
- Manage placements.
- Manage tags.
- Remove journalist accounts (writer-only), with option to keep or delete stories.

### Writer (Journalist)

- Create/edit/delete own drafts.
- Submit drafts for review.
- View rejection reasons.

## 8. Story Lifecycle

1. Writer creates a draft.
2. Writer submits draft (`status=submitted`).
3. Editorial users review in Pending Queue.
4. Editorial decision:
   - Accept: `status=published`, `published_at` set.
   - Reject: `status=draft` with rejection reason.
5. Published stories appear in public pages.

## 9. Front Page Placement Behavior

Placement values in `articles.placement`:

- `lead`
- `brief`
- `latest`
- `none`

Homepage rendering behavior:

- Lead Story uses only `placement=lead`.
- Frontline Briefs uses only `placement=brief`.
- Latest Reports uses only `placement=latest`.

This is intentionally strict so public layout obeys admin placement selections.

## 10. Admin API Endpoints

### Access request resolution

- Path: `/api/admin/access-requests`
- Method: `PATCH`
- Used by owner/editor to approve/reject role requests.

### Password change

- Path: `/api/admin/change-password`
- Method: `POST`
- Owner-only password reset for users.

### Journalist management

- Path: `/api/admin/journalists`
- Methods:
  - `POST`: create journalist account (owner)
  - `DELETE`: remove journalist account (owner/editor/sub-editor)
- Delete behavior supports `deleteStories` choice:
  - Keep stories (reassign)
  - Delete stories

## 11. Database Design Summary

Core entities:

- `profiles` - user profile + role
- `categories` - story categories
- `tags` - reusable tags
- `articles` - story content and status
- `article_tags` - many-to-many tag links

Important columns:

- `articles.status`: `draft | submitted | published`
- `articles.placement`: `none | lead | brief | latest`
- `articles.hero_image_url`: story image URL

## 12. Security Model

- Authenticated users can only perform role-allowed operations.
- Public users can read published content only.
- Admin operations requiring service role key are handled server-side only.
- RLS policies in [supabase/schema.sql](supabase/schema.sql) enforce data access boundaries.

## 13. Troubleshooting

### Public pages show empty data

- Verify published stories exist in `articles`.
- Verify `status='published'`.
- Verify Supabase env vars are present.

### Admin fails with forbidden/unauthorized

- Verify user is signed in.
- Verify profile role in `profiles.role`.

### Image upload issues

- Ensure `article-images` bucket exists.
- Ensure storage policies from schema are applied.
- Ensure image is jpg/png/webp and size constraints are respected.

### Owner role was changed accidentally

Run SQL in Supabase SQL editor:

```sql
update public.profiles
set role = 'owner', updated_at = now()
where email = 'owner@example.com';
```

## 14. Operational Notes

- Keep secrets only in server environment.
- Prefer admin APIs over direct client-side privileged mutations.
- Review RLS changes carefully before production deployment.

## 15. Additional Project Docs

- [WORK_SUMMARY.md](WORK_SUMMARY.md)
- [ADMIN_UI_PLAN.md](ADMIN_UI_PLAN.md)
- [SUPABASE_SETUP_STEPS.md](SUPABASE_SETUP_STEPS.md)
- [SUPABASE_SQL_COMMANDS.md](SUPABASE_SQL_COMMANDS.md)
- [ALL_SQL_COMMANDS.md](ALL_SQL_COMMANDS.md)
