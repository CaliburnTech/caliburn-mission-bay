import { test, expect } from '@playwright/test';

/**
 * Maker portal smoke tests — https://mission-bay-maker.vercel.app
 *
 * Public tests (no creds): login page renders, auth-gated routes fall back
 * to the login screen.
 *
 * Authenticated tests: a full signup requires a real mailbox (Supabase magic
 * link / email confirmation), so the login flow only runs when
 * E2E_MAKER_EMAIL and E2E_MAKER_PASSWORD are provided for an existing
 * password-based account.
 */

const MAKER_URL = process.env.E2E_MAKER_URL ?? 'https://mission-bay-maker.vercel.app';
const EMAIL = process.env.E2E_MAKER_EMAIL;
const PASSWORD = process.env.E2E_MAKER_PASSWORD;
const HAS_CREDS = Boolean(EMAIL && PASSWORD);

test.describe('maker portal — public', () => {
  test('login page renders with password and magic-link modes', async ({ page }) => {
    await page.goto(MAKER_URL);

    await expect(page.getByRole('heading', { name: 'Maker Portal' })).toBeVisible();

    // Mode switcher tabs.
    await expect(page.getByRole('button', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: /magic link/i })).toBeVisible();

    // Password form fields + submit.
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('magic-link mode asks for email only', async ({ page }) => {
    await page.goto(MAKER_URL);

    await page.getByRole('button', { name: /magic link/i }).click();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('auth-gated routes fall back to the login screen', async ({ page }) => {
    // Deep-link to an inner page; unauthenticated visitors must see the
    // login card regardless of the hash route.
    await page.goto(`${MAKER_URL}/#products`);

    await expect(page.getByRole('heading', { name: 'Maker Portal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});

test.describe('maker portal — authenticated', () => {
  test.skip(
    !HAS_CREDS,
    'Set E2E_MAKER_EMAIL and E2E_MAKER_PASSWORD to exercise the maker login flow'
  );

  test('logs in and lands in onboarding, pending-approval, or the portal', async ({ page }) => {
    await page.goto(MAKER_URL);

    await page.locator('input[type="email"]').fill(String(EMAIL));
    await page.locator('input[type="password"]').fill(String(PASSWORD));
    await page.getByRole('button', { name: 'Sign in' }).click();

    // The login card must give way to a signed-in state.
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeHidden({ timeout: 20000 });

    // Depending on the account's lifecycle stage we land on one of:
    //  - onboarding (User row exists but no company yet — company is created
    //    via /api/auth/complete-onboarding, not auto-created at signup)
    //  - a pending-approval state (company is PENDING_APPROVAL)
    //  - the portal itself (approved seller)
    const onboarding = page.getByText(/onboarding|get started|company name|welcome/i);
    const pending = page.getByText(/pending approval|awaiting approval|under review|pending review/i);
    const portal = page.getByText(/my products|add product/i);
    await expect(onboarding.or(pending).or(portal).first()).toBeVisible({ timeout: 20000 });
  });
});
