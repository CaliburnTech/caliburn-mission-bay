/**
 * Safe date formatting for API timestamps.
 *
 * Renders an em-dash placeholder instead of "Invalid Date" when the field is
 * missing or unparseable. Accepts a fallback timestamp (e.g. createdAt when
 * approvalRequestedAt is absent — the pending-companies API returns raw
 * Company rows, which carry createdAt only).
 */

function parse(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateTime(value?: string | null, fallback?: string | null): string {
  const d = parse(value) ?? parse(fallback)
  return d ? d.toLocaleString() : '—'
}

export function formatDate(value?: string | null, fallback?: string | null): string {
  const d = parse(value) ?? parse(fallback)
  return d ? d.toLocaleDateString() : '—'
}
