# Architecture

## Overview
Single-page React application for defense capability marketplace. Users browse vessel hulls, configure loadouts with payload capabilities, plan missions, and manage squadrons.

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
│  Zustand Stores (8 domain stores)            │
├─────────────────────────────────────────────┤
│  Static Data Layer (src/data/*.js)           │
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
Eight domain-specific Zustand stores with no cross-store dependencies at the store level. Components compose from multiple stores as needed.

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
3. **Static data files over API** — all capability/vessel data is bundled. No backend API.
4. **JSX with TS checking** — get type safety benefits without full TypeScript migration. `tsconfig.json` strict mode catches issues at build time.
5. **Leaflet for maps** — mission planning uses interactive map with zone editing and waypoints.

## Data Flow
```
Static Data (src/data/) → Components read directly
User Actions → Zustand store.set() → React re-renders subscribed components
Navigation → hash change → navigationStore → view switch
Persistence → navigationStore ↔ localStorage (safe wrapper for private browsing)
```

## Deployment
- **Platform**: Vercel (`.vercel/project.json` config)
- **Build**: `tsc && vite build` with prebuild lint + typecheck
- **Pre-commit**: Husky runs ESLint + TypeScript typecheck
