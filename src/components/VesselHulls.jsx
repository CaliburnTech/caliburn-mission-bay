import React from 'react';

// Individual vessel hull components extracted from the SVG packs

export const USVPatrolHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(50, 50)">
      <path d="M 50 100
               C 50 80, 80 70, 120 70
               L 280 70
               C 320 70, 350 80, 350 100
               C 350 120, 320 130, 280 130
               L 120 130
               C 80 130, 50 120, 50 100 Z"
      />
      <line x1="200" y1="70" x2="200" y2="40" />
      <circle cx="200" cy="40" r="3" />
      <ellipse cx="150" cy="70" rx="20" ry="10" />
      <rect x="220" y="85" width="40" height="30" strokeDasharray="2,2" />
      <rect x="140" y="85" width="40" height="30" strokeDasharray="2,2" />
    </g>
  </svg>
);

// Freedom-class LCS - Semiplaning Monohull (NOT trimaran - that's Independence-class)
export const FreedomLCSHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.45} viewBox="0 0 500 180" className={className}>
    <defs>
      <linearGradient id="freedomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Monohull - semi-planing hull form with fine entry */}
    <path
      d="M 30 95
         L 45 80
         L 70 72
         L 100 68
         L 400 68
         L 440 72
         L 465 82
         L 480 95
         L 475 110
         L 458 120
         L 430 125
         L 100 125
         L 70 122
         L 50 115
         L 35 105
         L 30 95 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Waterline */}
    <path d="M 38 108 L 475 108" className="stroke-lime-brand stroke-1 opacity-50" strokeDasharray="4,2" />

    {/* Angular superstructure - distinctive LCS look */}
    <path
      d="M 150 68 L 150 45 L 160 38 L 280 38 L 290 45 L 290 68"
      className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]"
    />
    <path
      d="M 165 38 L 165 28 L 175 22 L 265 22 L 275 28 L 275 38"
      className="fill-[#3d4852] stroke-lime-brand stroke-1"
    />

    {/* Bridge windows */}
    <rect x="175" y="42" width="90" height="10" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />

    {/* Integrated sensor mast */}
    <line x1="220" y1="22" x2="220" y2="5" className="stroke-lime-brand stroke-2" />
    <rect x="212" y="2" width="16" height="8" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    <circle cx="220" cy="0" r="4" className="fill-none stroke-lime-brand stroke-1" />

    {/* 57mm Mk 110 gun forward */}
    <rect x="75" y="55" width="30" height="18" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
    <line x1="90" y1="55" x2="90" y2="42" className="stroke-lime-brand stroke-2" />
    <rect x="85" y="40" width="10" height="5" className="fill-[#3d4852] stroke-lime-brand stroke-1" />

    {/* SeaRAM launcher */}
    <circle cx="130" cy="58" r="10" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
    <line x1="120" y1="58" x2="140" y2="58" className="stroke-lime-brand stroke-1" />
    <line x1="130" y1="48" x2="130" y2="68" className="stroke-lime-brand stroke-1" />

    {/* Aft superstructure/hangar */}
    <rect x="310" y="50" width="80" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />

    {/* Mission bay */}
    <rect x="320" y="78" width="70" height="35" className="fill-[#2d3748] stroke-lime-brand stroke-1" strokeDasharray="3,2" />

    {/* Mission bay doors */}
    <rect x="325" y="100" width="10" height="12" className="fill-none stroke-lime-brand stroke-[0.5]" strokeDasharray="1,1" />
    <rect x="375" y="100" width="10" height="12" className="fill-none stroke-lime-brand stroke-[0.5]" strokeDasharray="1,1" />

    {/* Flight deck */}
    <rect x="400" y="68" width="70" height="45" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
    <circle cx="435" cy="92" r="18" className="fill-none stroke-lime-brand stroke-1" strokeDasharray="3,2" />
    <line x1="417" y1="92" x2="453" y2="92" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="435" y1="74" x2="435" y2="110" className="stroke-lime-brand stroke-[0.5] opacity-50" />

    {/* Waterjet exhausts (4 waterjets) */}
    <ellipse cx="468" cy="85" rx="5" ry="4" className="fill-[#1a202c] stroke-lime-brand stroke-1" />
    <ellipse cx="468" cy="95" rx="5" ry="4" className="fill-[#1a202c] stroke-lime-brand stroke-1" />
    <ellipse cx="468" cy="105" rx="5" ry="4" className="fill-[#1a202c] stroke-lime-brand stroke-1" />

    {/* Component mounting areas */}
    <rect x="170" y="75" width="50" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="240" y="75" width="50" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />

    {/* Bow sonar (hull-mounted) */}
    <ellipse cx="45" cy="95" rx="10" ry="6" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="2,2" />
  </svg>
);

export const FrigateHull = FreedomLCSHull;

