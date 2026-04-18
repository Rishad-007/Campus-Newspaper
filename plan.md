## Plan: 6-Week Day-by-Day Newspaper Execution Roadmap

Start here for immediate implementation:

- Day 1 execution guide: [DAY1_KICKOFF.md](DAY1_KICKOFF.md)
- Agent operating rules: [RULEBOOK.md](RULEBOOK.md)

Build a bilingual (English + Bangla) responsive newspaper web app with Next.js 16 and Supabase free tier, including role-based admin workflow, publishing pipeline, categories/tags, image upload, social sharing, and print support. This roadmap is intentionally granular so implementation can proceed without getting stuck.

**Scope Lock (Before Day 1 starts)**

- In scope: public news site, admin CMS, writer-to-editor approval, owner can add admins, category/tag management, share + print.
- In scope: Supabase Auth (email/password + Google OAuth), Supabase Postgres, Supabase Storage.
- Out of scope for MVP: comments, newsletter, paywall, native app, advanced analytics.
- Non-functional baseline: responsive across phone/tablet/desktop, basic accessibility, SEO-ready metadata.

**Phase 1: Setup and Architecture (Week 1)**

1. Day 1: Project bootstrap and environment contracts.

- Create Supabase project and capture project URL + anon key + service role key.
- Add local environment file contract and document required variables.
- Install core dependencies: Supabase client/SSR utilities, validation package, class utility package, icon package.
- Define app constants: roles, statuses, supported locales, default pagination values.
- Decide naming conventions for table names, slugs, storage buckets, and route segments.
- Output of day: app boots with env placeholders and dependency baseline committed.

2. Day 2: Data model draft and migration skeleton.

- Draft relational schema for profiles, roles, articles, article revisions, categories, tags, article-category map, article-tag map, article images.
- Add moderation fields: submission state, reviewer id, reviewed timestamp, rejection reason.
- Add indexes: article status + publish date, slug unique index, join-table composite indexes.
- Write first migration scripts with up/down strategy.
- Prepare seed template for initial categories/tags.
- Output of day: schema SQL files authored and reviewed for integrity.

3. Day 3: RLS policy baseline.

- Enable RLS on all application tables.
- Write public policy: only published articles visible publicly.
- Write writer policy: create/edit own drafts, submit own article.
- Write editor/owner policy: review + approve/reject + publish.
- Write owner-only policy: assign or revoke admin roles.
- Add policy comments for maintenance clarity.
- Output of day: policy suite complete and test scenarios documented.

4. Day 4: Supabase integration in Next.js app.

- Add server and browser Supabase clients with App Router-compatible utilities.
- Add auth-aware helper functions for server components/actions.
- Add protected route strategy for admin section.
- Define centralized error format for DB/auth actions.
- Output of day: auth session can be read on server and client safely.

5. Day 5: Auth UI and flow (email/password + Google).

- Build sign-up and sign-in pages with validation and useful error messages.
- Add Google OAuth sign-in button and callback handling.
- Add sign-out control and session reset behavior.
- Add redirect rules after login based on role.
- Output of day: both auth methods functional end-to-end.

6. Day 6: Admin shell and navigation skeleton.

- Create protected admin route group and base layout.
- Add sidebar nav for articles, review queue, categories, tags, admins, settings.
- Add role-aware nav visibility (writer vs editor vs owner).
- Add empty-state pages for each section.
- Output of day: admin information architecture finalized.

7. Day 7: Week 1 stabilization and review.

- Run lint/type-check.
- Dry-run auth flows and protected route behavior.
- Validate initial migration and rollback in local environment.
- Fix all blockers before Week 2.
- Output of day: stable foundation and verified setup checklist.

**Phase 2: Editorial CMS Core (Week 2)** 8. Day 8: Article create/edit foundation.

- Build article form with title, slug preview, excerpt, body, publish metadata fields.
- Add form validation and autosave draft behavior.
- Add language selector strategy for bilingual content (single table, locale field).
- Output of day: writer can create and save draft article.

9. Day 9: Rich content handling.

- Integrate selected editor approach (block or rich text) and sanitize output path.
- Add support for embedded images and captions in body content.
- Add read-time estimation logic.
- Output of day: article body can be authored with editorial structure.

