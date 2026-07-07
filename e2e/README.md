# End-to-end tests (Playwright)

Smoke tests against the three deployed apps. With **zero configuration** the
suite runs the public smoke paths (splash/demo marketplace, login pages,
API health/CORS contract) against production. Providing credentials unlocks
deeper authenticated flows — tests that need creds are skipped otherwise, so
the suite always passes meaningfully.

## Setup

```bash
npm install                      # installs @playwright/test (devDependency)
npx playwright install chromium  # one-time: download the browser binary
```

## Run

```bash
npm run test:e2e                 # all specs, chromium
npx playwright test e2e/api-health.spec.ts   # a single spec
npx playwright show-report                   # inspect failures/traces
```

Retries are set to 1 with `trace: 'on-first-retry'`, so any flaky failure
produces a trace you can open with `npx playwright show-trace`.

## Environment variables

| Variable | Default / behavior |
|---|---|
| `E2E_MAIN_URL` | Buyer SPA + `/api/*`. Default `https://caliburn-marketplace.vercel.app` |
| `E2E_MAKER_URL` | Maker portal. Default `https://mission-bay-maker.vercel.app` |
| `E2E_ADMIN_URL` | Admin portal. Default `https://caliburn-marketplace-admin.vercel.app` |
| `E2E_MAKER_EMAIL` / `E2E_MAKER_PASSWORD` | Optional. Existing maker account (password login). Unlocks the maker login → onboarding / pending-approval / portal test. Unset → skipped. |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Optional. Caliburn super-admin (`@caliburn.us`, on `SUPER_ADMIN_EMAILS` if configured). Unlocks admin login → pending approvals → submissions (+ delete button) test. Unset → skipped. |

Full maker **signup** (as opposed to login) requires a real mailbox for the
Supabase magic link / confirmation email, so it is intentionally not automated;
provision a password-based test account once and reuse it via the env vars.

## Spec inventory

| Spec | Coverage |
|---|---|
| `main-app.spec.ts` | Splash loads → enter marketplace (demo mode) → browse capabilities → vessel Configure → outfitter |
| `maker-portal.spec.ts` | Login page (password + magic-link modes), auth-gated redirect; with creds: login → onboarding / pending-approval / portal |
| `admin-portal.spec.ts` | Login page; with creds: login → Pending Approvals → Demo Submissions (delete action visible) |
| `api-health.spec.ts` | `GET /api/health` 200 JSON; unauthenticated `GET /api/me` 401 (not 500); `OPTIONS /api/configurations` 204 + CORS headers |

## Conventions

- Prefer `getByRole` / `getByText` over CSS classes — resilient to styling churn.
- Every credentialed block uses `test.skip(!HAS_CREDS, ...)` so a creds-less
  run reports skips, not failures.
- `e2e/` and `playwright.config.ts` are intentionally outside the root
  tsconfig `include` and the ESLint file globs; keep spec files free of
  TypeScript-only syntax (the ESLint `*.spec.ts` glob parses them with espree).
