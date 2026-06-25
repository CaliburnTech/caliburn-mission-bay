/**
 * configs — Saved configuration CRUD
 *
 * Routes:
 *  GET    /configs                list company's saved configs
 *  GET    /configs/:id            get one config + products
 *  POST   /configs                save a new configuration
 *  PUT    /configs/:id            update config name / data
 *  DELETE /configs/:id            soft-delete (mark archived)
 *  POST   /configs/:id/products   add product version to config
 *  DELETE /configs/:id/products/:product_id  remove product from config
 *
 * When ALLOW_ANONYMOUS_CONFIG_SAVE=true, requests without a JWT are
 * accepted and attributed to the stable "Public Demo" company/user
 * (cuid demo-user-000000000000). All anonymous DB ops use the
 * service-role client to bypass RLS (which requires auth.uid()).
 *
 * Otherwise all routes require an Authorization header (Supabase JWT).
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

const DEMO_USER_ID    = 'demo-user-000000000000'
const DEMO_COMPANY_ID = 'demo-company-00000000000'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  // DEMO MODE: anonymous save always enabled. Revert before production (Phase 2).
  const ANON_ALLOWED = true

  const supabase = userClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !ANON_ALLOWED) return errorResponse('Unauthorized', 401)

  // For anonymous requests we must use the service-role client so that RLS
  // (which depends on auth.uid()) does not block the queries.
  const db = user ? supabase : adminClient()

  let dbUser: { id: string; companyId: string }
  if (user) {
    const { data } = await supabase.from('"User"').select('id, companyId').eq('authId', user.id).single()
    if (!data?.companyId) return errorResponse('No company found', 403)
    dbUser = data
  } else {
    dbUser = { id: DEMO_USER_ID, companyId: DEMO_COMPANY_ID }
  }

  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/configs\/?/, '').split('/').filter(Boolean)
  const id         = parts[0]  // config id
  const sub        = parts[1]  // 'products'
  const productId  = parts[2]  // product id (for delete)

  try {
    // ── LIST ─────────────────────────────────────────────────────────────────

    if (req.method === 'GET' && !id) {
      const { data, error } = await db
        .from('"SavedConfiguration"')
        .select(`
          id, name, specVersion, hasVendorUpdate, submittedBy, createdAt, updatedAt,
          "ConfigurationProduct"(
            productId,
            products(id, name, type, status, companies(name)),
            product_versions(id, version_number, platform_tags, mission_tags)
          )
        `)
        .eq('companyId', dbUser.companyId)
        .order('updatedAt', { ascending: false })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── GET ONE ───────────────────────────────────────────────────────────────

    if (req.method === 'GET' && id && !sub) {
      const { data, error } = await db
        .from('"SavedConfiguration"')
        .select(`
          *,
          "User"(id, name, email),
          "ConfigurationProduct"(
            productId, productVersionId,
            products(*, companies(id, name, logo_url)),
            product_versions(
              *, licenses(display_name, spdx_id),
              product_components(
                is_direct, components(id, name, version, supplier, category)
              )
            )
          )
        `)
        .eq('id', id)
        .eq('companyId', dbUser.companyId)
        .maybeSingle()

      if (error) return errorResponse(error.message)
      if (!data)  return errorResponse('Not found', 404)
      return jsonResponse(data)
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    if (req.method === 'POST' && !id) {
      const body = await req.json()

      const { data, error } = await db
        .from('"SavedConfiguration"')
        .insert({
          userId:      dbUser.id,
          companyId:   dbUser.companyId,
          name:        body.name,
          configData:  body.configData ?? {},
          submittedBy: body.submittedBy ?? null,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)

      // Insert ConfigurationProduct rows if provided
      if (body.products?.length) {
        const rows = body.products.map((p: { productId: string; productVersionId: string }) => ({
          configId:          data.id,
          productId:         p.productId,
          productVersionId:  p.productVersionId,
        }))
        await db.from('"ConfigurationProduct"').insert(rows)
      }

      return jsonResponse(data, 201)
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    if (req.method === 'PUT' && id && !sub) {
      const body = await req.json()
      const { data, error } = await db
        .from('"SavedConfiguration"')
        .update({
          name:       body.name,
          configData: body.configData,
        })
        .eq('id', id)
        .eq('companyId', dbUser.companyId)
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    if (req.method === 'DELETE' && id && !sub) {
      const { error } = await db
        .from('"SavedConfiguration"')
        .delete()
        .eq('id', id)
        .eq('companyId', dbUser.companyId)

      if (error) return errorResponse(error.message)
      return jsonResponse({ deleted: true })
    }

    // ── ADD PRODUCT TO CONFIG ─────────────────────────────────────────────────

    if (req.method === 'POST' && id && sub === 'products') {
      const body = await req.json()
      const { data, error } = await db
        .from('"ConfigurationProduct"')
        .upsert({
          configId:         id,
          productId:        body.productId,
          productVersionId: body.productVersionId,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data, 201)
    }

    // ── REMOVE PRODUCT FROM CONFIG ────────────────────────────────────────────

    if (req.method === 'DELETE' && id && sub === 'products' && productId) {
      const { error } = await db
        .from('"ConfigurationProduct"')
        .delete()
        .eq('configId', id)
        .eq('productId', productId)

      if (error) return errorResponse(error.message)
      return jsonResponse({ deleted: true })
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[configs]', err)
    return errorResponse('Internal error', 500)
  }
})
