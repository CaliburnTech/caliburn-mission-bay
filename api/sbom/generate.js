import { createClient } from '@supabase/supabase-js';
import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { created, badRequest, notFound, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/sbom/generate
 * Body: { configId }
 *
 * Generates a CycloneDX 1.5 SBOM for a saved configuration.
 * Stores JSON + CSV in Supabase Storage, saves a Sbom record in the DB.
 *
 * The core logic lives in generateSbomForConfig() and is exported so other
 * handlers (e.g. purchase-requests) can call it directly without HTTP overhead.
 */

// ── Supabase Storage ──────────────────────────────────────────────────────────

const BUCKET = 'sboms';

function getStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  return createClient(url, key).storage;
}

async function uploadToStorage({ companyId, configId, json, csv }) {
  const storage = getStorage();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `${companyId}/${configId}/${ts}`;
  const jsonPath = `${base}.json`;
  const csvPath = `${base}.csv`;

  const [jsonResult, csvResult] = await Promise.all([
    storage.from(BUCKET).upload(jsonPath, json, {
      contentType: 'application/vnd.cyclonedx+json',
      upsert: false,
    }),
    storage.from(BUCKET).upload(csvPath, csv, {
      contentType: 'text/csv',
      upsert: false,
    }),
  ]);

  if (jsonResult.error) throw new Error(`SBOM JSON upload failed: ${jsonResult.error.message}`);
  if (csvResult.error) throw new Error(`SBOM CSV upload failed: ${csvResult.error.message}`);

  return { jsonPath, csvPath };
}

// ── Assembler ─────────────────────────────────────────────────────────────────

function assembleSbom(configuration) {
  const allComponents = [];
  const dependencyMap = new Map();
  const licenseSet = new Set();

  for (const cp of configuration.products) {
    const pv = cp.version;
    const pvBomRef = `product-${pv.id}`;
    const pvDeps = [];

    allComponents.push({
      bomRef: pvBomRef,
      name: pv.product.name,
      version: String(pv.versionNumber),
      supplier: pv.product.company.name,
      type: 'library',
      isDirect: true,
      license: pv.license?.displayName ?? 'Unknown',
    });

    if (pv.license) licenseSet.add(pv.license.displayName);

    const sorted = [...pv.components].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const pc of sorted) {
      const c = pc.component;
      const bomRef = c.bomRef ?? `comp-${crypto.randomUUID()}`;
      pvDeps.push(bomRef);

      allComponents.push({
        bomRef,
        name: c.name,
        version: c.version,
        supplier: c.supplier ?? 'Unknown',
        type: mapCategory(c.category),
        isDirect: pc.isDirect,
        purl: c.purl ?? undefined,
        license: c.license?.displayName ?? 'Unknown',
      });

      if (c.license) licenseSet.add(c.license.displayName);
    }

    dependencyMap.set(pvBomRef, pvDeps);
  }

  const topLevel = allComponents.filter(c => c.isDirect);
  const transitive = allComponents.filter(c => !c.isDirect);
  const dependencies = Array.from(dependencyMap.entries()).map(([ref, dependsOn]) => ({
    ref,
    dependsOn,
  }));
  const licenses = Array.from(licenseSet);

  return {
    allComponents,
    topLevel,
    transitive,
    dependencies,
    licenses,
    counts: {
      components: allComponents.length,
      topLevel: topLevel.length,
      dependencies: dependencies.length,
      licenses: licenses.length,
    },
  };
}

const CATEGORY_MAP = {
  OS: 'operating-system',
  RUNTIME: 'framework',
  MESSAGING: 'library',
  DRIVER: 'firmware',
  SDK: 'library',
  LIBRARY: 'library',
  FIRMWARE: 'firmware',
  APPLICATION: 'application',
  OTHER: 'library',
};

function mapCategory(cat) {
  return CATEGORY_MAP[cat] ?? 'library';
}

// ── Serializers ───────────────────────────────────────────────────────────────

