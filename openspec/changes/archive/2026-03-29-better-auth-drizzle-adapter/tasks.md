## 1. Schema

- [x] 1.1 Add `user` table to `src/db/schema.ts` with columns: `id` (text PK), `name` (text), `email` (text unique), `emailVerified` (boolean), `image` (text nullable), `createdAt` (integer), `updatedAt` (integer)
- [x] 1.2 Add `session` table to `src/db/schema.ts` with columns: `id` (text PK), `expiresAt` (integer), `token` (text unique), `createdAt` (integer), `updatedAt` (integer), `ipAddress` (text nullable), `userAgent` (text nullable), `userId` (text FK → user.id)
- [x] 1.3 Add `account` table to `src/db/schema.ts` with columns: `id` (text PK), `accountId` (text), `providerId` (text), `userId` (text FK → user.id), `accessToken` (text nullable), `refreshToken` (text nullable), `idToken` (text nullable), `accessTokenExpiresAt` (integer nullable), `refreshTokenExpiresAt` (integer nullable), `scope` (text nullable), `password` (text nullable), `createdAt` (integer), `updatedAt` (integer)
- [x] 1.4 Add `verification` table to `src/db/schema.ts` with columns: `id` (text PK), `identifier` (text), `value` (text), `expiresAt` (integer), `createdAt` (integer nullable), `updatedAt` (integer nullable)

## 2. Auth Config

- [x] 2.1 In `src/lib/auth.ts`, import `drizzleAdapter` from `better-auth/adapters/drizzle` and `* as schema` from `#/db/schema`
- [x] 2.2 Replace `database: new Database('./gradients.db')` with `database: drizzleAdapter(db, { provider: 'sqlite', schema })` and import `db` from `#/db/index`
- [x] 2.3 Remove the `import Database from 'better-sqlite3'` line from `auth.ts`

## 3. Migration

- [x] 3.1 Run `pnpm db:generate` to generate the migration SQL for the new auth tables
- [x] 3.2 Run `pnpm db:migrate` to apply the migration to `gradients.db`

## 4. Verification

- [x] 4.1 Start dev server (`pnpm dev`) and confirm it starts without errors
- [x] 4.2 Register a new user and confirm the session cookie is set and user is redirected to the index page
