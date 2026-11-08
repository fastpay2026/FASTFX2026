import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { translations, Language } from "../translations";
import { sqlDb } from "../db/sqlEngine";
import { useAuth } from "../context/AuthContext";
import { MarketPair } from "../types";
import { BrandLogo } from "./BrandLogo";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Database,
  Lock,
  ArrowRight,
  BarChart3,
  Globe2,
  Server,
  Layers,
  Sparkles,
  Heart,
  Coins,
  Scale,
  Award,
  Wallet
} from "lucide-react";
import { PromotionalCampaigns } from "./PromotionalCampaigns";
import { MarketHeartbeatLine } from "./MarketHeartbeatLine";

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
  onNavigateToTrading
}) => {
  const { openAuthModal, isLoggedIn } = useAuth();
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
    return marketPairs;
  }, [marketPairs, marketTab]);

  const scrollToMarkets = () => {
    const el = document.getElementById("live-markets-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-20 py-8 relative overflow-hidden bg-[#070913]">
      {/* 
        FAINT AMBIENT HEARTBEAT PULSES ACROSS THE ENTIRE CANVAS BACKGROUND 
        (Harmonized with Fast FX Logo Colors: Royal Indigo, Electric Amber-Gold, Midnight Obsidian)
      */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-amber-500/12 via-indigo-600/15 to-yellow-400/10 rounded-full blur-3xl pointer-events-none animate-faint-bg-pulse -z-10" />
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-tr from-indigo-700/12 via-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-faint-bg-pulse -z-10" />
      <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-emerald-500/8 via-amber-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-faint-bg-pulse -z-10" />

      {/* Streaming Live Forex Rates Ribbon Ticker */}
      <div className="w-full bg-[#05060e] border-y border-indigo-900/40 py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAr ? "أسعار الفوركس المباشرة ECN" : "LIVE INTERBANK FX"}</span>
          </div>

          <div className="flex items-center gap-6 whitespace-nowrap text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-white">EUR/USD</span>
              <span className="text-emerald-400 font-bold tabular-nums">1.0945</span>
              <span className="text-slate-500 text-[10px]">(0.1 Pip)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-white">GBP/USD</span>
              <span className="text-emerald-400 font-bold tabular-nums">1.2721</span>
              <span className="text-slate-500 text-[10px]">(0.2 Pip)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-white">XAU/USD (ذهب)</span>
              <span className="text-amber-400 font-bold tabular-nums">$2,648.50</span>
              <span className="text-emerald-400 text-[10px]">+1.25%</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-white">USD/JPY</span>
              <span className="text-rose-400 font-bold tabular-nums">154.62</span>
              <span className="text-slate-500 text-[10px]">(0.1 Pip)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-white">BTC/USD</span>
              <span className="text-emerald-400 font-bold tabular-nums">$94,820</span>
              <span className="text-emerald-400 text-[10px]">+3.4%</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-amber-300/80 font-semibold">
              {isAr ? "حسابات إسلامية 100% بدون عمولات تبييت" : "100% Sharia Swap-Free Accounts"}
            </span>
          </div>
        </div>
      </div>

      {/* 1. New Modern Luxury Institutional Forex Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Official Logo Brand Pill Showcase */}
          <div className="inline-flex items-center gap-3 p-1.5 pr-4 pl-2 bg-[#0d1224] rounded-2xl border border-amber-500/30 shadow-xl shadow-indigo-950/40 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center">
              <img
                src="/assets/aistudio/image_832cc79a.png"
                alt="FAST FX SINCE 2026"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-white tracking-wide">FAST FX</span>
              <span className="text-amber-400 font-bold">SINCE 2026</span>
              <span className="text-slate-600">·</span>
              <span className="text-indigo-400 font-semibold">⚡ ULTRA-FAST TRADING</span>
            </div>
          </div>

          {/* Institutional Metadata Line with Heartbeat and Gold Accent (Zero-Pill) */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 font-mono tracking-wide">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-500/50 animate-faint-heartbeat" />
              {isAr ? "نبض سوق الفوركس نشط" : "LIVE FOREX PULSE"}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">0.0 PIPS RAW SPREAD</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">{isAr ? "حسابات إسلامية معتمدة" : "SWAP-FREE ISLAMIC"}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>EQUINIX LONDON LD4</span>
          </div>

          {/* New Luxury Headline in Champagne Gold & Crisp White */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] font-sans"
            style={{ textWrap: "balance" }}
          >
            <span>{isAr ? "المنصة الرائدة لتداول الفوركس والذهب" : "Premier Institutional Forex & Gold Trading"}</span>
            <span className="block mt-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {isAr ? "بفروقات خام صفرية وتنفيذ فائق السرعة" : "Zero Raw Spreads & Sub-Millisecond Execution"}
            </span>
          </h1>

          <p
            className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal font-sans"
            style={{ textWrap: "balance" }}
          >
            {isAr
              ? "تداول العملات الأجنبية وسبائك الذهب الخالص بحسابات إسلامية خالية تماماً من فوائد التبييت (Swap-Free) وربط مباشر بسيولة بنوك الاستثمار العالمية من الفئة الأولى."
              : "Trade foreign currencies, gold bullion, and commodities with 100% Sharia-compliant Swap-Free accounts and direct STP liquidity from global Tier-1 investment banks."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 font-sans">
            <button
              onClick={scrollToMarkets}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>{isAr ? "استعراض أسعار الفوركس اللحظية" : "Explore Live Forex Rates"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={() => openAuthModal("register")}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#121622] border border-amber-500/30 hover:border-amber-400 text-slate-100 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? "فتح حساب فوركس إسلامي / ممول" : "Open Islamic / Funded FX Account"}</span>
              </button>
            ) : (
              <button
                onClick={onNavigateToTrading}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#121622] border border-amber-500/30 hover:border-amber-400 text-slate-100 hover:text-white transition-all cursor-pointer"
              >
                <span>{isAr ? "الانتقال إلى محطة التداول" : "Go to Trading Terminal"}</span>
              </button>
            )}
          </div>

          {/* 4 Core Forex Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 mt-10 font-mono">
            <div className="text-center p-3 bg-[#0d1018] rounded-xl border border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">0.0 Pips</div>
              <div className="text-xs text-slate-400 font-sans mt-1">{isAr ? "فوارق أسعار خام" : "Raw FX Spreads"}</div>
            </div>
            <div className="text-center p-3 bg-[#0d1018] rounded-xl border border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">0.003ms</div>
              <div className="text-xs text-slate-400 font-sans mt-1">{isAr ? "سرعة المطابقة الفائقة" : "Equinix Execution"}</div>
            </div>
            <div className="text-center p-3 bg-[#0d1018] rounded-xl border border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">100%</div>
              <div className="text-xs text-slate-400 font-sans mt-1">{isAr ? "حسابات إسلامية خالية من الربا" : "Swap-Free Certified"}</div>
            </div>
            <div className="text-center p-3 bg-[#0d1018] rounded-xl border border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">1:100</div>
              <div className="text-xs text-slate-400 font-sans mt-1">{isAr ? "رافعة مالية مرنة" : "Max Leverage"}</div>
            </div>
          </div>
        </div>

        {/* Live Market Heartbeat Pulse Component */}
        <div className="mt-8">
          <MarketHeartbeatLine lang={lang} />
        </div>

        {/* 15-Day Grand Prix Official Launch Countdown Card */}
        <div id="grand-prix-countdown" className="mt-8 max-w-3xl mx-auto rounded-2xl bg-[#0f131e] border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Corner Amber Glow with faint pulse */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-faint-bg-pulse" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                  {t.countdownTitle}
                </h3>
                <div className="text-xs text-amber-400/80 font-mono">
                  FAST FX GLOBAL FOREX CHAMPIONSHIP · 15-DAY COUNTDOWN
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {t.countdownBadge}
            </span>
          </div>

          {/* Countdown Clock Digits in Golden Amber */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 my-6 font-mono">
            <div className="bg-[#141926] border border-slate-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-3xl sm:text-5xl font-black text-white tabular-nums">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-1 uppercase tracking-wider">{t.days}</div>
            </div>

            <div className="bg-[#141926] border border-slate-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-3xl sm:text-5xl font-black text-white tabular-nums">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-1 uppercase tracking-wider">{t.hours}</div>
            </div>

            <div className="bg-[#141926] border border-slate-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-3xl sm:text-5xl font-black text-white tabular-nums">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-1 uppercase tracking-wider">{t.minutes}</div>
            </div>

            <div className="bg-[#141926] border border-amber-500/40 rounded-xl p-3 sm:p-4 text-center shadow-lg shadow-amber-500/10">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 tabular-nums">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[11px] text-amber-400 font-sans mt-1 uppercase tracking-wider">{t.seconds}</div>
            </div>
          </div>

          {/* Quick Registration Form */}
          <div className="pt-4 border-t border-slate-800">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1 bg-[#121622] border border-slate-700 focus:border-amber-400 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                {t.submitButton}
              </button>
            </form>

            {errorMsg && <p className="text-xs text-rose-400 mt-2 text-center font-mono">{errorMsg}</p>}
            {isSubscribed && (
              <p className="text-xs text-emerald-400 mt-2 text-center font-mono flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.successTitle}</span>
              </p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2 pt-2">
              <div>
                {t.countdownEndDateLabel} <span className="text-amber-300 font-bold">{targetDateFormatted}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                EQUINIX LD4 · PRIME BROKERAGE ROUTING
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Forex Broker Advertising Campaigns & Photo Showcases */}
      <PromotionalCampaigns
        lang={lang}
        onOpenRegister={() => openAuthModal("register")}
        onNavigateToTrading={onNavigateToTrading}
        onScrollToMarkets={scrollToMarkets}
        onScrollToCountdown={() => {
          const el = document.getElementById("grand-prix-countdown");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 3. Institutional Live Markets Table (Exclusively Informational - No Trade Execution on Home Page) */}
      <section id="live-markets-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-[#0e121b] border border-amber-500/20 p-5 sm:p-7 shadow-2xl">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                  {isAr ? "أسعار أزواج الفوركس والذهب اللحظية" : "Live Forex & Commodity Rates"}
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {isAr ? "للعرض فقط · ECN FEED" : "READ ONLY"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {isAr
                  ? "أسعار مباشرة بنظام الدفتر المزدوج. فتح الصفقات متاح حصرياً داخل محطة التداول بعد تسجيل الدخول وتوفر رصيد بالحساب."
                  : "Streaming interbank pricing. Trade execution is strictly restricted to authenticated accounts with funded balance inside the Terminal."}
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-[#121622] rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setMarketTab("hot")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "hot"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.marketHot}
              </button>
              <button
                onClick={() => setMarketTab("forex")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "forex"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.marketForex}
              </button>
              <button
                onClick={() => setMarketTab("commodities")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "commodities"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {isAr ? "الذهب والسلع" : "Commodities"}
              </button>
              <button
                onClick={() => setMarketTab("crypto")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "crypto"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.marketCrypto}
              </button>
              <button
                onClick={() => setMarketTab("gainers")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  marketTab === "gainers"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.marketGainers}
              </button>
            </div>
          </div>

          {/* Table Data (Informative Only - No Row Clicks or Trade Buttons) */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3 font-semibold">{isAr ? "الزوج / الأصل" : "Instrument"}</th>
                  <th className="pb-3 font-semibold">{t.currentPrice}</th>
                  <th className="pb-3 font-semibold">{isAr ? "تغير 24س" : "24h Change"}</th>
                  <th className="pb-3 font-semibold hidden md:table-cell">{isAr ? "أعلى / أدنى 24س" : "24h High / Low"}</th>
                  <th className="pb-3 font-semibold hidden sm:table-cell">{t.marketVolume}</th>
                  <th className="pb-3 font-semibold hidden lg:table-cell">{isAr ? "المسار السعري (7D)" : "7D Trend"}</th>
                  <th className="pb-3 font-semibold text-right">{isAr ? "الفارق السعري ECN" : "Raw Spread"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedPairs.map((pair) => {
                  const isUp = pair.change24h >= 0;
                  return (
                    <tr
                      key={pair.symbol}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Instrument Symbol & Full Name */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#141926] border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                            {pair.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {pair.symbol}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">{pair.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-4 font-bold text-sm text-white tabular-nums">
                        ${pair.price >= 100 ? pair.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : pair.price.toFixed(4)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-4">
                        <span
                          className={`font-semibold tabular-nums ${
                            isUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {pair.change24h.toFixed(2)}%
                        </span>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-4 text-slate-300 hidden md:table-cell tabular-nums text-[11px]">
                        <div>H: ${pair.high24h >= 100 ? pair.high24h.toFixed(2) : pair.high24h.toFixed(4)}</div>
                        <div className="text-slate-500">L: ${pair.low24h >= 100 ? pair.low24h.toFixed(2) : pair.low24h.toFixed(4)}</div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-4 text-slate-300 hidden sm:table-cell tabular-nums">
                        {pair.volume24h}
                      </td>

                      {/* 7D Sparkline */}
                      <td className="py-4 hidden lg:table-cell">
                        <svg className="w-24 h-7" viewBox="0 0 100 30">
                          <path
                            d={isUp ? "M 0 24 Q 25 15, 50 18 T 100 6" : "M 0 8 Q 25 20, 50 14 T 100 26"}
                            fill="none"
                            stroke={isUp ? "#10b981" : "#f43f5e"}
                            strokeWidth="2"
                          />
                        </svg>
                      </td>

                      {/* Informative Liquidity Status */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400 text-xs font-mono">
                          <span className="text-[11px] text-amber-400 font-semibold tabular-nums">
                            {pair.spreadPips} Pips
                          </span>
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className="text-[11px] text-slate-300">
                            {isAr ? "سيولة مباشرة" : "Raw ECN"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isAr
                  ? "فتح الصفقات يتطلب تسجيل الدخول ووجود رصيد متاح في الحساب (الحسابات ذات الرصيد صفر لا يمكنها فتح صفقات)"
                  : "Opening positions requires an authenticated account with a funded balance (zero balance accounts cannot trade)"}
              </span>
            </div>
            {!isLoggedIn ? (
              <button
                onClick={() => openAuthModal("login")}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                {isAr ? "تسجيل الدخول للمتابعة ←" : "Sign In to Trade ←"}
              </button>
            ) : (
              <button
                onClick={onNavigateToTrading}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                {isAr ? "الانتقال إلى محطة التداول ←" : "Open Trading Terminal ←"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. Core Institutional Advantages Section (With the requested ORANGE/GOLD HOVER GLOW) */}
      <section id="proof-of-reserves-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase mb-2">
            PREMIER BROKERAGE STANDARDS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {t.whyUsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-sans">
            {t.whyUsSubtitle}
          </p>
        </div>

        {/* 3 Core Cards with the Orange Hover Glow Effect requested in user prompt 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 100% Proof of Reserves & British Custody */}
          <div className="card-hover-glow p-7 rounded-2xl bg-[#0e121b] border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase">TIER-1 BANK CUSTODY</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                100% <span className="text-xs text-amber-400 font-sans font-semibold">SEGREGATED</span>
              </div>
              <h3 className="text-base font-bold text-white mt-2 font-sans">{t.proofOfReservesTitle}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                {t.proofOfReservesDesc}
              </p>
            </div>
          </div>

          {/* Card 2: Sub-millisecond Execution Speed */}
          <div className="card-hover-glow p-7 rounded-2xl bg-[#0e121b] border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase">{t.pillar1Kicker}</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                0.003ms <span className="text-xs text-slate-400 font-sans">/fill</span>
              </div>
              <h3 className="text-base font-bold text-white mt-2 font-sans">{t.ultraFastMatchingTitle}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                {t.ultraFastMatchingDesc}
              </p>
            </div>
          </div>

          {/* Card 3: ACID Relational SQL Ledger Security */}
          <div className="card-hover-glow p-7 rounded-2xl bg-[#0e121b] border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase">AUDITED SETTLEMENT</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">ACID SQL</div>
              <h3 className="text-base font-bold text-white mt-2 font-sans">{t.sqlSecurityTitle}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                {t.sqlSecurityDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
