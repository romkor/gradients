## Context

The app is a React SPA built with `@tanstack/react-start` (SSR-capable), TanStack Router, and React Query. All gradient data is currently stored in browser `localStorage`. Each gradient has an `id`, `name`, `type`, `angle`, `createdAt`, `updatedAt`, and an array of `ColorStop` objects (`id`, `color`, `position`).

The goal is to move the storage layer to a server-side SQLite3 database using Drizzle ORM, exposed to the client via TanStack Start's `createServerFn`.

## Goals / Non-Goals

**Goals:**
- Replace localStorage CRUD with SQLite3-backed Drizzle ORM queries
- Keep all changes inside the storage/server layer — no UI changes
- Use `createServerFn` as the RPC boundary so React Query mutations remain client-side
- Validate all server function inputs using **Effect v4 `Schema`** (`Schema.decodeUnknownSync`) — strict structural validation at the server boundary
- Produce explicit SQL migration files via `drizzle-kit generate` + `drizzle-kit migrate`
- Serialize `ColorStop[]` as JSON text in a single column (no join tables)

**Non-Goals:**
- Migrating existing localStorage data to the database
- Multi-user or authentication
- REST/GraphQL API (server functions replace the need for it)
- Replacing React Query with server components or other state management

## Decisions

### 1. Color stops as JSON text column

**Decision**: Store `ColorStop[]` as a serialized `TEXT` column on the `gradients` table.

**Alternatives considered**:
- *Separate `color_stops` table* — adds joins and complicates queries with no current benefit; a flat array with positional data does not need relational queries.

**Rationale**: The existing TypeScript shape is a plain array; serializing it keeps the schema simple and the round-trip trivial. If querying individual stops becomes necessary in the future, extraction is straightforward.

---

### 2. `createServerFn` as the RPC layer

**Decision**: Expose four server functions in `src/server/gradients.ts`:
- `loadGradientsFn` — list all
- `getGradientFn` — fetch by ID
- `saveGradientFn` — upsert (insert or update on conflict by ID)
- `deleteGradientFn` — delete by ID

**Alternatives considered**:
- *API route handlers (`/api/...`)* — more boilerplate, manual fetch calls, no type safety without a codegen step.
- *Loader/action functions in routes* — tighter coupling; keeping DB access in one dedicated module is easier to test and maintain.

**Rationale**: `createServerFn` is the idiomatic TanStack Start approach; it is tree-shakeable, type-safe, and integrates natively with React Query's `mutationFn`.

---

### 3. Effect v4 `Schema` for server function input validation

**Decision**: Validate all server function inputs using `Schema.decodeUnknownSync` from the `effect` package (v4 beta).

**Shapes defined**:
- `Schema.String` — used for `id` inputs (`getGradientFn`, `deleteGradientFn`)
- `GradientSchema` — `Schema.Struct` with nested `ColorStopSchema` array and `GradientTypeSchema` (union of three literals), used for `saveGradientFn`

**Alternatives considered**:
- *No validation* — server functions called only from client code, so trusted inputs; but validation is cheap and prevents subtle bugs during development.
- *Zod* — not already in the dependency tree; Effect v4 bundles `Schema` without extra packages.
- *Manual `typeof` guards* — too brittle and verbose for nested structures.

**Rationale**: Effect v4 ships `Schema` as a first-class module with zero extra dependencies; using `Schema.decodeUnknownSync` keeps validation declarative, type-safe, and consistent with the data model defined in `src/utils/gradient.ts`. Invalid inputs throw at the TanStack Start server boundary before any DB query runs.

---

### 4. `better-sqlite3` for the SQLite driver

**Decision**: Use `better-sqlite3` as the Drizzle SQLite dialect driver.

**Alternatives considered**:
- *`@libsql/client` (Turso)* — async API, adds network option, but unnecessary complexity for a local file.
- *`bun:sqlite`* — only works on Bun runtime; project currently targets Node.js.

**Rationale**: `better-sqlite3` is a mature, synchronous, file-based SQLite driver with first-class Drizzle support. Drizzle wraps it in an async-compatible interface at the ORM layer.

---

### 5. Migration strategy: `drizzle-kit generate` + `drizzle-kit migrate`

**Decision**: Use `drizzle-kit generate` to emit numbered SQL migration files to `drizzle/` and `drizzle-kit migrate` to apply them at startup or via npm script.

**Alternatives considered**:
- *`drizzle-kit push`* — convenient for dev, but skips migration files, making schema history invisible.

**Rationale**: Explicit migration files are committed to git, enabling reproducible schema setup in CI and production.

---

### 6. Database file location

**Decision**: `gradients.db` at the project root (gitignored).

**Rationale**: Simple, out of `src/`, accessible by the Drizzle config and the runtime without path gymnastics.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `better-sqlite3` is a native Node module — requires native compilation | Already handled via `pnpm.onlyBuiltDependencies`; CI must have a C++ build toolchain |
| Existing localStorage data is not migrated | Document in the PR; users start with an empty DB (acceptable for dev-stage app) |
| Synchronous SQLite writes could block the event loop under heavy load | Acceptable for a single-user local app; switch to Turso/libsql if async is ever needed |
| Server functions add a network hop per mutation (local loopback) | Negligible latency for a local dev app |

## Migration Plan

1. Install new deps (`pnpm install`)
2. Run `pnpm db:generate` → creates `drizzle/0000_initial.sql`
3. Run `pnpm db:migrate` → applies migration, creates `gradients.db`
4. Start dev server (`pnpm dev`) — app reads from SQLite instead of localStorage
5. **Rollback**: revert commits; localStorage data is untouched and browser will fall back to it automatically

## Open Questions

- Should `pnpm dev` auto-run `db:migrate` before starting Vite? (could be added to the `dev` script as `pnpm db:migrate && vite dev`) — left for the implementer to decide based on team preference.
