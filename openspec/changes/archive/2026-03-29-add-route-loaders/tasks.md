## 1. Wire QueryClient into Router Context

- [x] 1.1 In `src/router.tsx`, move `QueryClient` instantiation to a `context` factory passed to `createTanStackRouter({ context: { queryClient } })`
- [x] 1.2 In `src/routes/__root.tsx`, declare the `RouterContext` type with `queryClient: QueryClient` and update the root route to consume it from context rather than using a module-level instance
- [x] 1.3 Verify the `<QueryClientProvider client={queryClient}>` in the root component still receives the same instance (from `useRouterState` or route context)

## 2. Add Loader to Index Route

- [x] 2.1 In `src/routes/index.tsx`, add a `loader` function that calls `context.queryClient.ensureQueryData({ queryKey: ['gradients'], queryFn: loadGradientsFn })`
- [x] 2.2 Confirm the existing `useQuery({ queryKey: ['gradients'], queryFn: loadGradientsFn })` in the component body requires no changes (cache is pre-populated)

## 3. Add Loader to Gradient Detail Route

- [x] 3.1 In `src/routes/gradient/$id.tsx`, add a `loader` function that reads `params.id` and calls `context.queryClient.ensureQueryData({ queryKey: ['gradient', id], queryFn: () => getGradientFn({ data: id }) })`
- [x] 3.2 Confirm the existing `useQuery({ queryKey: ['gradient', id] })` in the component body requires no changes

## 4. Verification

- [x] 4.1 Start the dev server (`pnpm dev`) and confirm no TypeScript or runtime errors
- [x] 4.2 Open the index route (`/`) and verify the gradient list renders immediately with no loading spinner on first paint
- [x] 4.3 Open a gradient detail route (`/gradient/$id`) and verify the gradient data renders immediately with no loading spinner
- [x] 4.4 Hover a link to verify intent-based preloading triggers the loaders (check Network tab — request fires before click)
