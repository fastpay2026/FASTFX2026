import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { translations, Language } from "../translations";
import { sqlDb } from "../db/sqlEngine";
import { useAuth } from "../context/AuthContext";
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
  Crown
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
  onNavigateToTrading: () => void;
}

export const LandingSection: React.FC<LandingSectionProps> = ({
  lang,
  onNavigateToTrading
}) => {
  const { openAuthModal, isAdmin } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  const [targetTimestamp] = useState<number>(() => getLaunchTargetDate());
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeftValues(getLaunchTargetDate()));

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

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/25 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.kicker}</span>
        </div>

        {/* Main Punchy Headlines */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none mb-6">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500">
            {t.heroLine1}
          </span>
          <span className="block text-white mt-1 sm:mt-2">{t.heroLine2}</span>
          <span className="block text-zinc-400 font-light mt-1 sm:mt-2">{t.heroLine3}</span>
        </h1>

        {/* Narrative Paragraphs */}
        <div className="space-y-4 max-w-3xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-light mb-8">
          <p className="text-zinc-300 font-medium">{t.narrativeP1}</p>
          <p>
            {t.narrativeP2.before}
            <strong className="text-white font-bold">{t.narrativeP2.brand}</strong>
            {t.narrativeP2.after}
          </p>
          <p>{t.narrativeP3}</p>
          <p className="text-amber-400 font-medium">{t.narrativeP5}</p>
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={onNavigateToTrading}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black shadow-xl shadow-orange-500/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CandlestickChart className="w-4 h-4" />
            <span>{t.navTrading}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{isAr ? "تسجيل الدخول / فتح حساب" : "Sign In / Open Account"}</span>
          </button>
        </div>

        {/* 15-Day Official Launch Countdown Box */}
        <div className="relative max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#11131c] to-[#0a0b10] border border-orange-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {t.countdownTitle}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
              {t.countdownBadge}
            </span>
          </div>

          {/* Countdown Digit Blocks */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 font-mono">
            {/* Days */}
            <div className="bg-[#141624] border border-zinc-800/90 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 font-sans mt-1">{t.days}</div>
            </div>

            {/* Hours */}
            <div className="bg-[#141624] border border-zinc-800/90 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 font-sans mt-1">{t.hours}</div>
            </div>

            {/* Minutes */}
            <div className="bg-[#141624] border border-zinc-800/90 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-4xl font-black text-white">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 font-sans mt-1">{t.minutes}</div>
            </div>

            {/* Seconds */}
            <div className="bg-[#141624] border border-orange-500/40 rounded-2xl p-3 sm:p-4 text-center shadow-lg shadow-orange-500/10">
              <div className="text-2xl sm:text-4xl font-black text-orange-400 animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-orange-400 font-sans mt-1">{t.seconds}</div>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-400 font-mono">
            {t.countdownEndDateLabel} <span className="text-amber-400 font-bold">{targetDateFormatted}</span>
          </div>
        </div>
      </section>

      {/* Waitlist Subscription Section with SQL Storage */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-xl mx-auto text-center">
        <div className="bg-[#0e1017] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
            <Mail className="w-6 h-6" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t.formTitle}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6">{t.formDesc}</p>

          {isSubscribed ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.successTitle}</span>
              </div>
              <p className="text-xs text-zinc-300">
                {t.successDesc.before}
                <strong>{t.successDesc.brand}</strong>
                {t.successDesc.after}
              </p>
              <button
                onClick={() => setIsSubscribed(false)}
                className="text-xs text-amber-400 hover:underline pt-2 inline-block cursor-pointer"
              >
                {t.registerAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="flex-1 bg-[#13151f] border border-zinc-800 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:opacity-95 shadow-md shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  {t.submitButton}
                </button>
              </div>
              {errorMsg && <p className="text-xs text-rose-400 text-left">{errorMsg}</p>}
            </form>
          )}
        </div>
      </section>

      {/* Why Fast FX Section with Hover Orange Glow */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold font-mono tracking-wider text-orange-400 uppercase mb-2">
            {t.coreAdvantagesKicker}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">{t.whyUsTitle}</h2>
          <p className="text-xs sm:text-sm text-zinc-400">{t.whyUsSubtitle}</p>
        </div>

        {/* 3 Core Advantage Cards with orange hover glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0c0e15] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">{t.pillar1Kicker}</span>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">
                {t.pillar1Value} <span className="text-xs text-zinc-500 font-sans">{t.pillar1Unit}</span>
              </div>
              <h3 className="text-base font-bold text-zinc-100 mt-2">{t.pillar1Title}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{t.pillar1Desc}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0c0e15] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">{t.pillar2Kicker}</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{t.pillar2Value}</div>
              <h3 className="text-base font-bold text-zinc-100 mt-2">{t.pillar2Title}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{t.pillar2Desc}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-hover-glow p-6 sm:p-8 rounded-2xl bg-[#0c0e15] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">{t.pillar3Kicker}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{t.pillar3Value}</div>
              <h3 className="text-base font-bold text-zinc-100 mt-2">{t.pillar3Title}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{t.pillar3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
