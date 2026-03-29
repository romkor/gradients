## Why

The gradients index page currently renders items using a plain CSS grid of custom `GradientCard` components, which lacks ARIA semantics, keyboard navigation, and focus management. Replacing it with `react-aria-components` `GridList` (with `layout="grid"`) provides built-in grid role, arrow-key navigation, and screen-reader support at no extra bundle cost, since `react-aria-components` is already a project dependency. Creator attribution is also absent from gradient cards, making it hard to distinguish who made a published gradient.

## What Changes

- Replace `<div className="grid ...">` + `<GradientCard>` on the index page with `<GridList layout="grid">` + `<GridListItem>` from `react-aria-components`
- Each `GridListItem` renders: gradient preview swatch, gradient name, gradient type badge, and creator name (`"By <name>"` or `"Anonymous"` when no owner)
- Navigation to the detail page moves from individual card `onClick` handlers to `GridList`'s `onAction` prop (required by react-aria for client-side routing — `GridListItem` cannot render as `<a>`)
- Extend `loadGradientsFn` return type to include `creatorName: string | null` via a left join between `gradients` and the `user` table on `owner_id`
- `GradientCard` component is replaced by inline `GridListItem` rendering; the file can be removed
- Delete action stays on each item via a `Button` child inside the `GridListItem`

## Capabilities

### New Capabilities

- `gradient-grid-view`: Accessible grid view for the gradients index page using react-aria `GridList`, with keyboard navigation, ARIA semantics, and creator attribution per item

### Modified Capabilities

- `gradient-persistence`: `loadGradientsFn` now returns `creatorName: string | null` per item (joined from the `user` table)

## Impact

- `src/routes/index.tsx` — replaces grid div + map loop with `GridList` + `onAction`
- `src/components/GradientCard.tsx` — replaced; file removed
- `src/server/gradients.ts` — `loadGradientsFn` query extended with `user.name` join; return type updated
- `src/utils/gradient.ts` — no changes needed (creator name is not part of the core `Gradient` type; it is a server-response extension)
- No new npm dependencies required (`GridList`, `GridListItem`, `Text` are already exported from `react-aria-components`)
- No DB migrations required (join is on existing `user.name` column)
