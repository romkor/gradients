## 1. Install Dependencies

- [x] 1.1 Add `drizzle-orm` and `better-sqlite3` to `dependencies` in `package.json`
- [x] 1.2 Add `drizzle-kit` and `@types/better-sqlite3` to `devDependencies` in `package.json`
- [x] 1.3 Add `"better-sqlite3"` to `pnpm.onlyBuiltDependencies` in `package.json`
- [x] 1.4 Add `"db:generate": "drizzle-kit generate"` and `"db:migrate": "drizzle-kit migrate"` to `scripts` in `package.json`
- [x] 1.5 Add `effect@4.0.0-beta.42` to `dependencies` in `package.json`
- [x] 1.6 Run `pnpm install` and confirm it completes without errors

## 2. Drizzle Configuration and Schema

- [x] 2.1 Create `drizzle.config.ts` at the project root with `dialect: "sqlite"`, `schema: "./src/db/schema.ts"`, `out: "./drizzle"`, `dbCredentials: { url: "./gradients.db" }`
- [x] 2.2 Create `src/db/schema.ts` defining the `gradients` table with columns: `id` (TEXT, PK), `name` (TEXT), `type` (TEXT), `angle` (INTEGER), `stops` (TEXT, JSON), `created_at` (INTEGER), `updated_at` (INTEGER)
- [x] 2.3 Create `src/db/index.ts` that instantiates `Database` from `better-sqlite3`, wraps it with `drizzle(sqlite, { schema })`, and exports `db`

## 3. Generate and Apply Migrations

- [x] 3.1 Run `pnpm db:generate` and confirm a numbered SQL file is created under `drizzle/`
- [x] 3.2 Run `pnpm db:migrate` and confirm `gradients.db` is created with the `gradients` table

## 4. Server Functions

- [x] 4.1 Create `src/server/gradients.ts` with `loadGradientsFn` — `createServerFn` that selects all rows from `gradients`, parses `stops` JSON, returns `Gradient[]`
- [x] 4.2 Add `getGradientFn` to `src/server/gradients.ts` — `createServerFn` with `id: string` input validated via `Schema.decodeUnknownSync(Schema.String)`, selects by ID, parses stops, returns `Gradient | undefined`
- [x] 4.3 Add `saveGradientFn` to `src/server/gradients.ts` — `createServerFn` with `Gradient` input validated via `Schema.decodeUnknownSync(GradientSchema)` (Effect v4 `Schema.Struct` with nested `ColorStopSchema` and `GradientTypeSchema`), stringifies stops, inserts with `onConflictDoUpdate` for all non-PK columns
- [x] 4.4 Add `deleteGradientFn` to `src/server/gradients.ts` — `createServerFn` with `id: string` input validated via `Schema.decodeUnknownSync(Schema.String)`, deletes the matching row

## 5. Update Routes

- [x] 5.1 Update `src/routes/index.tsx`: replace `loadGradients` import with `loadGradientsFn`, replace `deleteGradient` with `deleteGradientFn`, make `mutationFn` async
- [x] 5.2 Update `src/routes/gradient/$id.tsx`: replace `getGradient` with `getGradientFn`, replace `saveGradient` with `saveGradientFn`, make `mutationFn` async
- [x] 5.3 Update `src/routes/gradient/new.tsx`: replace `saveGradient` with `saveGradientFn`, make `mutationFn` async

## 6. Cleanup

- [x] 6.1 Remove `src/utils/storage.ts` (or replace its exports with stubs that throw, to surface any lingering call sites)
- [x] 6.2 Add `gradients.db` to `.gitignore` if not already present

## 7. Verification

- [x] 7.1 Run `pnpm dev` and confirm the app starts without errors
- [ ] 7.2 Create a new gradient in the UI and verify it appears in the list
- [ ] 7.3 Reload the page and confirm the gradient is still visible (confirming SQLite persistence, not localStorage)
- [ ] 7.4 Edit an existing gradient and save — confirm changes persist after reload
- [ ] 7.5 Delete a gradient and confirm it is removed from the list and from the database (`sqlite3 gradients.db "select * from gradients"`)
