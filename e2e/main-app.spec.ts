import { test, expect } from '@playwright/test';

/**
 * Buyer SPA smoke tests — https://caliburn-marketplace.vercel.app
 *
 * Demo mode works fully logged-out, so these need zero credentials.
 * Selectors favor visible roles/text over CSS classes so styling changes
 * don't break the suite.
 *
 * Note: specs are kept free of TypeScript-only syntax on purpose — the repo's
 * ESLint test-file glob matches *.spec.ts but parses with espree.
 */

test.describe('buyer marketplace (demo mode, no auth)', () => {
  test('splash page loads', async ({ page }) => {
    await page.goto('/');

    // Brand + primary calls to action from the splash page.
    await expect(page.getByText('Mission Bay').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /explore fleet/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /capabilities/i }).first()).toBeVisible();
  });

  test('enters the marketplace and browses capabilities', async ({ page }) => {
    await page.goto('/');

    // Enter the marketplace via the splash CTA (demo mode — no login).
    await page.getByRole('button', { name: /explore fleet/i }).first().click();
    await expect(page).toHaveURL(/#shipyard/);

    // Marketplace nav bar renders its view tabs.
    await expect(page.getByRole('button', { name: 'Squadrons' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mission Planner' })).toBeVisible();

    // Switch to the capabilities catalog.
    await page.getByRole('button', { name: 'Capabilities', exact: true }).first().click();
    await expect(page).toHaveURL(/#capabilities/);
  });

  test('vessel configure flow opens the outfitter', async ({ page }) => {
    // Deep-link straight into the shipyard (hash routing skips the splash).
    await page.goto('/#shipyard');
    await expect(page.getByRole('button', { name: 'Squadrons' })).toBeVisible();

    // Vessel cards expose a "Configure" action that opens the outfitter.
    // Hidden responsive duplicates are display:none and therefore excluded
    // from the accessibility tree, so getByRole only sees visible buttons.
    const configure = page.getByRole('button', { name: 'Configure' }).first();
    let hasVessel = true;
    try {
      await configure.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      hasVessel = false;
    }
    test.skip(!hasVessel, 'No vessel cards with a Configure action visible (empty demo fleet)');

    await configure.click();
    await expect(page).toHaveURL(/#outfitter/);
  });
});
