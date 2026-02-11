// Military-grade SVG icons and illustrations for defense systems
import React from 'react';

// NGHTS Laser Targeting System
export const NGHTSIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="nghts-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbfd00" />
        <stop offset="100%" stopColor="#9fd700" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge> 
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Laser housing */}
    <rect x="20" y="35" width="60" height="30" rx="4" fill="#2a3844" stroke="#cbfd00" strokeWidth="1" />
    
    {/* Lens assembly */}
    <circle cx="75" cy="50" r="12" fill="url(#nghts-gradient)" opacity="0.8" />
    <circle cx="75" cy="50" r="8" fill="#1a2530" stroke="#cbfd00" strokeWidth="1" />
    <circle cx="75" cy="50" r="4" fill="#cbfd00" filter="url(#glow)" />
    
    {/* Laser beam */}
    <line x1="87" y1="50" x2="95" y2="50" stroke="#cbfd00" strokeWidth="2" opacity="0.9" filter="url(#glow)" />
    <line x1="87" y1="49" x2="95" y2="49" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
    
    {/* Mounting bracket */}
    <rect x="15" y="40" width="10" height="20" rx="2" fill="#374151" />
    <rect x="80" y="40" width="10" height="20" rx="2" fill="#374151" />
    
    {/* Control unit */}
    <rect x="25" y="40" width="25" height="15" rx="2" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="27" y="42" width="4" height="2" fill="#cbfd00" />
    <rect x="32" y="42" width="4" height="2" fill="#4ade80" />
    <rect x="37" y="42" width="4" height="2" fill="#f87171" />
  </svg>
);

// Scion ESM Electronic Support Measures
export const ScionESMIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="esm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    
    {/* Antenna array */}
    <rect x="40" y="20" width="20" height="60" rx="2" fill="#2a3844" stroke="#60a5fa" strokeWidth="1" />
    
    {/* Antenna elements */}
    <rect x="30" y="25" width="40" height="2" fill="#60a5fa" />
    <rect x="25" y="35" width="50" height="2" fill="#60a5fa" />
    <rect x="30" y="45" width="40" height="2" fill="#60a5fa" />
    <rect x="35" y="55" width="30" height="2" fill="#60a5fa" />
    <rect x="40" y="65" width="20" height="2" fill="#60a5fa" />
    
    {/* Signal waves */}
    <path d="M 15 30 Q 25 25 35 30" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    <path d="M 15 40 Q 25 35 35 40" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    <path d="M 15 50 Q 25 45 35 50" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    
    <path d="M 65 30 Q 75 25 85 30" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    <path d="M 65 40 Q 75 35 85 40" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    <path d="M 65 50 Q 75 45 85 50" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
    
    {/* Processing unit */}
    <rect x="42" y="70" width="16" height="8" rx="1" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="44" y="72" width="3" height="1" fill="#4ade80" />
    <rect x="48" y="72" width="3" height="1" fill="#cbfd00" />
    <rect x="52" y="72" width="3" height="1" fill="#f87171" />
  </svg>
);

// Hidden Level Passive Radar
export const HiddenLevelRadarIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="hidden-radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
      <filter id="passive-glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge> 
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Main sensor housing */}
    <rect x="25" y="30" width="50" height="40" rx="6" fill="#2a3844" stroke="#8b5cf6" strokeWidth="2" />
    
    {/* Passive receiver array */}
    <rect x="30" y="35" width="40" height="30" rx="3" fill="#1a2530" stroke="#a855f7" strokeWidth="1" />
    
    {/* RF receiver elements */}
    {Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 6 }, (_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={32 + col * 6}
          cy={37 + row * 6}
          r="1.5"
          fill="#8b5cf6"
          opacity={0.6 + Math.random() * 0.4}
        />
      ))
    )}
    
    {/* Passive detection waves - incoming signals */}
    <path d="M 15 25 Q 20 30 25 35" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
    <path d="M 10 35 Q 17 40 25 45" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
    <path d="M 15 55 Q 20 50 25 45" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
    <path d="M 10 65 Q 17 60 25 55" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
    
    <path d="M 85 25 Q 80 30 75 35" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
    <path d="M 90 35 Q 83 40 75 45" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
    <path d="M 85 55 Q 80 50 75 45" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
    <path d="M 90 65 Q 83 60 75 55" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
    
    {/* Processing unit indicator */}
    <rect x="40" y="70" width="20" height="8" rx="2" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="42" y="72" width="4" height="2" fill="#8b5cf6" />
    <rect x="47" y="72" width="4" height="2" fill="#a855f7" />
    <rect x="52" y="72" width="4" height="2" fill="#c084fc" />
    
    {/* "PASSIVE" indicator text */}
    <text x="50" y="88" textAnchor="middle" fill="#8b5cf6" fontSize="6" fontWeight="bold">PASSIVE</text>
    
    {/* Stealth mode indicator */}
    <circle cx="20" cy="20" r="3" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
    <circle cx="80" cy="20" r="3" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
  </svg>
);

