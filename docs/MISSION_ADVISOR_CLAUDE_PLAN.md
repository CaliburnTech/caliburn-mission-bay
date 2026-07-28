# Mission Advisor — Claude API in Mission Bay

## Implementation plan

**Date:** 27 July 2026
**Repo:** `Mission Bay Backend/caliburn-marketplace`
**Approved scope (Alex, 27 Jul 2026):** features 1–3 below. Briefing generator and live demo narrator were considered and **rejected** — do not build them.

---

## 1. Scope and intent

Put a Claude-backed assistant inside Mission Bay that answers grounded questions about the missions, payloads, and vehicles on screen. Three features, in build order:

1. **Ask-the-Mission panel** — a chat drawer in each of the five Autonomy Mission Series mission views. A reviewer asks "why doesn't the LCS ever fire?" or "what does CAPTAS-4 do here?" and gets an answer grounded in that mission's actual role and catalog data.
2. **Loadout Advisor** — in the config page (LoadoutBuilder), explains why a readiness requirement is unmet and suggests which catalog capability would satisfy it, checked against the hull's real SWaP capacity.
3. **Swap Consequence Explainer** — in SwapVesselModal, answers "what do I gain/lose swapping hull X for hull Y in this role?" from real capacity and capability numbers.

### Design principle (non-negotiable)

The assistant answers **only from the context it is handed** and declines anything else. The worst demo outcome is Claude confidently contradicting the pitch. The system prompt must instruct: answer from the provided mission data; if the answer is not in the data, say so briefly; never invent specs, TRLs, or program facts; match the measured, confident voice of the pitch decks (no hype, no hedging).

---

## 2. Cost estimate (Tiffany's rule — up front)

Per question: ~8,000 chars of mission context + question ≈ 2,300 input tokens; answer capped at 1,024 output tokens, typically ~300.

| Model | Per question | 500 q/month | 2,000 q/month |
|---|---|---|---|
| claude-haiku-4-5 ($1/$5 per Mtok) | ~$0.004 | ~$2 | ~$8 |
| claude-sonnet-4-5 ($3/$15 per Mtok) | ~$0.012 | ~$6 | ~$24 |

**Recommendation:** default `claude-haiku-4-5`, overridable via env var `ADVISOR_MODEL`. Either model is far under the $50/month flag at any plausible demo volume. The real cost risk is not usage, it is an abused public endpoint — see §4 auth decision and rate limits.

---

## 3. What already exists (verified against the code, 27 Jul 2026)

This repo already has most of the plumbing. **Do not rebuild any of this.**

| Asset | Location | Verified facts |
|---|---|---|
| Anthropic server proxy | `api/ai/chat.js` | POST `/api/ai/chat`. `@anthropic-ai/sdk` already a dependency. Model fixed server-side (`claude-sonnet-4-5`), `MAX_TOKENS 2048`, rate limit 20/min/IP via `assertRateLimitKey`, body caps: 50 messages, 32,000 total content chars, **`system` capped at 4,000 chars**. Key resolution: caller's company key (`Company.anthropicKeyEnc`, decrypted server-side) → env `ANTHROPIC_API_KEY` → 503. **`auth: 'user'`** — requires an authenticated session. |
| Route wrapper | `api/_lib/handler.js` | `withHandler(fn, { auth })` with modes `'none' | 'user' | 'seller' | 'admin'`, CORS, JSON error envelope. |
| Rate limiter | `api/_lib/rateLimit.js` | In-memory sliding window per IP, per-instance best-effort (documented as NOT a security boundary; Upstash/KV if hard limits ever needed). |
| Existing AI chat UI precedent | `src/components/shared/AIChat.jsx` | The SV-2 editor's chat panel. Dual mode: authenticated → server proxy `/api/ai/chat`; unauthenticated demo → **browser Anthropic SDK with a user-supplied key in localStorage** (`caliburn-anthropic-api-key`). This is the house pattern for demo-mode AI. Note it hardcodes an older model string (`claude-sonnet-4-20250514`) for browser mode. |
| Mission data (context sources) | `src/data/missionsData.js` (`initialMissions`), `src/data/missionRoles.js` (`MISSION_ROLES`), `src/data/marketplaceData.js` (`individualCapabilities`, `missionFlowTemplates`), `src/data/vesselData.js` (`vesselHullData`, `VESSEL_SLOT_CAPACITY`) | Everything the advisor needs is client-side structured data, already imported by the views. |
| Readiness logic | `src/utils/missionReadiness.js` | `getMissionReadiness`, `meetsRequirements`, `isHullSwapEligible`, and **exported** `CAP_CATEGORY_TO_SLOT`. |
| Shared mission-series strings | `src/components/mission-planner/autonomySeriesShared.js` | `ORCHESTRATION_LAYER`, `SUCCESS_CRITERIA` — feed these into context so answers echo the deck's framing. |
| The five mission views | `src/components/mission-planner/{MagazineDepth,ContestedLogisticsMothership,TheaterASW,StandoffMCM,MDAMothership}MissionView.jsx` | Identical header/sidebar structure (cloned from a common pattern); each declares `MISSION_SET_KEY` and `VESSEL_ROSTER`. |
| Swap modal | `src/components/mission-planner/SwapVesselModal.jsx` | Receives `missionKey`, `roleKey`, `currentHullName`; computes SWaP eligibility per candidate. |
| Config page | `src/components/LoadoutBuilder.jsx` | 4-column grid (mission-sets rail is column 4); `missingRequiredCategories` already computed; TempestOS is exempt from slots (locked OS banner). |

