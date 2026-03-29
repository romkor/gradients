## Context

The app uses Drizzle ORM + `better-sqlite3` for all gradient data. `better-auth` is currently configured with its own raw `new Database('./gradients.db')` connection — a second, independent handle to the same SQLite file. This works at runtime (SQLite allows multiple readers), but it means:

1. **Two open connections** to one file with different transaction contexts.
2. **Auth tables are invisible to Drizzle** — no type-safe queries, no relations, no Drizzle migrations.
3. **Migration story is split** — Drizzle handles `gradients`, better-auth handles its own tables via its internal adapter, and the two approaches cannot be composed.

The fix is to wire better-auth through the existing `db` Drizzle instance using `drizzleAdapter` (shipped inside the `better-auth` package) and define better-auth's tables explicitly in `src/db/schema.ts`.

## Goals / Non-Goals

**Goals:**
- Replace the raw `better-sqlite3` connection in `auth.ts` with `drizzleAdapter(db, { provider: 'sqlite', schema })`
- Add better-auth's `user`, `session`, `account`, and `verification` table definitions to `src/db/schema.ts`
- Generate a Drizzle migration for the auth tables and apply it
- Eliminate the `better-sqlite3` import from `auth.ts`

**Non-Goals:**
- Changing any auth behavior, endpoints, or session logic
- Adding Drizzle relations between auth and gradient tables (can follow later)
- Enabling experimental joins (can follow later once relations are defined)
- Migrating existing auth data (dev environment; `gradients.db` is local and gitignored)

## Decisions

### Decision: Use `drizzleAdapter` from `better-auth/adapters/drizzle` — no extra package

`drizzleAdapter` ships inside the `better-auth` package itself. Importing from `better-auth/adapters/drizzle` requires no new install. The alternative (`@better-auth/drizzle-adapter`) is a separate package that the docs list as an older path; the current docs import directly from `better-auth`.

### Decision: Define auth tables manually in `src/db/schema.ts`

better-auth's CLI (`npx auth@latest generate`) can output a Drizzle schema, but it writes to a separate file and may conflict with the existing schema setup. Instead, the required tables (`user`, `session`, `account`, `verification`) will be added directly to `src/db/schema.ts` by hand, matching the column names and types from the better-auth core schema documentation. This keeps all table definitions in one file and avoids a parallel schema file.

### Decision: Pass the full `schema` import to `drizzleAdapter`

`drizzleAdapter` needs to know which Drizzle table objects correspond to better-auth's models. Passing `schema` (the star-import from `src/db/schema.ts`) lets the adapter discover all tables automatically. The table names in the schema (`user`, `session`, `account`, `verification`) already match better-auth's expected model names, so no `modelName` overrides are needed.

### Decision: Generate a new Drizzle migration rather than running better-auth's migrate command

The project already uses `pnpm db:generate` + `pnpm db:migrate` for schema changes. Running `pnpm db:generate` after adding the auth tables to `schema.ts` produces a standard numbered SQL migration, keeping the migration history in `drizzle/` consistent and reviewable.

## Risks / Trade-offs

- **Column name casing**: better-auth uses camelCase field names (e.g., `emailVerified`, `createdAt`) but Drizzle maps them to snake_case column names by default. The adapter resolves field names from the Drizzle schema property names — not the column names — so this is transparent. → Mitigation: verify the generated migration SQL matches expected column names.
- **Existing auth data loss**: Any existing `user`/`session` rows created by the old built-in adapter will be in tables with different names or formats and will not be migrated. → Mitigation: acceptable for a dev environment; `gradients.db` is gitignored and local.
- **`better-sqlite3` peer warning**: The existing peer-dependency warning (`better-sqlite3@^12.0.0` vs found `11.x`) is pre-existing and unrelated to this change. → No action needed.

## Migration Plan

1. Add auth table definitions to `src/db/schema.ts`
2. Update `src/lib/auth.ts` to use `drizzleAdapter`
3. Run `pnpm db:generate` — produces new migration SQL
4. Run `pnpm db:migrate` — creates auth tables in `gradients.db`
5. Verify dev server starts and auth endpoints respond correctly

**Rollback**: Revert `schema.ts` and `auth.ts`, delete the generated migration file, and restore the DB from backup (or delete and let the app recreate gradient data).
