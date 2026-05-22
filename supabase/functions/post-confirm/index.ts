/**
 * post-confirm — Auth webhook called after a new user is confirmed.
 *
 * The on_auth_user_created DB trigger (see migration) handles the synchronous
 * Company + User record creation. This Edge Function handles async side-effects:
 *  - Send welcome / pending-approval email via Supabase SMTP / Resend
 *  - Notify Caliburn admins of a new pending company signup
 *
 * Configured in Supabase Dashboard → Auth → Webhooks → User Created.
 * Or in config.toml [auth.hook.send_email] for local dev (future).
 *
 * POST /functions/v1/post-confirm
 * Body: Supabase Auth webhook payload { type: "signup", record: { id, email, ... } }
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminClient, errorResponse, jsonResponse } from '../_shared/supabase.ts'

const CALIBURN_NOTIFY_EMAIL = Deno.env.get('CALIBURN_NOTIFY_EMAIL') ?? 'team@caliburn.us'
const FROM_EMAIL = Deno.env.get('SES_FROM_ADDRESS') ?? 'missions@caliburn.us'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  // Supabase Auth webhooks use a shared secret for verification
  const webhookSecret = Deno.env.get('AUTH_WEBHOOK_SECRET')
  if (webhookSecret) {
    const signature = req.headers.get('x-supabase-signature')
    if (signature !== webhookSecret) {
      return errorResponse('Unauthorized', 401)
    }
  }

  try {
    const payload = await req.json()
    const { type, record } = payload

    if (type !== 'INSERT' || !record?.email) {
      return jsonResponse({ ok: true, skipped: true })
    }

    const email: string = record.email
    const isCaliburn = email.endsWith('@caliburn.us')

    const admin = adminClient()

    // Look up the newly created user + company
    const { data: dbUser } = await admin
      .from('users')
      .select('id, name, company_id, companies(name, status)')
      .eq('auth_id', record.id)
      .maybeSingle()

    if (!dbUser) {
      console.warn('[post-confirm] No user row found for auth_id', record.id)
      return jsonResponse({ ok: true, skipped: true })
    }

    if (!isCaliburn) {
      // Send pending-approval notification to the new user
      console.log(`[post-confirm] New signup: ${email} — company pending approval`)

      // TODO: replace with Resend / Supabase SMTP when email provider is wired.
      // Example Resend call:
      // await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     from: FROM_EMAIL,
      //     to: email,
      //     subject: 'Welcome to Mission Bay — your account is pending review',
      //     html: `<p>Hi ${dbUser.name},</p><p>Your company is pending Caliburn review. We'll notify you once approved.</p>`,
      //   }),
      // })

      // Notify Caliburn team of new pending company
      console.log(`[post-confirm] Notify ${CALIBURN_NOTIFY_EMAIL} of new pending company: ${email}`)
    } else {
      console.log(`[post-confirm] Caliburn staff signup: ${email} — super-admin access granted`)
    }

    return jsonResponse({ ok: true })
  } catch (err) {
    console.error('[post-confirm]', err)
    return errorResponse('Internal error', 500)
  }
})