// Arleigh Burke-class Destroyer (DDG) - Technical Blueprint Style
export const ArleighBurkeHull = ({ size = 200, className = "", hullNumber = "62" }) => (
  <svg width={size} height={size * 0.35} viewBox="0 0 800 280" className={className}>
    <defs>
      <linearGradient id="superstructureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Main hull - gray filled */}
    <path
      d="M 30 180
         L 45 165
         L 70 155
         L 100 148
         L 680 148
         L 720 152
         L 750 160
         L 770 175
         L 765 195
         L 750 205
         L 720 212
         L 680 218
         L 100 218
         L 70 215
         L 50 208
         L 35 198
         L 30 180 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Waterline */}
    <path
      d="M 35 195 L 765 195"
      className="stroke-lime-brand stroke-1 opacity-50"
      strokeDasharray="4,2"
    />

    {/* Forward deck */}
    <rect x="50" y="145" width="180" height="8" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />

    {/* 5-inch gun mount forward */}
    <g>
      <rect x="70" y="125" width="35" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      <rect x="75" y="115" width="25" height="12" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
      <line x1="87" y1="115" x2="87" y2="100" className="stroke-lime-brand stroke-2" />
    </g>

    {/* Forward VLS */}
    <g>
      <rect x="120" y="130" width="50" height="18" className="fill-[#2d3748] stroke-lime-brand stroke-[1.5]" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={`fvls-${i}`} x1={125 + i*6} y1="130" x2={125 + i*6} y2="148" className="stroke-lime-brand stroke-[0.5] opacity-60" />
      ))}
    </g>

    {/* Forward superstructure block */}
    <g>
      <rect x="180" y="95" width="100" height="53" className="stroke-lime-brand stroke-[1.5]" fill="url(#superstructureGradient)" />
      <rect x="190" y="75" width="80" height="22" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      {/* Windows */}
      <rect x="195" y="100" width="70" height="10" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />
    </g>

    {/* Main mast */}
    <g>
      <line x1="230" y1="75" x2="230" y2="35" className="stroke-lime-brand stroke-2" />
      <line x1="220" y1="50" x2="240" y2="50" className="stroke-lime-brand stroke-[1.5]" />
      <line x1="222" y1="60" x2="238" y2="60" className="stroke-lime-brand stroke-1" />
      <circle cx="230" cy="35" r="6" className="fill-none stroke-lime-brand stroke-[1.5]" />
      {/* Radar array */}
      <rect x="218" y="42" width="24" height="6" className="fill-[#4a5568] stroke-lime-brand stroke-1" />
    </g>

    {/* SPY-1 radar housing (main superstructure) */}
    <g>
      <path
        d="M 300 148 L 300 65 L 310 55 L 430 55 L 440 65 L 440 148"
        className="stroke-lime-brand stroke-[1.5]"
        fill="url(#superstructureGradient)"
      />
      {/* SPY-1 radar face forward */}
      <rect x="305" y="70" width="15" height="40" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
      {/* SPY-1 radar face aft */}
      <rect x="420" y="70" width="15" height="40" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
      {/* Windows/bridge */}
      <rect x="330" y="65" width="80" height="15" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />
    </g>

    {/* Enclosed mast/sensor tower */}
    <g>
      <rect x="355" y="30" width="30" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" rx="3" />
      <circle cx="370" cy="20" r="12" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
      <line x1="370" y1="8" x2="370" y2="-5" className="stroke-lime-brand stroke-2" />
      <line x1="360" y1="0" x2="380" y2="0" className="stroke-lime-brand stroke-[1.5]" />
    </g>

    {/* Aft funnel/stack */}
    <g>
      <path
        d="M 450 148 L 455 90 L 460 85 L 500 85 L 505 90 L 510 148"
        className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]"
      />
      <rect x="465" y="75" width="30" height="12" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    </g>

    {/* Aft superstructure */}
    <g>
      <rect x="520" y="100" width="80" height="48" className="stroke-lime-brand stroke-[1.5]" fill="url(#superstructureGradient)" />
      <rect x="530" y="85" width="60" height="17" className="fill-[#4a5568] stroke-lime-brand stroke-1" />
    </g>

    {/* Aft mast with radar */}
    <g>
      <line x1="560" y1="85" x2="560" y2="50" className="stroke-lime-brand stroke-2" />
      <circle cx="560" cy="45" r="8" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
      <line x1="550" y1="60" x2="570" y2="60" className="stroke-lime-brand stroke-1" />
      {/* Antenna array */}
      <line x1="555" y1="55" x2="555" y2="38" className="stroke-lime-brand stroke-1" />
      <line x1="565" y1="55" x2="565" y2="42" className="stroke-lime-brand stroke-1" />
    </g>

    {/* Aft VLS */}
    <g>
      <rect x="610" y="130" width="60" height="18" className="fill-[#2d3748] stroke-lime-brand stroke-[1.5]" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <line key={`avls-${i}`} x1={615 + i*6} y1="130" x2={615 + i*6} y2="148" className="stroke-lime-brand stroke-[0.5] opacity-60" />
      ))}
    </g>

    {/* Flight deck */}
    <g>
      <rect x="680" y="145" width="80" height="55" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
      <circle cx="720" cy="175" r="20" className="fill-none stroke-lime-brand stroke-1" strokeDasharray="4,2" />
      <line x1="700" y1="175" x2="740" y2="175" className="stroke-lime-brand stroke-[0.5] opacity-50" />
      <line x1="720" y1="155" x2="720" y2="195" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    </g>

    {/* Hangar */}
    <rect x="620" y="110" width="55" height="38" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />

    {/* CIWS mounts */}
    <circle cx="295" cy="90" r="8" className="fill-[#4a5568] stroke-lime-brand stroke-1" />
    <circle cx="615" cy="105" r="8" className="fill-[#4a5568] stroke-lime-brand stroke-1" />

    {/* Hull number */}
    <text x="710" y="140" className="fill-lime-brand text-[28px] font-mono font-bold opacity-90">
      {hullNumber}
    </text>

    {/* Stern detail */}
    <path d="M 755 180 L 770 180 L 765 195 L 755 200 Z" className="fill-[#3d4852] stroke-lime-brand stroke-1" />

    {/* Bow sonar dome indication */}
    <ellipse cx="40" cy="185" rx="12" ry="8" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="2,2" />

    {/* Component mounting areas (dashed) */}
    <rect x="185" y="155" width="45" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="320" y="155" width="50" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="470" y="155" width="45" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
  </svg>
);

