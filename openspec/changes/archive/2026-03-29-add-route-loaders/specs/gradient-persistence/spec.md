## MODIFIED Requirements

### Requirement: List all gradients from database
The system SHALL retrieve all gradients from the SQLite database and return them as a typed `Gradient[]` array, with `ColorStop[]` deserialized from the stored JSON text. The index route (`/`) SHALL fetch all gradients server-side via a TanStack Router `loader` that pre-populates the React Query cache before the component renders, so that no client-side loading state is shown on first paint or intent-based preload.

#### Scenario: Successful list
- **WHEN** a user navigates to the index route
- **THEN** all rows from the `gradients` table are returned as a `Gradient[]`, ordered by `created_at` descending, and are available before the component renders (no loading spinner on first paint)

#### Scenario: Empty database
- **WHEN** no gradients exist in the database
- **THEN** the loader returns an empty array without error and the component renders immediately with an empty state

#### Scenario: Loader pre-populates React Query cache
- **WHEN** the index route loader runs (server-side during SSR or on preload)
- **THEN** the `['gradients']` React Query cache entry is populated so that `useQuery({ queryKey: ['gradients'] })` resolves instantly without a network round-trip

#### Scenario: Intent-based preload triggers loader
- **WHEN** a user hovers or focuses a link to the index route
- **THEN** the route loader runs and the gradient list is fetched before navigation completes

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

## ADDED Requirements

### Requirement: QueryClient is available in route loaders via router context
The system SHALL instantiate a single `QueryClient` and pass it through TanStack Router's context so that all route loaders can access it to call `ensureQueryData`. The same `QueryClient` instance SHALL be used by both the router context and the React Query `QueryClientProvider`.

#### Scenario: Loader accesses QueryClient
- **WHEN** any route loader runs
- **THEN** it can access `context.queryClient` to interact with the React Query cache

#### Scenario: Single QueryClient instance
- **WHEN** the application initializes
- **THEN** exactly one `QueryClient` instance is created and shared between the router context and React components
