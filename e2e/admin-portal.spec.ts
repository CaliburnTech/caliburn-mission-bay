import { test, expect } from '@playwright/test';

/**
 * Admin portal smoke tests — https://caliburn-marketplace-admin.vercel.app
 *
 * Public tests (no creds): login page renders.
 *
 * Authenticated tests run only when E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are
 * provided. The account must be a Caliburn super-admin (@caliburn.us email,
 * and on the SUPER_ADMIN_EMAILS allowlist if one is configured) — otherwise
 * the portal shows "Access denied" and these tests fail by design.
 */

const ADMIN_URL = process.env.E2E_ADMIN_URL ?? 'https://caliburn-marketplace-admin.vercel.app';
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HAS_CREDS = Boolean(EMAIL && PASSWORD);

test.describe('admin portal — public', () => {
  test('login page renders', async ({ page }) => {
    await page.goto(ADMIN_URL);

    await expect(page.getByRole('heading', { name: 'Caliburn Admin' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});

test.describe('admin portal — authenticated', () => {
  test.skip(
    !HAS_CREDS,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (a @caliburn.us super-admin) to exercise the admin flows'
  );

  test('super-admin sees pending approvals and the submissions list', async ({ page }) => {
    await page.goto(ADMIN_URL);

    await page.locator('input[type="email"]').fill(String(EMAIL));
    await page.locator('input[type="password"]').fill(String(PASSWORD));
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Default landing page after login is the Pending Approvals queue.
    await expect(
      page.getByRole('heading', { name: 'Pending Approvals' })
    ).toBeVisible({ timeout: 20000 });

    // Sidebar navigation renders the other admin sections.
    await expect(page.getByRole('button', { name: 'Companies' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Audit Log' })).toBeVisible();

    // Submissions page loads.
    await page.getByRole('button', { name: /submissions/i }).click();
    await expect(page.getByRole('heading', { name: /submissions/i })).toBeVisible();

    // Each submission row exposes a delete action; only assert it when the
    // list is non-empty (empty state shows "No submissions yet").
    const emptyState = page.getByText(/no submissions yet/i);
    const loadingRow = page.getByText('Loading…');
    await expect(loadingRow).toBeHidden({ timeout: 20000 });

    if (await emptyState.isVisible().catch(() => false)) {
      test.info().annotations.push({
        type: 'note',
        description: 'Submissions list empty — delete button assertion skipped',
      });
    } else {
      await expect(
        page.getByRole('button', { name: 'Delete submission' }).first()
      ).toBeVisible();
    }
  });
});
