import { useMemo, useState } from 'react';
import { Check, ChevronRight, Package, Search, Ship, X, Zap, Scale } from 'lucide-react';
import { SecurityBadge, TRLBadge } from './shared';

/**
 * CapabilityCatalogView — redesigned capabilities storefront (Aug 2026).
 *
 * Replaces the old CapabilitiesView + FilterSidebar pair:
 *  - single row of category chips (derived from the live catalog) instead of
 *    the nested sidebar taxonomy
 *  - inline search + sort
 *  - vendor-first cards with a consistent SWaP strip
 *  - "Will it fit?" platform picker with per-card fit verdicts and a running
 *    selection budget (ported from the old view)
 *  - right-hand detail drawer with the full spec table
 *
 * Data-source agnostic: works with static demo capabilities (swap: {weight kg,
 * power kW}) and vendor DB products normalized by apiAdapter (swapData:
 * {weightKg, powerW, ...}). Production shows only the certified catalog;
 * demo keeps the full static one. Same component, different inventory.
 */

/** Normalize either capability shape to { kg, kw } (nulls when unknown). */
const swapOf = (cap) => {
  if (cap?.swap && (cap.swap.weight != null || cap.swap.power != null)) {
    return { kg: cap.swap.weight ?? null, kw: cap.swap.power ?? null };
  }
  const d = cap?.swapData;
  if (d && (d.weightKg != null || d.powerW != null)) {
    return {
      kg: d.weightKg != null ? Number(d.weightKg) : null,
      kw: d.powerW != null ? Number(d.powerW) / 1000 : null,
    };
  }
  return { kg: null, kw: null };
};

