# Architecture

## Overview
Three deployed applications sharing one backend:

| App | Source | URL |
|---|---|---|
| Buyer marketplace (React 19 SPA, JSX) | `src/` | https://caliburn-marketplace.vercel.app |
| Admin console (TypeScript) | `apps/admin/` | https://caliburn-marketplace-admin.vercel.app |
| Maker portal (TypeScript) | `apps/maker/` | https://mission-bay-maker.vercel.app |

The backend is a set of Vercel serverless functions in `api/` (plain JavaScript ESM) using Prisma over Supabase Postgres. Supabase provides auth, storage, and Postgres only — edge functions were retired to `_archive/`. Buyers browse vessel hulls, configure loadouts with payload capabilities, plan missions, and manage squadrons; makers submit products; admins review them.

## Layer Diagram
```
┌─────────────────────────────────────────────┐
│  App.jsx (hash routing: splash ↔ marketplace)│
├─────────────────────────────────────────────┤
│  MarketplacePage.jsx (view switcher + nav)   │
├──────┬──────┬──────┬──────┬──────┬──────────┤
│Shipyard│Outfitter│Loadout│Mission│Mission  │CapView│
│ View   │  View   │Builder│Planner│ Matrix  │       │
├──────┴──────┴──────┴──────┴──────┴──────────┤
│  Zustand Stores (domain stores)              │
├─────────────────────────────────────────────┤
│  Data Providers (src/providers)              │
│  staticAdapter (demo) │ apiAdapter (prod)    │
├───────────────────────┴─────────────────────┤
│  Vercel API (api/, Node ESM)  ← also used by │
│  apps/admin and apps/maker                   │
├─────────────────────────────────────────────┤
│  Prisma → Supabase Postgres (RLS on all      │
│  tables) · Supabase Auth · Supabase Storage  │
└─────────────────────────────────────────────┘
```

## View Navigation Flow
```
Splash Page → (hash change) → MarketplacePage
  ├── #shipyard     → ShipyardView (hull browser, fleet grid)
  │     └── select hull → #outfitter → OutfitterView (mount config)
  ├── #capabilities → CapabilitiesView (capability catalog)
  ├── #loadout      → LoadoutBuilder (slot-based equipping)
  ├── #missions     → MissionPlanner (library ↔ config)
  ├── #matrix       → MissionMatrix (capability × mission grid)
  └── #stacks       → StacksView (engineering stack combos)
```

## State Architecture
Domain-specific Zustand stores with no cross-store dependencies at the store level. Components compose from multiple stores as needed.

| Store | Responsibility |
|---|---|
| `navigationStore` | Current view, history stack, fleet sub-tabs, URL sync |
| `outfitterStore` | Selected hull, mount points, equipment slots, capability details |
| `filterStore` | Search terms, category filters, security level filters |
| `uiStore` | Cart contents, expanded panels, modal visibility |
| `squadronStore` | Squadron CRUD, vessel assignment, management modal state |
| `deploymentStore` | Deployment flow wizard state |
| `configurationStore` | Capability config helpers, category keys |
| `missionStore` | Mission data, objectives, flow templates |

## Key Decisions
1. **Hash routing over React Router** — simple view switching, no nested routes needed. Navigation state persists in localStorage + URL hash.
2. **Zustand over Context** — multiple independent state domains. Avoids Context re-render cascading.
3. **Adapter pattern for data access** — components never call the network directly; they go through the provider layer in `src/providers` (`dataInterface.js` / `dataStore.js`). Demo mode (`VITE_APP_MODE=demo`) uses `staticAdapter` — bundled, in-memory data from `src/data/`, no auth, no API calls. Production uses `apiAdapter`, which calls the Vercel API in `api/`.
4. **Vercel serverless API over Supabase edge functions** — the `api/` functions (plain JS ESM) own all business logic; retired edge functions live in `_archive/`. Prisma (with `@prisma/adapter-pg`) connects to Supabase Postgres; Supabase is used for auth, storage, and Postgres only.
5. **Prisma migrations as schema of record** — `prisma/migrations/` 0001–0004 define the live PascalCase schema, with row-level security enabled on all tables (including `SavedConfiguration` as of 0004).
6. **JSX with TS checking in `src/`; full TypeScript in `apps/`** — the buyer SPA stays .jsx, while `apps/admin` and `apps/maker` are strict TypeScript with their own tsconfigs.
7. **Leaflet for maps** — mission planning uses interactive map with zone editing and waypoints.

## Data Flow
```
Demo mode:  src/data/ → staticAdapter → components
Production: components → apiAdapter → api/ (Vercel) → Prisma → Supabase Postgres
Auth:       Supabase Auth issues JWT → sent as Bearer token → verified in api/
User Actions → Zustand store.set() → React re-renders subscribed components
Navigation → hash change → navigationStore → view switch
Persistence → navigationStore ↔ localStorage (safe wrapper for private browsing)
```

## Deployment
- **Platform**: Vercel — three projects: buyer SPA + `api/` (root), `apps/admin`, `apps/maker`
- **Build**: `prisma generate && tsc && vite build` with prebuild lint + typecheck
- **Pre-commit**: Husky runs ESLint + TypeScript typecheck
- **CI**: `.github/workflows/ci.yml` — lint, typecheck, tests, build at root; `tsc --noEmit` for each sub-app
