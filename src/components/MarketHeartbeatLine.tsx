import React, { useState, useEffect } from "react";
import { Activity, Heart, Zap, Radio } from "lucide-react";
import { Language } from "../translations";

interface MarketHeartbeatLineProps {
  lang: Language;
}

export const MarketHeartbeatLine: React.FC<MarketHeartbeatLineProps> = ({ lang }) => {
  const isAr = lang === "ar";
  const [bpm, setBpm] = useState(74);
  const [ticksCount, setTicksCount] = useState(14820);

  // Subtle fluctuation to simulate real heartbeat and liquidity order ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(Math.floor(72 + Math.random() * 6));
      setTicksCount((prev) => prev + Math.floor(Math.random() * 12 + 3));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 overflow-hidden pointer-events-none select-none">
      {/* Subtle Container with Faint Heartbeat Glow */}
      <div className="relative rounded-2xl bg-slate-900/40 border border-slate-800/60 p-3 sm:p-4 backdrop-blur-sm overflow-hidden">
        {/* Ambient Heartbeat Glow inside container */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-rose-500/10 to-emerald-500/5 animate-faint-heartbeat pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
          {/* Heartbeat Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-7 h-7 rounded-full bg-rose-500/20 animate-faint-heartbeat" />
              <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Heart className="w-3 h-3 fill-rose-500/60 text-rose-400 animate-faint-heartbeat" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">
                {isAr ? "نبض الأسواق المالية المباشر" : "Live Market Vitality Heartbeat"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400 font-bold tabular-nums">
                {bpm} <span className="text-[10px] text-slate-400 font-normal">BPM / TICK</span>
              </span>
            </div>
          </div>

          {/* Center: ECG Heartbeat SVG Wave (Faint & Smooth) */}
          <div className="w-full md:w-1/2 h-8 relative flex items-center overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
            <svg
              className="w-full h-8"
              viewBox="0 0 600 32"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Static faint baseline track */}
              <path
                d="M 0,16 L 120,16 L 135,16 L 140,8 L 146,26 L 152,2 L 158,28 L 164,12 L 170,16 L 340,16 L 355,16 L 360,7 L 366,27 L 372,1 L 378,29 L 384,13 L 390,16 L 560,16 L 575,16 L 580,8 L 586,26 L 592,2 L 598,28 L 600,16"
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated sweeping heartbeat pulse line */}
              <path
                d="M 0,16 L 120,16 L 135,16 L 140,8 L 146,26 L 152,2 L 158,28 L 164,12 L 170,16 L 340,16 L 355,16 L 360,7 L 366,27 L 372,1 L 378,29 L 384,13 L 390,16 L 560,16 L 575,16 L 580,8 L 586,26 L 592,2 L 598,28 L 600,16"
                stroke="url(#heartbeat-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-ecg-trace"
              />

              <defs>
                <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right: Live Ticks & Liquidity State */}
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">{isAr ? "سيولة نشطة" : "Active Liquidity"}</span>
            </div>
            <span className="text-slate-600">·</span>
            <span>
              {isAr ? "حركات الأسعار:" : "Price Ticks:"}{" "}
              <span className="text-white font-bold tabular-nums">{ticksCount.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
