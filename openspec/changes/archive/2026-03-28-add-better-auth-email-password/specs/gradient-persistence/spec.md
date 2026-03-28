## MODIFIED Requirements

### Requirement: Upsert a gradient
The system SHALL insert a new gradient or update an existing one (matched by `id`) in the SQLite database, with `ColorStop[]` serialized as JSON text. The `Gradient` input SHALL be validated with an Effect v4 `Schema.Struct` (including a nested `ColorStopSchema` array and a `GradientTypeSchema` union of literals) before any DB write occurs. When an authenticated session is present, the gradient's `owner_id` field SHALL be set to the current user's `id`; for unauthenticated requests, `owner_id` SHALL be `null`.

#### Scenario: Create new gradient
- **WHEN** `saveGradientFn` is called with a `Gradient` whose `id` does not exist in the database
- **THEN** a new row is inserted with all fields and the gradient is retrievable afterwards

#### Scenario: Update existing gradient
- **WHEN** `saveGradientFn` is called with a `Gradient` whose `id` already exists
- **THEN** the existing row is updated (all fields overwritten), and no duplicate rows are created

#### Scenario: Color stops serialization
- **WHEN** `saveGradientFn` is called with a `Gradient` containing a non-empty `stops` array
- **THEN** `stops` is stored as a valid JSON string, and reading back with `getGradientFn` or `loadGradientsFn` returns the same array

#### Scenario: Authenticated save sets owner_id
- **WHEN** `saveGradientFn` is called while a valid session cookie is present
- **THEN** the stored gradient row has `owner_id` equal to the session user's `id`

#### Scenario: Unauthenticated save leaves owner_id null
- **WHEN** `saveGradientFn` is called with no session cookie
- **THEN** the stored gradient row has `owner_id` set to `null`
