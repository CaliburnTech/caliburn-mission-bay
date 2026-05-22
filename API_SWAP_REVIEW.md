# Static → API Data Swap Review

Branch: `stream-i-buyer-portal`

This document tracks which static data files have been replaced by real API calls, and flags every place where the UI assumes fields or endpoints the backend does not yet provide.

---

## Endpoints Wired (production mode, `VITE_APP_MODE=production`)

| UI Data | Adapter Method | Backend Endpoint |
|---------|---------------|-----------------|
| Capabilities list | `getCapabilities()` | `GET /marketplace/capabilities` |
| Platforms list | `getVessels()` | `GET /marketplace/platforms` |
| Analytics tracking | `recordEvent()` | `POST /marketplace/events` |
| Current user | `getMe()` | `GET /me` |
| Saved configurations | `getConfigs()` | `GET /configs` |
| Save configuration | `createConfig()` | `POST /configs` |
| Update configuration | `updateConfig()` | `PUT /configs/:id` |
| Delete configuration | `deleteConfig()` | `DELETE /configs/:id` |
| Garage items | `getGarage()` | `GET /garage` |
| Add to garage | `addToGarage()` | `POST /garage` |

---

## Endpoints Missing — Static Fallback Retained

| Data | Static Source File | Gap ID |
|------|-------------------|--------|
| Engineering stacks | `src/data/marketplaceData.js → engineeringStacks` | API_GAP-01 |
| Missions | `src/data/missionsData.js → initialMissions` | API_GAP-02 |
| Swarm squadrons | `src/data/fleetData.js → swarmSquadrons` | API_GAP-03 |
| Squadron unit configurations | `src/data/fleetData.js → squadronUnitConfigurations` | API_GAP-04 |
| Active deployments | `src/data/fleetData.js → activeDeployments` | API_GAP-05 |
| Marketplace squadrons | `src/data/marketplaceData.js → squadrons` | API_GAP-06 |
| Software catalog | `src/data/softwareCatalog.js` | API_GAP-07 |
| SV-2 templates | `src/data/sv2Templates.js` | API_GAP-08 |
| SV-2 layer map | `src/data/sv2LayerMap.js` | API_GAP-09 |
| Fleet vessels | `src/data/fleetVessels.js` | API_GAP-10 |

---

## Shape Gaps: API Returns vs. UI Expects

### Capabilities (`GET /marketplace/capabilities`)

The backend returns flat Prisma records. The adapter normalizes what it can.

| Field the UI uses | API status | Notes |
|-------------------|-----------|-------|
| `trl` (string `"TRL 6"`) | Normalized | Derived from integer `trlLevel` |
| `provider` (string) | Normalized | From `company.name` |
| `icon` (React component) | **API_GAP-11** | Always `null` — icon column in CapabilitiesView will be blank |
| `specs` (object) | **API_GAP-12** | Always `{}` — capability detail specs panel will be empty |
| `statImpacts` (SWaP effects) | **API_GAP-13** | Always `{}` — Outfitter stat bars show zero impact for API capabilities |
| `missionTags` | **API_GAP-14** | Always `[]` — MissionMatrix compatibility will not populate for API capabilities |
| `capabilityRefs` | **API_GAP-15** | Always `[]` — used by engineering stacks, which remain static |
| `components` | **API_GAP-16** | Always `[]` — detail modal components tab will be empty |
| `securityClearance` | **API_GAP-17** | Always `null` — security filter in FilterSidebar will not match |
| `swapData` | **API_GAP-18** | Always `null` — SWaP table in detail modal will be empty |

### Platforms (`GET /marketplace/platforms`)

