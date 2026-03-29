# user-auth Specification

## Purpose
Email/password authentication using better-auth with session management via TanStack Router context.

## Requirements

### Requirement: User can register with email and password
The system SHALL allow a visitor to create a new account by providing a name, email address, and password. Registration SHALL be handled by `better-auth`'s email/password plugin via the `/api/auth/sign-up/email` endpoint. Duplicate emails SHALL be rejected with a descriptive error. The `id` assigned to the new user record SHALL be a UUID v7 string.

#### Scenario: Successful registration
- **WHEN** a visitor submits the registration form with a unique email and a valid password
- **THEN** a new user record is created, a session cookie is set, and the user is redirected to the index page

#### Scenario: Duplicate email rejected
- **WHEN** a visitor submits the registration form with an email that already exists
- **THEN** the server returns an error and the form displays a message indicating the email is taken

#### Scenario: Missing required fields
- **WHEN** a visitor submits the registration form with an empty email or password
- **THEN** client-side validation prevents submission and highlights the invalid fields

#### Scenario: New user ID is UUID v7
- **WHEN** a visitor successfully registers
- **THEN** the created user's `id` is a valid UUID v7 string (format `xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx`)

---

### Requirement: User can sign in with email and password
The system SHALL allow a registered user to sign in by providing their email and password via the `/api/auth/sign-in/email` endpoint. Invalid credentials SHALL be rejected without revealing which field is wrong. The `id` assigned to the new session record SHALL be a UUID v7 string.

#### Scenario: Successful sign-in
- **WHEN** a registered user submits the login form with correct credentials
- **THEN** a session cookie is issued and the user is redirected to the index page

#### Scenario: Invalid credentials rejected
- **WHEN** a user submits the login form with an incorrect password or unknown email
- **THEN** the server returns an error and the form displays a generic "Invalid email or password" message

#### Scenario: Already signed-in user visits login page
- **WHEN** a user with an active session navigates to `/login`
- **THEN** they are redirected to the index page

#### Scenario: New session ID is UUID v7
- **WHEN** a user successfully signs in
- **THEN** the created session's `id` is a valid UUID v7 string

---

### Requirement: User can sign out
The system SHALL allow an authenticated user to end their session by triggering the sign-out action. The session cookie SHALL be invalidated server-side.

#### Scenario: Successful sign-out
- **WHEN** an authenticated user clicks the Sign Out control in the Header
- **THEN** the session is invalidated, the cookie is cleared, and the user is redirected to the index page as a guest

---

### Requirement: Session is available server-side in root loader
The system SHALL read the current user session in the TanStack Router root route `beforeLoad` using `auth.api.getSession`. The resulting `user` object (or `null`) SHALL be passed into TanStack Router context so all child routes and components can access it without additional fetches.

#### Scenario: Authenticated request
- **WHEN** an authenticated user loads any page
- **THEN** the root loader resolves with a `user` object containing at minimum `id`, `email`, and `name`

#### Scenario: Unauthenticated request
- **WHEN** a visitor with no session cookie loads any page
- **THEN** the root loader resolves with `user: null`

---

### Requirement: Header reflects authentication state
The system SHALL update the Header component to display a "Sign In" link when the user is unauthenticated and a "Sign Out" button when authenticated.

#### Scenario: Unauthenticated header
- **WHEN** a visitor views any page
- **THEN** the Header shows a "Sign In" link pointing to `/login`

#### Scenario: Authenticated header
- **WHEN** an authenticated user views any page
- **THEN** the Header shows the user's name or email and a "Sign Out" button

---

### Requirement: New gradient route requires authentication
The system SHALL protect the `/gradient/new` route so that unauthenticated users are redirected to `/login`.

#### Scenario: Unauthenticated user visits new gradient page
- **WHEN** a visitor without a session navigates to `/gradient/new`
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated user visits new gradient page
- **WHEN** an authenticated user navigates to `/gradient/new`
- **THEN** the page renders normally

---

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

---

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
