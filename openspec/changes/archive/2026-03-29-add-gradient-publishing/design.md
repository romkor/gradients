## Context

Currently all gradients in the database are shown on the home page without any visibility control. The app uses a single `gradients` table (Drizzle ORM + SQLite). There is no concept of publishing or drafting. The feature request is to add per-gradient publish gating via a join table rather than an inline boolean column on `gradients`.

## Goals / Non-Goals

**Goals:**
- Introduce a `published_gradients` join table to track which gradients are visible on the home feed
- Home page query filters to only return gradients present in `published_gradients`
- Server functions to publish (insert) and unpublish (delete) a gradient's visibility record
- UI affordance (toggle button) on the gradient detail/editor so the owner can toggle publish state

**Non-Goals:**
- Scheduled publishing or future-dated visibility
- Batch publish/unpublish operations
- Any changes to authentication or ownership checks beyond what already exists

## Decisions

### Join table vs. boolean column on `gradients`

**Decision**: Use a separate `published_gradients` table.

**Rationale**: The proposal explicitly specifies this approach. It also cleanly separates publishing metadata (e.g., `created_at` = publish date) from gradient data, makes it easy to query "published since date X", and avoids a nullable boolean with three logical states on the main table.

**Alternative considered**: `is_published BOOLEAN DEFAULT false` on `gradients` — simpler migration but loses publish timestamp and conflates gradient data with visibility state.

### Cascade delete behavior

**Decision**: When a gradient is deleted, cascade-delete its `published_gradients` row automatically via a foreign key `ON DELETE CASCADE`.

**Rationale**: Prevents orphaned rows in `published_gradients` without requiring application-level cleanup on gradient deletion.

### Publish/unpublish server functions

**Decision**: Two dedicated server functions — `publishGradientFn` and `unpublishGradientFn` — using `createServerFn({ method: 'POST' })`.

**Rationale**: Consistent with existing server function conventions (named `*Fn`, POST method). Upsert on publish avoids duplicate-key errors if called twice; delete-where on unpublish is idempotent.

### Home page query

**Decision**: `loadGradientsFn` uses a `LEFT JOIN published_gradients` + `WHERE (published OR owned_by_current_user)`. Authenticated users see their own gradients (published or not) plus all other users' published gradients. Unauthenticated users see only published gradients.

**Rationale**: Owners need to be able to find and publish their own draft gradients. Without this, an unpublished gradient had no path back to the editor. Single change point; no new list endpoint needed. The home page already uses this query via React Query.

**Alternative considered**: INNER JOIN (only published) — simpler query, but leaves owners unable to reach their own unpublished gradients, making the Publish button unreachable.

## Risks / Trade-offs

- **Race condition on double publish**: Mitigated by using `INSERT OR IGNORE` (SQLite) so duplicate publishes are no-ops.
- **Orphaned publish records**: Mitigated by `ON DELETE CASCADE` on the FK.
- **Migration on existing data**: Existing gradients will become hidden until explicitly published. This is the intended behavior (private by default), but should be communicated to any existing users.

## Migration Plan

1. Generate migration: `pnpm db:generate` after adding `published_gradients` to `src/db/schema.ts`
2. Apply migration: `pnpm db:migrate` — safe, additive schema change
3. Deploy updated server functions and UI
4. **Rollback**: Drop the `published_gradients` table and revert the `listGradients` join — all gradients reappear on home page

## Open Questions

- ~~Should the gradient owner see their own unpublished gradients on the home page, or only on the detail page?~~ **Resolved**: Owners see their own unpublished gradients on the home page (as drafts). This is necessary so they can navigate to the editor and publish them.
- Is there a need to show a "published" badge on gradient cards on the home feed? (Assumed: not required for v1)
