/**
 * leads — Lead capture and purchase request management
 *
 * Routes:
 *  POST   /leads                       capture a lead (public — no auth required)
 *  GET    /leads                       list leads for seller's products (authenticated)
 *  GET    /leads/:id                   get one lead
 *  POST   /leads/purchase-requests     create a purchase request (authenticated buyer)
 *  GET    /leads/purchase-requests     list purchase requests (buyer: own; seller: for their products)
 *  PATCH  /leads/purchase-requests/:id update status (seller/admin)
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/leads\/?/, '').split('/').filter(Boolean)
  const section = parts[0]  // undefined | 'purchase-requests' | UUID
  const id      = parts[1]  // UUID for purchase-requests/:id

  try {
    // ── CAPTURE LEAD (public, no auth) ────────────────────────────────────────

    if (req.method === 'POST' && !section) {
      const body = await req.json()
      if (!body.product_id || !body.email || !body.buyer_name) {
        return errorResponse('product_id, email, and buyer_name are required')
      }

      const admin = adminClient()

      // Insert lead
      const { data: lead, error } = await admin
        .from('leads')
        .insert({
          product_id:    body.product_id,
          buyer_name:    body.buyer_name,
          buyer_company: body.buyer_company,
          email:         body.email,
          phone:         body.phone,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)

      // Record analytics event
      await admin.from('events').insert({
        product_id: body.product_id,
        type:       'PURCHASE_REQUEST',
        metadata:   { source: 'lead_form' },
      })

      return jsonResponse(lead, 201)
    }

    // All remaining routes require authentication
    const supabase = userClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401)

    const { data: dbUser } = await supabase
      .from('users')
      .select('id, company_id, role')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser) return errorResponse('User not found', 403)

    // ── LIST LEADS (seller) ───────────────────────────────────────────────────

    if (req.method === 'GET' && !section) {
      const { data, error } = await supabase
        .from('leads')
        .select('*, products(id, name, company_id)')
        .order('created_at', { ascending: false })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── GET ONE LEAD ──────────────────────────────────────────────────────────

    if (req.method === 'GET' && section && section !== 'purchase-requests') {
      const { data, error } = await supabase
        .from('leads')
        .select('*, products(id, name)')
        .eq('id', section)
        .maybeSingle()

      if (error) return errorResponse(error.message)
      if (!data)  return errorResponse('Not found', 404)
      return jsonResponse(data)
    }

    // ── CREATE PURCHASE REQUEST ────────────────────────────────────────────────

    if (req.method === 'POST' && section === 'purchase-requests') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('purchase_requests')
        .insert({
          user_id:       dbUser.id,
          config_id:     body.config_id,
          garage_item_id: body.garage_item_id,
          message:       body.message,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data, 201)
    }

    // ── LIST PURCHASE REQUESTS ─────────────────────────────────────────────────

    if (req.method === 'GET' && section === 'purchase-requests') {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          users(id, name, email),
          saved_configurations(id, name,
            configuration_products(
              products(id, name, companies(name))
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── UPDATE PURCHASE REQUEST STATUS ────────────────────────────────────────

    if (req.method === 'PATCH' && section === 'purchase-requests' && id) {
      const body = await req.json()
      const admin = adminClient()

      const { data, error } = await admin
        .from('purchase_requests')
        .update({ status: body.status })
        .eq('id', id)
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[leads]', err)
    return errorResponse('Internal error', 500)
  }
})