export const DDGHull = ArleighBurkeHull;
export const DestroyerHull = ArleighBurkeHull;

// Ticonderoga-class Cruiser - Updated Technical Blueprint Style
export const TiconderogaHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.35} viewBox="0 0 800 280" className={className}>
    <defs>
      <linearGradient id="cruiserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Main hull */}
    <path
      d="M 25 185
         L 40 168
         L 65 158
         L 95 150
         L 690 150
         L 730 155
         L 760 165
         L 780 180
         L 775 200
         L 758 212
         L 728 220
         L 95 220
         L 65 217
         L 45 210
         L 30 200
         L 25 185 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Waterline */}
    <path d="M 30 200 L 775 200" className="stroke-lime-brand stroke-1 opacity-50" strokeDasharray="4,2" />

    {/* Forward 5-inch gun */}
    <g>
      <rect x="60" y="130" width="40" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      <line x1="80" y1="130" x2="80" y2="110" className="stroke-lime-brand stroke-2" />
    </g>

    {/* Forward VLS */}
    <rect x="115" y="132" width="55" height="20" className="fill-[#2d3748] stroke-lime-brand stroke-[1.5]" />

    {/* Forward superstructure */}
    <rect x="185" y="95" width="90" height="55" className="stroke-lime-brand stroke-[1.5]" fill="url(#cruiserGradient)" />
    <rect x="195" y="78" width="70" height="20" className="fill-[#4a5568] stroke-lime-brand stroke-1" />

    {/* Main SPY-1 housing */}
    <path
      d="M 290 150 L 295 70 L 305 60 L 440 60 L 450 70 L 455 150"
      className="stroke-lime-brand stroke-[1.5]"
      fill="url(#cruiserGradient)"
    />
    {/* SPY-1 faces */}
    <rect x="300" y="75" width="12" height="35" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    <rect x="438" y="75" width="12" height="35" className="fill-[#2d3748] stroke-lime-brand stroke-1" />

    {/* Masts */}
    <line x1="230" y1="78" x2="230" y2="40" className="stroke-lime-brand stroke-2" />
    <circle cx="230" cy="35" r="6" className="fill-none stroke-lime-brand stroke-[1.5]" />
    <line x1="375" y1="60" x2="375" y2="20" className="stroke-lime-brand stroke-2" />
    <circle cx="375" cy="15" r="8" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />

    {/* Aft superstructure */}
    <rect x="470" y="85" width="80" height="65" className="stroke-lime-brand stroke-[1.5]" fill="url(#cruiserGradient)" />
    <line x1="510" y1="85" x2="510" y2="55" className="stroke-lime-brand stroke-2" />

    {/* Aft VLS */}
    <rect x="560" y="132" width="70" height="20" className="fill-[#2d3748] stroke-lime-brand stroke-[1.5]" />

    {/* Aft 5-inch gun */}
    <g>
      <rect x="640" y="130" width="40" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      <line x1="660" y1="130" x2="660" y2="110" className="stroke-lime-brand stroke-2" />
    </g>

    {/* Flight deck */}
    <rect x="690" y="148" width="75" height="52" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
    <circle cx="728" cy="175" r="18" className="fill-none stroke-lime-brand stroke-1" strokeDasharray="3,2" />

    {/* Component mounting areas */}
    <rect x="180" y="158" width="50" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="320" y="158" width="60" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="475" y="158" width="50" height="35" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
  </svg>
);

export const CruiserHull = TiconderogaHull;

// Medium USV - Technical Blueprint Style (MUSV class ~145ft)
export const MediumUSVHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.35} viewBox="0 0 500 175" className={className}>
    <defs>
      <linearGradient id="musvGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Main hull */}
    <path
      d="M 20 110
         L 30 95
         L 50 88
         L 80 82
         L 400 82
         L 435 85
         L 460 92
         L 480 105
         L 475 120
         L 460 130
         L 435 135
         L 80 135
         L 50 132
         L 35 125
         L 22 118
         L 20 110 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Waterline */}
    <path d="M 25 118 L 475 118" className="stroke-lime-brand stroke-1 opacity-50" strokeDasharray="4,2" />

    {/* Forward sensor mast */}
    <g>
      <rect x="60" y="60" width="25" height="25" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      <line x1="72" y1="60" x2="72" y2="40" className="stroke-lime-brand stroke-2" />
      <circle cx="72" cy="35" r="6" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
      <line x1="65" y1="45" x2="79" y2="45" className="stroke-lime-brand stroke-1" />
    </g>

    {/* Forward deck equipment */}
    <rect x="95" y="70" width="35" height="14" className="fill-[#2d3748] stroke-lime-brand stroke-1" />

    {/* Main superstructure/autonomy module */}
    <g>
      <rect x="145" y="52" width="100" height="33" className="stroke-lime-brand stroke-[1.5]" fill="url(#musvGradient)" />
      <rect x="155" y="40" width="80" height="14" className="fill-[#4a5568] stroke-lime-brand stroke-1" />
      {/* Sensor windows */}
      <rect x="160" y="57" width="70" height="8" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />
    </g>

    {/* Communications mast */}
    <g>
      <line x1="195" y1="40" x2="195" y2="18" className="stroke-lime-brand stroke-2" />
      <circle cx="195" cy="13" r="5" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
      <line x1="188" y1="25" x2="202" y2="25" className="stroke-lime-brand stroke-1" />
      <rect x="190" y="28" width="10" height="5" className="fill-[#4a5568] stroke-lime-brand stroke-[0.5]" />
    </g>

    {/* Aft equipment housing */}
    <rect x="260" y="58" width="70" height="27" className="stroke-lime-brand stroke-[1.5]" fill="url(#musvGradient)" />

    {/* Payload bay */}
    <rect x="345" y="70" width="60" height="15" className="fill-[#2d3748] stroke-lime-brand stroke-[1.5]" strokeDasharray="3,2" />

    {/* Aft sensor/antenna */}
    <g>
      <rect x="420" y="62" width="20" height="23" className="fill-[#4a5568] stroke-lime-brand stroke-1" />
      <line x1="430" y1="62" x2="430" y2="48" className="stroke-lime-brand stroke-[1.5]" />
      <circle cx="430" cy="44" r="4" className="fill-none stroke-lime-brand stroke-1" />
    </g>

    {/* Propulsion indicators */}
    <ellipse cx="465" cy="108" rx="8" ry="5" className="fill-none stroke-lime-brand stroke-1 opacity-60" strokeDasharray="2,1" />

    {/* Component mounting areas */}
    <rect x="100" y="90" width="40" height="30" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="200" y="90" width="55" height="30" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="340" y="90" width="50" height="30" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />

    {/* Autonomous system indicators */}
    <circle cx="170" cy="48" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="180" cy="48" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="210" cy="48" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="220" cy="48" r="2" className="fill-lime-brand opacity-60" />
  </svg>
);

