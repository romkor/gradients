## Why

The auth schema in `src/db/schema.ts` was hand-maintained and would drift from `better-auth`'s actual schema as the library evolves. The `better-auth` CLI provides `auth:generate` to produce an up-to-date Drizzle schema file — the project should use this generated file as the source of truth and wire it in properly.

## What Changes

- `src/db/auth.ts` — new generated file (output of `pnpm auth:generate --output src/db/auth.ts`); replaces the hand-written auth tables in `schema.ts`
- `src/db/schema.ts` — auth table definitions removed (commented-out stubs deleted)
- `src/db/index.ts` — merges `schema` and `auth` exports so the full schema is available to Drizzle: `{ schema: { ...schema, ...auth } }`
- `src/lib/auth.ts` — `drizzleAdapter` updated to pass the full merged schema and add `usePlural: true` so the adapter resolves plural Drizzle object keys (`users`, `sessions`, …) to singular SQL table names
- `src/db/auth.ts` Drizzle object names renamed to **plural** (`users`, `sessions`, `accounts`, `verifications`) while keeping singular SQL table names (`'user'`, `'session'`, …) to match `better-auth` expectations; **BREAKING** for any code that imports singular-named auth table objects
- `package.json` — `auth:generate` script targets `--output src/db/auth.ts` (already done in uncommitted changes)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `user-auth`: The requirement for how auth tables are defined in the schema changes — tables are now maintained by `pnpm auth:generate` in a separate `src/db/auth.ts` file rather than hand-written in `schema.ts`. Drizzle object names are plural; `drizzleAdapter` is configured with `usePlural: true`.

## Impact

- `src/db/schema.ts` — auth tables removed
- `src/db/auth.ts` — new generated file (not to be hand-edited)
- `src/db/index.ts` — schema merge
- `src/lib/auth.ts` — adapter config update
- Drizzle migration required to account for any column-level differences between old hand-written tables and the newly generated ones (e.g., `timestamp` → `timestamp_ms`, added indexes)
- Any import of `user`, `session`, `account`, `verification` from `schema.ts` must be updated to import `users`, `sessions`, `accounts`, `verifications` from `auth.ts`
