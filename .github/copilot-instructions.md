# Gradients — Copilot Instructions

## Tech Stack

- **Framework:** TanStack Start (SSR) + React 19 + TypeScript (strict)
- **Routing:** TanStack Router — file-based, `routeTree.gen.ts` is auto-generated, never edit it
- **Data fetching:** TanStack React Query (server state), useMutation + invalidateQueries pattern
- **Database:** Drizzle ORM + SQLite (`gradients.db` via `better-sqlite3`)
- **Validation:** Effect v4 Schemas — used for server function input validation
- **UI:** Tailwind CSS v4 (via `@tailwindcss/vite`), `react-aria-components` for accessible primitives
- **Build:** Vite 7; dev port **5005**

## Commands

```bash
pnpm dev           # Start dev server (http://localhost:5005)
pnpm build         # Production build
pnpm test          # Run tests (Vitest)
pnpm db:generate   # Generate Drizzle migrations from schema changes
pnpm db:migrate    # Apply pending migrations to gradients.db
```

## Architecture

```
src/
├── routes/         # File-based TanStack Router pages; $id for dynamic segments
├── server/         # TanStack Start server functions (createServerFn)
├── db/             # Drizzle schema (schema.ts) + sqlite client (index.ts)
├── components/     # Shared React components (PascalCase)
└── utils/          # Domain utilities (gradient naming engine, etc.)
drizzle/            # Auto-generated SQL migration files
openspec/           # Spec-driven development workflow (see below)
```

## Conventions

**Server functions** — defined with `createServerFn` in `src/server/`, named with `Fn` suffix:
```ts
export const saveGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeGradient) // Effect schema
  .handler(async ({ data }) => { ... })
```

**Import aliases** — use `#/*` (primary) or `@/*` (secondary), both map to `./src/*`:
```ts
import { db } from '#/db/index'
```

**React Query pattern** — always invalidate after mutations:
```ts
const mutation = useMutation({
  mutationFn: (g: Gradient) => saveGradientFn({ data: g }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gradients'] }),
})
```

**Effect v4 schemas** — define input shapes in `src/server/` using `Schema.Struct`, `Schema.Literal`, etc. Pass `Schema.decode(MySchema)` as `inputValidator`.

**Route guards** — redirect via TanStack Router's `beforeLoad` in the route file, reading auth context from `router.context`.

## OpenSpec Workflow

Feature changes follow a spec-driven process in `openspec/changes/{name}/`:
- `proposal.md` — why & what
- `design.md` — decisions, risks
- `specs/{area}/spec.md` — acceptance criteria
- `tasks.md` — step-by-step checklist

Use the prompts in `.github/prompts/` to work within this workflow:
- `opsx-propose.prompt.md` — propose a new change
- `opsx-apply.prompt.md` — implement tasks from the active change
- `opsx-explore.prompt.md` — explore/clarify before coding
- `opsx-archive.prompt.md` — archive a completed change

**Active change:** `add-better-auth-email-password` — adds email/password auth via `better-auth`. See `openspec/changes/add-better-auth-email-password/` for specs and tasks before touching auth-related code.

## Database

- Schema: `src/db/schema.ts` — single `gradients` table (id, name, type, angle, stops JSON, timestamps)
- After schema changes: run `pnpm db:generate` then `pnpm db:migrate`
- SQLite file is local: `gradients.db` (gitignored)