export const MUSVHull = MediumUSVHull;

// Small USV - Technical Blueprint Style (12-50ft patrol/recon)
export const SmallUSVHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.35} viewBox="0 0 350 125" className={className}>
    <defs>
      <linearGradient id="susvGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Main hull - rigid inflatable style */}
    <path
      d="M 15 75
         L 25 62
         L 45 55
         L 70 50
         L 280 50
         L 310 53
         L 328 60
         L 340 72
         L 335 85
         L 320 93
         L 295 98
         L 70 98
         L 45 95
         L 28 88
         L 18 80
         L 15 75 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Waterline */}
    <path d="M 20 82 L 335 82" className="stroke-lime-brand stroke-1 opacity-50" strokeDasharray="3,2" />

    {/* Sponson/tube indication */}
    <path
      d="M 25 72 Q 20 75 25 78 L 320 78 Q 325 75 320 72"
      className="fill-none stroke-lime-brand stroke-1 opacity-40"
    />

    {/* Forward sensor pod */}
    <g>
      <circle cx="55" cy="48" r="10" className="fill-[#4a5568] stroke-lime-brand stroke-[1.5]" />
      <line x1="55" y1="38" x2="55" y2="28" className="stroke-lime-brand stroke-[1.5]" />
      <circle cx="55" cy="25" r="3" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    </g>

    {/* Main console/autonomy housing */}
    <g>
      <rect x="100" y="35" width="70" height="20" className="stroke-lime-brand stroke-[1.5]" rx="2" fill="url(#susvGradient)" />
      {/* Sensor array */}
      <rect x="110" y="40" width="50" height="6" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />
    </g>

    {/* Mast */}
    <g>
      <line x1="135" y1="35" x2="135" y2="15" className="stroke-lime-brand stroke-[1.5]" />
      <circle cx="135" cy="12" r="4" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
      <line x1="128" y1="22" x2="142" y2="22" className="stroke-lime-brand stroke-1" />
    </g>

    {/* Payload/equipment area */}
    <rect x="185" y="42" width="50" height="13" className="fill-[#2d3748] stroke-lime-brand stroke-1" />

    {/* Aft equipment */}
    <rect x="250" y="40" width="35" height="15" className="fill-[#4a5568] stroke-lime-brand stroke-1" />

    {/* Outboard motor indicators */}
    <g>
      <rect x="310" y="58" width="15" height="18" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
      <ellipse cx="325" cy="67" rx="5" ry="3" className="fill-none stroke-lime-brand stroke-1 opacity-60" />
    </g>

    {/* Component mounting areas */}
    <rect x="75" y="60" width="30" height="25" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="2,2" />
    <rect x="150" y="60" width="45" height="25" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="2,2" />
    <rect x="230" y="60" width="40" height="25" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="2,2" />

    {/* Autonomous indicators */}
    <circle cx="115" cy="32" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="125" cy="32" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="145" cy="32" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="155" cy="32" r="2" className="fill-lime-brand opacity-60" />
  </svg>
);

export const SUSVHull = SmallUSVHull;
export const PatrolUSVHull = SmallUSVHull;

