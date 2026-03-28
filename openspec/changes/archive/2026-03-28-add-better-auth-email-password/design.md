## Context

The app is a TanStack Start (React + Vite SSR) application using Drizzle ORM with a `better-sqlite3` database. It currently has no concept of users — all gradients are stored globally. The stack already includes `@tanstack/react-start` server functions, Effect v4 for validation, and Drizzle for schema/migrations.

`better-auth` is a TypeScript-first auth library with a built-in SQLite adapter, making it a natural fit for this stack. It handles sessions, hashed passwords, CSRF, and cookie management out of the box.

## Goals / Non-Goals

**Goals:**
- Integrate `better-auth` with the SQLite adapter pointing at the existing `gradients.db`
- Support email/password registration and sign-in flows
- Expose session info to client components (Header sign-in/out button)
- Add `/login` and `/register` TanStack Router routes with form UIs
- Associate new gradients with the authenticated user via `owner_id`

**Non-Goals:**
- OAuth / social login providers (no GitHub, Google, etc.)
- Email verification or password reset flows (can be added later)
- Authorization (gradient ownership enforcement / access control) — `owner_id` is stored but not gated
- Role-based access control

## Decisions

### 1. Use `better-auth` with its built-in SQLite adapter

**Decision**: Use `better-auth` package directly with `betterSqlite3` adapter (provided by `@better-auth/sqlite` or the built-in adapter), pointing at the same `gradients.db` file.

**Alternatives considered**:
- `lucia`: less active, less batteries-included
- `next-auth` / `auth.js`: React Server Components-first, awkward in TanStack Start
- Custom session handling: too much undifferentiated work (hashing, CSRF, rotation)

**Rationale**: `better-auth` integrates via a plain `fetch` handler, requires no framework adapter, and manages its own tables without conflicting with Drizzle-managed tables. It also provides a typed client (`createAuthClient`) that works in any React app.

### 2. Wire auth as a catch-all API route

**Decision**: Register `better-auth`'s handler at `/api/auth/[...all]` as a TanStack Start API route (or `createServerFn` catch-all). All auth operations (sign-up, sign-in, sign-out, session) route through this endpoint.

**Rationale**: Keeps auth logic entirely server-side; the `better-auth` client on the browser proxies all calls through this route automatically.

### 3. Session in root loader, passed via context

**Decision**: Read the session server-side in the root route's `loader` using `auth.api.getSession({ headers })` and pass `user` into TanStack Router context. Components use `useRouteContext` to access the session without an additional fetch.

**Alternatives considered**:
- Client-side `useSession()` hook from `@better-auth/react`: adds a waterfall fetch on mount
- React context provider: requires duplicating session fetch logic

**Rationale**: SSR-safe, no client-side flash, consistent with TanStack Router patterns already in the codebase.

### 4. `better-auth` manages its own schema via `migrate()`

**Decision**: Call `auth.api.migrate()` (or `betterAuth`'s `migrate` CLI) on server startup to create/update `better-auth`'s tables (`user`, `session`, `account`, `verification`). These tables live in the same SQLite file but are **not** tracked by Drizzle migrations.

**Alternatives considered**:
- Defining auth tables in Drizzle schema: would duplicate type definitions and create a maintenance burden
- Separate auth DB file: adds operational complexity

**Rationale**: `better-auth` documents this as the intended approach; keeps auth schema evolution owned by the library.

### 5. Add optional `owner_id` to `gradients` table via Drizzle

**Decision**: Add `owner_id TEXT REFERENCES user(id)` (nullable) to the `gradients` table via a new Drizzle migration. Set it during `saveGradientFn` when a session user is present.

**Rationale**: Preserves backward compatibility (existing rows have `owner_id = NULL`), enables future per-user filtering without a breaking migration.

## Risks / Trade-offs

- **`better-auth` version churn** → Pin to a specific minor version; review changelog before upgrades.
- **Two migration systems** → Document clearly that Drizzle handles app tables and `better-auth`'s `migrate()` handles auth tables. Add a note to README.
- **SQLite concurrency** → SQLite is single-writer; auth writes and gradient writes queue automatically. Acceptable for a single-server app.
- **No email verification** → Users can register with any email. Acceptable for now; `better-auth` supports it as an add-on later.

## Migration Plan

1. `pnpm add better-auth`
2. Create `src/lib/auth.ts` with `betterAuth({ database, emailAndPassword: { enabled: true } })`
3. Run `better-auth` migration to create auth tables in `gradients.db`
4. Add Drizzle migration for `owner_id` column on `gradients`
5. Add `/api/auth/[...all]` server route
6. Add `/login` and `/register` routes with React forms using `authClient`
7. Update root loader to read session; pass to router context
8. Update `Header` to show Sign In / Sign Out based on session
9. Update `saveGradientFn` to attach `owner_id` from session if available

**Rollback**: Remove `better-auth` package; `owner_id` column is nullable so existing data is unaffected; delete auth routes.

## Open Questions

- Should `/gradient/new` redirect unauthenticated users to `/login`? (Proposed: yes, guard in the route loader)
- Should gradients list be filtered to the current user's gradients or remain global? (Proposed: remain global for now; owner_id stored but not filtered)
