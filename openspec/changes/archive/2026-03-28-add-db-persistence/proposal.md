## Why

Gradient data is currently stored in browser localStorage, which is device-local, limited in size, brittle across browsers, and inaccessible server-side. Migrating to a SQLite database via Drizzle ORM gives the app a durable, queryable, server-side store that will support future multi-user and sync scenarios.

## What Changes

- Replace all `src/utils/storage.ts` localStorage functions with Drizzle ORM queries against a SQLite3 database
- Add a `src/db/` module (schema + db client) and a `src/server/gradients.ts` server-function layer
- Expose four server functions (`loadGradientsFn`, `getGradientFn`, `saveGradientFn`, `deleteGradientFn`) via TanStack Start's `createServerFn`
- Update all three routes (`index`, `gradient/$id`, `gradient/new`) to call server functions instead of localStorage helpers
- Add `drizzle.config.ts` and `drizzle/` migration directory; add `db:generate` and `db:migrate` scripts to `package.json`
- Add runtime deps: `drizzle-orm`, `better-sqlite3`, `effect` (v4); dev deps: `drizzle-kit`, `@types/better-sqlite3`

## Capabilities

### New Capabilities

- `gradient-persistence`: Server-side CRUD operations for gradients stored in a SQLite3 database via Drizzle ORM, exposed as TanStack Start server functions with Effect v4 Schema validation on all inputs

### Modified Capabilities

- _(none — no existing spec-level requirements are changing; only the storage implementation changes)_

## Impact

- **Dependencies**: adds `drizzle-orm`, `better-sqlite3` (native build), `effect` (v4 — used for `Schema`-based input validation), `drizzle-kit`, `@types/better-sqlite3`
- **Files changed**: `src/utils/storage.ts` (removed), `package.json`, `src/routes/index.tsx`, `src/routes/gradient/$id.tsx`, `src/routes/gradient/new.tsx`
- **Files added**: `drizzle.config.ts`, `src/db/schema.ts`, `src/db/index.ts`, `src/server/gradients.ts`, `drizzle/` migration folder
- **Data migration**: existing localStorage data is not migrated automatically (gradients created before this change will not appear after)
- **Runtime requirement**: Node.js server environment (already satisfied by `@tanstack/react-start` SSR setup)
