import React, { useState } from 'react';

// ── colour tokens ──────────────────────────────────────────────────────────────
const L      = '#84cc16';                      // lime stroke
const LD     = 'rgba(132,204,22,0.40)';        // lime dim
const LG     = 'rgba(132,204,22,0.50)';        // lime grid
const LGG    = 'rgba(132,204,22,0.22)';        // lime grid very dim (cell lines)
const BLUE   = '#60a5fa';                      // MOOS-IvP chip
const BLUED  = 'rgba(96,165,250,0.45)';
const AMBER  = '#fbbf24';                      // OrbComm
const AMBERD = 'rgba(251,191,36,0.50)';
const OFF    = '#0d1b2a';                      // dark bg

// Sail clip boundary (polygon points)
const SAIL_PTS = '80,5 232,5 232,300 80,300';

// ── helpers ───────────────────────────────────────────────────────────────────
const CABLE_LEN = 95; // approx stroke length for dashoffset

const fade = (visible, delay = 0) => ({
  opacity:    visible ? 1 : 0,
  transform:  visible ? 'none' : 'translateY(-8px)',
  transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  pointerEvents: 'none',
});

// ── component ─────────────────────────────────────────────────────────────────
const HorusModelViewer = () => {
  const [missionSet, setMissionSet] = useState(false);

  return (
    <div className="flex gap-8 p-6 rounded-2xl border border-lime-brand/10 mb-8"
      style={{ background: OFF }}
    >

      {/* ── SVG blueprint ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <svg
          viewBox="0 0 320 510"
          width="248"
          height="397"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Clip grid to sail boundary */}
            <clipPath id="horus-sail-clip">
              <polygon points={SAIL_PTS} />
            </clipPath>
          </defs>

          {/* ── subtle dot-grid bg ── */}
          {Array.from({ length: 12 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <circle
                key={`bg-${row}-${col}`}
                cx={col * 40 + 20}
                cy={row * 42 + 10}
                r="0.8"
                fill={LGG}
              />
            ))
          )}

          {/* ══ SAIL ════════════════════════════════════════════════════════ */}

          {/* Cell grid (clipped to sail interior) */}
          <g clipPath="url(#horus-sail-clip)">
            {/* Vertical cell lines – 5 columns → 4 interior verticals */}
            {[110, 141, 171, 202].map(x => (
              <line key={`sv-${x}`} x1={x} y1="5" x2={x} y2="300"
                stroke={LG} strokeWidth="0.65"
              />
            ))}
            {/* Horizontal cell lines – 8 rows → 7 interior horizontals */}
            {[42, 83, 124, 165, 206, 247, 288].map(y => (
              <line key={`sh-${y}`} x1="80" y1={y} x2="232" y2={y}
                stroke={LG} strokeWidth="0.65"
              />
            ))}
          </g>

          {/* Sail border */}
          <polygon
            points={SAIL_PTS}
            fill="none"
            stroke={L}
            strokeWidth="1.6"
          />

          {/* ══ MAST ════════════════════════════════════════════════════════ */}
          {/* Left mast edge – runs from top to hull */}
          <line x1="79" y1="4" x2="79" y2="348"
            stroke={L} strokeWidth="1.8"
          />

          {/* Top spreader / cap fitting */}
          <line x1="74" y1="8" x2="88" y2="8"
            stroke={L} strokeWidth="1.3"
          />

          {/* Aft stay – diagonal from mast top-right to hull aft */}
          <line x1="232" y1="5" x2="245" y2="305"
            stroke={L} strokeWidth="1.0"
          />

          {/* Boom – horizontal at foot of sail */}
          <line x1="74" y1="300" x2="248" y2="300"
            stroke={L} strokeWidth="1.6"
          />

          {/* ══ HULL ════════════════════════════════════════════════════════ */}

          {/* Waterline – dim dashed reference */}
          <line x1="0" y1="345" x2="320" y2="345"
            stroke={LD} strokeWidth="0.6" strokeDasharray="10 7"
          />
          <text x="308" y="342" fontSize="7.5" fill={LD} textAnchor="end"
            fontFamily="monospace"
          >WL
          </text>

          {/* Hull body – narrow double-ended shape */}
          <path
            d="M 14,334 C 55,323 105,320 160,320 C 215,320 265,323 306,334
               L 306,346 C 265,357 215,360 160,360 C 105,360 55,357 14,346 Z"
            fill="none" stroke={L} strokeWidth="1.6"
          />

          {/* Hull deck internal bulkheads (frame lines) */}
          <line x1="79" y1="320" x2="79" y2="360" stroke={LD} strokeWidth="0.7" />
          <line x1="241" y1="320" x2="241" y2="360" stroke={LD} strokeWidth="0.7" />

          {/* Deck payload bays (two rectangles) */}
          <rect x="112" y="318" width="26" height="9" rx="1.5"
            fill="none" stroke={L} strokeWidth="1.0"
          />
          <rect x="148" y="318" width="26" height="9" rx="1.5"
            fill="none" stroke={L} strokeWidth="1.0"
          />

          {/* ══ OUTRIGGER STRUTS & PONTOONS ═════════════════════════════════ */}

          {/* Left outrigger */}
          <line x1="60" y1="347" x2="55" y2="373" stroke={L} strokeWidth="1.2" />
          <line x1="100" y1="347" x2="104" y2="373" stroke={L} strokeWidth="1.2" />
          <path
            d="M 24,374 C 33,367 48,364 72,364 C 96,364 110,367 118,374
               L 118,382 C 110,389 96,392 72,392 C 48,392 33,389 24,382 Z"
            fill="none" stroke={L} strokeWidth="1.5"
          />

          {/* Right outrigger */}
          <line x1="220" y1="347" x2="216" y2="373" stroke={L} strokeWidth="1.2" />
          <line x1="260" y1="347" x2="265" y2="373" stroke={L} strokeWidth="1.2" />
          <path
            d="M 202,374 C 210,367 225,364 249,364 C 273,364 287,367 296,374
               L 296,382 C 287,389 273,392 249,392 C 225,392 210,389 202,382 Z"
            fill="none" stroke={L} strokeWidth="1.5"
          />

          {/* ══ PAYLOADS ════════════════════════════════════════════════════ */}

          {/* ── MOOS-IvP chip (hull interior, software payload) ── */}
          <g style={fade(missionSet, 0)}>
            {/* IC body */}
            <rect x="118" y="326" width="38" height="18" rx="2"
              fill="none" stroke={BLUE} strokeWidth="1.1"
            />
            {/* internal trace lines */}
            <line x1="122" y1="330" x2="152" y2="330" stroke={BLUED} strokeWidth="0.55" />
            <line x1="122" y1="335" x2="152" y2="335" stroke={BLUED} strokeWidth="0.55" />
            <line x1="122" y1="340" x2="152" y2="340" stroke={BLUED} strokeWidth="0.55" />
            {/* IC pins – left */}
            <line x1="118" y1="330" x2="110" y2="330" stroke={BLUE} strokeWidth="0.8" />
            <line x1="118" y1="335" x2="110" y2="335" stroke={BLUE} strokeWidth="0.8" />
            <line x1="118" y1="340" x2="110" y2="340" stroke={BLUE} strokeWidth="0.8" />
            {/* IC pins – right */}
            <line x1="156" y1="330" x2="164" y2="330" stroke={BLUE} strokeWidth="0.8" />
            <line x1="156" y1="335" x2="164" y2="335" stroke={BLUE} strokeWidth="0.8" />
            <line x1="156" y1="340" x2="164" y2="340" stroke={BLUE} strokeWidth="0.8" />
            {/* callout */}
            <line x1="156" y1="335" x2="172" y2="335" stroke={BLUED} strokeWidth="0.7" />
            <text x="174" y="338" fontSize="8.5" fill={BLUE} fontFamily="monospace">MOOS-IvP</text>
          </g>

          {/* ── OrbComm radio (hull topside, right of mast) ── */}
          <g style={fade(missionSet, 0.18)}>
            {/* Antenna mast */}
            <line x1="222" y1="319" x2="222" y2="304" stroke={AMBER} strokeWidth="1.1" />
            {/* Spreader arm */}
            <line x1="217" y1="308" x2="227" y2="308" stroke={AMBER} strokeWidth="0.9" />
            {/* Dome top */}
            <path d="M 219,304 A 3,3 0 0 1 225,304" fill="none" stroke={AMBER} strokeWidth="0.9" />
            {/* Radio body */}
            <rect x="211" y="319" width="22" height="11" rx="2"
              fill="none" stroke={AMBER} strokeWidth="1.1"
            />
            {/* callout */}
            <line x1="233" y1="325" x2="247" y2="325" stroke={AMBERD} strokeWidth="0.7" />
            <text x="249" y="328" fontSize="8.5" fill={AMBER} fontFamily="monospace">OrbComm</text>
          </g>

          {/* ── Hydrophone (towed on cable below hull) ── */}
          <g>
            {/* Cable – draws in with dash animation */}
            <line
              x1="160" y1="360"
              x2="160" y2="460"
              stroke={L}
              strokeWidth="1.2"
              strokeDasharray={CABLE_LEN}
              style={{
                strokeDashoffset: missionSet ? 0 : CABLE_LEN,
                transition: `stroke-dashoffset 0.7s ease ${missionSet ? 0.35 : 0}s`,
              }}
            />
            {/* Sensor body – fades in after cable draws */}
            <g style={fade(missionSet, 0.85)}>
              <ellipse cx="160" cy="469" rx="8" ry="11"
                fill="none" stroke={L} strokeWidth="1.5"
              />
              <ellipse cx="160" cy="466" rx="3.5" ry="4"
                fill="none" stroke={LG} strokeWidth="0.8"
              />
              {/* horizontal equator line on sensor */}
              <line x1="152" y1="469" x2="168" y2="469" stroke={LG} strokeWidth="0.6" />
              {/* callout */}
              <line x1="168" y1="469" x2="180" y2="469" stroke={LD} strokeWidth="0.7" />
              <text x="182" y="472" fontSize="8.5" fill={LD} fontFamily="monospace">Hydrophone</text>
            </g>
          </g>

          {/* ══ Vessel label ════════════════════════════════════════════════ */}
          <text
            x="160" y="505"
            fontSize="8.5"
            fill={LD}
            textAnchor="middle"
            fontFamily="monospace"
            letterSpacing="2.5"
          >
            SUBSEASAIL · HORUS · AUSV
          </text>
        </svg>
      </div>

      {/* ── Controls sidebar ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        <div>
          <p className="text-lime-brand font-bold text-xs uppercase tracking-widest mb-1">
            Payload Configuration
          </p>
          <p className="text-gray-500 text-[0.72rem] leading-relaxed">
            Base vehicle displayed with no payloads. Apply a mission set to load hardware
            and software onto the hull.
          </p>
        </div>

        {/* Mission set button */}
        <button
          onClick={() => setMissionSet(v => !v)}
          className={`w-full py-3 px-5 rounded-xl border-2 text-[0.8rem] font-bold transition-all duration-300 text-left flex items-center gap-3 ${
            missionSet
              ? 'bg-lime-brand/15 border-lime-brand text-lime-brand'
              : 'bg-transparent border-gray-600 text-gray-400 hover:border-lime-brand/50 hover:text-gray-300'
          }`}
        >
          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            missionSet ? 'bg-lime-brand border-lime-brand' : 'border-gray-500'
          }`}
          >
            {missionSet && (
              <svg viewBox="0 0 10 10" width="10" height="10">
                <polyline points="2,5 4.5,8 8,2" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </span>
          Port Security Mission Set
        </button>

        {/* Payload legend – slides in */}
        <div
          style={{
            opacity: missionSet ? 1 : 0,
            transform: missionSet ? 'none' : 'translateY(8px)',
            transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s',
            pointerEvents: missionSet ? 'auto' : 'none',
          }}
          className="flex flex-col gap-2"
        >
          <p className="text-gray-600 text-[0.62rem] uppercase tracking-widest">
            Loaded Payloads
          </p>

          {[
            {
              name: 'Hydrophone',
              color: '#84cc16',
              borderColor: 'rgba(132,204,22,0.3)',
              type: 'Acoustic Sensor',
              note: 'Towed cable array · passive acoustic detection',
            },
            {
              name: 'OrbComm ST 6100',
              color: '#fbbf24',
              borderColor: 'rgba(251,191,36,0.3)',
              type: 'Satellite Communications',
              note: 'L-band SATCOM · store-and-forward messaging',
            },
            {
              name: 'MOOS-IvP',
              color: '#60a5fa',
              borderColor: 'rgba(96,165,250,0.3)',
              type: 'Autonomy Software',
              note: 'Mission behavior engine · multi-objective optimization',
            },
          ].map((p, i) => (
            <div
              key={p.name}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.borderColor}`,
                opacity: missionSet ? 1 : 0,
                transform: missionSet ? 'none' : 'translateY(6px)',
                transition: `opacity 0.35s ease ${0.3 + i * 0.1}s, transform 0.35s ease ${0.3 + i * 0.1}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{ background: p.color }}
              />
              <div>
                <p className="text-[0.75rem] font-semibold" style={{ color: p.color }}>
                  {p.name}
                </p>
                <p className="text-gray-400 text-[0.65rem]">{p.type}</p>
                <p className="text-gray-600 text-[0.62rem] mt-0.5">{p.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Idle hint */}
        {!missionSet && (
          <p className="text-gray-700 text-[0.68rem] italic">
            Hydrophone · OrbComm · MOOS-IvP will appear on the hull when activated.
          </p>
        )}
      </div>
    </div>
  );
};

export default HorusModelViewer;
