## Context

The gradients index page (`src/routes/index.tsx`) currently uses a plain `<div className="grid ...">` with custom `GradientCard` components. This pattern provides no semantic structure, no keyboard navigation between cards, and requires manual focus management for accessibility. `react-aria-components` is already a project dependency and exports `GridList`, `GridListItem`, and `Text` — bringing this conformance for free.

Creator attribution is missing from gradient cards. The `gradients` DB table has an `owner_id` FK to the `user` table, which already stores `name`. A left join at the server level can expose `creatorName: string | null` without schema changes.

## Goals / Non-Goals

**Goals:**
- Replace the custom grid + `GradientCard` with `<GridList layout="grid">` from react-aria, providing ARIA grid role and keyboard navigation
- Show `creatorName` on each grid item (from the owner's `user.name`; `null` owners render as `"Anonymous"`)
- Keep the existing delete-per-item action and navigation-to-detail behaviour
- Remove the now-unused `GradientCard` component file

**Non-Goals:**
- Selection mode (single/multiple) — cards are navigable but not selectable
- Drag-and-drop reordering
- Pagination or infinite scroll
- Any changes to the detail page or other routes

## Decisions

### 1. `createLink(GridListItem)` for type-safe `href`-based navigation

TanStack Router's `createLink` utility wraps any third-party component that accepts an `href` prop, giving it full TanStack Router type safety and intent-based preloading. The official TanStack Router docs show exactly this pattern for React Aria Components (v1.11.0+):

```ts
import { createLink } from '@tanstack/react-router'
import { GridListItem } from 'react-aria-components'

export const GridListItemLink = createLink(GridListItem)
```

This lets us use `<GridListItemLink to="/gradient/$id" params={...}>` with full type safety and `preload="intent"`. No `onAction` needed, no `RouterProvider` needed.

**Alternative considered:** `onAction` callback with `useNavigate`. Rejected — it bypasses TanStack Router's preload/intent behaviour and loses type-safe `to` props.

**Alternative considered:** react-aria `RouterProvider`. Rejected — `createLink` is the TanStack Router-idiomatic approach and is explicitly documented for this use case.

### 2. `creatorName` as server-response extension, not part of `Gradient` type

`Gradient` is a domain type used throughout the app (editor, storage, etc.). Adding `creatorName` to it would add an optional field that most consumers don't need. Instead, `loadGradientsFn` returns `(Gradient & { isPublished: boolean; creatorName: string | null })[]` — extending the existing pattern already used for `isPublished`.

**Alternative considered:** Add `ownerId` to `Gradient` and resolve the name on the client. Rejected because it requires an extra round-trip and leaks internal IDs to the UI.

### 3. Inline `GridListItem` rendering in `index.tsx`, no separate component

The gradient grid item is now a `GridListItem` composition. Extracting it into a `GradientGridItem` component is unnecessary indirection for a single usage site. The logic (swatch div + Text slots + delete Button) fits in a short render function passed to `GridList`.

**Alternative considered:** Create a new `GradientGridItem.tsx`. Rejected to avoid unnecessary file proliferation (YAGNI).

### 4. `selectionMode="none"` — items are links only

Gradients are opened, not selected. Navigation is handled by the `GridListItemLink` `to` prop (rendered as a real link). Delete remains an explicit `Button` child inside each item.

## Risks / Trade-offs

- **Focus ring styling** → react-aria's default `[data-focus-visible]` attribute must be styled with Tailwind. The existing app has no global GridList styles, so focus rings need to be added via CSS or Tailwind variants in the component. Mitigation: use `className` render prop with `isFocusVisible` to toggle a ring class.
- **`GradientCard` deletion** → If any other route imports `GradientCard`, removing the file will cause a build error. Mitigation: search for usages before deleting.
- **Creator name for anonymous gradients** → Gradients saved without a session have `owner_id = null`; the join returns `null` for `user.name`. UI shows `"Anonymous"`. Edge case: if a user account is deleted but gradients remain, `owner_id` is non-null but the join returns `null` (cascade deletes are on session, not gradient). Mitigation: treat `null` name as `"Anonymous"` in all cases.

## Migration Plan

1. Extend `loadGradientsFn` query (join + `creatorName` field) — backwards-compatible, no migration
2. Create `GridListItemLink = createLink(GridListItem)` in a shared utility or inline in `index.tsx`
3. Replace index page grid + map with `GridList` + `GridListItemLink` (using `to` prop)
4. Delete `GradientCard.tsx` after confirming no other imports
5. Add delta spec for `gradient-persistence` (new `creatorName` field)
6. Add new spec `gradient-grid-view`

No DB migrations required. No breaking API changes to other consumers.
