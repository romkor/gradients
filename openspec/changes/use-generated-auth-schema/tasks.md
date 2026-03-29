## 1. Clean up `src/db/schema.ts`

- [x] 1.1 Remove all commented-out auth table stubs (`user`, `session`, `account`, `verification`) from `schema.ts`

## 2. Rename Drizzle object keys in `src/db/auth.ts` to plural

- [x] 2.1 Rename `user` → `users` (keep `sqliteTable('user', ...)` SQL name unchanged)
- [x] 2.2 Rename `session` → `sessions` (keep `sqliteTable('session', ...)`)
- [x] 2.3 Rename `account` → `accounts` (keep `sqliteTable('account', ...)`)
- [x] 2.4 Rename `verification` → `verifications` (keep `sqliteTable('verification', ...)`)
- [x] 2.5 Update all internal cross-references in `auth.ts` (FK `.references(() => users.id)`, relations fields)

## 3. Update `src/lib/auth.ts` — adapter config

- [x] 3.1 Import `* as authSchema from '#/db/auth'` in `auth.ts`
- [x] 3.2 Replace `schema` in `drizzleAdapter` with the merged object `{ ...schema, ...authSchema }` (or import the full merged schema)
- [x] 3.3 Add `usePlural: true` to the `drizzleAdapter` options

## 4. Database migration

- [x] 4.1 Run `pnpm db:generate` and review the produced migration SQL for correctness
- [x] 4.2 Run `pnpm db:migrate` to apply the migration to `gradients.db`

## 5. Verification

- [x] 5.1 Start dev server (`pnpm dev`) and confirm no startup errors
- [x] 5.2 Smoke-test user registration flow end-to-end (new account created, session cookie set)
- [x] 5.3 Smoke-test sign-in flow end-to-end (existing user can authenticate)