// Northrop Grumman Manta Ray XLUUV - Technical Blueprint Style
export const MantaRayHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 600 300" className={className}>
    <defs>
      <linearGradient id="mantaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>

    {/* Main body - manta ray shape from above */}
    <path
      d="M 300 40
         C 340 45, 380 55, 420 80
         L 520 120
         C 560 135, 580 150, 580 160
         C 580 170, 560 175, 530 170
         L 440 155
         C 420 175, 380 200, 340 210
         L 300 220
         L 260 210
         C 220 200, 180 175, 160 155
         L 70 170
         C 40 175, 20 170, 20 160
         C 20 150, 40 135, 80 120
         L 180 80
         C 220 55, 260 45, 300 40 Z"
      className="fill-[#3d4852] stroke-lime-brand stroke-2"
    />

    {/* Wing contour lines */}
    <path
      d="M 300 60 C 350 65, 400 85, 450 110 L 500 130"
      className="fill-none stroke-lime-brand stroke-1 opacity-40"
    />
    <path
      d="M 300 60 C 250 65, 200 85, 150 110 L 100 130"
      className="fill-none stroke-lime-brand stroke-1 opacity-40"
    />

    {/* Central body ridge */}
    <path
      d="M 300 50 L 300 200"
      className="fill-none stroke-lime-brand stroke-1 opacity-50"
    />

    {/* Forward sensor housing */}
    <g>
      <ellipse cx="300" cy="70" rx="35" ry="20" className="stroke-lime-brand stroke-[1.5]" fill="url(#mantaGradient)" />
      {/* Sensor array */}
      <rect x="280" y="62" width="40" height="8" className="fill-[#1a202c] stroke-lime-brand stroke-[0.5] opacity-80" />
      <circle cx="300" cy="55" r="4" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    </g>

    {/* Main autonomy/payload bay */}
    <g>
      <ellipse cx="300" cy="120" rx="50" ry="30" className="stroke-lime-brand stroke-[1.5]" fill="url(#mantaGradient)" />
      {/* Internal systems indicator */}
      <rect x="270" y="110" width="60" height="15" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    </g>

    {/* Wing-mounted payload bays - port */}
    <rect x="150" y="115" width="40" height="25" className="fill-[#2d3748] stroke-lime-brand stroke-1" rx="3" />
    <rect x="100" y="130" width="35" height="20" className="fill-[#2d3748] stroke-lime-brand stroke-1" rx="3" strokeDasharray="3,2" />

    {/* Wing-mounted payload bays - starboard */}
    <rect x="410" y="115" width="40" height="25" className="fill-[#2d3748] stroke-lime-brand stroke-1" rx="3" />
    <rect x="465" y="130" width="35" height="20" className="fill-[#2d3748] stroke-lime-brand stroke-1" rx="3" strokeDasharray="3,2" />

    {/* Propulsion - dual rear propellers */}
    <g>
      {/* Port propeller */}
      <circle cx="260" cy="195" r="12" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
      <line x1="260" y1="183" x2="260" y2="207" className="stroke-lime-brand stroke-1" />
      <line x1="248" y1="195" x2="272" y2="195" className="stroke-lime-brand stroke-1" />

      {/* Starboard propeller */}
      <circle cx="340" cy="195" r="12" className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]" />
      <line x1="340" y1="183" x2="340" y2="207" className="stroke-lime-brand stroke-1" />
      <line x1="328" y1="195" x2="352" y2="195" className="stroke-lime-brand stroke-1" />
    </g>

    {/* Tail section */}
    <path
      d="M 280 210 L 300 250 L 320 210"
      className="fill-[#3d4852] stroke-lime-brand stroke-[1.5]"
    />
    <line x1="300" y1="220" x2="300" y2="245" className="stroke-lime-brand stroke-1 opacity-50" />

    {/* Control surfaces on wings */}
    <rect x="420" y="145" width="25" height="8" className="fill-none stroke-lime-brand stroke-1 opacity-60" />
    <rect x="155" y="145" width="25" height="8" className="fill-none stroke-lime-brand stroke-1 opacity-60" />

    {/* Component mounting areas (dashed) */}
    <rect x="220" y="140" width="35" height="30" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />
    <rect x="345" y="140" width="35" height="30" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="3,2" />

    {/* Buoyancy system indicators */}
    <circle cx="240" cy="100" r="6" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="2,1" />
    <circle cx="360" cy="100" r="6" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="2,1" />

    {/* Autonomous system indicators */}
    <circle cx="285" cy="75" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="300" cy="75" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="315" cy="75" r="2" className="fill-lime-brand opacity-60" />

    {/* Energy harvesting indicator */}
    <path d="M 300 160 L 295 170 L 305 165 L 300 175" className="stroke-lime-brand stroke-1 fill-none opacity-50" />
  </svg>
);

export const XLUUVHull = MantaRayHull;

export const SubmarineHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(0, 50)">
      <ellipse cx="200" cy="100" rx="160" ry="25" />
      <path d="M 180 75
               L 180 85
               L 190 87.5
               L 210 87.5
               L 220 85
               L 220 75
               C 220 70, 215 65, 200 65
               C 185 70, 180 70, 180 75 Z"
      />
      <line x1="195" y1="65" x2="195" y2="50" />
      <line x1="205" y1="65" x2="205" y2="55" />
      <rect x="80" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="130" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="240" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="290" y="90" width="30" height="20" strokeDasharray="2,2" />
      <circle cx="45" cy="100" r="8" strokeDasharray="1,1" />
      <circle cx="45" cy="85" r="8" strokeDasharray="1,1" />
      <circle cx="45" cy="115" r="8" strokeDasharray="1,1" />
    </g>
  </svg>
);

export const UUVHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(30, 50)">
      <ellipse cx="200" cy="100" rx="120" ry="15" />
      <path d="M 80 100
               C 80 90, 60 90, 60 100
               C 60 110, 80 110, 80 100 Z"
      />
      <path d="M 320 100
               C 320 90, 340 90, 340 100
               C 340 110, 320 110, 320 100 Z"
      />
      <path d="M 310 85 L 330 70 L 330 85 Z" />
      <path d="M 310 115 L 330 130 L 330 115 Z" />
      <rect x="100" y="92.5" width="40" height="15" strokeDasharray="2,2" />
      <rect x="180" y="92.5" width="40" height="15" strokeDasharray="2,2" />
      <rect x="260" y="92.5" width="40" height="15" strokeDasharray="2,2" />
      <circle cx="75" cy="100" r="8" strokeDasharray="1,1" />
    </g>
  </svg>
);

