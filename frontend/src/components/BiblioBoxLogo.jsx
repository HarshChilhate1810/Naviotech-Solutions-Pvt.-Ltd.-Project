import React from 'react';

export function BiblioBoxLogo({ className = 'w-8 h-8', showText = false, textClassName = '' }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Custom Vector Emblem */}
      <div className={`relative shrink-0 flex items-center justify-center ${className} transition-transform duration-200 group-hover:scale-105`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2738" />
              <stop offset="100%" stopColor="#0B0F1A" />
            </linearGradient>

            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="logoFilmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>

            <linearGradient id="logoPageLeft" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#DDD2BF" />
              <stop offset="40%" stopColor="#FAF5EB" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            <linearGradient id="logoPageRight" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#DDD2BF" />
              <stop offset="40%" stopColor="#FAF5EB" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Outer Frame */}
          <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#logoBgGrad)" stroke="url(#logoGoldGrad)" strokeWidth="2.5" />
          
          {/* Subtle Inner Border */}
          <rect x="7.5" y="7.5" width="85" height="85" rx="21" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Core Ambient Backlight */}
          <circle cx="50" cy="50" r="24" fill="#F59E0B" opacity="0.18" filter="url(#logoGlow)" />

          {/* ── BOOK BASE (Hardcover & Pages) ── */}
          <path d="M 18 68 Q 50 63 50 78 Q 50 63 82 68 L 84 72 Q 50 67 50 82 Q 50 67 16 72 Z" fill="#92400E" opacity="0.9" />
          <path d="M 20 65 Q 35 60 50 64 L 50 75 Q 35 71 20 75 Z" fill="#D4C5A9" />
          <path d="M 21 62 Q 35 57 50 61 L 50 73 Q 35 69 21 73 Z" fill="url(#logoPageLeft)" />

          <path d="M 80 65 Q 65 60 50 64 L 50 75 Q 65 71 80 75 Z" fill="#D4C5A9" />
          <path d="M 79 62 Q 65 57 50 61 L 50 73 Q 65 69 79 73 Z" fill="url(#logoPageRight)" />

          <line x1="50" y1="58" x2="50" y2="76" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />

          {/* ── CINEMATIC FILM STRIP ARCH ── */}
          <path d="M 48 62 C 45 46, 26 44, 28 32 C 30 20, 52 18, 64 24 C 74 29, 78 40, 70 46 C 62 52, 52 48, 51 40" 
                fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 48 62 C 45 46, 26 44, 28 32 C 30 20, 52 18, 64 24 C 74 29, 78 40, 70 46 C 62 52, 52 48, 51 40" 
                fill="none" stroke="url(#logoFilmGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Film Perforation Track */}
          <path d="M 48 62 C 45 46, 26 44, 28 32 C 30 20, 52 18, 64 24 C 74 29, 78 40, 70 46 C 62 52, 52 48, 51 40" 
                fill="none" stroke="#0B0F19" strokeWidth="3" strokeLinecap="round" strokeDasharray="3.5 2" />

          {/* Sprockets */}
          <circle cx="30" cy="27" r="1.1" fill="#FEF3C7" />
          <circle cx="36" cy="22" r="1.1" fill="#FEF3C7" />
          <circle cx="44" cy="20" r="1.1" fill="#FEF3C7" />
          <circle cx="53" cy="21" r="1.1" fill="#FEF3C7" />
          <circle cx="62" cy="24" r="1.1" fill="#FEF3C7" />
          <circle cx="70" cy="30" r="1.1" fill="#FEF3C7" />
          <circle cx="73" cy="38" r="1.1" fill="#FEF3C7" />
          <circle cx="68" cy="45" r="1.1" fill="#FEF3C7" />

          {/* Radiant 4-Point Gold Star Sparkle */}
          <g transform="translate(74, 20)">
            <path d="M 0 -7 Q 1 -1 7 0 Q 1 1 0 7 Q -1 1 -7 0 Q -1 -1 0 -7 Z" fill="url(#logoGoldGrad)" filter="url(#logoGlow)" />
            <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Secondary Sparkle */}
          <g transform="translate(23, 40)">
            <path d="M 0 -4 Q 0.6 -0.6 4 0 Q 0.6 0.6 0 4 Q -0.6 0.6 -4 0 Q -0.6 -0.6 0 -4 Z" fill="#FDE68A" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`font-display font-bold tracking-tight text-cream-900 dark:text-white ${textClassName}`}>
          Biblio<span className="text-amber-600 dark:text-amber-400">Box</span>
        </span>
      )}
    </div>
  );
}
