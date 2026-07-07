# Caliburn Mission Bay Marketplace

Defense marketplace for configuring autonomous maritime and aerial platforms. Buyers browse vessel hulls, outfit mount points with payload capabilities, build loadouts, and plan missions; makers submit products; admins review and approve.

## Deployed apps

| App | Path | URL |
|---|---|---|
| Buyer marketplace (SPA) | `src/` | https://caliburn-marketplace.vercel.app |
| Admin console | `apps/admin/` | https://caliburn-marketplace-admin.vercel.app |
| Maker portal | `apps/maker/` | https://mission-bay-maker.vercel.app |

## Architecture

- **Buyer SPA** — React 19 + Vite, JavaScript/JSX, Zustand stores, Tailwind CSS 4. Data access goes through an adapter layer in `src/providers`: demo mode uses `staticAdapter` (bundled/in-memory data, no backend), production mode uses `apiAdapter` (calls the Vercel API). Mode is selected with `VITE_APP_MODE`.
- **API** — Vercel serverless functions in `api/` (plain JavaScript ESM). Prisma (with `@prisma/adapter-pg`) talks to Supabase Postgres; Supabase issues auth tokens which the API verifies.
- **Sub-apps** — `apps/admin` and `apps/maker` are standalone TypeScript + Vite apps with their own `package.json`, deployed as separate Vercel projects. They authenticate with Supabase and call the same `api/` endpoints.
- **Supabase** — provides auth, storage, and Postgres only. Edge functions were retired (see `_archive/`, untracked). The Prisma migrations in `prisma/migrations/` (0001–0004) are the schema of record; row-level security is enabled on all tables.

## Repository layout

```
api/            Vercel serverless functions (Node ESM) + api/_lib helpers
apps/admin/     Admin console (TypeScript + Vite, own node_modules)
apps/maker/     Maker portal (TypeScript + Vite, own node_modules)
src/            Buyer SPA (React 19, JSX)
  providers/    Data adapter layer (staticAdapter | apiAdapter)
  store/        Zustand stores (one per domain)
  components/   React components
prisma/         schema.prisma, migrations/, seed.ts
supabase/       Supabase CLI config
backend/        Payload-provider content assets (logos, overviews)
docs/           Architecture and conventions docs
_archive/       Retired code (gitignored): edge functions, src/lib, infra, backups
```

## Local development

```bash
npm install
npx prisma generate        # generates the Prisma client (also run after schema changes)
cp .env.example .env.local # fill in values; VITE_APP_MODE=demo needs no backend
npm run dev                # buyer SPA at http://localhost:5173
```

Sub-apps have their own dependencies and `.env.example`:

```bash
cd apps/admin && npm install && npm run dev   # same for apps/maker
```

The `api/` functions run under `vercel dev` (or are exercised against the deployed API); they read `DATABASE_URL` and the Supabase server-side vars — see `.env.example` for the full list.

## Commands (repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server for the buyer SPA |
| `npm run build` | `prisma generate` + `tsc` + `vite build` (prebuild runs lint + typecheck) |
| `npm run lint` / `lint:fix` | ESLint over the whole repo (src, api, apps) |
| `npm run typecheck` | Type-checks root TS files (`vite.config.ts`, `prisma.config.ts`, `prisma/seed.ts`) |
| `npm run typecheck:apps` | Type-checks `apps/admin` and `apps/maker` |
| `npm run test` / `test:watch` | Vitest (jsdom) |
| `npm run test:ci` | lint + typecheck + tests |
| `npm run test:e2e` | Playwright e2e smoke suite against the deployed apps |

## End-to-end tests

Playwright specs in `e2e/` run against the three deployed apps (or any
environment via `E2E_MAIN_URL` / `E2E_MAKER_URL` / `E2E_ADMIN_URL`). With no
credentials the suite covers the public smoke paths (demo marketplace, login
pages, `/api/health` + CORS contract); setting `E2E_MAKER_EMAIL/PASSWORD` and
`E2E_ADMIN_EMAIL/PASSWORD` unlocks the authenticated maker and admin flows —
credentialed tests are skipped otherwise.

```bash
npx playwright install chromium   # one-time browser download
npm run test:e2e
```

See `e2e/README.md` for the full env-var reference and spec inventory. The
e2e suite is standalone tooling: it is intentionally outside the root
tsconfig `include` list and the ESLint globs.

## Database migrations

The live database is the PascalCase Prisma schema; `prisma/migrations/` is the source of truth.

```bash
npx prisma migrate dev --name my_change   # create + apply a migration locally
npx prisma migrate deploy                 # apply pending migrations (production)
npx prisma db seed                        # seed reference data (prisma/seed.ts)
```

Migrations run over the direct (non-pooled) connection — set `DIRECT_URL` (see `prisma.config.ts`); the runtime API uses the pooled `DATABASE_URL`.

## More docs

- `docs/architecture.md` — system architecture and key decisions
- `docs/conventions.md` — code style and conventions
- `CLAUDE.md` — orientation for AI coding agents
