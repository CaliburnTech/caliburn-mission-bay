import React from 'react';

// Individual vessel hull components extracted from the SVG packs

export const USVPatrolHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(50, 50)">
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

// Freedom-class LCS - Professional Technical Diagram
export const FreedomLCSHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 150" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0, 20)">
      {/* Trimaran hull - center hull */}
      <path d="M 40 120
               L 50 110
               L 60 105
               L 80 103
               L 320 103
               L 340 105
               L 350 110
               L 360 120
               L 355 130
               L 345 135
               L 330 137
               L 70 137
               L 55 135
               L 45 130
               L 40 120 Z"
      />
      
      {/* Port outrigger */}
      <path d="M 60 100
               L 65 95
               L 280 95
               L 285 100
               L 280 105
               L 65 105
               L 60 100 Z"
      />
      
      {/* Starboard outrigger */}
      <path d="M 60 140
               L 65 135
               L 280 135
               L 285 140
               L 280 145
               L 65 145
               L 60 140 Z"
      />
      
      {/* Angular superstructure */}
      <path d="M 140 103
               L 140 85
               L 145 75
               L 240 75
               L 245 85
               L 245 103"
      />
      <path d="M 150 75
               L 150 65
               L 155 60
               L 230 60
               L 235 65
               L 235 75"
      />
      
      {/* Integrated mast */}
      <path d="M 190 60
               L 190 40
               L 195 35
               L 195 60"
      />
      <rect x="188" y="35" width="9" height="5" />
      
      {/* 57mm gun */}
      <circle cx="80" cy="103" r="10" />
      <rect x="75" y="98" width="10" height="10" />
      
      {/* SeaRAM mount */}
      <circle cx="120" cy="90" r="8" />
      <path d="M 112 90 L 128 90 M 120 82 L 120 98" />
      
      {/* Mission bay (large modular area) */}
      <rect x="250" y="108" width="60" height="24" strokeDasharray="3,2" />
      
      {/* Side launch doors */}
      <rect x="255" y="125" width="8" height="10" strokeDasharray="1,1" />
      <rect x="297" y="125" width="8" height="10" strokeDasharray="1,1" />
      
      {/* Flight deck */}
      <rect x="310" y="103" width="45" height="34" strokeDasharray="2,2" />
      <circle cx="332.5" cy="120" r="13" strokeDasharray="1,1" />
      
      {/* Waterjet positions */}
      <circle cx="355" cy="120" r="5" strokeDasharray="1,1" />
      <circle cx="355" cy="110" r="3" strokeDasharray="1,1" />
      <circle cx="355" cy="130" r="3" strokeDasharray="1,1" />
      
      {/* Component mounting areas */}
      <rect x="90" y="112" width="30" height="18" strokeDasharray="2,2" />
      <rect x="155" y="112" width="40" height="18" strokeDasharray="2,2" />
      <rect x="210" y="112" width="30" height="18" strokeDasharray="2,2" />
    </g>
  </svg>
);

export const FrigateHull = FreedomLCSHull;

// Ticonderoga-class Cruiser - Professional Technical Diagram
export const TiconderogaHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 150" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0, 20)">
      {/* Main hull outline */}
      <path d="M 25 120
               L 35 110
               L 45 105
               L 60 102
               L 340 102
               L 355 105
               L 365 110
               L 375 120
               L 370 130
               L 360 135
               L 345 137
               L 65 137
               L 50 135
               L 35 130
               L 25 120 Z"
      />
      
      {/* Superstructure - Forward */}
      <rect x="120" y="82" width="50" height="20" />
      <rect x="125" y="70" width="40" height="12" />
      
      {/* Main superstructure with SPY-1 arrays */}
      <rect x="180" y="65" width="70" height="37" />
      <rect x="185" y="50" width="60" height="15" />
      {/* SPY-1 radar faces */}
      <rect x="180" y="70" width="8" height="25" fill="#cbfd00" opacity="0.1" />
      <rect x="242" y="70" width="8" height="25" fill="#cbfd00" opacity="0.1" />
      
      {/* Aft superstructure */}
      <rect x="260" y="75" width="40" height="27" />
      
      {/* Masts */}
      <line x1="150" y1="70" x2="150" y2="40" />
      <line x1="215" y1="50" x2="215" y2="25" />
      <circle cx="215" cy="25" r="4" />
      <line x1="280" y1="75" x2="280" y2="55" />
      
      {/* Forward VLS (32 cells) */}
      <rect x="75" y="92" width="35" height="10" />
      <line x1="80" y1="92" x2="80" y2="102" />
      <line x1="85" y1="92" x2="85" y2="102" />
      <line x1="90" y1="92" x2="90" y2="102" />
      <line x1="95" y1="92" x2="95" y2="102" />
      <line x1="100" y1="92" x2="100" y2="102" />
      <line x1="105" y1="92" x2="105" y2="102" />
      
      {/* Aft VLS (64 cells) */}
      <rect x="310" y="92" width="45" height="10" />
      <line x1="315" y1="92" x2="315" y2="102" />
      <line x1="320" y1="92" x2="320" y2="102" />
      <line x1="325" y1="92" x2="325" y2="102" />
      <line x1="330" y1="92" x2="330" y2="102" />
      <line x1="335" y1="92" x2="335" y2="102" />
      <line x1="340" y1="92" x2="340" y2="102" />
      <line x1="345" y1="92" x2="345" y2="102" />
      <line x1="350" y1="92" x2="350" y2="102" />
      
      {/* 5-inch guns */}
      <circle cx="55" cy="102" r="8" />
      <rect x="51" y="98" width="8" height="8" />
      <circle cx="370" cy="102" r="8" />
      <rect x="366" y="98" width="8" height="8" />
      
      {/* Component mounting areas */}
      <rect x="90" y="110" width="25" height="20" strokeDasharray="2,2" />
      <rect x="130" y="110" width="35" height="20" strokeDasharray="2,2" />
      <rect x="190" y="110" width="40" height="20" strokeDasharray="2,2" />
      <rect x="265" y="110" width="35" height="20" strokeDasharray="2,2" />
      
      {/* Helicopter pad */}
      <rect x="320" y="102" width="40" height="35" strokeDasharray="2,2" />
      <circle cx="340" cy="119.5" r="12" strokeDasharray="1,1" />
      
      {/* CIWS mounts */}
      <circle cx="110" cy="85" r="5" />
      <circle cx="305" cy="85" r="5" />
    </g>
  </svg>
);

