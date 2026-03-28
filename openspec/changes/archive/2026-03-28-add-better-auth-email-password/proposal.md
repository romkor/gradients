## Why

The app currently has no user authentication, meaning gradients are shared globally and cannot be scoped to individual users. Adding email/password auth via `better-auth` enables private gradient libraries, personalized experiences, and a foundation for future social features.

## What Changes

- Add `better-auth` as a dependency with the SQLite adapter
- Add `users`, `sessions`, `accounts`, and `verifications` tables to the database schema via Drizzle
- Expose auth API routes (`/api/auth/**`) from the TanStack Start server
- Add registration (sign-up) and login (sign-in) pages with email/password forms
- Add auth session context so client-side code can access the current user
- Add a sign-out action reachable from the Header
- Gradient routes remain publicly readable; creation/editing requires authentication

## Capabilities

### New Capabilities

- `user-auth`: Email/password registration, login, logout, and session management using better-auth with the built-in SQLite adapter

### Modified Capabilities

- `gradient-persistence`: Gradients will optionally track an `ownerId` field; create/update operations will associate the gradient with the authenticated user when present

## Impact

- **Dependencies**: adds `better-auth` (and its peer `@better-auth/sqlite` or built-in adapter)
- **Database**: new tables generated via `drizzle-kit generate` + `drizzle-kit migrate`
- **Routes**: new `/login` and `/register` routes; new server route handler at `/api/auth/[...all]`
- **Schema**: `gradients` table gains optional `owner_id` column
- **Server**: auth handler must be wired into the TanStack Start server entry
- **UI**: Header gains Sign In / Sign Out controls; protected routes redirect unauthenticated users
