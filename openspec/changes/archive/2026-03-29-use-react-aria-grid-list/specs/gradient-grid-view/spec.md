## ADDED Requirements

### Requirement: Render gradients index as accessible grid list
The index page (`/`) SHALL render the list of gradients using `react-aria-components` `<GridList layout="grid">`. Each gradient SHALL appear as a `<GridListItem>`. The grid list SHALL carry the ARIA `grid` role and support keyboard navigation between items via arrow keys.

#### Scenario: Grid renders all visible gradients
- **WHEN** the index page loads with one or more gradients
- **THEN** each gradient is rendered as a `GridListItem` inside a `GridList` with `layout="grid"`

#### Scenario: Keyboard navigation between items
- **WHEN** a keyboard user focuses the grid list and presses an arrow key
- **THEN** focus moves to the adjacent grid item without a page reload

#### Scenario: Empty state
- **WHEN** no gradients are available
- **THEN** the grid list renders its `renderEmptyState` content (a prompt to create the first gradient)

### Requirement: Each grid item shows gradient preview, name, type, and creator
Each `GridListItem` SHALL display:
- A gradient preview swatch (full-width div with the CSS gradient as background)
- The gradient's name as the primary label (`<Text>`)
- The gradient type (linear / radial / conic) as a secondary description (`<Text slot="description">`)
- The creator attribution: `"By <user.name>"` if `creatorName` is non-null, or `"By Anonymous"` otherwise

#### Scenario: Creator name shown for owned gradient
- **WHEN** a gradient's `creatorName` is a non-null string
- **THEN** the item displays `"By <name>"` as part of its visible content

#### Scenario: Anonymous shown when no owner
- **WHEN** a gradient's `creatorName` is `null`
- **THEN** the item displays `"By Anonymous"`

### Requirement: Item activation navigates to gradient detail
Each gradient item SHALL be rendered using a `GridListItemLink` component created via `createLink(GridListItem)` from `@tanstack/react-router`. The `to` prop SHALL be set to `/gradient/$id` with `params={{ id: gradient.id }}` and `preload="intent"`. Navigation SHALL happen via a real link (no `onAction` callback).

#### Scenario: Click navigates to detail
- **WHEN** a user clicks a gradient item
- **THEN** the app navigates to `/gradient/<id>` via TanStack Router client-side navigation

#### Scenario: Keyboard activation navigates to detail
- **WHEN** a keyboard user focuses a gradient item and presses Enter or Space
- **THEN** the app navigates to `/gradient/<id>`

#### Scenario: Hover preloads the detail route
- **WHEN** a user hovers over a gradient item
- **THEN** the `/gradient/$id` route loader runs in the background (intent preload via `preload="intent"`)

### Requirement: Delete action available per item
Each `GridListItem` SHALL contain a delete `Button` child. Pressing it SHALL invoke `deleteGradientFn` for that gradient's `id` and invalidate the `['gradients']` query on success. The delete button SHALL NOT trigger item activation/navigation.

#### Scenario: Delete removes the gradient from the list
- **WHEN** a user activates the delete button on a gradient item
- **THEN** `deleteGradientFn` is called with the gradient's id and the grid list updates without the deleted item
