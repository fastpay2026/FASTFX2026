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
      {/* Official Lightning Speed Emblem */}
      <div
        className={`relative shrink-0 ${dimensions.box} rounded-xl bg-[#070b14] p-0.5 shadow-lg shadow-amber-500/10 border border-amber-500/30 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-amber-500/25`}
      >
        <img
          src="/assets/brand/fast_fx_lightning_logo.jpg"
          alt="FAST FX - Lightning Speed Broker"
          className="w-full h-full object-cover rounded-[10px]"
        />
        {/* Speed pulse aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-indigo-500/20 pointer-events-none rounded-[10px]" />
      </div>

      {/* Brand Typography Wordmark matching Logo Colors (Royal Indigo & Amber Gold) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5 tracking-tight font-sans">
            {/* FAST in Crisp White / Royal Indigo on dark */}
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
                LIGHTNING SPEED
              </span>
              <span className="text-slate-600 text-[8px]">·</span>
              <span
                className={`text-indigo-400 font-semibold tracking-wider ${dimensions.sub}`}
              >
                SINCE 2026
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
