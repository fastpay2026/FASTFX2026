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
    sm: { icon: 26, text: "text-base", sub: "text-[8px]", gap: "gap-2" },
    md: { icon: 34, text: "text-xl", sub: "text-[9px]", gap: "gap-2.5" },
    lg: { icon: 44, text: "text-2xl", sub: "text-[10px]", gap: "gap-3" },
    xl: { icon: 56, text: "text-3xl", sub: "text-[11px]", gap: "gap-3.5" }
  }[size];

  return (
    <div className={`flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* High-Precision Vector Monogram Emblem */}
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
            {/* Primary Diamond Velocity Gradient */}
            <linearGradient id="fastFxPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Cyan Accent Gradient */}
            <linearGradient id="fastFxCyan" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Prismatic Shimmer Gradient */}
            <linearGradient id="fastFxShimmer" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="fastFxGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Outer Shield Polygon */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            fill="#090e1a"
            stroke="url(#fastFxPrimary)"
            strokeWidth="3"
            strokeOpacity="0.7"
          />

          {/* Inner Geometric Prism Grids */}
          <g filter="url(#fastFxGlow)">
            {/* Upper Velocity Chevron (The 'F' top bar & forward impulse) */}
            <path
              d="M 22 26 L 76 26 L 82 38 L 40 38 L 40 48 L 70 48 L 65 60 L 40 60 L 40 78 L 26 78 Z"
              fill="url(#fastFxPrimary)"
            />

            {/* Geometric Dynamic 'X' / Arrow Intersect */}
            <path
              d="M 52 38 L 84 78 L 70 78 L 44 46 Z"
              fill="url(#fastFxCyan)"
              fillOpacity="0.9"
            />

            {/* Prismatic Center Highlight Facet */}
            <polygon
              points="40,26 56,26 40,48"
              fill="url(#fastFxShimmer)"
            />

            {/* Precision Micro Crosshair Marker */}
            <circle cx="78" cy="26" r="3.5" fill="#38bdf8" />
            <circle cx="26" cy="78" r="3" fill="#10b981" />
          </g>
        </svg>
      </div>

      {/* Typography Wordmark (FAST FX + Subtitle) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5 tracking-tight">
            <span
              className={`font-black text-white ${dimensions.text} tracking-tight font-sans`}
              style={{ letterSpacing: "-0.03em" }}
            >
              FAST
            </span>
            <span
              className={`font-black ${dimensions.text} bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent tracking-tight font-sans`}
              style={{ letterSpacing: "-0.02em" }}
            >
              FX
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`text-slate-400 font-mono tracking-[0.22em] uppercase ${dimensions.sub} mt-0.5`}
            >
              INSTITUTIONAL
            </span>
          )}
        </div>
      )}
    </div>
  );
};
