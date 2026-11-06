import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  iconOnly = false,
  showSubtitle = true,
  className = ""
}) => {
  // Dimension scale maps
  const dimensions = {
    sm: { icon: 28, text: "text-base", sub: "text-[8px]", spark: 10, gap: "gap-2" },
    md: { icon: 36, text: "text-xl", sub: "text-[9px]", spark: 13, gap: "gap-2.5" },
    lg: { icon: 46, text: "text-2xl", sub: "text-[10px]", spark: 16, gap: "gap-3" },
    xl: { icon: 58, text: "text-3xl", sub: "text-[11px]", spark: 20, gap: "gap-3.5" }
  }[size];

  return (
    <div className={`flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* High-Precision Institutional Vector Emblem with Lightning Bolt */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Shield Frame Gradient */}
            <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Shield Background Radial */}
            <radialGradient id="shieldBgGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#111c33" />
              <stop offset="60%" stopColor="#080d1a" />
              <stop offset="100%" stopColor="#04070e" />
            </radialGradient>

            {/* Lightning Bolt Primary Electric Gradient */}
            <linearGradient id="lightningBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#67e8f9" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="85%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Lightning Bevel Shadow Gradient */}
            <linearGradient id="lightningBevelGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Institutional 'F' & 'X' Speed Chevrons */}
            <linearGradient id="fxChevronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>

            {/* High-Voltage Glow Filter */}
            <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.6" />
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Rounded Architectural Shield */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#shieldBgGrad)"
            stroke="url(#shieldBorderGrad)"
            strokeWidth="2.5"
          />

          {/* Precision Micro Corner Ticks */}
          <circle cx="16" cy="16" r="1.5" fill="#38bdf8" opacity="0.7" />
          <circle cx="84" cy="16" r="1.5" fill="#38bdf8" opacity="0.7" />
          <circle cx="16" cy="84" r="1.5" fill="#f59e0b" opacity="0.7" />
          <circle cx="84" cy="84" r="1.5" fill="#f59e0b" opacity="0.7" />

          {/* Background Speed Slits / Chevrons (Representing the 'F' stem and matching engine speed) */}
          <path
            d="M 18 28 L 36 28 L 30 38 L 18 38 Z"
            fill="url(#fxChevronGrad)"
            opacity="0.7"
          />
          <path
            d="M 18 44 L 32 44 L 26 54 L 18 54 Z"
            fill="url(#fxChevronGrad)"
            opacity="0.7"
          />
          <path
            d="M 18 60 L 28 60 L 22 70 L 18 70 Z"
            fill="url(#fxChevronGrad)"
            opacity="0.7"
          />

          {/* Right Flanking Velocity Chevron (The 'X' counterpart) */}
          <path
            d="M 72 26 L 82 26 L 68 50 L 58 50 Z"
            fill="url(#fxChevronGrad)"
            opacity="0.5"
          />
          <path
            d="M 64 54 L 74 54 L 84 76 L 74 76 Z"
            fill="url(#fxChevronGrad)"
            opacity="0.6"
          />

          {/* Central Bold High-Voltage Lightning Bolt (البرق الأساسي) */}
          <g filter="url(#lightningGlow)">
            {/* Primary Lightning Body */}
            <path
              d="M 58 12 L 28 48 L 48 48 L 36 88 L 78 40 L 54 40 Z"
              fill="url(#lightningBoltGrad)"
            />

            {/* 3D Chiseled Facet / Bevel Highlight */}
            <path
              d="M 58 12 L 48 48 L 54 40 Z"
              fill="#ffffff"
              opacity="0.75"
            />
            <path
              d="M 48 48 L 36 88 L 78 40 L 52 44 Z"
              fill="url(#lightningBevelGrad)"
              opacity="0.9"
            />

            {/* Pure White Flash Spark at Strike Points */}
            <polygon
              points="58,12 55,22 49,20"
              fill="#ffffff"
            />
            <polygon
              points="36,88 40,78 45,80"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Typography Wordmark (FAST + Lightning Bolt Glyph + FX + Subtitle) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5 tracking-tight">
            {/* "FAST" Wordmark */}
            <span
              className={`font-black text-white ${dimensions.text} tracking-tight font-sans`}
              style={{ letterSpacing: "-0.03em" }}
            >
              FAST
            </span>

            {/* Integrated Lightning Bolt Icon in Wordmark */}
            <svg
              width={dimensions.spark}
              height={dimensions.spark}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            >
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="url(#wordmarkLightning)"
              />
              <defs>
                <linearGradient id="wordmarkLightning" x1="3" y1="2" x2="21" y2="22">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* "FX" Wordmark */}
            <span
              className={`font-black ${dimensions.text} bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent tracking-tight font-sans`}
              style={{ letterSpacing: "-0.02em" }}
            >
              FX
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-slate-400 font-mono tracking-[0.22em] uppercase ${dimensions.sub}`}
              >
                INSTITUTIONAL
              </span>
              <span className="text-amber-400 text-[8px] font-mono font-bold tracking-wider">
                ⚡ 0.003ms
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
