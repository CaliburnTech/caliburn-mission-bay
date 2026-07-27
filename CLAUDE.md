# Caliburn Mission Bay Marketplace

## What
Defense marketplace SPA for configuring autonomous maritime/aerial platforms with capabilities, loadouts, and mission planning.

## Active work: Autonomous Strike Group missions 01–04
There is an implementation-ready spec at **`docs/AUTONOMOUS_STRIKE_GROUP_MISSION_PLAN.md`**. Read it before doing any work on missions, mission roles, the capability catalog, or vessel hulls.

It specifies four new missions — Magazine Depth (`MAGAZINE_DEPTH`), Contested Logistics (`CONTESTED_LOGISTICS_MOTHERSHIP`), Theater ASW (`THEATER_ASW`), Standoff MCM (`STANDOFF_MCM`) — built to match the five Caliburn pitch decks in the user's `LCS Planning` folder. `MDA_MOTHERSHIP` is the already-built fifth mission and the reference implementation for the pattern. All five are filterable together via a new `Autonomous Strike Group` entry in `NAVY_GROUPS`.

The spec contains: the seven-file anatomy of a mission in this codebase, launch-gate and SWaP mechanics, paste-ready mission records / role rosters / flow templates, the `Helicopter` platform-type plumbing, a build sequence, and a verification checklist. It also records eight bugs found while verifying it (section 12) — read that section before trusting any capability or hull name you have not grepped yourself.

Two standing notes from that work: **`MissionMatrix.jsx` is dead code** (render site commented out in `MarketplacePage.jsx`, retained on request) so do not add `missionTags` or `platformTypes` for it; and **`missionCategories` in `marketplaceData.js` is unused** — grouping is done via `NAVY_GROUPS` in `MissionConfigView.jsx`.

## Stack
React 19 (JSX) | Vite 7 | Tailwind CSS 4 | Zustand 5 | Leaflet | Lucide React | jsPDF
TypeScript strict checking enabled on JS source files (tsconfig strict: true, source is .jsx/.js)

## Commands
- `npm run dev` — local dev server (Vite)
- `npm run build` — production build (lint + typecheck + tsc + vite build)
- `npm run test` — full test suite (vitest run)
- `npm run test:watch` — watch mode tests
- `npm run test:ci` — lint + typecheck + tests
- `npm run lint` — ESLint check
- `npm run lint:fix` — ESLint auto-fix
- `npm run typecheck` — TypeScript type checking (no emit; root TS files — run `npx prisma generate` first)
- `npm run typecheck:apps` — type-check apps/admin and apps/maker

## Structure
```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Root: splash page ↔ marketplace (hash routing)
├── components/               # React components (PascalCase files)
│   ├── MarketplacePage.jsx   # Main app shell, view switching
│   ├── ShipyardView.jsx      # Vessel hull browser + fleet management
│   ├── OutfitterView.jsx     # Mount-point configuration (drag-drop)
│   ├── MissionPlanner.jsx    # Mission table ↔ config views
│   ├── MissionMatrix.jsx     # DEAD CODE — render site commented out in MarketplacePage.jsx
│   ├── LoadoutBuilder.jsx    # Capability browser + slot equipping
│   ├── mission-planner/      # Mission planner sub-components
│   ├── loadout/              # Loadout sub-components
│   ├── variations/           # Configuration variation modals
│   ├── shared/               # Reusable badges (TRL, Security)
│   └── ui/                   # Generic UI primitives (Modal)
├── store/                    # Zustand stores (one per domain)
│   ├── navigationStore.js    # View routing, history, fleet sub-tabs
│   ├── outfitterStore.js     # Hull selection, mount points, equipment
│   ├── filterStore.js        # Search terms, category/security filters
│   ├── uiStore.js            # Cart, expanded state, UI toggles
│   ├── squadronStore.js      # Squadron creation, vessel assignment
│   ├── deploymentStore.js    # Deployment flow state
│   ├── configurationStore.js # Capability config helpers
│   └── missionStore.js       # Mission data management
├── providers/                # Data adapters: staticAdapter (demo) | apiAdapter (production)
├── data/                     # Static data (capabilities, vessels, missions, fleet)
├── constants/colors.js       # Design system: category colors, status, brand
├── hooks/                    # Custom hooks (drag-drop)
└── assets/images/            # Vessel images, logos, backgrounds
```

## Backend & Sub-apps
Beyond `src/` (the buyer SPA above), the repo contains:
- `api/` — Vercel serverless functions (plain JavaScript ESM). Prisma → Supabase Postgres, Supabase auth token verification. Shared helpers in `api/_lib/`.
- `apps/admin/` — Admin console, TypeScript + Vite, own `package.json`/`node_modules`. Deployed at https://caliburn-marketplace-admin.vercel.app.
- `apps/maker/` — Maker portal, TypeScript + Vite, own `package.json`/`node_modules`. Deployed at https://mission-bay-maker.vercel.app.
- `prisma/` — `schema.prisma`, migrations (schema of record), `seed.ts`.
- `_archive/` — retired code (gitignored): old edge functions, `src/lib`, infra, backups. Do not resurrect from here.

`src/` uses `.jsx` default exports; `apps/` use TypeScript named exports — both conventions are deliberate (see `docs/conventions.md`). Run `npm run typecheck:apps` for the sub-apps.

## Conventions
### React/Vite-Specific
- Functional components only, arrow function style
- PascalCase component files, camelCase everything else
- Import order: React → libraries → local stores → local components → assets
- Tailwind CSS 4 for styling (via `@tailwindcss/vite` plugin)
- Hash-based routing (no router library) — `window.location.hash`

### State Management
- One Zustand store per domain — never mix concerns across stores
- Stores use `create((set, get) => ({...}))` pattern
- localStorage persistence for navigation state (with safe wrapper for private browsing)

### Data Layer
- Static data in `src/data/` — capability specs, vessel hulls, missions
- Centralized color constants in `src/constants/colors.js` — never hardcode hex in components
- Icon mappings via Lucide React + custom SVG icons in `MilitaryIcons.jsx`

### Testing
- Vitest + Testing Library + jsdom
- Mock stores with `vi.mock()` — mock at store boundary, not internals
- Test files co-located: `Component.test.jsx` next to `Component.jsx`

### Quality Gates
- Pre-commit hook: ESLint + TypeScript typecheck (via Husky)
- ESLint: strict JSX formatting rules (spacing, wrapping, boolean values, fragments)
- `no-unused-vars` ignores uppercase/underscore-prefixed names

## Key Files
- Entry: `src/main.jsx` → `src/App.jsx`
- Config: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`
- Main shell: `src/components/MarketplacePage.jsx`
- Data: `src/data/marketplaceData.js` (capabilities + stacks), `src/data/vesselData.js` (hulls + mounts)
- Design tokens: `src/constants/colors.js`

## When Stuck
- For mission work of any kind, start with `docs/AUTONOMOUS_STRIKE_GROUP_MISSION_PLAN.md` — section 2 documents every file a mission touches
- For a reference mission implementation, look at `src/components/mission-planner/MDAMothershipMissionView.jsx` plus its entries in `constants.js`, `missionsData.js`, `missionRoles.js`, and `marketplaceData.js`
- For component patterns, look at `src/components/MissionPlanner.jsx` (clean view-switching)
- For store patterns, look at `src/store/navigationStore.js` (Zustand + localStorage)
- For data shape, look at `src/data/marketplaceData.js` (capability/stack schema)
- Deploy config: `.vercel/project.json`
