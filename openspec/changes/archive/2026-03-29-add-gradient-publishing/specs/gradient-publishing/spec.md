## ADDED Requirements

### Requirement: Publish a gradient
The system SHALL allow a user to publish a gradient, making it visible on the home page. Publishing SHALL insert a row into the `published_gradients` table with the `gradient_id` and `created_at` timestamp. Publishing an already-published gradient SHALL be idempotent (no duplicate rows, no error).

#### Scenario: Publish a gradient
- **WHEN** a user clicks the "Publish" button on an unpublished gradient
- **THEN** a row is inserted into `published_gradients` for that `gradient_id` and the gradient becomes visible on the home page

#### Scenario: Publish is idempotent
- **WHEN** `publishGradientFn` is called for a `gradient_id` that already has a row in `published_gradients`
- **THEN** the call completes without error and no duplicate rows are created

#### Scenario: UI reflects published state
- **WHEN** a gradient is published
- **THEN** the detail/editor view shows an "Unpublish" button (and hides the "Publish" button)

### Requirement: Unpublish a gradient
The system SHALL allow a user to unpublish a gradient, removing it from the home page. Unpublishing SHALL delete the row from `published_gradients` matching the given `gradient_id`. Unpublishing an already-unpublished gradient SHALL be idempotent (no error).

#### Scenario: Unpublish a gradient
- **WHEN** a user clicks the "Unpublish" button on a published gradient
- **THEN** the `published_gradients` row for that `gradient_id` is deleted; the gradient is no longer visible to other users on the home page, but still appears to the owner as a draft

#### Scenario: Unpublish is idempotent
- **WHEN** `unpublishGradientFn` is called for a `gradient_id` with no row in `published_gradients`
- **THEN** the call completes without error

#### Scenario: UI reflects unpublished state
- **WHEN** a gradient is unpublished
- **THEN** the detail/editor view shows a "Publish" button (and hides the "Unpublish" button)

### Requirement: Private gradient detail is inaccessible to non-owners
When a gradient has no row in `published_gradients`, the detail route (`/gradient/$id`) SHALL deny access to any user who is not the gradient's owner. The server function that fetches a single gradient SHALL check whether the gradient is published; if it is not, it SHALL return a 403/not-found response unless the requesting session belongs to the gradient's `owner_id`. Unauthenticated users SHALL never see unpublished gradients, even if they know the UUID.

#### Scenario: Unauthenticated user cannot view unpublished gradient
- **WHEN** an unauthenticated request is made for a gradient that has no row in `published_gradients`
- **THEN** the server returns a not-found or forbidden response, and the detail page is not rendered

#### Scenario: Non-owner authenticated user cannot view unpublished gradient
- **WHEN** an authenticated user whose `id` does not match the gradient's `owner_id` navigates to `/gradient/<uuid>` for an unpublished gradient
- **THEN** the server returns a not-found or forbidden response

#### Scenario: Owner can view their own unpublished gradient
- **WHEN** the authenticated user whose `id` matches the gradient's `owner_id` navigates to `/gradient/<uuid>` for an unpublished gradient
- **THEN** the gradient detail page is rendered normally with publish/unpublish controls

#### Scenario: Any user can view a published gradient
- **WHEN** any user (authenticated or not) navigates to `/gradient/<uuid>` for a gradient that has a row in `published_gradients`
- **THEN** the gradient detail page is rendered normally

### Requirement: Cascade delete on gradient removal
The system SHALL automatically delete the `published_gradients` row when the associated gradient is deleted, via an `ON DELETE CASCADE` foreign key constraint.

#### Scenario: Gradient deletion removes publish record
- **WHEN** a gradient that has a row in `published_gradients` is deleted via `deleteGradientFn`
- **THEN** the corresponding `published_gradients` row is also removed, with no orphaned records