10. Day 10: Category and tag management.

- Build CRUD views for categories and tags.
- Add slug uniqueness and normalization rules.
- Add article assignment UI (multi-select categories and tags).
- Output of day: taxonomy system fully operational.

11. Day 11: Image upload pipeline.

- Create storage bucket structure and path naming policy.
- Add upload UI with preview, file size/type validation, progress state.
- Persist image metadata (alt text, caption, credit, dimensions).
- Add policy constraints for who can upload and read.
- Output of day: article hero + inline image upload works securely.

12. Day 12: Submission workflow.

- Add status transitions: draft to submitted.
- Lock editing rules once submitted (or controlled reopen flow).
- Add submission audit trail fields.
- Output of day: writers can submit article for review.

13. Day 13: Review queue and moderation actions.

- Build editor/owner queue with filters (newest, category, writer, status).
- Add approve, reject, request-changes actions.
- Persist reviewer notes and rejection reason.
- Output of day: moderation flow works with clear outcomes.

14. Day 14: Week 2 hardening.

- Verify status-transition permissions with role matrix tests.
- Verify writer cannot self-approve if not allowed.
- Fix UX edge cases: stale form, concurrent edits, missing taxonomies.
- Output of day: editorial core stable for public site integration.

**Phase 3: Public Newspaper Experience (Week 3)** 15. Day 15: Theme and typography system.

- Implement newspaper visual identity with CSS variables for color, spacing, typography.
- Add bilingual font pairing for Bangla + Latin with fallback stack.
- Define heading/body scale and responsive clamps.
- Output of day: global newspaper look established.

16. Day 16: Homepage structure.

- Build masthead, top navigation, lead story block, secondary headline grid.
- Build section blocks by category with consistent card component.
- Add placeholder ad slots (optional) without blocking content.
- Output of day: homepage reflects newspaper layout.

17. Day 17: Article cards and listing behavior.

- Build reusable card variants: hero, compact, sidebar, list row.
- Add byline/date/read-time chips and image ratio handling.
- Add pagination or load-more strategy.
- Output of day: reusable list presentation system complete.

18. Day 18: Category and tag public pages.

- Build dynamic category route page with latest + trending sections.
- Build tag route page with archive-like listing.
- Add empty/no-result UI states.
- Output of day: taxonomy-driven browsing experience complete.

19. Day 19: Article detail page.

- Build article header, byline block, hero media, body renderer, related stories.
- Add proper heading hierarchy and semantic markup.
- Add structured metadata plumbing for SEO.
- Output of day: publish-ready article page.

20. Day 20: Localization and bilingual behavior.

- Finalize locale toggle or language-specific route strategy.
- Ensure typography and line-height are tuned for Bangla readability.
- Ensure metadata and slug strategy support bilingual entries.
- Output of day: bilingual reading and navigation validated.

21. Day 21: Week 3 QA.

- Cross-device responsiveness pass.
- Fix overflow, truncation, and content density issues.
- Validate image loading and content shifts.
- Output of day: stable public reading experience.

**Phase 4: Sharing, Printing, and Admin Management (Week 4)** 22. Day 22: Social share features.

- Add share actions for Facebook, X, LinkedIn, WhatsApp, email, copy-link.
- Ensure encoded URL/title handling works for multilingual text.
- Add success/failure feedback for copy-link action.
- Output of day: share UX complete.

23. Day 23: Print experience.

- Add print stylesheet and print button on article page.
- Hide non-essential UI in print (nav, ads, share controls, admin artifacts).
- Optimize typography and media sizing for A4/Letter style print.
- Output of day: clean printable article output.

24. Day 24: Admin management (owner powers).

- Build admin directory with role badges and activity indicators.
- Add owner-only actions to grant/revoke writer/editor/owner roles.
- Add confirmation + audit logging for role changes.
- Output of day: owner can safely add/manage admins.

25. Day 25: Security validation day.

- Re-test all RLS policies from a non-privileged account.
- Verify no direct unauthorized mutation via API paths.
- Verify storage access boundaries by role.
- Output of day: permission model hardened.

26. Day 26: Performance tuning.