| Field the UI uses | API status | Notes |
|-------------------|-----------|-------|
| `trl` / `provider` | Normalized | Same as capabilities |
| `icon` (React component) | **API_GAP-19** | Always `null` — vessel hull icon will not render |
| `speed`, `range`, `payload`, `endurance` | **API_GAP-20** | Undefined — VesselStatsDisplay shows 0 or blank |
| `mountPoints` | **API_GAP-21** | Undefined — OutfitterView / LoadoutBuilder cannot show mount points for API platforms |
| `platformType` (`USV`/`UAV`/etc.) | **API_GAP-22** | Undefined — maritime vs. aerial domain filter broken for API platforms |
| `lengthM`, `beamM`, `displacementTons` | **API_GAP-23** | Undefined — dimension specs blank |
| `propulsion` | **API_GAP-24** | Undefined — propulsion spec blank |
| `securityClassification` | **API_GAP-25** | Undefined — security badge will not render |
| `statImpacts` | **API_GAP-26** | Undefined — platform baseline stat display broken |

---

## Auth (Supabase — Phase 2 complete)

All production endpoints require a valid JWT in `Authorization: Bearer <token>`. The backend `api/_lib/auth.js` middleware validates it via the Supabase admin client (`getUser(token)`).

**Current state:** `AuthProvider.jsx` is fully wired to Supabase Auth. In production mode it:
1. Calls `supabase.auth.getSession()` on mount to hydrate any existing session
2. Passes the access token to `dataStore.initialize()` so the API adapter includes it in every request
3. Subscribes to `onAuthStateChange` to refresh the token on rotation and clean up on sign-out

**Environment variables required:**

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Browser (Vite) | `https://vmyuyljmycwtfpuwiusr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Browser (Vite) | `sb_publishable_xECPZXdl1JBnmh4ERIjDdg_gbfQeC8_` |
| `SUPABASE_URL` | Server (Vercel env) | same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (Vercel env) | from Supabase Dashboard → Settings → API |
| `SUPABASE_WEBHOOK_SECRET` | Server (Vercel env) | arbitrary secret, set in Supabase DB webhook config |

**User sync:** Supabase Database Webhook → `POST /api/auth/webhook`
Configure in Supabase Dashboard → Database → Webhooks: table `auth.users`, events `INSERT` + `UPDATE`.

**Pending schema migration:** `User.cognitoSub` stores the Supabase UUID. Should be renamed to `authId` once all streams merge.

---

## How to Activate Production Mode

1. Create `.env.local`:
   ```
   VITE_APP_MODE=production
   VITE_API_URL=https://api.missionbay.caliburn.us
   VITE_SUPABASE_URL=https://vmyuyljmycwtfpuwiusr.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xECPZXdl1JBnmh4ERIjDdg_gbfQeC8_
   ```
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_WEBHOOK_SECRET` in Vercel project settings (or `.env.local` for local API dev).
3. Enable the Supabase Database Webhook pointing at `/api/auth/webhook`.

Demo mode (`VITE_APP_MODE=demo`) is unaffected and continues using all static data.

---

## Files Changed in This Branch

| File | Change |
|------|--------|
| `src/providers/apiAdapter.js` | Full rewrite — real `fetch()` for all wired endpoints; static fallbacks for the rest; shape normalization |
| `src/providers/dataStore.js` | Added delegated store methods: `getMe`, `getConfigs`, `createConfig`, `updateConfig`, `deleteConfig`, `getGarage`, `addToGarage`, `recordEvent` |
| `src/auth/AuthProvider.jsx` | Real Supabase Auth integration (replaces Clerk placeholder) |
| `src/auth/supabaseClient.js` | New — Supabase browser client singleton |
| `src/App.jsx` | Demo mode calls `initialize()` directly; production mode defers to `AuthProvider` |
| `api/_lib/auth.js` | Supabase JWT verification via admin client (replaces Clerk placeholder) |
| `api/auth/webhook.js` | Supabase database webhook handler (replaces Clerk/svix webhook) |
| `.env.example` | Replaced `VITE_API_BASE_URL` + `VITE_CLERK_PUBLISHABLE_KEY` with `VITE_API_URL` + Supabase vars |
| `eslint.config.js` | Added `apps/**` to lint ignore list (dist bundles from other streams caused false positives) |
| `package.json` | Removed `@clerk/backend`, `@clerk/clerk-react`; added `@supabase/supabase-js` |
| `API_SWAP_REVIEW.md` | This document |