/** Vendor initials for the card mark, e.g. "Northrop Grumman" -> "NG". */
const initials = (provider) =>
  (provider || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Derive a { name, weightKg, powerKw } payload budget from either a static
 * hull (capacity.totalWeight/totalPower) or a vendor platform product
 * (swapData.payloadKg + a "power budget" custom field like "500 kW").
 */
const platformBudget = (p) => {
  if (p?.capacity?.totalWeight != null || p?.capacity?.totalPower != null) {
    return { name: p.name, weightKg: p.capacity.totalWeight ?? null, powerKw: p.capacity.totalPower ?? null };
  }
  const kg = p?.swapData?.payloadKg != null ? Number(p.swapData.payloadKg) : null;
  const powerField = (p?.customFields ?? []).find((f) => /power budget/i.test(f.label || ''));
  const kw = powerField ? parseFloat(powerField.value) : null;
  if (kg == null && kw == null) return null;
  return { name: p.name, weightKg: kg, powerKw: kw };
};

const SORTS = [
  { id: 'name', label: 'Sort: Name' },
  { id: 'provider', label: 'Sort: Vendor' },
  { id: 'weight', label: 'Sort: Lightest first' },
  { id: 'power', label: 'Sort: Lowest power' },
];

const CapabilityCatalogView = ({ capabilities = [], platforms = [], onConfigure }) => {
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [fitPlatform, setFitPlatform] = useState('');
  const [selectedForFit, setSelectedForFit] = useState([]);
  const [detail, setDetail] = useState(null);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const c of capabilities) {
      const cat = c.category || 'Other';
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return [['All', capabilities.length], ...[...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))];
  }, [capabilities]);

  const fitTargets = useMemo(
    () => platforms.map(platformBudget).filter(Boolean),
    [platforms]
  );
  const budget = fitTargets.find((t) => t.name === fitPlatform) || null;

  const fitTotals = useMemo(() => {
    const t = { kg: 0, kw: 0 };
    for (const name of selectedForFit) {
      const cap = capabilities.find((c) => c.name === name);
      const s = swapOf(cap);
      t.kg += s.kg ?? 0;
      t.kw += s.kw ?? 0;
    }
    return t;
  }, [selectedForFit, capabilities]);

  const checkFit = (cap) => {
    if (!budget) return null;
    const s = swapOf(cap);
    if (s.kg == null && s.kw == null) return null; // no SWaP data — no verdict
    const overKg = budget.weightKg != null && s.kg != null && s.kg > budget.weightKg - fitTotals.kg;
    const overKw = budget.powerKw != null && s.kw != null && s.kw > budget.powerKw - fitTotals.kw;
    if (!overKg && !overKw) return { fits: true };
    return { fits: false, reason: overKg && overKw ? 'Exceeds weight and power' : overKg ? 'Exceeds weight' : 'Exceeds power' };
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = capabilities.filter((c) =>
      (activeCat === 'All' || (c.category || 'Other') === activeCat) &&
      (!q || `${c.name} ${c.provider ?? ''} ${c.category ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q))
    );
    const key = (c) => {
      const s = swapOf(c);
      if (sortBy === 'weight') return s.kg ?? Number.MAX_VALUE;
      if (sortBy === 'power') return s.kw ?? Number.MAX_VALUE;
      return null;
    };
    return filtered.sort((a, b) => {
      if (sortBy === 'weight' || sortBy === 'power') return key(a) - key(b);
      const av = (sortBy === 'provider' ? a.provider : a.name) || '';
      const bv = (sortBy === 'provider' ? b.provider : b.name) || '';
      return av.localeCompare(bv);
    });
  }, [capabilities, activeCat, query, sortBy]);

  const vendorCount = useMemo(
    () => new Set(capabilities.map((c) => c.provider).filter(Boolean)).size,
    [capabilities]
  );

  const toggleFit = (name) =>
    setSelectedForFit((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const detailSwap = detail ? swapOf(detail) : null;
  const detailSpecs = detail?.specs ? Object.entries(detail.specs) : [];

  return (
    <div>
      {/* Intro line */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">Capability Catalog</h2>
        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
          Every payload below is certified to run on TempestOS and listed by its manufacturer.
          Configure them onto your platforms and export a full CycloneDX SBOM.
        </p>
        <div className="text-xs text-gray-500 mt-2">
          <span className="text-lime-brand font-semibold">{list.length}</span> of{' '}
          <span className="text-lime-brand font-semibold">{capabilities.length}</span> capabilities ·{' '}
          <span className="text-lime-brand font-semibold">{vendorCount}</span> manufacturers
        </div>
      </div>

      {/* Category chips + search + sort */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {categories.map(([cat, n]) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-1.5 rounded-full text-[13px] border transition-colors ${
              activeCat === cat
                ? 'bg-lime-brand/10 border-lime-brand text-lime-brand font-semibold'
                : 'bg-darker border-border-subtle text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {cat} <span className="opacity-60">({n})</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 bg-darker border border-border-subtle rounded-lg px-3 py-1.5 min-w-[220px]">
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search capabilities, vendors…"
              className="bg-transparent outline-none border-none text-sm text-white placeholder-gray-600 w-full"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-darker border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-gray-300"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Will it fit? */}
      <div className="bg-darker rounded-xl border border-border-subtle p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Ship size={16} className="text-lime-brand" />
            <span className="text-lime-brand font-semibold text-xs tracking-wide">WILL IT FIT?</span>
          </div>
          <select
            value={fitPlatform}
            onChange={(e) => {
              setFitPlatform(e.target.value);
              setSelectedForFit([]);
            }}
            className="bg-darkest border border-border-subtle rounded-lg px-3 py-2 text-white text-sm min-w-[260px]"
          >
            <option value="">No platform selected</option>
            {fitTargets.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
                {t.weightKg != null ? ` — ${t.weightKg.toLocaleString()} kg` : ''}
                {t.powerKw != null ? ` / ${t.powerKw} kW budget` : ''}
              </option>
            ))}
          </select>
          {!budget && (
            <span className="text-gray-500 text-xs">
              Pick a platform and every card shows a fit verdict against its SWaP budget.
            </span>
          )}

          {budget && (
            <div className="ml-auto flex items-center gap-5">
              {budget.weightKg != null && (
                <div className="flex items-center gap-2">
                  <Scale size={13} className={fitTotals.kg > budget.weightKg ? 'text-red-400' : 'text-cyan-400'} />
                  <div>
                    <div className={`text-sm font-bold leading-none ${fitTotals.kg > budget.weightKg ? 'text-red-400' : 'text-white'}`}>
                      {fitTotals.kg.toFixed(1)} / {budget.weightKg.toLocaleString()} kg
                    </div>
                    <div className="w-24 h-1 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full ${fitTotals.kg > budget.weightKg ? 'bg-red-500' : 'bg-cyan-400'}`}
                        style={{ width: `${Math.min(100, (fitTotals.kg / budget.weightKg) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {budget.powerKw != null && (
                <div className="flex items-center gap-2">
                  <Zap size={13} className={fitTotals.kw > budget.powerKw ? 'text-red-400' : 'text-yellow-400'} />
                  <div>
                    <div className={`text-sm font-bold leading-none ${fitTotals.kw > budget.powerKw ? 'text-red-400' : 'text-white'}`}>
                      {fitTotals.kw.toFixed(2)} / {budget.powerKw} kW
                    </div>
                    <div className="w-24 h-1 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full ${fitTotals.kw > budget.powerKw ? 'bg-red-500' : 'bg-yellow-400'}`}
                        style={{ width: `${Math.min(100, (fitTotals.kw / budget.powerKw) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {selectedForFit.length > 0 && (
                <button
                  onClick={() => setSelectedForFit([])}
                  className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-700/50 rounded"
                >
                  Clear ({selectedForFit.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      {list.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-darker rounded-xl border border-border-subtle">
          No capabilities match. Clear the search or pick another category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((cap) => {
            const s = swapOf(cap);
            const verdict = checkFit(cap);
            const selected = selectedForFit.includes(cap.name);
            return (
              <div
                key={cap.name}
                onClick={() => setDetail(cap)}
                className={`bg-darker border rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-2.5 hover:-translate-y-0.5 ${
                  selected ? 'border-lime-brand ring-1 ring-lime-brand/40' : 'border-border-subtle hover:border-lime-brand/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-darkest border border-border-subtle flex items-center justify-center text-lime-brand font-bold text-xs flex-shrink-0">
                    {initials(cap.provider)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold leading-snug text-[15px]">{cap.name}</h3>
                    <div className="text-gray-500 text-xs mt-0.5">{cap.provider}</div>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-lime-brand/10 text-lime-brand">
                    {cap.category || 'Other'}
                  </span>
                  {cap.trl && <TRLBadge trl={cap.trl} />}
                  {(cap.securityLevel ?? []).slice(0, 2).map((lvl) => (
                    <SecurityBadge key={lvl} type={lvl} />
                  ))}
                  {verdict && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        verdict.fits ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {verdict.fits ? <Check size={10} /> : <X size={10} />}
                      {verdict.fits ? 'Fits' : verdict.reason}
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-3">{cap.description}</p>

                <div className="flex gap-2 mt-auto pt-3 border-t border-border-subtle">
                  <div className="flex-1 bg-darkest rounded-lg px-2.5 py-1.5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Weight</div>
                    <div className="text-sm font-semibold text-white">
                      {s.kg != null ? <>{s.kg} <span className="text-gray-500 text-[11px] font-normal">kg</span></> : '—'}
                    </div>
                  </div>
                  <div className="flex-1 bg-darkest rounded-lg px-2.5 py-1.5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Power</div>
                    <div className="text-sm font-semibold text-white">
                      {s.kw != null ? <>{(s.kw * 1000).toFixed(0)} <span className="text-gray-500 text-[11px] font-normal">W</span></> : '—'}
                    </div>
                  </div>
                  {budget && (s.kg != null || s.kw != null) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFit(cap.name);
                      }}
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? 'bg-lime-brand text-black'
                          : 'bg-darkest text-gray-400 border border-border-subtle hover:text-white'
                      }`}
                    >
                      {selected ? '✓ Counted' : '+ Count it'}
                    </button>
                  ) : (
                    <div className="flex-1 bg-darkest rounded-lg px-2.5 py-1.5">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">TRL</div>
                      <div className="text-sm font-semibold text-white">
                        {cap.trl ? String(cap.trl).replace(/^TRL\s*/i, '') : '—'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {detail && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[900]" onClick={() => setDetail(null)} />
          <div className="fixed top-0 right-0 h-full w-[540px] max-w-[94vw] bg-darker border-l border-border-subtle z-[901] overflow-y-auto p-7">
            <button
              onClick={() => setDetail(null)}
              className="float-right w-8 h-8 rounded-lg bg-darkest border border-border-subtle text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex gap-1.5 flex-wrap items-center mb-3">
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-lime-brand/10 text-lime-brand">
                {detail.category || 'Other'}
              </span>
              {detail.trl && <TRLBadge trl={detail.trl} />}
              {(detail.securityLevel ?? []).map((lvl) => (
                <SecurityBadge key={lvl} type={lvl} />
              ))}
            </div>

            <h2 className="text-xl font-bold text-white">{detail.name}</h2>
            <div className="text-gray-400 text-sm mt-0.5">{detail.provider}</div>

            <p className="text-gray-300 text-sm leading-relaxed mt-4">{detail.description}</p>

            {(detailSwap.kg != null || detailSwap.kw != null || detailSpecs.length > 0) && (
              <>
                <h4 className="text-lime-brand text-[11px] font-bold tracking-widest uppercase mt-6 mb-2">
                  Specifications
                </h4>
                <table className="w-full">
                  <tbody>
                    {detailSwap.kg != null && (
                      <tr className="border-b border-border-subtle">
                        <td className="py-2 pr-3 text-gray-500 text-[13px] w-[42%] align-top">Weight</td>
                        <td className="py-2 text-white text-[13px]">{detailSwap.kg} kg</td>
                      </tr>
                    )}
                    {detailSwap.kw != null && (
                      <tr className="border-b border-border-subtle">
                        <td className="py-2 pr-3 text-gray-500 text-[13px] w-[42%] align-top">Power draw</td>
                        <td className="py-2 text-white text-[13px]">{(detailSwap.kw * 1000).toFixed(0)} W</td>
                      </tr>
                    )}
                    {detailSpecs.map(([k, v]) => (
                      <tr key={k} className="border-b border-border-subtle">
                        <td className="py-2 pr-3 text-gray-500 text-[13px] w-[42%] align-top">
                          {k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}
                        </td>
                        <td className="py-2 text-white text-[13px]">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {(detail.keyFeatures ?? []).length > 0 && (
              <>
                <h4 className="text-lime-brand text-[11px] font-bold tracking-widest uppercase mt-6 mb-2">
                  Key features
                </h4>
                <ul className="space-y-1.5">
                  {detail.keyFeatures.map((f, i) => (
                    <li key={i} className="text-gray-300 text-[13px] flex gap-2">
                      <ChevronRight size={14} className="text-lime-brand flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {detail.integrationNotes && (
              <>
                <h4 className="text-lime-brand text-[11px] font-bold tracking-widest uppercase mt-6 mb-2">
                  TempestOS integration
                </h4>
                <p className="text-gray-300 text-[13px] leading-relaxed">{detail.integrationNotes}</p>
              </>
            )}

            <div className="flex items-center gap-3 bg-darkest rounded-xl px-4 py-3 mt-6 border border-border-subtle">
              <div className="w-9 h-9 rounded-lg bg-darker border border-border-subtle flex items-center justify-center text-lime-brand font-bold text-xs">
                {initials(detail.provider)}
              </div>
              <div className="text-[13px]">
                <div className="text-white font-semibold">{detail.provider}</div>
                <div className="text-gray-500 text-xs">
                  {detail.source === 'vendor'
                    ? 'Verified manufacturer · listing maintained by the vendor'
                    : 'Catalog listing'}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => {
                  setDetail(null);
                  onConfigure?.();
                }}
                className="flex-1 bg-lime-brand text-black font-bold text-sm rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-lime-brand/90"
              >
                <Package size={15} />
                Configure on a platform
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CapabilityCatalogView;
