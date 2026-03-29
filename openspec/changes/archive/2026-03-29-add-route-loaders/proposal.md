## Why

All data fetching today happens client-side via React Query `useQuery` — on every page load the browser renders a skeleton/loading state before data arrives, and SSR sends empty shells with no content. TanStack Start's route `loader` API runs data fetching on the server before rendering, eliminating loading flicker, enabling full-page SSR hydration, and allowing intent-based preloading to kick in before the user navigates.

## What Changes

- `src/router.tsx` — pass a shared `QueryClient` instance in router `context` so loaders can interact with the cache
- `src/routes/__root.tsx` — declare `RouterContext` type with `queryClient`; wire it up in the router context factory
- `src/routes/index.tsx` — add a `loader` that calls `queryClient.ensureQueryData({ queryKey: ['gradients'], queryFn: loadGradientsFn })`; component's `useQuery` becomes instant (cache pre-populated on server)
- `src/routes/gradient/$id.tsx` — add a `loader` that calls `queryClient.ensureQueryData({ queryKey: ['gradient', id], queryFn: ... })`; same pattern
- `src/routes/gradient/new.tsx` — no data to load; loader only enforces the auth guard (already done via `beforeLoad`); no change needed

## Capabilities

### New Capabilities

_(none — this is a performance/architecture improvement, not a user-visible feature)_

### Modified Capabilities

- `gradient-persistence`: The requirement for how gradient data is delivered to the client changes — the gradient list and individual gradient detail SHALL be available server-side at render time (no client-side loading state) via TanStack Router loaders integrated with the React Query cache.

## Impact

- `src/router.tsx` — context setup
- `src/routes/__root.tsx` — context type declaration
- `src/routes/index.tsx` — new `loader`, component read pattern unchanged
- `src/routes/gradient/$id.tsx` — new `loader`, component read pattern unchanged
- No new npm dependencies (TanStack Router loaders are built-in)
- No database or API shape changes
- React Query mutations and `invalidateQueries` remain unchanged
