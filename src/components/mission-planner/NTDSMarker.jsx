import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

/**
 * NTDS-style tactical symbol marker (per operator symbol key, Aug 2026):
 *
 *              friend                    hostile
 *   air        arc open at the bottom    chevron pointing up  ^
 *   surface    circle                    diamond
 *   sub        arc open at the top       chevron pointing down v
 *
 *   ownship    circle with internal cross — "your boat" (the mothership /
 *              command node the demo audience identifies with)
 *
 * Replaces the generic CircleMarker for every UNIT in the mission views.
 * Non-unit graphics (mines, torpedoes, cargo dots, data packets, explosions,
 * shore sites) stay as plain Leaflet primitives.
 *
 * Props:
 *   position     [lat, lng]
 *   domain       'air' | 'surface' | 'sub'          (ignored for ownship)
 *   affiliation  'friend' | 'hostile' | 'ownship'
 *   color        stroke color
 *   fill         fill color (surface-friend circle and hostile diamond only;
 *                open shapes never fill). Default 'none'.
 *   fillOpacity  fill opacity (default 0.9)
 *   size         symbol size in px (diameter-equivalent; CircleMarker radius
 *                r maps to roughly size = 2 * r)
 *   weight       stroke width
 *   label        optional small grey text rendered under the symbol —
 *                unobtrusive unit naming for the strike-group missions
 *   opacity      whole-marker opacity
 *   dashed       dashed stroke (e.g. link-denied state)
 *   children     react-leaflet <Tooltip> etc.
 */
const NTDSMarker = ({
  position,
  domain = 'surface',
  affiliation = 'friend',
  color = '#60a5fa',
  fill = 'none',
  fillOpacity = 0.9,
  size = 20,
  weight = 2.5,
  label,
  opacity = 1,
  dashed = false,
  children,
}) => {
  const icon = useMemo(() => {
    const s = size;
    const pad = weight; // keep strokes inside the viewBox
    const c = s / 2;
    const r = c - pad;
    const dash = dashed ? `stroke-dasharray="3 3"` : '';
    const strokeAttrs = `stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" ${dash}`;

    let body = '';
    if (affiliation === 'ownship') {
      // circle with internal cross
      body =
        `<circle cx="${c}" cy="${c}" r="${r}" ${strokeAttrs} fill="${fill}" fill-opacity="${fillOpacity}"/>` +
        `<line x1="${c - r}" y1="${c}" x2="${c + r}" y2="${c}" ${strokeAttrs}/>` +
        `<line x1="${c}" y1="${c - r}" x2="${c}" y2="${c + r}" ${strokeAttrs}/>`;
    } else if (affiliation === 'hostile') {
      if (domain === 'air') {
        // chevron pointing up, open bottom
        body = `<path d="M ${pad} ${s - pad} L ${c} ${pad} L ${s - pad} ${s - pad}" ${strokeAttrs} fill="none"/>`;
      } else if (domain === 'sub') {
        // chevron pointing down, open top
        body = `<path d="M ${pad} ${pad} L ${c} ${s - pad} L ${s - pad} ${pad}" ${strokeAttrs} fill="none"/>`;
      } else {
        // diamond
        body = `<polygon points="${c},${pad} ${s - pad},${c} ${c},${s - pad} ${pad},${c}" ${strokeAttrs} fill="${fill}" fill-opacity="${fillOpacity}"/>`;
      }
    } else {
      // friend
      if (domain === 'air') {
        // arc open at the bottom (dome over the top)
        const y = s * 0.78;
        body = `<path d="M ${pad} ${y} A ${r} ${r} 0 1 1 ${s - pad} ${y}" ${strokeAttrs} fill="none"/>`;
      } else if (domain === 'sub') {
        // arc open at the top (cup under the bottom)
        const y = s * 0.22;
        body = `<path d="M ${pad} ${y} A ${r} ${r} 0 1 0 ${s - pad} ${y}" ${strokeAttrs} fill="none"/>`;
      } else {
        // circle
        body = `<circle cx="${c}" cy="${c}" r="${r}" ${strokeAttrs} fill="${fill}" fill-opacity="${fillOpacity}"/>`;
      }
    }

    const labelHtml = label
      ? `<span style="margin-top:1px;font-size:9px;font-weight:700;letter-spacing:0.02em;color:#aab2bd;white-space:nowrap;text-shadow:0 0 3px rgba(0,0,0,0.95), 0 0 7px rgba(0,0,0,0.8);pointer-events:none;">${label}</span>`
      : '';

    return L.divIcon({
      className: 'ntds-marker', // custom class: no default leaflet-div-icon white box
      html:
        `<div style="display:flex;flex-direction:column;align-items:center;opacity:${opacity};">` +
        `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="overflow:visible;display:block;">${body}</svg>` +
        labelHtml +
        `</div>`,
      iconSize: [s, s],
      // anchor at the symbol's center so the label hangs below the position
      iconAnchor: [s / 2, s / 2],
    });
  }, [domain, affiliation, color, fill, fillOpacity, size, weight, label, opacity, dashed]);

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
};

export default NTDSMarker;
