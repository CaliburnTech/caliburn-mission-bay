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
 * All routes require Authorization header (Supabase JWT).
 * Configs are company-scoped; RLS enforces this.
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const supabase = userClient(req)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errorResponse('Unauthorized', 401)

  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/configs\/?/, '').split('/').filter(Boolean)
  const id         = parts[0]  // config UUID
  const sub        = parts[1]  // 'products'
  const productId  = parts[2]  // product UUID (for delete)

  try {
    // Fetch the user's company_id from the database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser?.company_id) return errorResponse('No company found', 403)

    // ── LIST ─────────────────────────────────────────────────────────────────

    if (req.method === 'GET' && !id) {
      const { data, error } = await supabase
        .from('saved_configurations')
        .select(`
          id, name, spec_version, has_vendor_update, created_at, updated_at,
          configuration_products(
            product_id,
            products(id, name, type, status, companies(name)),
            product_versions(id, version_number, platform_tags, mission_tags)
          )
        `)
        .eq('company_id', dbUser.company_id)
        .order('updated_at', { ascending: false })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── GET ONE ───────────────────────────────────────────────────────────────

    if (req.method === 'GET' && id && !sub) {
      const { data, error } = await supabase
        .from('saved_configurations')
        .select(`
          *,
          users(id, name, email),
          configuration_products(
            product_id, product_version_id,
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
        .eq('company_id', dbUser.company_id)
        .maybeSingle()

      if (error) return errorResponse(error.message)
      if (!data)  return errorResponse('Not found', 404)
      return jsonResponse(data)
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    if (req.method === 'POST' && !id) {
      const body = await req.json()

      const { data, error } = await supabase
        .from('saved_configurations')
        .insert({
          user_id:     dbUser.id,
          company_id:  dbUser.company_id,
          name:        body.name,
          config_data: body.config_data ?? {},
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)

      // Insert configuration_products if provided
      if (body.products?.length) {
        const rows = body.products.map((p: { product_id: string; product_version_id: string }) => ({
          config_id:          data.id,
          product_id:         p.product_id,
          product_version_id: p.product_version_id,
        }))
        await supabase.from('configuration_products').insert(rows)
      }

      return jsonResponse(data, 201)
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    if (req.method === 'PUT' && id && !sub) {
      const body = await req.json()
      const { data, error } = await supabase
        .from('saved_configurations')
        .update({
          name:        body.name,
          config_data: body.config_data,
        })
        .eq('id', id)
        .eq('company_id', dbUser.company_id)
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    if (req.method === 'DELETE' && id && !sub) {
      const { error } = await supabase
        .from('saved_configurations')
        .delete()
        .eq('id', id)
        .eq('company_id', dbUser.company_id)

      if (error) return errorResponse(error.message)
      return jsonResponse({ deleted: true })
    }

    // ── ADD PRODUCT TO CONFIG ─────────────────────────────────────────────────

    if (req.method === 'POST' && id && sub === 'products') {
      const body = await req.json()
      const { data, error } = await supabase
        .from('configuration_products')
        .upsert({
          config_id:          id,
          product_id:         body.product_id,
          product_version_id: body.product_version_id,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data, 201)
    }

    // ── REMOVE PRODUCT FROM CONFIG ────────────────────────────────────────────

    if (req.method === 'DELETE' && id && sub === 'products' && productId) {
      const { error } = await supabase
        .from('configuration_products')
        .delete()
        .eq('config_id', id)
        .eq('product_id', productId)

      if (error) return errorResponse(error.message)
      return jsonResponse({ deleted: true })
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[configs]', err)
    return errorResponse('Internal error', 500)
  }
})