// Advanced Towed Sonar
export const TowedSonarIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="sonar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    
    {/* Sonar array body */}
    <ellipse cx="50" cy="50" rx="35" ry="8" fill="#2a3844" stroke="#06b6d4" strokeWidth="2" />
    
    {/* Hydrophone elements */}
    {Array.from({ length: 12 }, (_, i) => (
      <circle
        key={i}
        cx={20 + i * 5}
        cy="50"
        r="1.5"
        fill="#06b6d4"
        opacity={0.8}
      />
    ))}
    
    {/* Sonar waves */}
    <path d="M 15 40 Q 30 35 45 40" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
    <path d="M 15 50 Q 30 45 45 50" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
    <path d="M 15 60 Q 30 55 45 60" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
    
    <path d="M 55 40 Q 70 35 85 40" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
    <path d="M 55 50 Q 70 45 85 50" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
    <path d="M 55 60 Q 70 55 85 60" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
    
    {/* Tow cable */}
    <rect x="10" y="48" width="15" height="4" rx="2" fill="#374151" />
    <rect x="75" y="48" width="15" height="4" rx="2" fill="#374151" />
    
    {/* Processing unit */}
    <rect x="40" y="65" width="20" height="10" rx="2" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="42" y="67" width="4" height="2" fill="#06b6d4" />
    <rect x="47" y="67" width="4" height="2" fill="#4ade80" />
    <rect x="52" y="67" width="4" height="2" fill="#cbfd00" />
  </svg>
);

// SM-6 Missile
export const SM6MissileIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="missile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    
    {/* Missile body */}
    <rect x="30" y="20" width="40" height="60" rx="20" fill="#2a3844" stroke="#ef4444" strokeWidth="2" />
    
    {/* Nose cone */}
    <path d="M 30 20 Q 50 10 70 20" fill="#ef4444" />
    
    {/* Fins */}
    <polygon points="25,60 30,55 30,65" fill="#374151" />
    <polygon points="75,60 70,55 70,65" fill="#374151" />
    <polygon points="45,25 50,30 55,25" fill="#374151" />
    <polygon points="45,75 50,70 55,75" fill="#374151" />
    
    {/* Guidance section */}
    <rect x="35" y="30" width="30" height="15" rx="2" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <circle cx="50" cy="37" r="3" fill="#ef4444" opacity="0.8" />
    
    {/* Warhead section */}
    <rect x="35" y="50" width="30" height="20" rx="2" fill="#374151" />
    <rect x="37" y="55" width="26" height="3" fill="#ef4444" />
    <rect x="37" y="60" width="26" height="3" fill="#ef4444" />
    <rect x="37" y="65" width="26" height="3" fill="#ef4444" />
    
    {/* Rocket motor */}
    <rect x="40" y="72" width="20" height="8" rx="4" fill="#dc2626" />
    <rect x="42" y="74" width="16" height="4" fill="#ef4444" />
  </svg>
);

// High-Energy Laser
export const HighEnergyLaserIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="laser-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="intense-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge> 
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Laser housing */}
    <rect x="15" y="30" width="70" height="40" rx="6" fill="#2a3844" stroke="#f59e0b" strokeWidth="2" />
    
    {/* Cooling system */}
    <rect x="20" y="35" width="15" height="30" rx="2" fill="#1a2530" />
    <rect x="22" y="37" width="11" height="3" fill="#06b6d4" />
    <rect x="22" y="42" width="11" height="3" fill="#06b6d4" />
    <rect x="22" y="47" width="11" height="3" fill="#06b6d4" />
    <rect x="22" y="52" width="11" height="3" fill="#06b6d4" />
    <rect x="22" y="57" width="11" height="3" fill="#06b6d4" />
    
    {/* Laser chamber */}
    <rect x="40" y="40" width="30" height="20" rx="3" fill="#374151" stroke="#f59e0b" strokeWidth="1" />
    <rect x="42" y="45" width="26" height="10" fill="#f59e0b" opacity="0.6" />
    
    {/* Focusing optics */}
    <circle cx="75" cy="50" r="8" fill="#1a2530" stroke="#f59e0b" strokeWidth="2" />
    <circle cx="75" cy="50" r="5" fill="#f59e0b" opacity="0.8" />
    <circle cx="75" cy="50" r="2" fill="#ffffff" filter="url(#intense-glow)" />
    
    {/* Laser beam */}
    <line x1="83" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="4" filter="url(#intense-glow)" />
    <line x1="83" y1="50" x2="95" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
    
    {/* Power indicators */}
    <rect x="25" y="72" width="50" height="6" rx="3" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="27" y="74" width="20" height="2" fill="#4ade80" />
    <rect x="48" y="74" width="15" height="2" fill="#f59e0b" />
    <rect x="64" y="74" width="9" height="2" fill="#ef4444" />
  </svg>
);

