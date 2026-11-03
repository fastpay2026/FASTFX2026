import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { translations, Language } from "../translations";
import { sqlDb } from "../db/sqlEngine";
import { useAuth } from "../context/AuthContext";
import { MarketPair } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Activity,
  Mail,
  CheckCircle2,
  Globe,
  Clock,
  ArrowUpRight,
  Sparkles,
  CandlestickChart,
  Crown,
  ChevronRight,
  Lock,
  Database,
  Layers,
  ArrowRight
} from "lucide-react";

const COUNTDOWN_STORAGE_KEY = "fast_fx_countdown_target_15d";
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function getLaunchTargetDate(): number {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        const now = Date.now();
        if (!isNaN(parsed) && parsed > now && parsed <= now + FIFTEEN_DAYS_MS + 3600000) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read countdown target from localStorage", e);
    }
  }

  const newTarget = Date.now() + FIFTEEN_DAYS_MS;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, newTarget.toString());
    } catch (e) {
      console.error("Failed to save countdown target to localStorage", e);
    }
  }
  return newTarget;
}

function calculateTimeLeftValues(target: number) {
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
}

interface LandingSectionProps {
  lang: Language;
  marketPairs?: MarketPair[];
  onNavigateToTrading: () => void;
  onSelectPairAndTrade?: (symbol: string) => void;
}