export const CruiserHull = TiconderogaHull;

export const SubmarineHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0, 50)">
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
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(30, 50)">
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
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(30, 50)">
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
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(20, 50)">
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

// MetalShark Autonomous Patrol Boat - Professional Technical Diagram
export const MetalSharkHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 150" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0, 20)">
      {/* High-speed patrol boat hull */}
      <path d="M 50 120
               L 55 110
               L 65 105
               L 85 102
               L 100 100
               L 300 100
               L 315 102
               L 335 105
               L 345 110
               L 350 120
               L 345 128
               L 335 132
               L 315 134
               L 300 136
               L 100 136
               L 85 134
               L 65 132
               L 55 128
               L 50 120 Z"
      />
      
      {/* Deep-V hull lines */}
      <path d="M 65 105 L 70 118 L 65 132" strokeWidth="0.5" />
      <path d="M 335 105 L 330 118 L 335 132" strokeWidth="0.5" />
      
      {/* Pilothouse */}
      <rect x="140" y="80" width="60" height="20" />
      <path d="M 140 80 L 145 70 L 195 70 L 200 80" />
      {/* Windows */}
      <rect x="145" y="85" width="50" height="8" fill="#cbfd00" opacity="0.1" />
      
      {/* Mast with sensors */}
      <line x1="170" y1="70" x2="170" y2="45" />
      <circle cx="170" cy="45" r="4" />
      <line x1="165" y1="55" x2="175" y2="55" />
      <rect x="167" y="60" width="6" height="4" />
      
      {/* Forward weapon mount */}
      <circle cx="90" cy="100" r="12" strokeDasharray="2,2" />
      
      {/* Aft deck equipment area */}
      <rect x="220" y="102" width="70" height="32" strokeDasharray="2,2" />
      
      {/* Twin outboard configuration */}
      <rect x="340" y="108" width="18" height="8" />
      <rect x="340" y="120" width="18" height="8" />
      <circle cx="358" cy="112" r="4" />
      <circle cx="358" cy="124" r="4" />
      <path d="M 350 112 L 340 112 M 350 124 L 340 124" />
      
      {/* Side-mounted equipment */}
      <rect x="75" y="115" width="8" height="15" />
      <rect x="317" y="115" width="8" height="15" />
      
      {/* Component mounting areas */}
      <rect x="105" y="108" width="30" height="20" strokeDasharray="2,2" />
      <rect x="155" y="108" width="35" height="20" strokeDasharray="2,2" />
      <rect x="210" y="108" width="25" height="20" strokeDasharray="2,2" />
      
      {/* Autonomous systems indicators */}
      <circle cx="150" cy="90" r="3" fill="#cbfd00" opacity="0.3" />
      <circle cx="160" cy="90" r="3" fill="#cbfd00" opacity="0.3" />
      <circle cx="180" cy="90" r="3" fill="#cbfd00" opacity="0.3" />
      <circle cx="190" cy="90" r="3" fill="#cbfd00" opacity="0.3" />
      
      {/* Hull steps/strakes */}
      <line x1="100" y1="125" x2="300" y2="125" strokeWidth="0.5" strokeDasharray="8,4" />
      <line x1="100" y1="130" x2="300" y2="130" strokeWidth="0.5" strokeDasharray="8,4" />
    </g>
  </svg>
);