// Camera/Optical Sensors
export const CameraIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="camera-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
    </defs>
    <rect x="20" y="35" width="60" height="40" rx="8" fill="url(#camera-gradient)" stroke="#60a5fa" strokeWidth="2" />
    <circle cx="50" cy="55" r="15" fill="#1e40af" stroke="#60a5fa" strokeWidth="2" />
    <circle cx="50" cy="55" r="8" fill="#93c5fd" opacity="0.8" />
    <rect x="65" y="30" width="8" height="8" rx="2" fill="#ef4444" />
    <rect x="25" y="40" width="4" height="3" rx="1" fill="#60a5fa" />
  </svg>
);

// GPS/Navigation
export const GPSIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="gps-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="30" fill="url(#gps-gradient)" stroke="#34d399" strokeWidth="2" />
    <circle cx="50" cy="50" r="20" fill="none" stroke="#6ee7b7" strokeWidth="1" opacity="0.6" />
    <circle cx="50" cy="50" r="10" fill="none" stroke="#6ee7b7" strokeWidth="1" opacity="0.4" />
    <circle cx="50" cy="50" r="3" fill="#ffffff" />
    <path d="M 50 20 L 55 30 L 45 30 Z" fill="#ffffff" />
    <path d="M 80 50 L 70 45 L 70 55 Z" fill="#ffffff" />
    <path d="M 50 80 L 45 70 L 55 70 Z" fill="#ffffff" />
    <path d="M 20 50 L 30 55 L 30 45 Z" fill="#ffffff" />
  </svg>
);

// Battery/Power
export const BatteryIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="battery-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="70%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#6ee7b7" />
      </linearGradient>
    </defs>
    <rect x="20" y="35" width="55" height="30" rx="4" fill="#374151" stroke="#6b7280" strokeWidth="2" />
    <rect x="75" y="42" width="5" height="16" rx="2" fill="#6b7280" />
    <rect x="25" y="40" width="45" height="20" rx="2" fill="url(#battery-gradient)" />
    <rect x="30" y="44" width="8" height="12" fill="#ffffff" opacity="0.3" />
    <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">PWR</text>
  </svg>
);

// Antenna/Communications
export const AntennaIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="antenna-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <rect x="47" y="30" width="6" height="50" fill="url(#antenna-gradient)" />
    <rect x="45" y="75" width="10" height="8" rx="2" fill="#374151" />
    <line x1="35" y1="35" x2="65" y2="35" stroke="#f59e0b" strokeWidth="2" />
    <line x1="30" y1="45" x2="70" y2="45" stroke="#f59e0b" strokeWidth="2" />
    <line x1="25" y1="55" x2="75" y2="55" stroke="#f59e0b" strokeWidth="2" />
    <path d="M 20 40 Q 30 35 40 40" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
    <path d="M 60 40 Q 70 35 80 40" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Motor/Propulsion
export const MotorIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="motor-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="25" fill="url(#motor-gradient)" stroke="#818cf8" strokeWidth="2" />
    <circle cx="50" cy="50" r="15" fill="#312e81" stroke="#818cf8" strokeWidth="1" />
    <circle cx="50" cy="50" r="5" fill="#818cf8" />
    <rect x="35" y="48" width="8" height="4" fill="#374151" />
    <rect x="57" y="48" width="8" height="4" fill="#374151" />
    <rect x="48" y="35" width="4" height="8" fill="#374151" />
    <rect x="48" y="57" width="4" height="8" fill="#374151" />
  </svg>
);

// Propeller
export const PropellerIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="prop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="35" rx="40" ry="8" fill="url(#prop-gradient)" transform="rotate(45 50 50)" />
    <ellipse cx="50" cy="65" rx="40" ry="8" fill="url(#prop-gradient)" transform="rotate(45 50 50)" />
    <circle cx="50" cy="50" r="6" fill="#374151" stroke="#a78bfa" strokeWidth="2" />
    <circle cx="50" cy="50" r="2" fill="#a78bfa" />
  </svg>
);

// Frame/Structure
export const FrameIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    <path d="M 30 30 L 70 30 L 70 45 L 55 45 L 55 55 L 70 55 L 70 70 L 30 70 L 30 55 L 45 55 L 45 45 L 30 45 Z" 
          fill="url(#frame-gradient)" stroke="#9ca3af" strokeWidth="2"
    />
    <circle cx="30" cy="30" r="4" fill="#ef4444" />
    <circle cx="70" cy="30" r="4" fill="#ef4444" />
    <circle cx="30" cy="70" r="4" fill="#ef4444" />
    <circle cx="70" cy="70" r="4" fill="#ef4444" />
  </svg>
);

