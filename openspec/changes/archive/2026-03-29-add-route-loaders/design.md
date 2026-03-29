## Context

TanStack Start uses TanStack Router's `loader` API to fetch data server-side before rendering. Currently the project fetches all data client-side via React Query `useQuery`, which means every page navigation triggers at minimum a round-trip to populate data. The router is already configured with `defaultPreload: 'intent'` and `defaultPreloadStaleTime: 0` but there are no loaders to preload.

The standard pattern for TanStack Start + React Query is the **"loader-ensures, component-reads"** hybrid:
- Loader: `queryClient.ensureQueryData(...)` → pre-populates the React Query cache on the server
- Component: `useQuery(...)` unchanged — always finds data in cache instantly, no loading state

This avoids rewriting component code and retains React Query's client-side benefits (deduplication, background refetch, devtools).

## Goals / Non-Goals

**Goals:**
- Eliminate client-side loading states for the gradient list (`/`) and gradient detail (`/gradient/$id`) pages
- Enable SSR to send fully-rendered HTML with data
- Enable intent-based preloading to work (currently `defaultPreload: 'intent'` has nothing to preload)
- Pass `QueryClient` through router context so loaders can access it
- Keep component code (`useQuery`, `useMutation`) unchanged

**Non-Goals:**
- Converting mutations to use loaders (mutations are not data fetching)
- Replacing React Query with pure `Route.useLoaderData()` (hybrid is simpler and preserves React Query features)
- Adding loaders to auth pages (`/login`, `/register`) — they have no data to fetch
- Adding loaders to `/gradient/new` — it creates a new gradient with no pre-existing data to load

## Decisions

### 1. Hybrid loader + React Query pattern (not pure `useLoaderData`)
**Decision:** Loaders call `queryClient.ensureQueryData(...)` to pre-populate cache; components keep `useQuery`.  
**Rationale:** Components require zero changes. React Query's client-side caching, deduplication, and devtools continue to work. Pure `useLoaderData` would require rewriting every data-consuming component and forfeits background refetch.  
**Alternative considered:** `Route.useLoaderData()` with no React Query — rejected (too invasive, loses RQ features).

### 2. `QueryClient` in router context
**Decision:** Instantiate `QueryClient` in `__root.tsx`, pass it to `createTanStackRouter({ context: { queryClient } })` in `router.tsx`.  
**Rationale:** Loaders run outside React, so they can't use `useQueryClient()`. Router context is the canonical way to share singletons across all route loaders.  
**Note:** The `QueryClient` instance already exists in `__root.tsx` — it just needs to be wired into the router context instead of being module-level in the root component.

### 3. `ensureQueryData` (not `prefetchQuery`)
**Decision:** Use `queryClient.ensureQueryData(...)` in loaders.  
**Rationale:** `ensureQueryData` returns the data (which the loader can return for type safety) AND populates the cache. `prefetchQuery` populates the cache but returns `void`. Using `ensureQueryData` means the loader's return value types match `Route.useLoaderData()` if needed in the future.

### 4. Loader error handling
**Decision:** Let loader errors propagate naturally — TanStack Router will catch them and render the nearest `errorComponent`.  
**Rationale:** Both `loadGradientsFn` and `getGradientFn` already throw on error. No special wrapping needed.

## Risks / Trade-offs

- **`getGradientFn` with missing id**: The `$id` loader must pass the route `params.id` correctly to the query fn. If the id is invalid, the server function returns `undefined` — the existing component already handles this with a "not found" render path. No change needed.
- **QueryClient serialization**: In SSR, the QueryClient cache is serialized and sent to the client via `<DehydratedState>`. TanStack Start handles this automatically via `RouterProvider` — no manual dehydration needed.
- **Double-fetching**: `ensureQueryData` respects `staleTime`. With `defaultPreloadStaleTime: 0`, preloads always refetch on intent. On actual navigation the loader runs server-side — this is correct behavior.

## Migration Plan

1. Move `QueryClient` instantiation to `router.tsx` context factory
2. Update `__root.tsx` to receive `queryClient` from context (instead of module-level)
3. Add `loader` to `index.tsx`
4. Add `loader` to `gradient/$id.tsx`
5. Test: verify pages render with data on first paint (no loading spinner visible)
