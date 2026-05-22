/**
 * ai-bridge — Anthropic API proxy for AI-assisted mission creation
 *
 * Streams Claude chat completions back to the maker portal.
 * Company's Anthropic API key is loaded from Supabase Vault (never sent to browser).
 * Only OWNER or ADMIN of an APPROVED company can use this endpoint.
 *
 * Routes:
 *  POST   /ai-bridge/chat       stream a chat completion
 *  POST   /ai-bridge/save-draft validate + save Claude's mission draft
 *
 * POST /ai-bridge/chat
 * Body: {
 *   messages: Array<{ role: 'user'|'assistant', content: string }>,
 *   company_id: string,
 *   model?: string  (default: claude-sonnet-4-5)
 * }
 *
 * POST /ai-bridge/save-draft
 * Body: {
 *   company_id: string,
 *   mission: { name, mission_type_id, description, zone_geo_json?, vessel_loadout?, notes? }
 * }
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, errorResponse, jsonResponse } from '../_shared/supabase.ts'

const SYSTEM_PROMPT = `You are Mission Builder, an AI assistant that helps defense contractors
create structured mission profiles for the Caliburn Mission Bay marketplace.

When the user describes a mission, ask clarifying questions about:
- Mission type (port security, ISR patrol, anti-submarine, etc.)
- Domain (maritime, aerial, combined)
- Geographic zone (if applicable)
- Platform/vessel loadout requirements
- Key objectives and success criteria

When you have enough information, output a structured mission JSON wrapped in <mission> tags:
<mission>
{
  "name": "...",
  "mission_type_slug": "...",
  "description": "...",
  "zone_geo_json": null,
  "vessel_loadout": {},
  "notes": "..."
}
</mission>

Be concise. Defense buyers need accurate, defensible mission profiles.`

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const supabase = userClient(req)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errorResponse('Unauthorized', 401)

  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/ai-bridge\/?/, '').split('/').filter(Boolean)
  const action = parts[0]  // 'chat' | 'save-draft'

  try {
    // Validate user is OWNER or ADMIN of an APPROVED company
    const admin = adminClient()
    const { data: dbUser } = await admin
      .from('users')
      .select('id, company_id, role, companies(status)')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser) return errorResponse('User not found', 403)

    const company = dbUser.companies as unknown as { status: string } | null
    if (!company || company.status !== 'APPROVED') {
      return errorResponse('Company must be approved to use AI features', 403)
    }
    if (!['OWNER', 'ADMIN'].includes(dbUser.role)) {
      return errorResponse('Only company OWNER or ADMIN can use AI features', 403)
    }

    // ── CHAT ──────────────────────────────────────────────────────────────────

    if (req.method === 'POST' && action === 'chat') {
      const body = await req.json()
      const { messages, company_id, model = 'claude-sonnet-4-5' } = body

      if (!messages?.length) return errorResponse('messages is required')

      // Load company's Anthropic key from Supabase Vault
      // In production: stored as a Vault secret named anthropic_key_{company_id}
      // For now, fall back to an env-level key for development.
      let anthropicKey: string | null = null

      try {
        const { data: secret } = await admin.rpc('vault_get_secret', {
          secret_name: `anthropic_key_${company_id ?? dbUser.company_id}`,
        })
        anthropicKey = secret
      } catch {
        // Vault lookup failed; fall back to dev env key
        anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? null
      }

      if (!anthropicKey) {
        return errorResponse(
          'No Anthropic API key configured for this company. Add it in Company Profile → AI Settings.',
          402,
        )
      }

      // Proxy to Anthropic API with streaming
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key':         anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system:     SYSTEM_PROMPT,
          messages,
          stream:     true,
        }),
      })

      if (!anthropicRes.ok) {
        const err = await anthropicRes.text()
        console.error('[ai-bridge] Anthropic error:', err)
        return errorResponse('AI provider error — check your API key', anthropicRes.status)
      }

      // Stream the response back to the client
      return new Response(anthropicRes.body, {
        headers: {
          ...corsHeaders,
          'Content-Type':  'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // ── SAVE DRAFT ────────────────────────────────────────────────────────────

    if (req.method === 'POST' && action === 'save-draft') {
      const body    = await req.json()
      const mission = body.mission

      if (!mission?.name || !mission?.mission_type_id) {
        return errorResponse('mission.name and mission.mission_type_id are required')
      }

      // Validate mission_type_id exists
      const { data: mType } = await admin
        .from('mission_types')
        .select('id')
        .eq('id', mission.mission_type_id)
        .maybeSingle()

      if (!mType) return errorResponse('Invalid mission_type_id')

      const { data: savedMission, error } = await admin
        .from('missions')
        .insert({
          name:               mission.name,
          company_id:         dbUser.company_id,
          mission_type_id:    mission.mission_type_id,
          description:        mission.description,
          zone_geo_json:      mission.zone_geo_json,
          vessel_loadout:     mission.vessel_loadout,
          notes:              mission.notes,
          status:             'DRAFT',
          created_by_user_id: dbUser.id,
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)
      return jsonResponse(savedMission, 201)
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[ai-bridge]', err)
    return errorResponse('Internal error', 500)
  }
})
