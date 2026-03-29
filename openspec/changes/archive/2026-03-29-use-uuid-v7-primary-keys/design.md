## Context

The gradients app uses `crypto.randomUUID()` (UUID v4) to generate primary keys for `Gradient` and `ColorStop` records. UUID v4 keys are completely random 128-bit values. When inserted into SQLite's B-tree index they land at arbitrary positions, causing page splits and read-amplification over time. UUID v7 (RFC 9562) encodes a 48-bit Unix millisecond timestamp in the most-significant bits, making each new key larger than the previous one. This means new rows always append to the rightmost leaf of the index, eliminating page splits for inserts.

The change is entirely in the ID-generation layer (`generateId()`). The database column type stays as `text`; no migration of existing rows is required.

## Goals / Non-Goals

**Goals:**
- Replace UUID v4 ID generation with UUID v7 for `Gradient` and `ColorStop` records
- Keep IDs sortable by insertion time from the ID value alone
- Zero-downtime: existing UUID v4 IDs continue to be valid and readable

**Non-Goals:**
- Migrating existing stored IDs to UUID v7 format
- Changing the column type in the database schema
- Changing ID generation for `better-auth` user/session tables (managed by the library)
- Introducing client-visible sort guarantees based on ID ordering

## Decisions

### Decision: Use the `uuid` npm package

**Choice:** Add `uuid` (MIT, ~200 M weekly downloads) as a runtime dependency and call `v7()` inside `generateId()`.

**Alternatives considered:**
- **Roll our own UUID v7**: UUID v7 bit-layout is straightforward but getting monotonicity within the same millisecond correct (counter sub-field) is subtle. Using a well-tested package avoids subtle bugs.
- **Use `uuidv7` package**: Purpose-built and smaller (<1 kB), but far less adopted. `uuid` is the de-facto standard and supports v7 since v9.0.
- **Use Node.js `crypto.randomUUID` waiting for v7 support**: As of Node 22, the Web Crypto API only exposes `randomUUID()` (v4). No native v7 yet.

### Decision: Only update `generateId()` and `advanced.database.generateId` — no schema or migration changes

The `id` column is declared as `text` in Drizzle schema, compatible with both UUID versions. Existing rows with v4 IDs are unaffected. New rows get v7 IDs. Mixed ID formats in the same table are acceptable because IDs are opaque identifiers, not compared across rows.

`better-auth` exposes `advanced.database.generateId` — a callback invoked for every insert into its managed tables (user, session, account, verification). Returning `v7()` from this callback applies UUID v7 uniformly across all auth tables with a single config change.

## Risks / Trade-offs

- **Mixed ID formats**: After the change, the table will contain both v4 and v7 IDs. Sorting by `id` text will not produce a consistent creation-time order for the pre-existing v4 rows. → Mitigation: The app already sorts by the `created_at` column; ID sort order is not relied upon in any query.
- **Monotonicity leaks creation time**: UUID v7's timestamp prefix reveals approximately when a record was created. → Mitigation: Acceptable for a personal/demo app; IDs are not used as security tokens.
- **New dependency**: Adds one package to the bundle. → Mitigation: `uuid` is mature and widely used; it's a frequent transitive dep in Node ecosystems so its cost may already be paid.
