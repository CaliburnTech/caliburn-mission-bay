/**
 * Playwright end-to-end configuration.
 *
 * Targets the three deployed apps by default; override with env vars:
 *   E2E_MAIN_URL  — buyer SPA + /api/*  (default: https://caliburn-marketplace.vercel.app)
 *   E2E_MAKER_URL — maker portal        (default: https://mission-bay-maker.vercel.app)
 *   E2E_ADMIN_URL — admin portal        (default: https://caliburn-marketplace-admin.vercel.app)
 *
 * With no credentials set, only public smoke tests run. Optional creds
 * (E2E_MAKER_EMAIL/PASSWORD, E2E_ADMIN_EMAIL/PASSWORD) unlock deeper flows.
 * See e2e/README.md.
 *
 * Note: this file and e2e/ are deliberately outside the root tsconfig
 * `include` list and the ESLint file globs — the e2e suite is standalone
 * tooling and is not part of the app build/lint surface.
 */
import { defineConfig, devices } from '@playwright/test';

const MAIN_URL = process.env.E2E_MAIN_URL ?? 'https://caliburn-marketplace.vercel.app';

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: MAIN_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