export const StealthHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(30, 50)">
      <path d="M 40 105
               L 60 90
               L 100 88
               L 280 88
               L 340 90
               L 370 100
               L 360 115
               L 340 120
               L 280 122
               L 100 122
               L 60 120
               L 40 115
               L 40 105 Z"
      />
      <path d="M 150 88
               L 150 75
               L 160 70
               L 240 70
               L 250 75
               L 250 88"
      />
      <path d="M 195 70 L 195 50 L 205 50 L 205 70" />
      <rect x="110" y="78" width="30" height="10" />
      <rect x="260" y="78" width="30" height="10" />
      <rect x="120" y="95" width="35" height="20" strokeDasharray="2,2" />
      <rect x="170" y="95" width="60" height="20" strokeDasharray="2,2" />
      <rect x="245" y="95" width="35" height="20" strokeDasharray="2,2" />
    </g>
  </svg>
);

export const CatamaranHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(20, 50)">
      <path d="M 60 90
               C 60 85, 70 83, 80 83
               L 140 83
               C 150 83, 160 85, 160 90
               L 160 110
               C 160 115, 150 117, 140 117
               L 80 117
               C 70 117, 60 115, 60 110
               L 60 90 Z"
      />
      <path d="M 240 90
               C 240 85, 250 83, 260 83
               L 320 83
               C 330 83, 340 85, 340 90
               L 340 110
               C 340 115, 330 117, 320 117
               L 260 117
               C 250 117, 240 115, 240 110
               L 240 90 Z"
      />
      <rect x="160" y="85" width="80" height="30" />
      <line x1="200" y1="85" x2="200" y2="50" />
      <circle cx="200" cy="50" r="5" />
      <line x1="190" y1="60" x2="210" y2="60" />
      <rect x="170" y="88" width="25" height="12" strokeDasharray="1,1" />
      <rect x="205" y="88" width="25" height="12" strokeDasharray="1,1" />
      <rect x="85" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="125" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="265" y="90" width="30" height="20" strokeDasharray="2,2" />
      <rect x="305" y="90" width="30" height="20" strokeDasharray="2,2" />
      <circle cx="70" cy="100" r="8" strokeDasharray="1,1" />
      <circle cx="330" cy="100" r="8" strokeDasharray="1,1" />
    </g>
  </svg>
);

// MetalShark Autonomous Patrol Boat - Image
import metalSharkImg from '../assets/images/MetalShark.png';

export const MetalSharkHull = ({ size = 200, className = "" }) => (
  <img
    src={metalSharkImg}
    alt="MetalShark Patrol Boat"
    width={size}
    height={size * 0.6}
    className={className}
    style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', filter: 'brightness(0.8)', clipPath: 'inset(5% 10% 10% 5% round 12px)' }}
  />
);

export const RIBHull = MetalSharkHull;

export const PatrolBoatHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(25, 50)">
      <path d="M 50 105
               L 60 95
               L 80 92
               L 100 90
               L 300 90
               L 320 92
               L 340 95
               L 350 105
               L 345 115
               L 335 120
               L 320 122
               L 300 124
               L 100 124
               L 80 122
               L 65 120
               L 55 115
               L 50 105 Z"
      />
      <rect x="170" y="70" width="60" height="20" />
      <path d="M 170 70 L 180 60 L 220 60 L 230 70" />
      <line x1="200" y1="60" x2="200" y2="40" />
      <line x1="190" y1="50" x2="210" y2="50" />
      <circle cx="200" cy="40" r="4" />
      <circle cx="100" cy="90" r="12" strokeDasharray="2,2" />
      <rect x="250" y="92" width="60" height="30" strokeDasharray="2,2" />
      <rect x="120" y="95" width="35" height="25" strokeDasharray="2,2" />
      <rect x="180" y="95" width="35" height="25" strokeDasharray="2,2" />
      <rect x="85" y="105" width="8" height="15" />
      <rect x="307" y="105" width="8" height="15" />
      <line x1="240" y1="85" x2="245" y2="85" />
      <line x1="240" y1="88" x2="245" y2="88" />
    </g>
  </svg>
);

export const CorvetteHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-[1.5] fill-none opacity-30" transform="translate(17, 50)">
      <path d="M 35 108
               L 45 98
               L 60 94
               L 80 92
               L 320 92
               L 340 94
               L 355 98
               L 365 108
               L 360 118
               L 350 122
               L 340 124
               L 320 126
               L 80 126
               L 60 124
               L 50 122
               L 40 118
               L 35 108 Z"
      />
      <rect x="160" y="72" width="80" height="20" />
      <rect x="170" y="58" width="60" height="14" />
      <path d="M 195 58 L 195 35 L 205 35 L 205 58" />
      <rect x="190" y="35" width="20" height="8" />
      <circle cx="90" cy="92" r="15" />
      <rect x="85" y="87" width="10" height="10" />
      <rect x="120" y="85" width="30" height="7" />
      <line x1="125" y1="85" x2="125" y2="92" />
      <line x1="130" y1="85" x2="130" y2="92" />
      <line x1="135" y1="85" x2="135" y2="92" />
      <line x1="140" y1="85" x2="140" y2="92" />
      <line x1="145" y1="85" x2="145" y2="92" />
      <rect x="100" y="100" width="40" height="20" strokeDasharray="2,2" />
      <rect x="155" y="100" width="50" height="20" strokeDasharray="2,2" />
      <rect x="220" y="100" width="50" height="20" strokeDasharray="2,2" />
      <circle cx="300" cy="92" r="12" strokeDasharray="2,2" />
      <rect x="75" y="108" width="5" height="10" />
      <rect x="320" y="108" width="5" height="10" />
      <rect x="250" y="75" width="8" height="15" />
    </g>
  </svg>
);

