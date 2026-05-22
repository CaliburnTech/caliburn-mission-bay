/**
 * catalog — Product + Mission catalog CRUD
 *
 * Routes:
 *  GET    /catalog/products           list approved products (authenticated)
 *  GET    /catalog/products/:id       get one product + current version
 *  POST   /catalog/products           create product (APPROVED company, OWNER/ADMIN)
 *  PUT    /catalog/products/:id       update product (own company)
 *  POST   /catalog/products/:id/publish  publish a draft (own company)
 *  GET    /catalog/missions           list approved missions
 *  GET    /catalog/missions/:id       get one mission
 *  POST   /catalog/missions           create mission draft
 *  PUT    /catalog/missions/:id       update mission (own company)
 *  POST   /catalog/missions/:id/submit   submit mission for review
 *
 * All routes require Authorization header (Supabase JWT).
 * RLS policies enforce company-scoping and approval checks.
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const supabase = userClient(req)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errorResponse('Unauthorized', 401)

  const url = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/catalog\/?/, '').split('/').filter(Boolean)
  const resource = parts[0]   // 'products' | 'missions'
  const id       = parts[1]   // UUID or undefined
  const action   = parts[2]   // 'publish' | 'submit' | undefined

  try {
    // ── PRODUCTS ────────────────────────────────────────────────────────────

    if (resource === 'products' || !resource) {

      if (req.method === 'GET' && !id) {
        // List products — RLS handles visibility (APPROVED companies see APPROVED products)
        const { type, status, company } = Object.fromEntries(url.searchParams)
        let q = supabase
          .from('products')
          .select(`
            id, type, name, description, category, trl_level, status, company_id, created_at,
            companies!inner(name, logo_url),
            product_versions!current_version_id(
              id, version_number, platform_tags, mission_tags, swap_json, license_id,
              licenses(display_name, spdx_id)
            )
          `)
          .order('created_at', { ascending: false })

        if (type)    q = q.eq('type', type)
        if (status)  q = q.eq('status', status)
        if (company) q = q.eq('company_id', company)

        const { data, error } = await q
        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }

      if (req.method === 'GET' && id) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            companies(id, name, logo_url, website),
            product_versions(
              id, version_number, data, changelog, published_at, platform_tags, mission_tags,
              swap_json, licenses(id, display_name, spdx_id, government_marking),
              product_components(
                component_id, is_direct, sort_order,
                components(id, name, version, supplier, category,
                  licenses(display_name, spdx_id))
              )
            )
          `)
          .eq('id', id)
          .maybeSingle()

        if (error) return errorResponse(error.message)
        if (!data)  return errorResponse('Not found', 404)
        return jsonResponse(data)
      }

      if (req.method === 'POST' && !id) {
        const body = await req.json()
        const { data, error } = await supabase
          .from('products')
          .insert({
            company_id:  body.company_id,
            type:        body.type,
            name:        body.name,
            description: body.description,
            category:    body.category,
            trl_level:   body.trl_level,
            status:      'DRAFT',
          })
          .select()
          .single()

        if (error) return errorResponse(error.message)
        return jsonResponse(data, 201)
      }

      if (req.method === 'PUT' && id) {
        const body = await req.json()
        const { data, error } = await supabase
          .from('products')
          .update({
            name:        body.name,
            description: body.description,
            category:    body.category,
            trl_level:   body.trl_level,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }

      if (req.method === 'POST' && id && action === 'publish') {
        const body = await req.json()
        const admin = adminClient()

        // Get current version number
        const { data: latest } = await admin
          .from('product_versions')
          .select('version_number')
          .eq('product_id', id)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle()

        const nextVersion = (latest?.version_number ?? 0) + 1

        const { data: version, error: vErr } = await supabase
          .from('product_versions')
          .insert({
            product_id:     id,
            version_number: nextVersion,
            data:           body.data ?? {},
            changelog:      body.changelog,
            license_id:     body.license_id,
            swap_json:      body.swap_json,
            platform_tags:  body.platform_tags ?? [],
            mission_tags:   body.mission_tags  ?? [],
            published_by:   body.published_by,
          })
          .select()
          .single()

        if (vErr) return errorResponse(vErr.message)

        // Advance product to IN_REVIEW + set current version
        await supabase
          .from('products')
          .update({ status: 'IN_REVIEW', current_version_id: version.id })
          .eq('id', id)

        return jsonResponse(version, 201)
      }
    }

    // ── MISSIONS ────────────────────────────────────────────────────────────

    if (resource === 'missions') {

      if (req.method === 'GET' && !id) {
        const { status, type, company } = Object.fromEntries(url.searchParams)
        let q = supabase
          .from('missions')
          .select(`
            id, name, status, description, company_id, created_at,
            companies!inner(name, logo_url),
            mission_types(id, slug, display_name, domain)
          `)
          .order('created_at', { ascending: false })

        if (status)  q = q.eq('status', status)
        if (type)    q = q.eq('mission_type_id', type)
        if (company) q = q.eq('company_id', company)

        const { data, error } = await q
        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }

      if (req.method === 'GET' && id) {
        const { data, error } = await supabase
          .from('missions')
          .select('*, mission_types(*), companies(id, name, logo_url)')
          .eq('id', id)
          .maybeSingle()

        if (error) return errorResponse(error.message)
        if (!data)  return errorResponse('Not found', 404)
        return jsonResponse(data)
      }

      if (req.method === 'POST' && !id) {
        const body = await req.json()
        const { data: dbUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        const { data, error } = await supabase
          .from('missions')
          .insert({
            name:              body.name,
            company_id:        body.company_id,
            mission_type_id:   body.mission_type_id,
            description:       body.description,
            zone_geo_json:     body.zone_geo_json,
            vessel_loadout:    body.vessel_loadout,
            notes:             body.notes,
            status:            'DRAFT',
            created_by_user_id: dbUser?.id,
          })
          .select()
          .single()

        if (error) return errorResponse(error.message)
        return jsonResponse(data, 201)
      }

      if (req.method === 'PUT' && id) {
        const body = await req.json()
        const { data, error } = await supabase
          .from('missions')
          .update({
            name:           body.name,
            description:    body.description,
            zone_geo_json:  body.zone_geo_json,
            vessel_loadout: body.vessel_loadout,
            notes:          body.notes,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }

      if (req.method === 'POST' && id && action === 'submit') {
        const { data, error } = await supabase
          .from('missions')
          .update({ status: 'IN_REVIEW', submitted_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[catalog]', err)
    return errorResponse('Internal error', 500)
  }
})
