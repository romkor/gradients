## 1. Database Schema

- [x] 1.1 Add `publishedGradients` table to `src/db/schema.ts` with `gradientId` (FK → gradients.id, ON DELETE CASCADE) and `createdAt` columns
- [x] 1.2 Run `pnpm db:generate` to generate the migration SQL
- [x] 1.3 Run `pnpm db:migrate` to apply the migration to `gradients.db`

## 2. Server Functions

- [x] 2.1 Add `publishGradientFn` in `src/server/gradients.ts` — inserts into `published_gradients` using `INSERT OR IGNORE` (idempotent)
- [x] 2.2 Add `unpublishGradientFn` in `src/server/gradients.ts` — deletes the row from `published_gradients` for the given gradient ID (idempotent)
- [x] 2.3 Modify `loadGradientsFn` (or equivalent list function) to `INNER JOIN published_gradients` so only published gradients are returned, ordered by `published_gradients.created_at` descending
- [x] 2.4 Modify `getGradientFn` to include `isPublished` in the returned payload (LEFT JOIN `published_gradients`)
- [x] 2.5 Add access-control guard in `getGradientFn`: if the gradient is not published AND the session user is not the `owner_id`, throw a 403/not-found error

## 3. UI — Publish/Unpublish Toggle

- [x] 3.1 Add a publish/unpublish button to the gradient detail route (`src/routes/gradient/$id.tsx`) that calls `publishGradientFn` or `unpublishGradientFn` based on current state
- [x] 3.2 Wire the mutations with `useMutation` and `invalidateQueries` for `['gradients']` and `['gradient', id]` on success
- [x] 3.3 Display the correct button label ("Publish" when unpublished, "Unpublish" when published) based on the fetched `isPublished` state

## 4. Validation

- [x] 4.1 Add Effect v4 Schema validators for the `gradient_id` input in both `publishGradientFn` and `unpublishGradientFn`
- [x] 4.2 Confirm the home page (`src/routes/index.tsx`) no longer shows unpublished gradients after the query change
- [x] 4.3 Verify cascade delete: deleting a published gradient also removes its `published_gradients` row
- [x] 4.4 Verify unauthenticated users get a not-found/forbidden response when requesting an unpublished gradient by UUID
- [x] 4.5 Verify a non-owner authenticated user cannot access another user's unpublished gradient by UUID
