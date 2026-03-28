## 1. Install and configure better-auth

- [x] 1.1 Add `better-auth` to dependencies (`pnpm add better-auth`)
- [x] 1.2 Create `src/lib/auth.ts` — instantiate `betterAuth` with the `betterSqlite3` adapter pointing at `gradients.db` and `emailAndPassword: { enabled: true }`
- [x] 1.3 Create `src/lib/auth-client.ts` — instantiate `createAuthClient` with `baseURL` pointing at `/api/auth`
- [x] 1.4 Run `better-auth`'s migration to create `user`, `session`, `account`, and `verification` tables in `gradients.db`

## 2. Database — add owner_id to gradients

- [x] 2.1 Add `owner_id` (nullable text) column to the `gradients` table in `src/db/schema.ts` with a reference to `user(id)`
- [x] 2.2 Run `pnpm db:generate` to produce the migration SQL
- [x] 2.3 Run `pnpm db:migrate` to apply the migration

## 3. Auth API route

- [x] 3.1 Create `src/routes/api/auth/$.ts` (or the TanStack Start catch-all equivalent) that forwards all requests to `auth.handler(request)`
- [ ] 3.2 Verify `/api/auth/sign-up/email` and `/api/auth/sign-in/email` respond via `curl` or browser dev tools

## 4. Root route — session in loader and router context

- [x] 4.1 Update `src/routes/__root.tsx` loader to call `auth.api.getSession({ headers: request.headers })` and return `{ user }`
- [x] 4.2 Extend the TanStack Router context type to include `user: User | null`
- [ ] 4.3 Verify `useRouteContext` exposes `user` in child routes

## 5. Login and register pages

- [x] 5.1 Create `src/routes/login.tsx` with an email/password form that calls `authClient.signIn.email()`; redirect to `/` on success; show error message on failure
- [x] 5.2 Create `src/routes/register.tsx` with a name/email/password form that calls `authClient.signUp.email()`; redirect to `/` on success; show error on duplicate email
- [x] 5.3 Add a redirect-if-authenticated guard in both login and register loaders (redirect to `/` when `user` is not null)

## 6. Header — auth controls

- [x] 6.1 Update `src/components/Header.tsx` to read `user` from router context
- [x] 6.2 Show "Sign In" link (`/login`) when `user` is null
- [x] 6.3 Show user name/email and a "Sign Out" button when `user` is set; button calls `authClient.signOut()` then navigates to `/`

## 7. Protect new gradient route

- [x] 7.1 Add a loader guard in `src/routes/gradient/new.tsx` that redirects unauthenticated users to `/login`

## 8. Attach owner_id when saving gradients

- [x] 8.1 Update `saveGradientFn` in `src/server/gradients.ts` to read the session from request headers via `auth.api.getSession`
- [x] 8.2 Set `owner_id` to `session.user.id` when a session is present, otherwise `null`

## 9. Verification

- [ ] 9.1 Register a new user via the `/register` form and confirm redirect + session cookie
- [ ] 9.2 Sign out and sign back in via `/login`; confirm session cookie is refreshed
- [ ] 9.3 Attempt login with wrong password; confirm generic error message is shown
- [ ] 9.4 Navigate to `/gradient/new` while logged out; confirm redirect to `/login`
- [ ] 9.5 Create a gradient while authenticated; confirm `owner_id` is set in the database row
- [ ] 9.6 Create a gradient while unauthenticated (temporarily remove guard); confirm `owner_id` is `null`