// Saildrone USV - Image
import saildroneImg from '../assets/images/Saildrone.png';

export const SaildroneHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={saildroneImg}
      alt="Saildrone"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Legacy alias
export const SailboatHull = SaildroneHull;

// Ocean Aero Triton AUSV - Autonomous Underwater and Surface Vehicle
// Wind and solar powered, can dive to avoid detection, stealth signature
export const TritonAUSVHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 450 200" className={className}>
    <defs>
      <linearGradient id="tritonHullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3d4852" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
      <linearGradient id="tritonSailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#4a5568" />
      </linearGradient>
    </defs>

    {/* Main hull - sleek submarine-like body */}
    <path
      d="M 60 110
         C 60 95, 80 85, 120 85
         L 330 85
         C 370 85, 390 95, 390 110
         C 390 125, 370 135, 330 135
         L 120 135
         C 80 135, 60 125, 60 110 Z"
      className="stroke-lime-brand stroke-[1.5]"
      fill="url(#tritonHullGradient)"
    />

    {/* Dive planes / hydrofoils - forward */}
    <path d="M 90 100 L 70 85 L 70 90 L 90 105" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    <path d="M 90 120 L 70 135 L 70 130 L 90 115" className="fill-[#3d4852] stroke-lime-brand stroke-1" />

    {/* Dive planes / hydrofoils - rear */}
    <path d="M 360 100 L 380 85 L 380 90 L 360 105" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    <path d="M 360 120 L 380 135 L 380 130 L 360 115" className="fill-[#3d4852] stroke-lime-brand stroke-1" />

    {/* Wing sail - rigid wingsail for wind propulsion */}
    <path
      d="M 200 85
         L 200 25
         C 200 20, 210 15, 220 15
         L 225 15
         C 245 15, 260 25, 260 35
         L 260 75
         C 260 80, 250 85, 240 85
         L 200 85 Z"
      className="stroke-lime-brand stroke-[1.5]"
      fill="url(#tritonSailGradient)"
    />

    {/* Sail mast */}
    <line x1="200" y1="85" x2="200" y2="25" className="stroke-lime-brand stroke-2" />

    {/* Solar panels on deck - forward array */}
    <rect x="110" y="85" width="70" height="15" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    <line x1="120" y1="85" x2="120" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="135" y1="85" x2="135" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="150" y1="85" x2="150" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="165" y1="85" x2="165" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />

    {/* Solar panels on deck - aft array */}
    <rect x="270" y="85" width="70" height="15" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    <line x1="280" y1="85" x2="280" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="295" y1="85" x2="295" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="310" y1="85" x2="310" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="325" y1="85" x2="325" y2="100" className="stroke-lime-brand stroke-[0.5] opacity-50" />

    {/* Sail boom/rotation indicator */}
    <circle cx="200" cy="85" r="8" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    <circle cx="200" cy="85" r="3" className="fill-lime-brand opacity-60" />

    {/* Sensor mast on sail */}
    <line x1="225" y1="15" x2="225" y2="5" className="stroke-lime-brand stroke-1" />
    <circle cx="225" cy="5" r="3" className="fill-none stroke-lime-brand stroke-1" />

    {/* Payload bays - dashed mount points */}
    <rect x="130" y="105" width="45" height="20" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="3,2" />
    <rect x="280" y="105" width="45" height="20" className="fill-none stroke-lime-brand stroke-1 opacity-50" strokeDasharray="3,2" />

    {/* Central electronics/autonomy bay */}
    <rect x="195" y="102" width="60" height="25" className="fill-none stroke-lime-brand stroke-1 opacity-40" strokeDasharray="2,2" />

    {/* Propulsion - electric thruster */}
    <circle cx="380" cy="110" r="8" className="fill-[#2d3748] stroke-lime-brand stroke-1" />
    <line x1="372" y1="110" x2="388" y2="110" className="stroke-lime-brand stroke-[0.5] opacity-50" />
    <line x1="380" y1="102" x2="380" y2="118" className="stroke-lime-brand stroke-[0.5] opacity-50" />

    {/* Bow sonar dome */}
    <ellipse cx="70" cy="110" r="12" ry="8" className="fill-[#3d4852] stroke-lime-brand stroke-1" />
    <circle cx="70" cy="110" r="4" className="fill-none stroke-lime-brand stroke-[0.5]" strokeDasharray="1,1" />

    {/* Dive indicator lights */}
    <circle cx="100" cy="90" r="2" className="fill-cyan-500 opacity-70" />
    <circle cx="350" cy="90" r="2" className="fill-cyan-500 opacity-70" />

    {/* Stealth waterline indicator */}
    <line x1="60" y1="115" x2="390" y2="115" className="stroke-lime-brand stroke-[0.5] opacity-30" strokeDasharray="10,5" />

    {/* Comms antenna base */}
    <rect x="240" y="80" width="15" height="5" className="fill-[#3d4852] stroke-lime-brand stroke-[0.5]" />
    <line x1="247" y1="80" x2="247" y2="70" className="stroke-lime-brand stroke-1" />
    <circle cx="247" cy="68" r="2" className="fill-lime-brand opacity-50" />

    {/* Hull status indicators */}
    <circle cx="225" cy="105" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="225" cy="112" r="2" className="fill-lime-brand opacity-60" />
    <circle cx="225" cy="119" r="2" className="fill-lime-brand opacity-60" />
  </svg>
);

