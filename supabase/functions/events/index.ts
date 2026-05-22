/**
 * events — Internal event consumer / webhook dispatcher
 *
 * Handles internal platform events that trigger side-effects
 * (email notifications, analytics aggregation, downstream stubs).
 *
 * In Supabase, this replaces the EventBridge consumer Lambda.
 * Trigger sources:
 *  - Supabase Database Webhooks (configured in dashboard → Database → Webhooks)
 *  - Direct POST from other Edge Functions
 *
 * POST /events
 * Body: { type: EventType, payload: Record<string, unknown> }
 *
 * Supported event types:
 *  sbom.generated       → notify Caliburn sales team
 *  lead.created         → notify seller + log
 *  config.saved         → send save-confirmation to buyer
 *  approval.granted     → send welcome email to company
 *  company.banned       → send ban notification
 *  company.unbanned     → send reinstatement email
 *  purchase.requested   → notify seller + Caliburn
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminClient, errorResponse, jsonResponse } from '../_shared/supabase.ts'

type EventPayload = {
  type: string
  payload: Record<string, unknown>
}

const FROM_EMAIL = Deno.env.get('SES_FROM_ADDRESS') ?? 'missions@caliburn.us'
const CALIBURN_SALES_EMAIL = Deno.env.get('CALIBURN_SALES_EMAIL') ?? 'sales@caliburn.us'

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // TODO: replace stub with Resend / Supabase SMTP / SES when email provider is wired.
  // Example Resend integration:
  // const resendKey = Deno.env.get('RESEND_API_KEY')
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ from: FROM_EMAIL, to, subject, html: body }),
  // })
  console.log(`[events] EMAIL to ${to}: ${subject}`)
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  // Validate service-role or internal call (database webhook uses service key)
  const authHeader = req.headers.get('Authorization') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const isInternal = authHeader === `Bearer ${serviceKey}`

  if (!isInternal) {
    // Fall back: check for a shared webhook secret
    const webhookSecret = Deno.env.get('EVENTS_WEBHOOK_SECRET')
    const signature = req.headers.get('x-webhook-secret')
    if (!webhookSecret || signature !== webhookSecret) {
      return errorResponse('Unauthorized', 401)
    }
  }

  try {
    const { type, payload } = (await req.json()) as EventPayload

    const admin = adminClient()

    switch (type) {

      case 'sbom.generated': {
        const { config_id, sbom_id, company_id } = payload as Record<string, string>
        const { data: company } = await admin
          .from('companies')
          .select('name, email')
          .eq('id', company_id)
          .single()

        await sendEmail(
          CALIBURN_SALES_EMAIL,
          `New SBOM generated — ${company?.name ?? 'unknown'}`,
          `<p>Company <strong>${company?.name}</strong> generated a new SBOM for config <code>${config_id}</code>.</p>
           <p>SBOM ID: <code>${sbom_id}</code></p>`,
        )
        console.log(`[events] sbom.generated: config=${config_id}`)
        break
      }

      case 'lead.created': {
        const { product_id, buyer_name, email: buyerEmail } = payload as Record<string, string>
        const { data: product } = await admin
          .from('products')
          .select('name, companies(email, name)')
          .eq('id', product_id)
          .single()

        const sellerEmail = (product?.companies as { email?: string } | null)?.email
        if (sellerEmail) {
          await sendEmail(
            sellerEmail,
            `New lead for ${product?.name}`,
            `<p>Buyer <strong>${buyer_name}</strong> (${buyerEmail}) expressed interest in <strong>${product?.name}</strong>.</p>`,
          )
        }
        console.log(`[events] lead.created: product=${product_id}`)
        break
      }

      case 'config.saved': {
        const { user_id, config_id } = payload as Record<string, string>
        const { data: user } = await admin
          .from('users')
          .select('email, name')
          .eq('id', user_id)
          .single()

        if (user?.email) {
          await sendEmail(
            user.email,
            'Your Mission Bay configuration has been saved',
            `<p>Hi ${user.name ?? 'there'},</p>
             <p>Your configuration (ID: <code>${config_id}</code>) has been saved successfully.</p>`,
          )
        }
        break
      }

      case 'approval.granted': {
        const { company_id } = payload as Record<string, string>
        const { data: company } = await admin
          .from('companies')
          .select('name, email, users(email, name, role)')
          .eq('id', company_id)
          .single()

        const owners = ((company?.users ?? []) as { email: string; name: string; role: string }[])
          .filter(u => u.role === 'OWNER')

        for (const owner of owners) {
          await sendEmail(
            owner.email,
            `Welcome to Mission Bay — ${company?.name} is approved`,
            `<p>Hi ${owner.name},</p>
             <p>Your company <strong>${company?.name}</strong> has been approved by the Caliburn team.</p>
             <p>You can now publish products and missions to the Mission Bay marketplace.</p>`,
          )
        }
        break
      }

      case 'company.banned': {
        const { company_id, reason } = payload as Record<string, string>
        const { data: company } = await admin
          .from('companies')
          .select('name, users(email, name, role)')
          .eq('id', company_id)
          .single()

        const owners = ((company?.users ?? []) as { email: string; name: string; role: string }[])
          .filter(u => u.role === 'OWNER')

        for (const owner of owners) {
          await sendEmail(
            owner.email,
            'Your Mission Bay account has been suspended',
            `<p>Hi ${owner.name},</p>
             <p>Your company account has been suspended. Reason: ${reason ?? 'policy violation'}.</p>
             <p>Contact <a href="mailto:support@caliburn.us">support@caliburn.us</a> to appeal.</p>`,
          )
        }
        break
      }

      case 'company.unbanned': {
        const { company_id } = payload as Record<string, string>
        const { data: company } = await admin
          .from('companies')
          .select('name, users(email, name, role)')
          .eq('id', company_id)
          .single()

        const owners = ((company?.users ?? []) as { email: string; name: string; role: string }[])
          .filter(u => u.role === 'OWNER')

        for (const owner of owners) {
          await sendEmail(
            owner.email,
            'Your Mission Bay account has been reinstated',
            `<p>Hi ${owner.name},</p>
             <p>Your company account has been reinstated. You may now access Mission Bay.</p>`,
          )
        }
        break
      }

      case 'purchase.requested': {
        const { config_id, user_id } = payload as Record<string, string>
        const { data: user } = await admin
          .from('users')
          .select('name, email')
          .eq('id', user_id)
          .single()

        console.log(`[events] purchase.requested: config=${config_id} by user=${user?.email}`)
        break
      }

      default:
        console.warn(`[events] Unknown event type: ${type}`)
    }

    return jsonResponse({ ok: true, type })
  } catch (err) {
    console.error('[events]', err)
    return errorResponse('Internal error', 500)
  }
})