function toCycloneDxJson(assembled, { configId, companyName, generatedAt }) {
  const bom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: generatedAt.toISOString(),
      tools: [{ vendor: 'Caliburn', name: 'Mission Bay', version: '1.0' }],
      component: {
        type: 'application',
        name: `Mission Bay Configuration ${configId}`,
        version: '1.0',
        supplier: { name: companyName },
      },
    },
    components: assembled.allComponents.map(c => ({
      type: c.type,
      'bom-ref': c.bomRef,
      name: c.name,
      version: c.version,
      supplier: c.supplier ? { name: c.supplier } : undefined,
      purl: c.purl,
      licenses:
        c.license && c.license !== 'Unknown'
          ? [{ license: { name: c.license } }]
          : undefined,
    })),
    dependencies: assembled.dependencies.map(d => ({
      ref: d.ref,
      dependsOn: d.dependsOn,
    })),
  };
  return JSON.stringify(bom, null, 2);
}

function toCsv(assembled) {
  const header = 'name,version,supplier,license,type,category';
  const rows = assembled.allComponents.map(c =>
    [c.name, c.version, c.supplier, c.license, c.type, c.isDirect ? 'direct' : 'transitive']
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

// ── DevOps stub ───────────────────────────────────────────────────────────────
// TODO: replace with real downstream DevOps endpoint when available.

async function notifyDevOps({ sbomId, configId, storagePath }) {
  console.log('[sbom] DevOps stub — SBOM ready for handoff', {
    sbomId,
    configId,
    storagePath,
  });
}

// ── Core generation logic (exported for direct calls) ─────────────────────────

/**
 * Generates a SBOM for a configuration and stores it.
 * Can be called directly from other handlers (e.g. purchase-requests)
 * without going through HTTP.
 *
 * @param {string} configId
 * @param {string} userId — the user triggering the generation
 * @returns {Promise<{ sbomId, storagePath, counts, generatedAt }>}
 */
export async function generateSbomForConfig(configId, userId) {
  const configuration = await prisma.savedConfiguration.findUnique({
    where: { id: configId },
    include: {
      company: { select: { id: true, name: true } },
      products: {
        include: {
          version: {
            include: {
              product: {
                include: { company: { select: { name: true } } },
              },
              license: {
                select: { displayName: true, spdxId: true, governmentMarking: true },
              },
              components: {
                include: {
                  component: {
                    include: {
                      license: { select: { displayName: true, spdxId: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!configuration) throw new Error(`Configuration ${configId} not found`);

  const generatedAt = new Date();
  const assembled = assembleSbom(configuration);
  const json = toCycloneDxJson(assembled, {
    configId,
    companyName: configuration.company.name,
    generatedAt,
  });
  const csv = toCsv(assembled);

  const { jsonPath } = await uploadToStorage({
    companyId: configuration.company.id,
    configId,
    json,
    csv,
  });

  const sbom = await prisma.sbom.upsert({
    where: { savedConfigurationId: configId },
    update: {
      storagePath: jsonPath,
      componentCount: assembled.counts.components,
      topLevelCount: assembled.counts.topLevel,
      dependencyCount: assembled.counts.dependencies,
      licenseCount: assembled.counts.licenses,
      generatedAt,
      generatedByUserId: userId,
      destinationStatus: null,
      destinationError: null,
    },
    create: {
      savedConfigurationId: configId,
      storagePath: jsonPath,
      componentCount: assembled.counts.components,
      topLevelCount: assembled.counts.topLevel,
      dependencyCount: assembled.counts.dependencies,
      licenseCount: assembled.counts.licenses,
      generatedAt,
      generatedByUserId: userId,
    },
  });

  notifyDevOps({ sbomId: sbom.id, configId, storagePath: jsonPath })
    .catch((err) => console.error('[sbom] DevOps notify failed:', err));

  return {
    sbomId: sbom.id,
    storagePath: jsonPath,
    counts: assembled.counts,
    generatedAt: generatedAt.toISOString(),
  };
}

// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { configId } = req.body ?? {};
  if (!configId) return badRequest(res, 'configId is required');

  // Verify ownership before generating
  const config = await prisma.savedConfiguration.findUnique({
    where: { id: configId },
    select: { userId: true },
  });
  if (!config) return notFound(res);
  if (config.userId !== user.id) return badRequest(res, 'Config does not belong to you');

  try {
    const result = await generateSbomForConfig(configId, user.id);
    return created(res, result);
  } catch (err) {
    console.error('[sbom/generate] generation failed:', err);
    return serverError(res, err);
  }
}
