## 1. Server: expose creatorName from loadGradientsFn

- [x] 1.1 In `src/server/gradients.ts`, import `users` from `src/db/auth.ts`
- [x] 1.2 Extend the `loadGradientsFn` `.select()` to include `creatorName: users.name` via a second left join on `gradients.ownerId = users.id`
- [x] 1.3 Update the `rows.map()` return to include `creatorName: row.creatorName ?? null`
- [x] 1.4 Update the function's return type annotation to `(Gradient & { isPublished: boolean; creatorName: string | null })[]`

## 2. Create GridListItemLink via createLink

- [x] 2.1 In `src/components/GridListItemLink.ts`, import `createLink` from `@tanstack/react-router` and `GridListItem` from `react-aria-components`; export `GridListItemLink = createLink(GridListItem)`

## 3. Index page: replace grid div with GridList

- [x] 3.1 In `src/routes/index.tsx`, import `GridList`, `Text` from `react-aria-components` and `GridListItemLink` from `../components/GridListItemLink`
- [x] 3.2 Remove the import of `GradientCard` and `useNavigate`
- [x] 3.3 Replace the `<div className="grid ...">` + `gradients.map(...)` block with `<GridList layout="grid" aria-label="Gradients" items={gradients}>`
- [x] 3.4 Render each item as `<GridListItemLink to="/gradient/$id" params={{ id: gradient.id }} preload="intent" textValue={gradient.name}>` containing: gradient swatch div (inline `background` style), `<Text>` for name, `<Text slot="description">` for type, `<Text slot="description">` for `"By <creatorName ?? 'Anonymous'>"`
- [x] 3.5 Move the delete `Button` inside the `GridListItemLink` as a child
- [x] 3.6 Replace the empty-state `div` with `renderEmptyState` prop on `GridList`

## 4. Styling: focus ring and grid layout

- [x] 4.1 Add Tailwind classes for `[data-focus-visible]` outline on `GridListItemLink` (e.g., `outline-2 outline-indigo-500 outline-offset-2`)
- [x] 4.2 Apply responsive grid CSS to the `GridList` element (replicate the previous `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` layout via Tailwind on the `className` prop)
- [x] 4.3 Verify no visual regression by loading the index page in the dev server

## 5. Cleanup

- [x] 5.1 Search the codebase for any other imports of `GradientCard`
- [x] 5.2 Delete `src/components/GradientCard.tsx`
- [x] 5.3 Run `pnpm build` to confirm no TypeScript or import errors
