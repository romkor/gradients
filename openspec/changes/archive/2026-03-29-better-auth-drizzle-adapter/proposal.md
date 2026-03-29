## Why

`better-auth` is currently configured with a raw `better-sqlite3` connection, bypassing the existing Drizzle ORM instance that the rest of the app already uses. This means two separate database connections are open to the same SQLite file and better-auth's tables are invisible to the app's Drizzle schema — making it impossible to define relations, run unified migrations, or query auth tables from app code. Switching to the Drizzle adapter unifies all database access through a single connection and ORM layer.

## What Changes

- Install `better-auth/adapters/drizzle` (built into the `better-auth` package — no extra install needed)
- Add better-auth's required tables (`user`, `session`, `account`, `verification`) to `src/db/schema.ts`
- Replace `new Database('./gradients.db')` in `src/lib/auth.ts` with `drizzleAdapter(db, { provider: 'sqlite', schema })`
- Remove the now-redundant `better-sqlite3` import from `auth.ts`
- Run `pnpm db:generate` and `pnpm db:migrate` to create the auth tables via Drizzle migrations

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `user-auth`: Auth tables are now defined in the Drizzle schema and managed through Drizzle migrations. The behavioral requirements for registration, sign-in, sign-out, and session management are unchanged; only the infrastructure backing them changes.

## Impact

- **`src/db/schema.ts`** — new `user`, `session`, `account`, `verification` table definitions added
- **`src/lib/auth.ts`** — `database` option switched from raw SQLite to `drizzleAdapter(db, { provider: 'sqlite', schema })`; `better-sqlite3` import removed
- **`drizzle/`** — new migration file generated for auth tables
- **`gradients.db`** — auth tables created on next `pnpm db:migrate`
- **`package.json`** — no new dependencies (`drizzleAdapter` ships inside `better-auth`)
- **No API or behavioral changes** — all auth endpoints and session flows remain identical
