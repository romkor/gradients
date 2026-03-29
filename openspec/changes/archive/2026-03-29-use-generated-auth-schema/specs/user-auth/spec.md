## MODIFIED Requirements

### Requirement: Auth tables are defined in the Drizzle schema
The system SHALL define `better-auth`'s auth tables as Drizzle table objects in a dedicated generated file `src/db/auth.ts`, produced by running `pnpm auth:generate --output src/db/auth.ts`. The Drizzle object keys SHALL use plural names (`users`, `sessions`, `accounts`, `verifications`) while the underlying SQL table names SHALL remain singular (`user`, `session`, `account`, `verification`) to match `better-auth`'s internal expectations. This file SHALL NOT be hand-edited. The `src/db/index.ts` module SHALL merge this file's exports with `src/db/schema.ts` so the entire schema is available to the Drizzle client.

#### Scenario: Auth tables present in schema module
- **WHEN** `src/db/auth.ts` is imported
- **THEN** it exports `users`, `sessions`, `accounts`, and `verifications` Drizzle table objects with SQL table names `user`, `session`, `account`, `verification` respectively

#### Scenario: Auth tables merged into Drizzle client
- **WHEN** `src/db/index.ts` creates the Drizzle client
- **THEN** the schema passed to `drizzle()` includes both app tables from `schema.ts` and auth tables from `auth.ts`

#### Scenario: Auth tables created by Drizzle migration
- **WHEN** `pnpm db:generate` is run after schema changes and `pnpm db:migrate` is applied
- **THEN** the `user`, `session`, `account`, and `verification` tables exist in `gradients.db` with the correct columns

#### Scenario: Regenerating auth schema
- **WHEN** a developer runs `pnpm auth:generate`
- **THEN** `src/db/auth.ts` is overwritten with an up-to-date schema matching the installed `better-auth` version

### Requirement: better-auth uses the Drizzle adapter
The system SHALL configure `better-auth` with `drizzleAdapter(db, { provider: 'sqlite', schema, usePlural: true })` instead of a raw `better-sqlite3` connection, where `schema` includes both the app tables and the auth tables from `src/db/auth.ts`. The `usePlural: true` option SHALL be set so the adapter resolves plural Drizzle object keys to singular SQL table names.

#### Scenario: Single database connection at runtime
- **WHEN** the application starts
- **THEN** only one `better-sqlite3` connection is opened to `gradients.db` (via the Drizzle `db` instance in `src/db/index.ts`)

#### Scenario: Auth operations use Drizzle adapter with plural schema
- **WHEN** a user registers, signs in, or signs out
- **THEN** better-auth writes and reads auth data through the `drizzleAdapter` using the plural-named Drizzle table objects

#### Scenario: Adapter resolves plural keys to singular SQL tables
- **WHEN** better-auth performs a database operation on the `user` table
- **THEN** the adapter finds the Drizzle table via the `users` key and the SQL query targets the `user` table
