# gradient-persistence Specification

## Purpose
TBD - created by archiving change add-db-persistence. Update Purpose after archive.
## Requirements
### Requirement: List gradients from database
The system SHALL retrieve gradients from the SQLite database and return them as a typed `(Gradient & { isPublished: boolean })[]` array, with `ColorStop[]` deserialized from the stored JSON text. A gradient is published if a row exists for its `id` in the `published_gradients` table.

Visibility rules:
- **Unauthenticated users** see only published gradients.
- **Authenticated users** see all published gradients plus their own unpublished (draft) gradients.

The index route (`/`) SHALL fetch gradients server-side via a TanStack Router `loader` that pre-populates the React Query cache before the component renders, so that no client-side loading state is shown on first paint or intent-based preload.

#### Scenario: Unauthenticated user sees only published gradients
- **WHEN** an unauthenticated user navigates to the index route
- **THEN** only gradients with a matching row in `published_gradients` are returned as a `Gradient[]`, ordered by `gradients.created_at` descending

#### Scenario: Owner sees their own unpublished gradients
- **WHEN** an authenticated user navigates to the index route
- **THEN** the response includes all published gradients plus any gradients owned by that user that have no row in `published_gradients` (drafts), each carrying `isPublished: false`

#### Scenario: Unpublished gradient not shown to non-owners
- **WHEN** a gradient exists in the `gradients` table but has no row in `published_gradients`, and the requesting user is not its owner
- **THEN** it is NOT included in the results

#### Scenario: Empty published list
- **WHEN** no gradients have been published (i.e., `published_gradients` is empty)
- **THEN** the loader returns an empty array without error and the component renders with an empty state

#### Scenario: Loader pre-populates React Query cache
- **WHEN** the index route loader runs (server-side during SSR or on preload)
- **THEN** the `['gradients']` React Query cache entry is populated so that `useQuery({ queryKey: ['gradients'] })` resolves instantly without a network round-trip

#### Scenario: Intent-based preload triggers loader
- **WHEN** a user hovers or focuses a link to the index route
- **THEN** the route loader runs and the published gradient list is fetched before navigation completes

---

### Requirement: Fetch a single gradient by ID
The system SHALL retrieve a single gradient by its `id` from the SQLite database and return it as a `Gradient`, or `undefined` if not found. The `id` input SHALL be validated with Effect v4 `Schema.String` before any DB query runs. The gradient detail route (`/gradient/$id`) SHALL fetch the gradient server-side via a TanStack Router `loader` that pre-populates the React Query cache, so that no client-side loading state is shown on first paint or intent-based preload.

#### Scenario: Gradient found
- **WHEN** `getGradientFn` is called with a valid existing `id`
- **THEN** the matching gradient is returned with all fields, including deserialized `stops`, and the component renders with data immediately (no loading spinner on first paint)

#### Scenario: Gradient not found
- **WHEN** the route loader runs for an `id` that does not exist in the database
- **THEN** the function returns `undefined` without throwing and the component renders a "not found" state immediately

#### Scenario: Loader pre-populates React Query cache
- **WHEN** the gradient detail route loader runs for a given `id`
- **THEN** the `['gradient', id]` React Query cache entry is populated so that `useQuery({ queryKey: ['gradient', id] })` resolves instantly

#### Scenario: Intent-based preload triggers loader
- **WHEN** a user hovers or focuses a link to `/gradient/$id`
- **THEN** the route loader runs and the gradient is fetched before navigation completes

---

### Requirement: Upsert a gradient
The system SHALL insert a new gradient or update an existing one (matched by `id`) in the SQLite database, with `ColorStop[]` serialized as JSON text. The `Gradient` input SHALL be validated with an Effect v4 `Schema.Struct` (including a nested `ColorStopSchema` array and a `GradientTypeSchema` union of literals) before any DB write occurs. When an authenticated session is present, the gradient's `owner_id` field SHALL be set to the current user's `id`; for unauthenticated requests, `owner_id` SHALL be `null`. New gradient IDs and new color-stop IDs SHALL be generated using UUID v7 (time-ordered).

#### Scenario: Create new gradient
- **WHEN** `saveGradientFn` is called with a `Gradient` whose `id` does not exist in the database
- **THEN** a new row is inserted with all fields and the gradient is retrievable afterwards

#### Scenario: Update existing gradient
- **WHEN** `saveGradientFn` is called with a `Gradient` whose `id` already exists
- **THEN** the existing row is updated (all fields overwritten), and no duplicate rows are created

#### Scenario: Color stops serialization
- **WHEN** `saveGradientFn` is called with a `Gradient` containing a non-empty `stops` array
- **THEN** `stops` is stored as a valid JSON string, and reading back with `getGradientFn` or `loadGradientsFn` returns the same array

