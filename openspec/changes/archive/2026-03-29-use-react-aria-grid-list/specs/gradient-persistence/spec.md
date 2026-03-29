## MODIFIED Requirements

### Requirement: List gradients from database
The system SHALL retrieve gradients from the SQLite database and return them as a typed `(Gradient & { isPublished: boolean; creatorName: string | null })[]` array, with `ColorStop[]` deserialized from the stored JSON text and `creatorName` resolved via a left join to the `user` table on `owner_id`.

Visibility rules (unchanged):
- **Unauthenticated users** see only published gradients.
- **Authenticated users** see all published gradients plus their own unpublished (draft) gradients.

#### Scenario: Creator name populated for owned gradient
- **WHEN** `loadGradientsFn` returns a gradient whose `owner_id` matches a row in the `user` table
- **THEN** `creatorName` equals the `user.name` string for that owner

#### Scenario: Creator name is null for anonymous gradient
- **WHEN** `loadGradientsFn` returns a gradient with `owner_id` set to `null`
- **THEN** `creatorName` is `null`

#### Scenario: Creator name is null when owner account is deleted
- **WHEN** `loadGradientsFn` returns a gradient whose `owner_id` references a user that no longer exists
- **THEN** `creatorName` is `null` (left join produces no match)
