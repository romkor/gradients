## ADDED Requirements

### Requirement: Auth tables are defined in the Drizzle schema
The system SHALL define the `user`, `session`, `account`, and `verification` tables as Drizzle table objects in `src/db/schema.ts`, matching the column names and types required by `better-auth`'s core schema. These tables SHALL be included in the star-export so that `drizzleAdapter` can discover them automatically.

#### Scenario: Auth tables present in schema module
- **WHEN** `src/db/schema.ts` is imported
- **THEN** it exports `user`, `session`, `account`, and `verification` Drizzle table objects alongside the existing `gradients` table

#### Scenario: Auth tables created by Drizzle migration
- **WHEN** `pnpm db:generate` is run after schema changes and `pnpm db:migrate` is applied
- **THEN** the `user`, `session`, `account`, and `verification` tables exist in `gradients.db` with the correct columns

### Requirement: better-auth uses the Drizzle adapter
The system SHALL configure `better-auth` with `drizzleAdapter(db, { provider: 'sqlite', schema })` instead of a raw `better-sqlite3` connection, so that all database access goes through the single shared Drizzle instance.

#### Scenario: Single database connection at runtime
- **WHEN** the application starts
- **THEN** only one `better-sqlite3` connection is opened to `gradients.db` (via the Drizzle `db` instance in `src/db/index.ts`)

#### Scenario: Auth operations use Drizzle adapter
- **WHEN** a user registers, signs in, or signs out
- **THEN** better-auth writes and reads auth data through the `drizzleAdapter`, not through a separate direct SQLite connection