### Two constraints that shape the design

1. **The 4,000-char `system` cap on `/api/ai/chat`.** Mission context will not fit in `system`. Therefore context travels as the **first user message** (32,000-char total budget ≈ 8k tokens — comfortable), and the small guardrail prompt goes in `system`.
2. **`auth: 'user'` on the existing endpoint.** The mission planner demo runs unauthenticated. Decision required (§4).

---

## 4. Architecture

```
┌──────────────────────────── Browser (React SPA) ────────────────────────────┐
│                                                                             │
│  MissionView ──┐                                                            │
│  LoadoutBuilder├── buildXxxContext()  ──►  MissionAdvisorChat (drawer UI)   │
│  SwapModal ────┘   src/utils/advisorContext.js       │                      │
│                    (compact plain-text digest         │ POST question +     │
│                     of mission/loadout/swap data)     │ context             │
└───────────────────────────────────────────────────────┼─────────────────────┘
                                                        ▼
                                    api/ai/mission-advisor.js  (NEW, Vercel fn)
                                    · auth: 'none' + rate limit 10/min/IP
                                    · guardrail system prompt lives HERE
                                    · model: ADVISOR_MODEL env (default haiku)
                                    · key: env ANTHROPIC_API_KEY only
                                                        │
                                                        ▼
                                              Anthropic Messages API
```

**Decision needed from Alex before build (endpoint auth):**

- **Option A (recommended): new public endpoint** `api/ai/mission-advisor.js`, `auth: 'none'`, tight limits (10 req/min/IP, `MAX_TOKENS 1024`, max 12 messages, 20k context chars). Demo audiences need zero setup. Cost exposure if someone scripts against it is bounded by rate limit and Haiku pricing; can add Vercel KV rate limiting later if abused.
- **Option B: reuse `/api/ai/chat` (auth-gated) + AIChat.jsx's localStorage-key fallback for demos.** Zero new backend, but demo mode means pasting an API key into the browser — clumsy on stage.

The plan below assumes Option A. If Alex picks B, skip §5.1 and wire the client to `/api/ai/chat` with the dual-mode pattern copied from `AIChat.jsx`.

---

## 5. The build, file by file

### 5.1 New endpoint — `api/ai/mission-advisor.js`

Clone the shape of `api/ai/chat.js` (validation style, error envelope, rate limiting) with these differences:

- `withHandler(fn, { auth: 'none' })`
- `RATE_LIMIT = { limit: 10, windowMs: 60_000, bucket: 'mission-advisor' }`
- `MODEL = process.env.ADVISOR_MODEL || 'claude-haiku-4-5'`, `MAX_TOKENS = 1024`
- Key from env `ANTHROPIC_API_KEY` only (no company-key lookup, no prisma import — keep this function dependency-free so it cold-starts fast)
- The **guardrail system prompt is a server-side constant** (client cannot override it; ignore any `system` field in the body):

