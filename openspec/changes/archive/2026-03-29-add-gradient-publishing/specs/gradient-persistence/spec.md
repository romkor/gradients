## MODIFIED Requirements

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
