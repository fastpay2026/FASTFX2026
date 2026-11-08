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
    sm: {
      box: "w-8 h-8",
      imgSize: 32,
      text: "text-base",
      sub: "text-[8px]",
      gap: "gap-2"
    },
    md: {
      box: "w-10 h-10",
      imgSize: 40,
      text: "text-xl",
      sub: "text-[9px]",
      gap: "gap-2.5"
    },
    lg: {
      box: "w-12 h-12",
      imgSize: 48,
      text: "text-2xl",
      sub: "text-[10px]",
      gap: "gap-3"
    },
    xl: {
      box: "w-16 h-16",
      imgSize: 64,
      text: "text-3xl",
      sub: "text-[11px]",
      gap: "gap-3.5"
    }
  }[size];

  return (
    <div className={`flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* Official Uploaded Logo Emblem Badge (Lightning Bolt with Speed Streaks & Since 2026) */}
      <div
        className={`relative shrink-0 ${dimensions.box} rounded-xl bg-white p-1 shadow-md shadow-indigo-950/40 border border-amber-400/30 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-amber-500/20`}
      >
        <img
          src="/assets/aistudio/image_832cc79a.png"
          alt="FAST FX SINCE 2026"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Typography Wordmark matching Logo Colors (Royal Indigo & Amber Gold) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5 tracking-tight font-sans">
            {/* FAST in Royal Indigo / Crisp White on dark */}
            <span
              className={`font-black text-white ${dimensions.text} tracking-tight font-sans drop-shadow-sm`}
              style={{ letterSpacing: "-0.03em" }}
            >
              FAST
            </span>

            {/* Electric Amber-Gold FX matching the Lightning Bolt */}
            <span
              className={`font-black ${dimensions.text} bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent tracking-tight font-sans`}
              style={{ letterSpacing: "-0.02em" }}
            >
              FX
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-0.5 font-mono">
              <span
                className={`text-amber-400 font-bold uppercase tracking-[0.2em] ${dimensions.sub}`}
              >
                SINCE 2026
              </span>
              <span className="text-slate-600 text-[8px]">·</span>
              <span
                className={`text-indigo-400 font-semibold tracking-wider ${dimensions.sub}`}
              >
                ⚡ ULTRA-FAST
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