// Flight Controller/CPU
export const FlightControllerIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="fc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="25" y="25" width="50" height="50" rx="4" fill="url(#fc-gradient)" stroke="#10b981" strokeWidth="2" />
    <rect x="30" y="30" width="40" height="40" rx="2" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
    <rect x="35" y="35" width="8" height="8" fill="#10b981" />
    <rect x="47" y="35" width="8" height="8" fill="#10b981" />
    <rect x="59" y="35" width="8" height="8" fill="#10b981" />
    <rect x="35" y="47" width="8" height="8" fill="#10b981" />
    <rect x="59" y="47" width="8" height="8" fill="#10b981" />
    <rect x="35" y="59" width="8" height="8" fill="#10b981" />
    <rect x="47" y="59" width="8" height="8" fill="#10b981" />
    <rect x="59" y="59" width="8" height="8" fill="#10b981" />
    <circle cx="20" cy="30" r="2" fill="#fbbf24" />
    <circle cx="80" cy="30" r="2" fill="#fbbf24" />
    <circle cx="20" cy="70" r="2" fill="#fbbf24" />
    <circle cx="80" cy="70" r="2" fill="#fbbf24" />
  </svg>
);

// LED/Lights
export const LEDIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="led-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
      <filter id="led-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge> 
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="45" r="15" fill="url(#led-gradient)" filter="url(#led-glow)" />
    <rect x="47" y="60" width="6" height="15" fill="#374151" />
    <rect x="45" y="75" width="10" height="5" rx="2" fill="#6b7280" />
    <path d="M 35 35 L 25 25" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
    <path d="M 65 35 L 75 25" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
    <path d="M 35 55 L 25 65" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
    <path d="M 65 55 L 75 65" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
  </svg>
);

// Infrared Sensor
export const InfraredIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="ir-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </radialGradient>
    </defs>
    <rect x="30" y="35" width="40" height="30" rx="6" fill="#374151" stroke="#6b7280" strokeWidth="2" />
    <circle cx="50" cy="50" r="12" fill="url(#ir-gradient)" stroke="#f87171" strokeWidth="2" />
    <circle cx="50" cy="50" r="6" fill="#7f1d1d" />
    <path d="M 25 40 Q 20 35 15 40" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
    <path d="M 25 50 Q 20 45 15 50" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
    <path d="M 25 60 Q 20 55 15 60" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
    <text x="50" y="75" textAnchor="middle" fill="#dc2626" fontSize="8" fontWeight="bold">IR</text>
  </svg>
);

// Stabilizer/Gimbal
export const StabilizerIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="stab-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#a78bfa" strokeWidth="3" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="#a78bfa" strokeWidth="2" />
    <rect x="40" y="40" width="20" height="20" rx="4" fill="url(#stab-gradient)" stroke="#c4b5fd" strokeWidth="2" />
    <circle cx="50" cy="50" r="5" fill="#1e1b4b" />
    <line x1="25" y1="50" x2="35" y2="50" stroke="#a78bfa" strokeWidth="2" />
    <line x1="65" y1="50" x2="75" y2="50" stroke="#a78bfa" strokeWidth="2" />
    <line x1="50" y1="25" x2="50" y2="35" stroke="#a78bfa" strokeWidth="2" />
    <line x1="50" y1="65" x2="50" y2="75" stroke="#a78bfa" strokeWidth="2" />
  </svg>
);

