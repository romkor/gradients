# user-auth Specification

## Purpose
Email/password authentication using better-auth with session management via TanStack Router context.

## Requirements

### Requirement: User can register with email and password
The system SHALL allow a visitor to create a new account by providing a name, email address, and password. Registration SHALL be handled by `better-auth`'s email/password plugin via the `/api/auth/sign-up/email` endpoint. Duplicate emails SHALL be rejected with a descriptive error.

#### Scenario: Successful registration
- **WHEN** a visitor submits the registration form with a unique email and a valid password
- **THEN** a new user record is created, a session cookie is set, and the user is redirected to the index page

#### Scenario: Duplicate email rejected
- **WHEN** a visitor submits the registration form with an email that already exists
- **THEN** the server returns an error and the form displays a message indicating the email is taken

#### Scenario: Missing required fields
- **WHEN** a visitor submits the registration form with an empty email or password
- **THEN** client-side validation prevents submission and highlights the invalid fields

---

### Requirement: User can sign in with email and password
The system SHALL allow a registered user to sign in by providing their email and password via the `/api/auth/sign-in/email` endpoint. Invalid credentials SHALL be rejected without revealing which field is wrong.

#### Scenario: Successful sign-in
- **WHEN** a registered user submits the login form with correct credentials
- **THEN** a session cookie is issued and the user is redirected to the index page

#### Scenario: Invalid credentials rejected
- **WHEN** a user submits the login form with an incorrect password or unknown email
- **THEN** the server returns an error and the form displays a generic "Invalid email or password" message

#### Scenario: Already signed-in user visits login page
- **WHEN** a user with an active session navigates to `/login`
- **THEN** they are redirected to the index page

---

### Requirement: User can sign out
The system SHALL allow an authenticated user to end their session by triggering the sign-out action. The session cookie SHALL be invalidated server-side.

#### Scenario: Successful sign-out
- **WHEN** an authenticated user clicks the Sign Out control in the Header
- **THEN** the session is invalidated, the cookie is cleared, and the user is redirected to the index page as a guest

---

### Requirement: Session is available server-side in root loader
The system SHALL read the current user session in the TanStack Router root route `beforeLoad` using `auth.api.getSession`. The resulting `user` object (or `null`) SHALL be passed into TanStack Router context so all child routes and components can access it without additional fetches.

#### Scenario: Authenticated request
- **WHEN** an authenticated user loads any page
- **THEN** the root loader resolves with a `user` object containing at minimum `id`, `email`, and `name`

#### Scenario: Unauthenticated request
- **WHEN** a visitor with no session cookie loads any page
- **THEN** the root loader resolves with `user: null`

---

### Requirement: Header reflects authentication state
The system SHALL update the Header component to display a "Sign In" link when the user is unauthenticated and a "Sign Out" button when authenticated.

#### Scenario: Unauthenticated header
- **WHEN** a visitor views any page
- **THEN** the Header shows a "Sign In" link pointing to `/login`

#### Scenario: Authenticated header
- **WHEN** an authenticated user views any page
- **THEN** the Header shows the user's name or email and a "Sign Out" button

---

### Requirement: New gradient route requires authentication
The system SHALL protect the `/gradient/new` route so that unauthenticated users are redirected to `/login`.

#### Scenario: Unauthenticated user visits new gradient page
- **WHEN** a visitor without a session navigates to `/gradient/new`
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated user visits new gradient page
- **WHEN** an authenticated user navigates to `/gradient/new`
- **THEN** the page renders normally
