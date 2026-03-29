## 1. Dependency

- [x] 1.1 Add `uuid` package: `pnpm add uuid` (and `pnpm add -D @types/uuid`)

## 2. ID Generation

- [x] 2.1 Replace `generateId()` in `src/utils/gradient.ts` to import `{ v7 as uuidv7 }` from `uuid` and call `uuidv7()` instead of `crypto.randomUUID()`
- [x] 2.2 In `src/lib/auth.ts`, add `advanced: { database: { generateId: () => v7() } }` to the `betterAuth` config (importing `{ v7 }` from `uuid`)

## 3. Verification

- [x] 3.1 Start the dev server and create a new gradient; confirm the generated `id` matches the UUID v7 format (`xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx`)
- [x] 3.2 Create two gradients in sequence and confirm the second `id` is lexicographically greater than the first
