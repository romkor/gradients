## MODIFIED Requirements

### Requirement: User can register with email and password
The system SHALL allow a visitor to create a new account by providing a name, email address, and password. Registration SHALL be handled by `better-auth`'s email/password plugin via the `/api/auth/sign-up/email` endpoint. Duplicate emails SHALL be rejected with a descriptive error. The `id` assigned to the new user record SHALL be a UUID v7 string.

#### Scenario: Successful registration
- **WHEN** a visitor submits the registration form with a unique email and a valid password
- **THEN** a new user record is created, a session cookie is set, and the user is redirected to the index page

#### Scenario: Duplicate email rejected
- **WHEN** a visitor submits the registration form with an email that already exists
- **THEN** the server returns an error and the form displays a message indicating the email is taken

#### Scenario: Missing required fields
- **WHEN** a visitor submits the registration form with an empty email or password
- **THEN** client-side validation prevents submission and highlights the invalid fields

#### Scenario: New user ID is UUID v7
- **WHEN** a visitor successfully registers
- **THEN** the created user's `id` is a valid UUID v7 string (format `xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx`)

### Requirement: User can sign in with email and password
The system SHALL allow a registered user to sign in by providing their email and password via the `/api/auth/sign-in/email` endpoint. Invalid credentials SHALL be rejected without revealing which field is wrong. The `id` assigned to the new session record SHALL be a UUID v7 string.

#### Scenario: Successful sign-in
- **WHEN** a registered user submits the login form with correct credentials
- **THEN** a session cookie is issued and the user is redirected to the index page

#### Scenario: Invalid credentials rejected
- **WHEN** a user submits the login form with an incorrect password or unknown email
- **THEN** the server returns an error and the form displays a generic "Invalid email or password" message

#### Scenario: Already signed-in user visits login page
- **WHEN** a user with an active session navigates to `/login`
- **THEN** they are redirected to the index page

#### Scenario: New session ID is UUID v7
- **WHEN** a user successfully signs in
- **THEN** the created session's `id` is a valid UUID v7 string
