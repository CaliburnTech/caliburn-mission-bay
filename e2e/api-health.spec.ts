import { test, expect } from '@playwright/test';

/**
 * API smoke tests — run against E2E_MAIN_URL (`use.baseURL` in
 * playwright.config.ts). Zero credentials required.
 *
 * These pin down the API's public contract:
 *  - /api/health is up and returns JSON
 *  - unauthenticated requests are rejected cleanly (401, never a 500)
 *  - CORS preflights succeed with the headers the portals depend on
 */

test.describe('API health and public contract', () => {
  test('GET /api/health returns 200 JSON', async ({ request }) => {
    const res = await request.get('/api/health');

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('application/json');

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeTruthy();
  });

  test('unauthenticated GET /api/me returns 401, not 500', async ({ request }) => {
    const res = await request.get('/api/me');

    expect(res.status()).toBe(401);

    // The error envelope should be JSON with a message, not a stack trace.
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('OPTIONS preflight on /api/configurations returns 204 with CORS headers', async ({ request }) => {
    const res = await request.fetch('/api/configurations', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://mission-bay-maker.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization, content-type',
      },
    });

    expect(res.status()).toBe(204);

    const headers = res.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
    expect(headers['access-control-allow-methods'] ?? '').toContain('GET');
    // The portals send Authorization and the impersonation header.
    expect(headers['access-control-allow-headers'] ?? '').toMatch(/authorization/i);
    expect(headers['access-control-allow-headers'] ?? '').toMatch(/x-impersonation-session-id/i);
  });
});