> You are the Mission Advisor inside Caliburn's Mission Bay. Answer questions using ONLY the mission data provided in the first message. Ground every claim in that data — quote SWaP numbers, role requirements, and capability descriptions from it. If the data does not contain the answer, say so in one sentence; never invent specifications, TRLs, vendors, or program facts. Keep answers short (2–6 sentences), concrete, and in a measured professional voice. Never contradict the provided data.

- Body: `{ context: string, messages: [{role, content}] }`; server assembles `messages = [{ role:'user', content: MISSION DATA:\n${context} }, { role:'assistant', content:'Understood — I will answer only from this mission data.' }, ...messages]`. Caps: context ≤ 20,000 chars, ≤ 12 turns, each turn ≤ 2,000 chars.
- Response: `{ reply, usage }` (non-streaming v1, same as chat.js; streaming is a later polish).

### 5.2 Context builders — `src/utils/advisorContext.js` (NEW)

Pure functions, no React. Each returns a compact plain-text digest, budget ≤ 18,000 chars. Reuse, don't restate: pull from `initialMissions`, `MISSION_ROLES`, `individualCapabilities`, `vesselHullData`, `VESSEL_SLOT_CAPACITY`, `CAP_CATEGORY_TO_SLOT`, `SUCCESS_CRITERIA`, `ORCHESTRATION_LAYER`.

- `buildMissionContext(missionSetKey)` — mission record essentials (name, objectives, squadronComposition, whyThisConfig, escalationTriggers, threat); every role (label, description, requirements, default/suggested hulls); for each capability in any role: name, provider, category, subType, swap weight/power, first ~200 chars of description; for each hull: type, platformType, speed/range, capacity; the mission's SUCCESS_CRITERIA. Trim descriptions, never truncate names or numbers.
- `buildLoadoutContext(hull, activeConfig, missionSetKey, roleKey)` — hull specs + slot capacity, equipped capabilities per slot, the role's requirements, and the current readiness verdict (call `getMissionReadiness` / reuse `missingRequiredCategories` logic). Include remaining SWaP headroom (capacity minus equipped sum). Also include a short list of catalog capabilities that WOULD satisfy each unmet requirement and fit remaining SWaP — computed in JS, so Claude explains rather than searches.
- `buildSwapContext(missionSetKey, roleKey, currentHullName, candidateHullName)` — both hulls' full specs and capacities, the role's capability list with summed SWaP, eligibility verdict for each hull (reuse `isHullSwapEligible`), platform-domain notes (aerial vs maritime).

### 5.3 Advisor UI — `src/components/shared/MissionAdvisorChat.jsx` (NEW)

One reusable drawer/panel component, visually consistent with the mission views (dark, compact, same border/typography idioms). Props:

- `contextText` (string), `title`, `accentColor`, `suggestedQuestions` (array of 3 canned questions rendered as tappable chips), `prefill` (optional first question, used by the swap explainer).

Behavior: maintains message list in component state; POSTs `{ context, messages }` to `/api/ai/mission-advisor`; renders replies as plain text (no markdown dependency needed v1); loading spinner; graceful 429/503 error strings ("Advisor is rate-limited, try again in a minute" / "Advisor not configured"). No localStorage, no API keys in the browser.

### 5.4 Feature 1 — mount in the five mission views