export const LandingSection: React.FC<LandingSectionProps> = ({
  lang,
  marketPairs = [],
  onNavigateToTrading,
  onSelectPairAndTrade
}) => {
  const { openAuthModal } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  const [targetTimestamp] = useState<number>(() => getLaunchTargetDate());
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeftValues(getLaunchTargetDate()));

  const [marketTab, setMarketTab] = useState<"hot" | "crypto" | "forex" | "commodities" | "gainers">("hot");
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeftValues(targetTimestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  const targetDateFormatted = useMemo(() => {
    try {
      const d = new Date(targetTimestamp);
      return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(d);
    } catch {
      return new Date(targetTimestamp).toLocaleDateString();
    }
  }, [targetTimestamp, lang]);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg(t.errorEmpty);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg(t.errorInvalid);
      return;
    }

    const result = sqlDb.addSubscriber(email.trim());
    if (!result.success) {
      setErrorMsg(t.errorDuplicate);
      return;
    }

    setIsSubscribed(true);
    setEmail("");
  };

  // Filter pairs by active market tab
  const displayedPairs = useMemo(() => {
    if (marketTab === "crypto") {
      return marketPairs.filter((p) => p.type === "crypto");
    }
    if (marketTab === "forex") {
      return marketPairs.filter((p) => p.type === "forex");
    }
    if (marketTab === "commodities") {
      return marketPairs.filter((p) => p.type === "commodities");
    }
    if (marketTab === "gainers") {
      return [...marketPairs].sort((a, b) => b.change24h - a.change24h);
    }
    // "hot" shows key pairs
    return marketPairs;
  }, [marketPairs, marketTab]);

  const handleTradeAction = (symbol: string) => {
    if (onSelectPairAndTrade) {
      onSelectPairAndTrade(symbol);
    } else {
      onNavigateToTrading();
    }
  };

  return (
    <div className="space-y-20 py-8">
      {/* OKX Mega Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* OKX Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#161a22] text-zinc-300 border border-[#222832]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
            <span>{isAr ? "منصة التداول المؤسسية فئة Tier-1" : "Tier-1 Multi-Asset Institutional Exchange"}</span>
          </div>

          {/* OKX Hero Headlines */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            <span className="block">{t.heroLine1}</span>
            <span className="block text-zinc-400 font-bold mt-1">{t.heroLine2}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            {isAr
              ? "تداول العملات المشفرة، الفوركس والسلع عبر محرك مطابقة فائق السرعة بزمن استجابة يقل عن 0.003ms مع إثبات احتياطيات بنسبة 100% وسجلات SQL محمية."
              : "Trade Crypto, Forex, and Commodities with sub-millisecond execution, raw 0.0 pip spreads, and 100% Proof of Reserves verified by audited SQL ledger."}
          </p>

          {/* OKX Hero Fast Sign-up Bar */}
          <div className="max-w-lg mx-auto pt-2">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 bg-[#0b0e11] p-1.5 rounded-xl border border-[#1e2329] shadow-2xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1 bg-transparent text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                {isAr ? "تسجيل فوري" : "Sign Up"}
              </button>
            </form>
            {errorMsg && <p className="text-xs text-[#f6465d] mt-2 font-mono">{errorMsg}</p>}
            {isSubscribed && (
              <p className="text-xs text-[#00c087] mt-2 font-mono flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.successTitle}</span>
              </p>
            )}
          </div>

          {/* OKX Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToTrading}
              className="px-6 py-3 rounded-lg font-bold text-xs sm:text-sm bg-[#00c087] text-black hover:bg-[#00c087]/90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00c087]/15"
            >
              <CandlestickChart className="w-4 h-4" />
              <span>{t.navTrade}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuthModal("login")}
              className="px-6 py-3 rounded-lg font-bold text-xs sm:text-sm bg-[#0b0e11] border border-[#1e2329] text-white hover:bg-[#161a22] hover:border-zinc-700 transition-all cursor-pointer"
            >
              <span>{t.loginBtn}</span>
            </button>
          </div>
        </div>

        {/* 15-Day Official Launch / Global Grand Prix Countdown Box */}
        <div className="mt-12 max-w-3xl mx-auto p-5 sm:p-7 rounded-2xl bg-[#0b0e11] border border-[#1e2329] shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1e2329]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#161a22] flex items-center justify-center text-[#00c087]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                  {t.countdownTitle}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  FAST FX GLOBAL TRADING GRAND PRIX • 15 DAYS
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00c087]/15 text-[#00c087] border border-[#00c087]/30">
              {t.countdownBadge}
            </span>
          </div>

          {/* Countdown Digit Blocks */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 font-mono">
            {/* Days */}
            <div className="bg-[#12161c] border border-[#1e2329] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white font-tabular">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-zinc-500 font-sans mt-1 uppercase tracking-wider">{t.days}</div>
            </div>

            {/* Hours */}
            <div className="bg-[#12161c] border border-[#1e2329] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white font-tabular">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-zinc-500 font-sans mt-1 uppercase tracking-wider">{t.hours}</div>
            </div>

            {/* Minutes */}
            <div className="bg-[#12161c] border border-[#1e2329] rounded-xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white font-tabular">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-zinc-500 font-sans mt-1 uppercase tracking-wider">{t.minutes}</div>
            </div>

            {/* Seconds */}
            <div className="bg-[#12161c] border border-[#00c087]/40 rounded-xl p-3 sm:p-4 text-center shadow-lg shadow-[#00c087]/10">
              <div className="text-2xl sm:text-4xl font-black text-[#00c087] font-tabular animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-[#00c087] font-sans mt-1 uppercase tracking-wider">{t.seconds}</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2329]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-2">
            <div>
              {t.countdownEndDateLabel} <span className="text-white font-bold">{targetDateFormatted}</span>
            </div>
            <div className="text-[10px] text-zinc-600">
              EQUINIX LD4 • ZERO SLIPPAGE ARCHITECTURE
            </div>
          </div>
        </div>
      </section>

      {/* OKX Live Markets Table (The Centerpiece of okx.com) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0b0e11] border border-[#1e2329] rounded-2xl p-5 sm:p-7 shadow-2xl">
          {/* Market Table Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1e2329]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c087]" />
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
                  {isAr ? "أسواق التداول المباشرة" : "Live Markets Overview"}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAr
                  ? "أسعار لحظية، فارق سعري خام، وتداول بنقرة واحدة عبر محرك SQL"
                  : "Real-time institutional tick stream with 1-click execution"}
              </p>
            </div>

            {/* OKX Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#12161c] p-1 rounded-xl border border-[#1e2329] text-xs font-semibold">
              <button
                onClick={() => setMarketTab("hot")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "hot"
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.marketHot}
              </button>
              <button
                onClick={() => setMarketTab("crypto")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "crypto"
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.marketCrypto}
              </button>
              <button
                onClick={() => setMarketTab("forex")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "forex"
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.marketForex}
              </button>
              <button
                onClick={() => setMarketTab("commodities")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "commodities"
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isAr ? "السلع" : "Commodities"}
              </button>
              <button
                onClick={() => setMarketTab("gainers")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "gainers"
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.marketGainers}
              </button>
            </div>
          </div>

          {/* OKX Table Grid */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-[#1e2329] text-[11px]">
                  <th className="pb-3 font-semibold">{isAr ? "الأصل / الرمز" : "Instrument"}</th>
                  <th className="pb-3 font-semibold">{t.currentPrice}</th>
                  <th className="pb-3 font-semibold">{isAr ? "تغير 24س" : "24h Change"}</th>
                  <th className="pb-3 font-semibold hidden md:table-cell">{isAr ? "أعلى / أدنى 24س" : "24h High / Low"}</th>
                  <th className="pb-3 font-semibold hidden sm:table-cell">{t.marketVolume}</th>
                  <th className="pb-3 font-semibold hidden lg:table-cell">{isAr ? "المسار السعري" : "7D Trend"}</th>
                  <th className="pb-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2329]/70">
                {displayedPairs.map((pair) => {
                  const isUp = pair.change24h >= 0;
                  return (
                    <tr
                      key={pair.symbol}
                      className="hover:bg-[#12161c]/80 transition-colors group cursor-pointer"
                      onClick={() => handleTradeAction(pair.symbol)}
                    >
                      {/* Asset Symbol & Name */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#161a22] border border-[#222832] flex items-center justify-center font-bold text-white text-xs">
                            {pair.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-[#00c087] transition-colors">
                              {pair.symbol}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-sans">{pair.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Last Price */}
                      <td className="py-4 font-bold text-sm text-white font-tabular">
                        ${pair.price >= 100 ? pair.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : pair.price.toFixed(4)}
                      </td>

                      {/* 24h Change Pill */}
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-tabular ${
                            isUp
                              ? "bg-[#00c087]/15 text-[#00c087] border border-[#00c087]/30"
                              : "bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/30"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {pair.change24h.toFixed(2)}%
                        </span>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-4 text-zinc-400 hidden md:table-cell font-tabular text-[11px]">
                        <div>H: ${pair.high24h >= 100 ? pair.high24h.toFixed(2) : pair.high24h.toFixed(4)}</div>
                        <div className="text-zinc-500">L: ${pair.low24h >= 100 ? pair.low24h.toFixed(2) : pair.low24h.toFixed(4)}</div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-4 text-zinc-300 hidden sm:table-cell font-tabular">
                        {pair.volume24h}
                      </td>

                      {/* 7D Sparkline SVG */}
                      <td className="py-4 hidden lg:table-cell">
                        <svg className="w-24 h-7" viewBox="0 0 100 30">
                          <path
                            d={isUp ? "M 0 24 Q 25 15, 50 18 T 100 6" : "M 0 8 Q 25 20, 50 14 T 100 26"}
                            fill="none"
                            stroke={isUp ? "#00c087" : "#f6465d"}
                            strokeWidth="2"
                          />
                        </svg>
                      </td>

                      {/* Direct Trade Action Button */}
                      <td className="py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTradeAction(pair.symbol);
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#161a22] text-white border border-[#222832] group-hover:bg-white group-hover:text-black group-hover:border-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>{t.tradeAction}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* OKX 100% Proof of Reserves & Institutional Security (With Orange Glow on Hover) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold font-mono tracking-wider text-[#00c087] uppercase mb-2">
            INSTITUTIONAL TRUST & TRANSPARENCY
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            {t.whyUsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {t.whyUsSubtitle}
          </p>
        </div>

        {/* 3 Core Advantage Cards with orange hover glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Proof of Reserves */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0b0e11] border border-[#1e2329] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">PROOF OF RESERVES</span>
              <div className="w-10 h-10 rounded-xl bg-[#161a22] border border-[#222832] flex items-center justify-center text-[#00c087]">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">
                100% <span className="text-xs text-[#00c087] font-sans font-bold">1:1 BACKED</span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{t.proofOfReservesTitle}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {t.proofOfReservesDesc}
              </p>
            </div>
          </div>

          {/* Card 2: Sub-millisecond Execution */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0b0e11] border border-[#1e2329] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">{t.pillar1Kicker}</span>
              <div className="w-10 h-10 rounded-xl bg-[#161a22] border border-[#222832] flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">
                0.003ms <span className="text-xs text-zinc-500 font-sans">/fill</span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{t.ultraFastMatchingTitle}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {t.ultraFastMatchingDesc}
              </p>
            </div>
          </div>

          {/* Card 3: Relational SQL Ledger Security */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0b0e11] border border-[#1e2329] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">AUDITED LEDGER</span>
              <div className="w-10 h-10 rounded-xl bg-[#161a22] border border-[#222832] flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">ACID SQL</div>
              <h3 className="text-base font-bold text-white mt-2">{t.sqlSecurityTitle}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {t.sqlSecurityDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
