## Role-Based Admin UI Plan (UI-Only)

Build a complete role-based admin experience using local mock state (no auth/DB yet), reusing the existing newspaper visual system.

### Confirmed Decisions

- Scope: UI-only for now.
- Roles: Owner, Editor, Sub Editor, Writer/Journalist.
- Sub Editor: same permissions as Editor in this phase.
- Include a temporary role switcher for development/testing.
- Keep owner user management simple: select role, assign/remove, password-change action UI.

### Phase 1: Data + State Foundation

1. Define types for roles, article workflow status, and homepage placement.
2. Extend mock article model with:

- owner/journalist linkage
- status and moderation fields
- rejection reason
- placement fields: lead, brief, latest

3. Add a lightweight in-memory admin state layer to manage:

- role switching
- journalist CRUD-like actions
- article workflow transitions

### Phase 2: Admin Shell

1. Refactor admin page into a role-based dashboard shell.
2. Add temporary role switch control.
3. Add role-aware panels/tabs:

- Users
- Journalists
- Pending Queue
- Placement
- My Stories

### Phase 3: Owner View

1. Owner has all capabilities of all roles.
2. Add user-role management UI:

- select user
- choose role
- assign/remove role

3. Add password-change action window for users (UI-only action for now).

### Phase 4: Editor + Sub Editor View

1. Show all journalists.
2. Add/remove journalist.
3. Enter journalist profile.
4. In profile, show all articles by that journalist.
5. Allow deleting journalist articles.
6. Add placement window:

- choose Lead Story
- choose Frontline Briefs
- choose Latest

7. Show pending writer submissions.
8. Allow approve/reject from queue.
9. Approved items become publish-ready in local workflow.

### Phase 5: Writer View

1. Show only own news list.
2. Allow create/edit/delete own news.
3. Submit news for review.
4. Submitted news appears in editor/sub editor pending queue.

### Phase 6: Public Consistency + QA

1. Keep homepage sections aligned with placement decisions.
2. Keep bilingual rendering and existing visual style unchanged.
3. Verify role matrix behavior:

- Owner full access
- Editor/Sub Editor shared access
- Writer limited to own content + submit flow

4. Verify transitions and rejection reason path.
5. Verify mobile/tablet/desktop responsiveness.

### Target Files

- app/admin/page.tsx
- lib/mock-news.ts
- app/page.tsx
- app/globals.css
- components/admin/\* (new)
- lib/admin/\* (new)

### Acceptance Checklist

1. Owner can assign/remove roles and trigger password-change UI action.
2. Editor/Sub Editor can manage journalists and review pending content.
3. Editor/Sub Editor can configure Lead/Brief/Latest placement.
4. Writer can create/edit/delete own stories and submit for review.
5. Rejected story shows reason and can be edited/resubmitted.
6. Front page reflects placement updates.
