/**
 * sbom — CycloneDX SBOM generation for a saved configuration
 *
 * Routes:
 *  POST   /sbom/generate/:config_id   generate SBOM, store in Supabase Storage, return record
 *  GET    /sbom/:id                   get SBOM metadata record
 *  GET    /sbom/:id/download          get signed download URL (5-min TTL)
 *  GET    /sbom/config/:config_id     list SBOMs for a configuration
 *
 * SBOM files are stored at: sboms/{company_id}/{config_id}/{uuid}.json
 * The sboms bucket is private; access via signed URL only.
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const supabase = userClient(req)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errorResponse('Unauthorized', 401)

  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/sbom\/?/, '').split('/').filter(Boolean)
  const action   = parts[0]  // 'generate' | 'config' | UUID
  const targetId = parts[1]  // config_id or sbom_id
  const sub      = parts[2]  // 'download'

  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser) return errorResponse('User not found', 403)

    // ── GENERATE ──────────────────────────────────────────────────────────────

    if (req.method === 'POST' && action === 'generate' && targetId) {
      const configId = targetId
      const admin    = adminClient()

      // Fetch config + all product versions + their components
      const { data: config, error: cfgErr } = await admin
        .from('saved_configurations')
        .select(`
          id, name, company_id,
          configuration_products(
            product_versions(
              id, version_number, data,
              products(id, name, type, companies(name)),
              licenses(id, spdx_id, display_name, government_marking),
              product_components(
                is_direct, sort_order,
                components(
                  id, name, version, supplier, category, bom_ref, purl,
                  licenses(id, spdx_id, display_name)
                )
              )
            )
          )
        `)
        .eq('id', configId)
        .single()

      if (cfgErr) return errorResponse(cfgErr.message)
      if (config.company_id !== dbUser.company_id) return errorResponse('Forbidden', 403)

      // Build CycloneDX 1.5 JSON
      const sbomId       = crypto.randomUUID()
      const storagePath  = `${config.company_id}/${configId}/${sbomId}.json`
      const components: unknown[] = []
      const dependencies: unknown[] = []

      for (const cp of config.configuration_products ?? []) {
        const version = cp.product_versions
        if (!version) continue

        const product = version.products
        const compRef = `pkg:mission-bay/${product?.companies?.name ?? 'unknown'}/${product?.name}@${version.version_number}`

        const directDeps: string[] = []

        for (const pc of version.product_components ?? []) {
          const comp = pc.components
          if (!comp) continue

          const ref = comp.purl ?? comp.bom_ref ?? `pkg:generic/${comp.supplier ?? 'unknown'}/${comp.name}@${comp.version}`
          components.push({
            'bom-ref':    ref,
            type:         'library',
            name:         comp.name,
            version:      comp.version,
            supplier:     comp.supplier ? { name: comp.supplier } : undefined,
            licenses:     comp.licenses ? [{ license: { id: comp.licenses.spdx_id, name: comp.licenses.display_name } }] : undefined,
            purl:         comp.purl ?? undefined,
          })
          if (pc.is_direct) directDeps.push(ref)
        }

        components.push({
          'bom-ref': compRef,
          type:      product?.type === 'PLATFORM' ? 'container' : 'library',
          name:      product?.name,
          version:   String(version.version_number),
          supplier:  product?.companies?.name ? { name: product.companies.name } : undefined,
          licenses:  version.licenses
            ? [{ license: { id: version.licenses.spdx_id, name: version.licenses.display_name } }]
            : undefined,
        })
        dependencies.push({ ref: compRef, dependsOn: directDeps })
      }

      const cycloneDxJson = {
        bomFormat:    'CycloneDX',
        specVersion:  '1.5',
        serialNumber: `urn:uuid:${sbomId}`,
        version:      1,
        metadata: {
          timestamp:  new Date().toISOString(),
          tools:      [{ vendor: 'Caliburn Technologies', name: 'Mission Bay', version: '1.0' }],
          component: { type: 'application', name: config.name ?? 'Mission Bay Configuration', version: '1' },
        },
        components,
        dependencies,
      }

      // Upload to Supabase Storage (service role — bypasses RLS)
      const { error: uploadErr } = await admin.storage
        .from('sboms')
        .upload(storagePath, JSON.stringify(cycloneDxJson, null, 2), {
          contentType: 'application/json',
          upsert: false,
        })

      if (uploadErr) return errorResponse(`Storage upload failed: ${uploadErr.message}`)

      // Insert SBOM record
      const { data: sbomRecord, error: sbomErr } = await admin
        .from('sboms')
        .insert({
          saved_configuration_id: configId,
          storage_path:           storagePath,
          component_count:        components.length,
          top_level_count:        config.configuration_products?.length ?? 0,
          dependency_count:       dependencies.length,
          generated_by_user_id:   dbUser.id,
        })
        .select()
        .single()

      if (sbomErr) return errorResponse(sbomErr.message)
      return jsonResponse(sbomRecord, 201)
    }

    // ── GET SBOM METADATA ────────────────────────────────────────────────────

    if (req.method === 'GET' && action && !sub && action !== 'config') {
      const { data, error } = await supabase
        .from('sboms')
        .select('*, saved_configurations(id, name, company_id)')
        .eq('id', action)
        .maybeSingle()

      if (error) return errorResponse(error.message)
      if (!data)  return errorResponse('Not found', 404)
      return jsonResponse(data)
    }

    // ── SIGNED DOWNLOAD URL ──────────────────────────────────────────────────

    if (req.method === 'GET' && action && sub === 'download') {
      const { data: sbom } = await supabase
        .from('sboms')
        .select('storage_path, saved_configurations(company_id)')
        .eq('id', action)
        .single()

      if (!sbom) return errorResponse('Not found', 404)

      const admin = adminClient()
      const { data: signed, error: signErr } = await admin.storage
        .from('sboms')
        .createSignedUrl(sbom.storage_path, 300)  // 5-min TTL

      if (signErr) return errorResponse(signErr.message)
      return jsonResponse({ url: signed.signedUrl, expires_in: 300 })
    }

    // ── LIST FOR CONFIG ──────────────────────────────────────────────────────

    if (req.method === 'GET' && action === 'config' && targetId) {
      const { data, error } = await supabase
        .from('sboms')
        .select('*')
        .eq('saved_configuration_id', targetId)
        .order('generated_at', { ascending: false })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[sbom]', err)
    return errorResponse('Internal error', 500)
  }
})
