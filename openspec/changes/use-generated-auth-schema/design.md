## Context

`better-auth` provides an official `auth:generate` CLI command that emits a Drizzle schema file matching the library's current table definitions. Previously the project hand-maintained auth table definitions inside `src/db/schema.ts`. This had two problems: (1) dates used `timestamp` mode (second precision) rather than `timestamp_ms` (millisecond precision) that better-auth actually stores; (2) missing indexes and `$onUpdate` helpers. The generated file is the canonical source of truth and should not be edited by hand.

The uncommitted working-tree already applies the structural wiring (`index.ts` merge, `schema.ts` cleanup, `auth:generate` script). This change finalises compatibility by: renaming Drizzle object keys to plural, configuring the adapter, and removing stale hand-written column definitions from schema.ts.

## Goals / Non-Goals

**Goals:**
- Use `src/db/auth.ts` (output of `pnpm auth:generate`) as the sole source of Drizzle auth table definitions
- Rename Drizzle object exports in `auth.ts` to plural (`users`, `sessions`, `accounts`, `verifications`) while keeping SQL table names singular
- Configure `drizzleAdapter` with `usePlural: true` so better-auth resolves plural keys correctly
- Ensure `src/lib/auth.ts` passes the full merged schema (app + auth tables) to the adapter
- Clean up commented-out auth stubs from `schema.ts`
- Generate and apply a new Drizzle migration for column-level changes

**Non-Goals:**
- Changing the SQL table names (must stay singular to match better-auth internals)
- Editing the generated `src/db/auth.ts` by hand beyond the plural rename
- Adding new auth capabilities (OAuth, 2FA, etc.)

## Decisions

### 1. Separate `auth.ts` file, not inlined into `schema.ts`
**Decision:** Keep auth tables in a dedicated `src/db/auth.ts` and merge at the Drizzle client level.
**Rationale:** `auth:generate` always writes to one file. Inlining would require merging generated output back into `schema.ts` on every regeneration. A dedicated file means regeneration is a simple `pnpm auth:generate` with no manual merge.

### 2. Plural Drizzle object keys + `usePlural: true`
**Decision:** Rename exported objects to `users`, `sessions`, `accounts`, `verifications`; pass `usePlural: true` to `drizzleAdapter`.
**Rationale:** Plural names are idiomatic in Drizzle (collection of rows = plural). The adapter's `usePlural` option was designed for exactly this — it strips an `s` suffix when looking up better-auth's internal table names.  
**Alternative considered:** Keep singular names (no rename needed) — rejected because the user explicitly requires plural names.

### 3. Pass full merged schema to `drizzleAdapter`
**Decision:** Import `* as authSchema from '#/db/auth'` in `auth.ts` and spread it into the adapter's `schema` option.
**Rationale:** The adapter must see the Drizzle table objects to build queries. The `db` instance already has the merged schema, but the adapter's `schema` option must also include them.  
**Alternative considered:** Import `db` and let the adapter infer from the Drizzle instance schema — not supported; the adapter requires an explicit `schema` object.

### 4. `timestamp_ms` mode
**Decision:** Accept the generated file's `timestamp_ms` columns as-is (millisecond precision).
**Rationale:** This is what better-auth actually stores. The old hand-written `timestamp` (second precision) caused SQLite binding errors in prior work. A migration is required to update column metadata, but data is preserved since the underlying integer type is unchanged.

## Risks / Trade-offs

- **Breaking import sites**: Any file importing `user`, `session`, `account`, `verification` from `#/db/schema` will break. Currently there are none (auth tables were not used in app queries directly). Low risk.
- **Migration noise**: Column metadata changes (`timestamp` → `timestamp_ms`, new indexes) may generate a migration even if the underlying SQL is identical. The migration should be reviewed before applying.
- **Generated file durability**: `src/db/auth.ts` is regenerated on every `pnpm auth:generate`. The plural rename will be overwritten — this is a known trade-off. A post-generate script or custom template would be needed to automate the rename long-term (out of scope here).

## Migration Plan

1. Apply the code changes (rename keys, update adapter config, clean schema.ts)
2. Run `pnpm db:generate` to produce a migration reflecting column-level differences
3. Review the migration SQL — expect index creation and no data loss
4. Run `pnpm db:migrate` against the local `gradients.db`
5. Smoke-test registration and sign-in flows
6. **Rollback**: restore from git if migration fails (local DB only; no production yet)
