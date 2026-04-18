## Rulebook: Newspaper MVP Execution (Agent-Readable)

This rulebook is the authoritative execution checklist for building the newspaper platform in this repository.

**Mission**

- Build a responsive bilingual newspaper website where:
- public users can read and share/print news,
- writers can submit drafts,
- editors/owners can approve and publish,
- owners can add/manage admins,
- categories and tags are fully supported,
- image storage is handled with Supabase free tier.

**Non-Negotiable Product Requirements**

1. Must support admin image uploads and public rendering.
2. Must support social share controls on article detail.
3. Must support print-friendly article mode.
4. Must allow owner to add new admins.
5. Must include category + tag taxonomy and filtering.
6. Must remain responsive across mobile/tablet/desktop.
7. Must support English + Bangla content presentation.

**Execution Order (Strict)**

1. Foundation setup (dependencies, env, constants).
2. DB schema + RLS policies.
3. Auth and role guards.
4. Admin CMS (articles + moderation + taxonomy + admin manager).
5. Public pages (home/category/tag/article).
6. Share + print.
7. Security/performance/accessibility hardening.
8. Deploy and verify.

**Do Not Proceed Rules**

- Do not ship admin UI before RLS is enforced and tested.
- Do not open public publishing before moderation status transitions are validated.
- Do not grant admin management actions to non-owner roles.
- Do not treat functionality complete until mobile + print view are verified.

**Role Matrix (Mandatory)**

- Writer:
- create/edit own drafts,
- submit for review,
- cannot approve/publish,
- cannot manage admins.
- Editor:
- review submitted stories,
- approve/reject and publish when allowed by policy,
- cannot manage owner privileges unless explicitly permitted.
- Owner:
- full editorial rights,
- can assign/revoke admin roles,
- owns permission governance.
- Public:
- read only published content.

**Article Lifecycle (Mandatory)**

- draft -> submitted -> approved -> published
- rejected path from submitted/approved back to draft with reason.
- status changes must be auditable with actor + timestamp.

**Data Safety Rules**

- RLS enabled on all content/admin tables.
- Slugs unique per locale strategy.
- Storage bucket paths deterministic and role-protected.
- Every mutation path validates input server-side.

**UI/UX Rules**

- Newspaper visual hierarchy: masthead, lead story, sections, secondary cards.
- Bilingual typography with appropriate Bangla and Latin font pairing.
- No hidden critical actions on mobile.
- Print stylesheet must hide irrelevant UI and keep article readable.

**Daily Working Protocol**

1. Select one day target from the roadmap in plan.md.
2. Implement smallest shippable slice first.
3. Run lint/type-check after each major block.
4. Record unresolved blockers and continue with adjacent tasks.
5. End day with verification notes.

**Release Gate**

- Auth (email/password + Google) passes.
- Role restrictions pass unauthorized tests.
- Writer->Editor/Owner approval workflow passes.
- Category/tag CRUD and filtering pass.
- Image upload + display pass.
- Share links + print mode pass.
- Responsive and accessibility baseline pass.

**Source of truth for schedule**

- Day 1 operational checklist: DAY1_KICKOFF.md
- Day-by-day detailed plan: plan.md
- This file: operational rules and guardrails.
