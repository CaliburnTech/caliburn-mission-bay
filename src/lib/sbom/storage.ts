import { createClient } from '@supabase/supabase-js';

/**
 * SBOM file storage via Supabase Storage.
 *
 * Required env vars:
 *   SUPABASE_URL          — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (server-side only, never exposed to browser)
 *
 * Bucket: "sboms" (create once in Supabase dashboard — Storage → New bucket → "sboms", private)
 *
 * File layout inside the bucket:
 *   {companyId}/{configId}/{timestamp}.json
 *   {companyId}/{configId}/{timestamp}.csv
 */

const BUCKET = 'sboms';

const getStorageClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  return createClient(url, key).storage;
};

export async function uploadSbomToStorage(params: {
  configId: string;
  companyId: string;
  json: string;
  csv: string;
}): Promise<{ jsonPath: string; csvPath: string }> {
  const storage = getStorageClient();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `${params.companyId}/${params.configId}/${ts}`;
  const jsonPath = `${base}.json`;
  const csvPath = `${base}.csv`;

  const [jsonResult, csvResult] = await Promise.all([
    storage.from(BUCKET).upload(jsonPath, params.json, {
      contentType: 'application/vnd.cyclonedx+json',
      upsert: false,
    }),
    storage.from(BUCKET).upload(csvPath, params.csv, {
      contentType: 'text/csv',
      upsert: false,
    }),
  ]);

  if (jsonResult.error) throw new Error(`SBOM JSON upload failed: ${jsonResult.error.message}`);
  if (csvResult.error) throw new Error(`SBOM CSV upload failed: ${csvResult.error.message}`);

  return { jsonPath, csvPath };
}

/**
 * Returns a short-lived signed URL for a stored SBOM file.
 * Use this to let an authenticated user download their SBOM — never expose
 * the service role key or bucket directly to the browser.
 *
 * @param storagePath — the path stored in the Sbom.storagePath DB column
 * @param expiresIn   — seconds until the URL expires (default 5 min)
 */
export async function getSignedSbomUrl(
  storagePath: string,
  expiresIn = 300,
): Promise<string> {
  const storage = getStorageClient();
  const { data, error } = await storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw new Error(`Failed to create signed URL: ${error.message}`);
  return data.signedUrl;
}