- Add caching strategy for public read routes.
- Optimize image sizing/quality and placeholder behavior.
- Reduce expensive queries with selective fields and indexes.
- Output of day: improved page speed and query efficiency.

27. Day 27: Accessibility and UX polish.

- Keyboard navigation pass across all critical pages.
- Verify color contrast and visible focus indicators.
- Validate alt text workflow in admin so editors can supply accessibility text.
- Output of day: baseline accessibility standards met.

28. Day 28: Week 4 stabilization.

- Resolve final defects from QA backlog.
- Freeze MVP feature set.
- Output of day: release candidate ready.

**Phase 5: Launch and Reliability (Week 5)** 29. Day 29: Deployment preparation.

- Configure production environment variables.
- Prepare deployment target and Supabase production branch.
- Document rollback notes and migration order.
- Output of day: production deployment checklist complete.

30. Day 30: Production deployment.

- Run migrations and verify post-deploy schema.
- Smoke test auth, publish flow, public reading, share, print.
- Output of day: production app live with verified core paths.

31. Day 31: Monitoring and incident readiness.

- Add runtime logging strategy and error triage process.
- Define basic operational alerts for auth failures and critical API errors.
- Output of day: operational guardrails in place.

32. Day 32: Editorial onboarding docs.

- Create admin usage guide: write, submit, review, publish, manage tags/categories.
- Create owner guide: add admins, role safety rules.
- Output of day: non-technical team can operate platform.

33. Day 33: SEO enhancement pass.

- Add Open Graph/Twitter metadata completeness checks.
- Add JSON-LD NewsArticle markup for published story pages.
- Output of day: richer social preview + search readiness.

34. Day 34: Final regression test.

- Execute full MVP checklist across core workflows.
- Re-verify bilingual rendering edge cases.
- Output of day: release confidence established.

35. Day 35: Buffer day.

- Use for spillover bugs, performance fixes, or deployment adjustments.
- Output of day: clean backlog and stable release.

**Phase 6: Post-MVP Reserved Week (Week 6, Optional but Recommended)** 36. Day 36-42: Optional improvements without scope creep.

- Add scheduled publishing.
- Add featured story pinning and homepage ordering controls.
- Add editorial analytics snapshots.
- Add safe draft version history restore.
- Keep optional features behind explicit product approval.

**Implementation Dependency Rules**

- Do not begin public page build before core article schema and status model are stable.
- Do not implement admin role UI before owner-only RLS is validated.
- Do not optimize performance before functional correctness and security are complete.
- Treat auth + RLS failures as release blockers.

**Definition of Done (MVP)**

- Users can browse published news by homepage/category/tag/article routes.
- Writers can draft and submit with images.
- Editors/owners can review and publish.
- Owners can add and manage admins.
- Articles support social share and clean print mode.
- Site is responsive and bilingual-ready.
- Security model validated via RLS and role tests.

**Daily Execution Ritual (to avoid getting stuck)**

- Start of day: pick day goal, list 3 must-complete tasks, identify blocker risk.
- Midday checkpoint: run lint/type-check and quick smoke test.
- End of day: write progress note, unresolved issues, and next-day first action.
- If blocked > 60 minutes: narrow scope to smallest testable slice and continue.

**Relevant files (planned execution targets)**

- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/package.json
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/app/layout.tsx
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/app/globals.css
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/app/page.tsx
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/app/(admin)/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/app/(public)/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/components/admin/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/components/news/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/lib/supabase/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/lib/auth/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/supabase/migrations/...
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/supabase/seed.sql
- /Users/rishad/Downloads/Loundsync/newspaper/newspaper/README.md

**Verification cadence**

1. End of each day: lint + type-check + focused smoke test for that day’s feature.
2. End of each week: full regression on auth, RLS, publishing workflow, taxonomy, media, responsive pages.
3. Pre-launch: production-like test with real OAuth callback, storage upload, and print/share validation.

**Decisions captured**

- Core-only MVP (no comments/newsletter now).
- Supabase free tier for DB/auth/storage.
- Auth methods: email/password + Google OAuth.
- Approval workflow: writer submits, owner/editor approves.
- Bilingual target: English + Bangla.