#### Scenario: Authenticated save sets owner_id
- **WHEN** `saveGradientFn` is called while a valid session cookie is present
- **THEN** the stored gradient row has `owner_id` equal to the session user's `id`

#### Scenario: Unauthenticated save leaves owner_id null
- **WHEN** `saveGradientFn` is called with no session cookie
- **THEN** the stored gradient row has `owner_id` set to `null`

#### Scenario: New gradient ID is UUID v7
- **WHEN** a new `Gradient` is created in the UI
- **THEN** its `id` value is a valid UUID v7 string (format `xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx`)

#### Scenario: New color stop ID is UUID v7
- **WHEN** a new `ColorStop` is added to a gradient in the UI
- **THEN** its `id` value is a valid UUID v7 string

#### Scenario: Newly inserted gradient IDs are time-ordered
- **WHEN** two gradients are created in sequence within a test
- **THEN** the `id` of the second gradient is lexicographically greater than the `id` of the first

---

### Requirement: Delete a gradient by ID
The system SHALL delete the gradient row with the given `id` from the SQLite database. The `id` input SHALL be validated with Effect v4 `Schema.String` before the delete query runs.

#### Scenario: Delete existing gradient
- **WHEN** `deleteGradientFn` is called with a valid existing `id`
- **THEN** the gradient is removed from the database and no longer appears in subsequent `loadGradientsFn` results

#### Scenario: Delete non-existent gradient
- **WHEN** `deleteGradientFn` is called with an `id` that does not exist
- **THEN** the function completes without error (no-op)

---

### Requirement: QueryClient is available in route loaders via router context
The system SHALL instantiate a single `QueryClient` and pass it through TanStack Router's context so that all route loaders can access it to call `ensureQueryData`. The same `QueryClient` instance SHALL be used by both the router context and the React Query `QueryClientProvider`.

#### Scenario: Loader accesses QueryClient
- **WHEN** any route loader runs
- **THEN** it can access `context.queryClient` to interact with the React Query cache

#### Scenario: Single QueryClient instance
- **WHEN** the application initializes
- **THEN** exactly one `QueryClient` instance is created and shared between the router context and React components

---

### Requirement: Input validation via Effect v4 Schema
All server function inputs (string IDs and `Gradient` objects) SHALL be validated using `Schema.decodeUnknownSync` from the `effect` package (v4) before any database operation is executed. Invalid inputs SHALL cause an error to be thrown at the server boundary.

#### Scenario: Invalid ID rejected
- **WHEN** `getGradientFn` or `deleteGradientFn` is called with a non-string value
- **THEN** Effect Schema throws a parse error before any DB query is made

#### Scenario: Invalid gradient shape rejected
- **WHEN** `saveGradientFn` is called with a payload that does not match `GradientSchema` (e.g., missing field, wrong type literal)
- **THEN** Effect Schema throws a parse error before any DB insert or update is made

---

### Requirement: Database schema and migrations
The system SHALL define a `gradients` table via Drizzle ORM schema and manage schema changes through explicit SQL migration files generated by `drizzle-kit`.

#### Scenario: Initial migration
- **WHEN** `pnpm db:generate` is run for the first time
- **THEN** a numbered SQL file is created under `drizzle/` containing the `CREATE TABLE gradients` statement

#### Scenario: Migration apply
- **WHEN** `pnpm db:migrate` is run
- **THEN** the migration is applied to `gradients.db` and the table exists with columns: `id TEXT PRIMARY KEY`, `name TEXT`, `type TEXT`, `angle INTEGER`, `stops TEXT`, `created_at INTEGER`, `updated_at INTEGER`

---

### Requirement: Routes use server functions instead of localStorage
The system SHALL update all three gradient routes to call the server function equivalents, making all persistence operations server-side with no fallback to localStorage.

#### Scenario: Index route lists gradients
- **WHEN** the index route renders
- **THEN** React Query fetches via `loadGradientsFn` and renders the gradient cards from database data

#### Scenario: New gradient is saved to database
- **WHEN** the user submits a new gradient in the new-gradient route
- **THEN** `saveGradientFn` is called, the gradient is stored in SQLite, the query cache is invalidated, and the user is redirected to the index

#### Scenario: Existing gradient is edited and saved
- **WHEN** the user submits an edited gradient in the edit route
- **THEN** `saveGradientFn` is called, the gradient is updated in SQLite, and the user is redirected to the index

#### Scenario: Gradient deleted from index
- **WHEN** the user clicks delete on a gradient card
- **THEN** `deleteGradientFn` is called, the gradient is removed from SQLite, and the list refreshes