// ============ UAV HULLS ============
// Clean silhouette style - aircraft recognition approach

// Boeing MQ-25 Stingray - Carrier-Based Aerial Refueling Drone
// MQ-25 Stingray - Image
import mq25Img from '../assets/images/MQ25 Stingray.png';

export const MQ25StingrayHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={mq25Img}
      alt="MQ-25 Stingray"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.1)', clipPath: 'inset(3% 3% 3% 3% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// General Atomics MQ-9 Reaper - Hunter-Killer MALE UAV
// MQ-9 Reaper - Image
import mq9ReaperImg from '../assets/images/MQ9Reaper.png';

export const MQ9ReaperHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={mq9ReaperImg}
      alt="MQ-9 Reaper"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.38)', clipPath: 'inset(8% 12% 12% 8% round 20px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Black Widow Micro-Drone - Image
import blackWidowImg from '../assets/images/BlackWidow.png';

export const BlackWidowHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={blackWidowImg}
      alt="Black Widow Micro-Drone"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Switchblade Loitering Munition - Image
import switchbladeImg from '../assets/images/Switchblade.png';

export const SwitchbladeHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={switchbladeImg}
      alt="Switchblade Loitering Munition"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Northrop Grumman MQ-4C Triton - HALE Maritime ISR
// MQ-4C Triton - Image
import mq4cTritonImg from '../assets/images/MQ4C Triton.png';

export const MQ4CTritonHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={mq4cTritonImg}
      alt="MQ-4C Triton"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.1)', clipPath: 'inset(3% 3% 3% 3% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Northrop Grumman MQ-8C Fire Scout - Shipborne Rotary-Wing UAV
// MQ-8C Fire Scout - Image
import mq8cFireScoutImg from '../assets/images/MQ8C Fire.png';

export const MQ8FireScoutHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={mq8cFireScoutImg}
      alt="MQ-8C Fire Scout"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.38)', clipPath: 'inset(8% 12% 12% 8% round 20px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Boeing/Insitu RQ-21A Blackjack - Small Tactical UAS
// RQ-21A Blackjack - Image
import rq21aBlackjackImg from '../assets/images/RQ21A Blackjack.png';

export const RQ21BlackjackHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={rq21aBlackjackImg}
      alt="RQ-21A Blackjack"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.1)', clipPath: 'inset(3% 3% 3% 3% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Custom Platform (Design from Scratch)
export const CustomPlatformHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g className="stroke-lime-brand stroke-2 fill-none opacity-50" transform="translate(50, 50)">
      <rect x="50" y="50" width="250" height="100" rx="25" strokeDasharray="8,4" />
      <circle cx="175" cy="100" r="40" strokeDasharray="4,4" />
      <text x="175" y="105" textAnchor="middle" className="fill-lime-brand text-[16px] opacity-70">
        Custom
      </text>
      <text x="175" y="120" textAnchor="middle" className="fill-lime-brand text-[12px] opacity-50">
        Platform
      </text>
    </g>
  </svg>
);

// SubSeaSail UUV - Image
import subSeaSailImg from '../assets/images/SubSeaSail.png';

export const SubSeaSailHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={subSeaSailImg}
      alt="SubSeaSail UUV"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(0.77)', filter: 'brightness(1.5)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// AEGIR Family - Images
import aegirFImg from '../assets/images/AEGIR-F.png';
import aegirWImg from '../assets/images/AEGIR-W.png';
import aegirHImg from '../assets/images/AEGIR-H.png';

export const AEGIRFHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={aegirFImg}
      alt="AEGIR-F Kinetic USV"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(0.96)', filter: 'brightness(1.5)', clipPath: 'inset(3% 1% 10% 1% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

export const AEGIRWHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={aegirWImg}
      alt="AEGIR-W Combat USV"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

export const AEGIRHHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={aegirHImg}
      alt="AEGIR-H Multi-Role USV"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.53)', clipPath: 'inset(5% 10% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// GARC Research Vessel - Image
import garcImg from '../assets/images/GARC.png';

export const GARCHull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={garcImg}
      alt="GARC Research Vessel"
      width={size}
      height={size * 0.6}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.22)', clipPath: 'inset(3% 4% 10% 3% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// ZeroUSV Oceanus17 - 17m Electric USV for ASW/Survey missions
import zeroUSVImg from '../assets/images/ZeroUSV-Oceanus17.png';

export const ZeroUSVOceanus17Hull = ({ size = 200, className = "" }) => {
  const isSmall = size < 100;
  const mask = isSmall
    ? 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)'
    : 'radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)';
  return (
    <img
      src={zeroUSVImg}
      alt="ZeroUSV Oceanus17"
      width={size}
      height={size * 0.5}
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.3)', filter: 'brightness(1.2)', clipPath: 'inset(5% 5% 10% 5% round 12px)', WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};

// Magnet Defense M48 LUSV
import m48Img from '../assets/images/M48.png';

export const M48Hull = ({ size = 200, className = "" }) => (
  <img
    src={m48Img}
    alt="Magnet Defense M48"
    width={size}
    height={size * 0.6}
    className={className}
    style={{ objectFit: 'contain', mixBlendMode: 'lighten', transform: 'scale(1.2)', filter: 'brightness(0.9)' }}
  />
);

// Note: Vessel data and mappings have been moved to src/data/vesselData.js to fix fast refresh violations