export const RIBHull = MetalSharkHull;

export const PatrolBoatHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(25, 50)">
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
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(17, 50)">
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

export const SailboatHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g stroke="#cbfd00" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0, 20)">
      <path d="M 100 130
               C 100 125, 105 123, 110 123
               L 290 123
               C 295 123, 300 125, 300 130
               C 300 135, 295 137, 290 137
               L 110 137
               C 105 137, 100 135, 100 130 Z"
      />
      <line x1="200" y1="137" x2="200" y2="155" />
      <ellipse cx="200" cy="155" rx="15" ry="3" />
      <path d="M 200 123
               L 200 30
               C 200 25, 205 20, 210 20
               L 215 20
               C 220 20, 225 22, 225 25
               L 225 110
               C 225 115, 220 118, 215 118
               L 210 118
               C 205 118, 200 120, 200 123 Z"
      />
      <circle cx="200" cy="120" r="5" />
      <line x1="195" y1="120" x2="205" y2="120" />
      <rect x="120" y="125" width="60" height="8" strokeDasharray="1,1" />
      <rect x="220" y="125" width="60" height="8" strokeDasharray="1,1" />
      <rect x="190" y="128" width="20" height="6" />
      <rect x="130" y="126" width="25" height="8" strokeDasharray="2,2" />
      <rect x="245" y="126" width="25" height="8" strokeDasharray="2,2" />
      <line x1="290" y1="123" x2="290" y2="110" />
      <circle cx="290" cy="110" r="2" />
      <circle cx="212" cy="50" r="3" />
      <line x1="212" y1="50" x2="225" y2="50" />
    </g>
  </svg>
);

// Custom Platform (Design from Scratch)
export const CustomPlatformHull = ({ size = 200, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 200" className={className}>
    <g stroke="#cbfd00" strokeWidth="2" fill="none" opacity="0.5" transform="translate(50, 50)">
      <rect x="50" y="50" width="250" height="100" rx="25" strokeDasharray="8,4" />
      <circle cx="175" cy="100" r="40" strokeDasharray="4,4" />
      <text x="175" y="105" textAnchor="middle" fill="#cbfd00" fontSize="16" opacity="0.7">
        Custom
      </text>
      <text x="175" y="120" textAnchor="middle" fill="#cbfd00" fontSize="12" opacity="0.5">
        Platform
      </text>
    </g>
  </svg>
);

// Vessel data array for outfitter view
export const vesselHullData = [
  {
    name: "USV Patrol Boat",
    type: "Unmanned Surface Vessel",
    displacement: "2.5 tons",
    description: "Autonomous patrol vessel for maritime security operations",
    icon: "USV Patrol Boat"
  },
  {
    name: "Oliver Hazard Perry Class", 
    type: "Guided Missile Frigate",
    displacement: "4,100 tons",
    description: "Multi-mission frigate optimized for anti-submarine warfare",
    icon: "Oliver Hazard Perry Class"
  },
  {
    name: "Arleigh Burke",
    type: "Guided Missile Destroyer", 
    displacement: "9,200 tons",
    description: "Advanced destroyer with Aegis combat system",
    icon: "Arleigh Burke"
  },
  {
    name: "Ticonderoga",
    type: "Guided Missile Cruiser",
    displacement: "9,600 tons", 
    description: "Multi-warfare cruiser with advanced radar systems",
    icon: "Ticonderoga"
  },
  {
    name: "Virginia Class",
    type: "Nuclear Attack Submarine",
    displacement: "7,800 tons",
    description: "Fast attack submarine for deep water operations",
    icon: "Virginia Class"
  },
  {
    name: "MetalShark",
    type: "Patrol Boat",
    displacement: "45 tons",
    description: "High-speed patrol craft for coastal operations", 
    icon: "MetalShark"
  }
];

export const vesselHullComponents = {
  "USV Patrol Boat": USVPatrolHull,
  "Oliver Hazard Perry Class": FreedomLCSHull, // Freedom-class LCS technical diagram
  "Arleigh Burke": TiconderogaHull, // Ticonderoga-class Cruiser technical diagram
  "Ticonderoga": TiconderogaHull, // Ticonderoga-class Cruiser technical diagram
  "Virginia": SubmarineHull,
  "Virginia Class": SubmarineHull,
  "MetalShark": MetalSharkHull, // Professional MetalShark patrol boat diagram
  "Saildrone": SailboatHull,
  "SubSeaSail": UUVHull,
  "GARC": StealthHull,
  "Custom Platform": CustomPlatformHull
};