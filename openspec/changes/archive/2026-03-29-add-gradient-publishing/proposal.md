## Why

Gradients are currently always public and visible to all users, giving creators no control over visibility. Adding publish/unpublish functionality lets users share only the gradients they're ready to show, keeping drafts or personal experiments private.

## What Changes

- Add a `published_gradients` table with `gradient_id` (FK to gradients) and `created_at` columns
- The home page (gradient listing) shows only gradients with a record in `published_gradients`
- Users can publish a gradient (insert into `published_gradients`) from the gradient detail or editor view
- Users can unpublish a gradient (delete from `published_gradients`), hiding it from the home page
- A gradient's "published" state is surfaced in the UI (publish/unpublish toggle/button)

## Capabilities

### New Capabilities
- `gradient-publishing`: Publish and unpublish gradients; tracking visibility via the `published_gradients` join table; filtering the home feed to only published gradients

### Modified Capabilities
- `gradient-persistence`: The home-page listing now filters by published status instead of returning all gradients

## Impact

- **Database**: New `published_gradients` table; new Drizzle migration required
- **Server functions**: `listGradients` (or equivalent) query gains a join/filter; new `publishGradient` and `unpublishGradient` server functions
- **UI**: Home page (`routes/index.tsx`) only renders published gradients; gradient detail/editor (`routes/gradient/$id.tsx`, `components/GradientEditor.tsx`) gains publish/unpublish controls
- **No breaking API changes** for existing gradient CRUD