// Downward Sensor/Proximity
export const DownwardSensorIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="down-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <rect x="35" y="25" width="30" height="20" rx="4" fill="url(#down-gradient)" stroke="#67e8f9" strokeWidth="2" />
    <circle cx="50" cy="35" r="6" fill="#164e63" stroke="#67e8f9" strokeWidth="1" />
    <path d="M 50 45 L 50 70" stroke="#06b6d4" strokeWidth="3" />
    <path d="M 40 65 L 50 75 L 60 65" fill="none" stroke="#06b6d4" strokeWidth="2" />
    <path d="M 30 60 Q 35 65 40 60" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.6" />
    <path d="M 60 60 Q 65 65 70 60" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.6" />
    <path d="M 35 70 Q 45 75 55 70" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Landing Gear
export const LandingGearIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="gear-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    <rect x="45" y="20" width="10" height="40" fill="url(#gear-gradient)" />
    <rect x="35" y="55" width="30" height="8" rx="4" fill="url(#gear-gradient)" stroke="#9ca3af" strokeWidth="1" />
    <circle cx="40" cy="70" r="8" fill="#374151" stroke="#9ca3af" strokeWidth="2" />
    <circle cx="60" cy="70" r="8" fill="#374151" stroke="#9ca3af" strokeWidth="2" />
    <circle cx="40" cy="70" r="4" fill="#6b7280" />
    <circle cx="60" cy="70" r="4" fill="#6b7280" />
    <rect x="38" y="75" width="4" height="8" rx="2" fill="#9ca3af" />
    <rect x="58" y="75" width="4" height="8" rx="2" fill="#9ca3af" />
  </svg>
);

// SNC Modi II Electronic Warfare System
export const ModiEWIcon = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="modi-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <radialGradient id="signal-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
      <filter id="modi-glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge> 
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Main Unit Housing */}
    <rect x="25" y="30" width="50" height="40" rx="4" fill="#2a3844" stroke="#f97316" strokeWidth="2" />
    
    {/* Modular Panels */}
    <rect x="30" y="35" width="18" height="30" rx="2" fill="#1a2530" stroke="#fb923c" strokeWidth="1" />
    <rect x="52" y="35" width="18" height="30" rx="2" fill="#1a2530" stroke="#fb923c" strokeWidth="1" />
    
    {/* Electronic Components */}
    {Array.from({ length: 3 }, (_, row) =>
      Array.from({ length: 2 }, (_, col) => (
        <rect
          key={`${row}-${col}`}
          x={32 + col * 18}
          y={37 + row * 8}
          width="14"
          height="6"
          rx="1"
          fill="#f97316"
          opacity={0.7 + Math.random() * 0.3}
        />
      ))
    )}
    
    {/* RF Signal Emissions */}
    <circle cx="50" cy="25" r="3" fill="url(#signal-gradient)" filter="url(#modi-glow)" />
    
    {/* Signal Waves - Jamming patterns */}
    <path d="M 35 20 Q 40 15 45 20" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.8" />
    <path d="M 55 20 Q 60 15 65 20" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.8" />
    <path d="M 30 25 Q 37 18 44 25" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
    <path d="M 56 25 Q 63 18 70 25" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
    
    {/* Disruption indicators */}
    <path d="M 20 40 L 25 35" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
    <path d="M 20 45 L 25 40" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
    <path d="M 75 35 L 80 40" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
    <path d="M 75 40 L 80 45" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
    
    {/* Control Interface */}
    <rect x="40" y="72" width="20" height="8" rx="2" fill="#1a2530" stroke="#9ca3af" strokeWidth="0.5" />
    <rect x="42" y="74" width="4" height="2" fill="#4ade80" />
    <rect x="47" y="74" width="4" height="2" fill="#f97316" />
    <rect x="52" y="74" width="4" height="2" fill="#ef4444" />
    
    {/* MODI Label */}
    <text x="50" y="90" textAnchor="middle" fill="#f97316" fontSize="7" fontWeight="bold">MODI II</text>
    
    {/* Modular connection points */}
    <circle cx="25" cy="40" r="2" fill="#f97316" stroke="#2a3844" strokeWidth="1" />
    <circle cx="75" cy="40" r="2" fill="#f97316" stroke="#2a3844" strokeWidth="1" />
    <circle cx="25" cy="60" r="2" fill="#f97316" stroke="#2a3844" strokeWidth="1" />
    <circle cx="75" cy="60" r="2" fill="#f97316" stroke="#2a3844" strokeWidth="1" />
  </svg>
);

// Note: Icon mappings have been moved to src/data/iconMappings.js to fix fast refresh violations