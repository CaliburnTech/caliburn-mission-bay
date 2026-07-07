/**
 * Normalize + validate maker-authored product spec (SWaP + custom fields).
 *
 * Shape accepted / returned:
 *   {
 *     swap: { [field]: number | string },   // standard SWaP/spec fields, all optional
 *     customFields: [{ label, value }]       // maker's own free-form entries
 *   }
 *
 * Everything is optional and zero-able (software-only capabilities may have no
 * physical SWaP). Returns a cleaned object, or null when nothing usable is present.
 */
export function sanitizeSpec(input) {
  if (input == null || typeof input !== 'object' || Array.isArray(input)) return null;

  const out = {};

  if (input.swap && typeof input.swap === 'object' && !Array.isArray(input.swap)) {
    const swap = {};
    for (const [k, v] of Object.entries(input.swap)) {
      if (typeof k !== 'string' || !k || k.length > 60) continue;
      if (v === '' || v == null) continue;
      if (typeof v === 'number' && Number.isFinite(v)) swap[k] = v;
      else if (typeof v === 'string' && v.length <= 200) swap[k] = v;
    }
    if (Object.keys(swap).length) out.swap = swap;
  }

  if (Array.isArray(input.customFields)) {
    const cf = input.customFields
      .filter((f) => f && typeof f === 'object')
      .map((f) => ({
        label: String(f.label ?? '').slice(0, 100),
        value: String(f.value ?? '').slice(0, 2000),
      }))
      .filter((f) => f.label || f.value)
      .slice(0, 50);
    if (cf.length) out.customFields = cf;
  }

  return Object.keys(out).length ? out : null;
}