Each mission view header gets a small "Ask the Advisor" button (Sparkles icon, matches each view's accent color) toggling the drawer. Context = `buildMissionContext(MISSION_SET_KEY)` — memoize once per mount. Suggested questions per mission, e.g. Magazine Depth: "Why does the LCS never fire?", "What does the Mk 70 PDS carry?", "What happens when an M48 runs empty?" Keep the drawer overlay consistent with the existing mobile log overlay pattern already in these views.

### 5.5 Feature 2 — Loadout Advisor in `LoadoutBuilder.jsx`

Mount point: the mission-sets column (4th grid column), below the Configure-for-Mission panel. Same `MissionAdvisorChat` component with `contextText = buildLoadoutContext(...)` rebuilt when the loadout changes (memo on `activeConfig`, `selectedHull`, applied mission/role). Canned chips: "Why isn't this loadout ready?", "What should I add to meet requirements?", "How much SWaP headroom is left?" When `missingRequiredCategories` is non-empty, show a one-line nudge on the panel ("2 requirements unmet — ask why").

### 5.6 Feature 3 — Swap explainer in `SwapVesselModal.jsx`

Lightest possible integration: each candidate row gets a small "?" / "explain" affordance. Clicking opens `MissionAdvisorChat` (modal-over-modal is clumsy — prefer replacing the modal body with the chat view and a back button) with `contextText = buildSwapContext(...)` and `prefill = "What changes if I swap the ${currentHullName} for the ${candidateHullName} in this role?"` so the first answer appears with one click.

### 5.7 Env & deploy

- Vercel project env: `ANTHROPIC_API_KEY` (already referenced by chat.js — confirm it is set in Vercel, not just locally), optional `ADVISOR_MODEL`.
- No schema, no Supabase, no new packages (`@anthropic-ai/sdk` already installed).

---

## 6. Build order

| Phase | Work | Demo checkpoint |
|---|---|---|
| 1 | `advisorContext.js` + unit test that every mission's context builds under budget and mentions every role capability by name | — |
| 2 | `api/ai/mission-advisor.js` + local test with `vercel dev` or curl | curl returns grounded answer |
| 3 | `MissionAdvisorChat.jsx` + mount in ONE view (Standoff MCM — simplest) | **stop, show Alex** |
| 4 | Mount in remaining four views | — |
| 5 | Loadout Advisor (feature 2) | — |
| 6 | Swap explainer (feature 3) | **stop, show Alex** |

---

## 7. Verification checklist

1. `npm run lint` and `npm run build` clean (Vercel fails deploys on ESLint errors).
2. **No API key in the client bundle:** grep `dist/` for `sk-ant` and `ANTHROPIC` after build.
3. Context budget: automated test builds all five mission contexts, asserts < 20,000 chars each and that every role capability name appears.
4. Grounding spot-checks per mission: ask (a) something in the data ("what does the AN/AQS-20C do here?"), (b) something answerable only by synthesis ("why one ping?"), (c) something NOT in the data ("what's the unit cost of the MH-60R?") — (c) must produce a decline, not an invention.
5. Rate limit: 11th request in a minute returns 429 with the friendly client message.
6. The existing SV-2 `AIChat.jsx` and `/api/ai/chat` still work untouched.
7. Mobile: drawer usable at phone widths (mission views already have a mobile overlay pattern to copy).

---

## 8. Open items needing Alex's decision

1. **Endpoint auth** — Option A (new public endpoint, rate-limited; recommended) vs Option B (login + browser-key fallback). §4.
2. **Model** — Haiku 4.5 default (recommended, ~$2/mo at demo volumes) or Sonnet 4.5 (~3× cost, noticeably better prose).
3. **Placement taste** — header button + right drawer is proposed; Alex may prefer a floating button. Cheap to change, decide at the phase-3 checkpoint.

## 9. Known gotchas for the implementing agent

- The mission views are five near-identical files; keep the advisor mount identical across them (same insertion points) or maintenance gets painful.
- `system` on the existing chat endpoint caps at 4,000 chars — that is WHY context goes in the user turn on the new endpoint. Do not "fix" this by raising the cap on `/api/ai/chat`.
- `marketplaceData.js` imports lucide-react icons; do NOT import it from the API function (bundles React deps into a lambda). Context building stays client-side.
- Repo history shows Vercel builds fail on lint errors — run the full lint, not just changed files.
- Do not add `missionTags`/`platformTypes` to capabilities and do not touch `MissionMatrix.jsx` (dead code, standing rule).
- TempestOS Core Platform is intentionally absent from slots and roster chips; the advisor context should still mention it as the OS layer (pull the one-liner from `ORCHESTRATION_LAYER`).
