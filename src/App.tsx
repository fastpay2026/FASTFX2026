import { useState, useEffect, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoUrl from "./assets/images/fast_fx_luxury_emblem_1783197785440.jpg";
import { translations, Language } from "./translations";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Activity,
  Mail,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Globe,
  Clock,
  ArrowUpRight,
  Sparkles,
  Info
} from "lucide-react";

// Types for ticker items
interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  isUp: boolean;
  type: string;
}

// Initial mockup data for ticker and trading pairs
const initialTickers: TickerItem[] = [
  { symbol: "EUR/USD", price: 1.0945, change: 0.12, isUp: true, type: "forex" },
  { symbol: "GBP/USD", price: 1.2721, change: -0.05, isUp: false, type: "forex" },
  { symbol: "USD/JPY", price: 155.80, change: 0.31, isUp: true, type: "forex" },
  { symbol: "BTC/USD", price: 96450.0, change: 1.45, isUp: true, type: "crypto" },
  { symbol: "ETH/USD", price: 3450.25, change: -0.85, isUp: false, type: "crypto" },
  { symbol: "Gold (XAU)", price: 2342.1, change: -0.18, isUp: false, type: "commodities" },
  { symbol: "Crude Oil", price: 78.45, change: 1.12, isUp: true, type: "commodities" },
];

// 15-day Countdown Logic (15 days starting from today)
const COUNTDOWN_STORAGE_KEY = "fast_fx_countdown_target_15d";
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function getLaunchTargetDate(): number {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        const now = Date.now();
        // If parsed is a valid future timestamp within 16 days
        if (!isNaN(parsed) && parsed > now && parsed <= now + FIFTEEN_DAYS_MS + 3600000) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read countdown target from localStorage", e);
    }
  }

  // Calculate 15 days ending from right now
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
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

export default function App() {
  // Language State - Persistent in localStorage
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("fast_fx_lang");
    return saved === "en" ? "en" : "ar";
  });

  const t = translations[lang];

  // Sync HTML document direction and title
  useEffect(() => {
    localStorage.setItem("fast_fx_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  const [tickers, setTickers] = useState<TickerItem[]>(initialTickers);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);

  // Trade Simulator States
  const [simPair, setSimPair] = useState("EUR/USD");
  const [simDirection, setSimDirection] = useState<"buy" | "sell" | null>(null);
  const [simStatus, setSimStatus] = useState<"idle" | "sending" | "filled" | "settled">("idle");
  const [executionTime, setExecutionTime] = useState(0);
  const [entryPrice, setEntryPrice] = useState(0);
  const [currentSimPrice, setCurrentSimPrice] = useState(1.0945);
  const [simProfit, setSimProfit] = useState<number | null>(null);
  const [simHistory, setSimHistory] = useState<
    { id: number; pair: string; dir: "buy" | "sell"; profit: number; speed: number }[]
  >([]);

  // Chart state for dynamic drawing
  const [chartData, setChartData] = useState<number[]>(Array.from({ length: 22 }, () => 40 + Math.random() * 30));

  // 15-day Countdown state (Target: 15 days from today)
  const [targetTimestamp] = useState<number>(() => getLaunchTargetDate());
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeftValues(getLaunchTargetDate()));

  // Formatted target date based on selected language
  const targetDateFormatted = useMemo(() => {
    try {
      const d = new Date(targetTimestamp);
      return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return new Date(targetTimestamp).toLocaleDateString();
    }
  }, [targetTimestamp, lang]);

  // Load subscribers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fast_fx_subscribers");
    if (saved) {
      try {
        setSubscribers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load subscribers", e);
      }
    }

    // Set initial countdown and interval
    setTimeLeft(calculateTimeLeftValues(targetTimestamp));
    const countdownInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeftValues(targetTimestamp));
    }, 1000);

    // Simulate live ticker changes
    const tickerInterval = setInterval(() => {
      setTickers((prev) =>
        prev.map((item) => {
          const changePercent = (Math.random() - 0.48) * 0.12;
          const isUp = changePercent >= 0;
          const newPrice = item.price * (1 + changePercent / 100);
          return {
            ...item,
            price: Number(newPrice.toFixed(item.price > 1000 ? 2 : 4)),
            change: Number((item.change + changePercent).toFixed(2)),
            isUp,
          };
        })
      );
    }, 3000);

    // Simulate live chart data
    const chartInterval = setInterval(() => {
      setChartData((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const variance = (Math.random() - 0.5) * 10;
        const newVal = Math.max(15, Math.min(85, last + variance));
        return [...next, newVal];
      });
    }, 1200);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(tickerInterval);
      clearInterval(chartInterval);
    };
  }, []);

  // Update simulator current price based on chart
  useEffect(() => {
    if (chartData.length > 0) {
      const scale = simPair === "BTC/USD" ? 1000 : simPair === "Gold (XAU)" ? 10 : 0.01;
      const base = simPair === "BTC/USD" ? 96000 : simPair === "Gold (XAU)" ? 2340 : 1.09;
      const lastVal = chartData[chartData.length - 1];
      const computedPrice = base + (lastVal - 50) * scale;
      setCurrentSimPrice(Number(computedPrice.toFixed(simPair === "BTC/USD" ? 2 : 4)));
    }
  }, [chartData, simPair]);

  // Handle trade calculation if filled
  useEffect(() => {
    if (simStatus === "filled" && simDirection) {
      const timer = setTimeout(() => {
        const priceDiff = currentSimPrice - entryPrice;
        let profit = 0;
        const multiplier = simPair === "BTC/USD" ? 10 : simPair === "Gold (XAU)" ? 100 : 10000;

        if (simDirection === "buy") {
          profit = priceDiff * multiplier;
        } else {
          profit = -priceDiff * multiplier;
        }

        setSimProfit(Number(profit.toFixed(2)));
        setSimStatus("settled");

        // Save to simulator history
        setSimHistory((prev) => [
          {
            id: Date.now(),
            pair: simPair,
            dir: simDirection,
            profit: Number(profit.toFixed(2)),
            speed: executionTime,
          },
          ...prev.slice(0, 4),
        ]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [simStatus, currentSimPrice, entryPrice, simDirection, simPair, executionTime]);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg(t.errorEmpty);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg(t.errorInvalid);
      return;
    }

    // Check if duplicate
    if (subscribers.includes(email.trim())) {
      setErrorMsg(t.errorDuplicate);
      return;
    }

    const updated = [...subscribers, email.trim()];
    setSubscribers(updated);
    localStorage.setItem("fast_fx_subscribers", JSON.stringify(updated));
    setIsSubscribed(true);
    setEmail("");
  };

  const triggerMockTrade = (direction: "buy" | "sell") => {
    if (simStatus === "sending" || simStatus === "filled") return;

    setSimDirection(direction);
    setSimStatus("sending");
    setSimProfit(null);

    // Simulate precise ultra-fast micro-execution speed (2ms - 5ms delay)
    const speed = Number((2 + Math.random() * 3).toFixed(0));

    setTimeout(() => {
      setEntryPrice(currentSimPrice);
      setExecutionTime(speed);
      setSimStatus("filled");
    }, 600);
  };

  const handleClearSubscribers = () => {
    setSubscribers([]);
    localStorage.removeItem("fast_fx_subscribers");
  };

  const isRTL = lang === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden relative"
    >
      {/* Background glow effects - Sophisticated Dark theme */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-orange-950/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-[150px] right-[15%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[350px] -left-[100px] w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Real-Time Ticker Bar with sophisticated borders */}
      <div className="bg-[#090909] border-b border-zinc-900 overflow-hidden py-3 z-50 relative" dir="ltr">
        <div className="flex whitespace-nowrap items-center animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused] gap-12">
          {/* Duplicate for infinite ticker */}
          {[...tickers, ...tickers].map((ticker, index) => (
            <div key={index} className="flex items-center gap-2.5 text-xs font-mono shrink-0">
              <span className="text-zinc-500 font-semibold">{ticker.symbol}</span>
              <span className="text-white font-medium">{ticker.price}</span>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 ${
                  ticker.isUp ? "text-emerald-400 bg-emerald-950/20" : "text-rose-400 bg-rose-950/20"
                }`}
              >
                {ticker.isUp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {ticker.isUp ? "+" : ""}
                {ticker.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* App Content Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
        
        {/* Navigation / Header - Sophisticated Dark Layout with Language Toggle */}
        <header className="flex flex-col sm:flex-row items-center justify-between py-6 sm:py-8 border-b border-zinc-900 gap-6 mb-12 md:mb-16">
          {/* Real custom-designed image logo with glowing hover effect */}
          <div className="relative group shrink-0">
            {/* Large double glow ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 group-hover:blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-md opacity-40" />
            
            <img
              src={logoUrl}
              alt="FAST FX Logo"
              className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-2xl object-cover border-2 border-zinc-800/80 shadow-[0_0_45px_rgba(249,115,22,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:border-orange-500/50"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Action Zone: Status + Language Toggle Switch + Waitlist Button */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#0e0e10] border border-zinc-850">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div>
              <span className="text-xs uppercase tracking-widest text-zinc-300 font-bold font-mono">
                {t.comingSoon}
              </span>
            </div>

            {/* Language Toggle Switch (العربية | English) */}
            <div
              role="group"
              aria-label="Language selection toggle"
              className="flex items-center p-0.5 bg-[#0e0e10] border border-zinc-800 rounded-none shadow-inner"
            >
              <button
                type="button"
                onClick={() => setLang("ar")}
                aria-pressed={lang === "ar"}
                className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  lang === "ar"
                    ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>العربية</span>
              </button>
              
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  lang === "en"
                    ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>English</span>
              </button>
            </div>
            
            {/* Waitlist Anchor Button */}
            <a 
              href="#registration-container"
              className="px-5 py-2.5 bg-transparent border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.waitlistBtn}
            </a>
          </div>
        </header>

        {/* Main 2-Column Section */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Column 1: Epic Text Content & Registration Form (7 Cols) */}
          <section className="lg:col-span-7 space-y-10">
            
            {/* Main Epic Copy */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#111] border border-zinc-800 text-[11px] text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  {t.kicker}
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.12] sm:leading-[1.15] bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                  {t.heroLine1} <br />
                  <span className="text-orange-500 font-sans font-extrabold">{t.heroLine2}</span> <br />
                  {t.heroLine3}
                </h1>
              </motion.div>

              {/* Epic Narrative Copy about the company */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={`text-base sm:text-lg text-zinc-300 leading-relaxed space-y-5 border-zinc-800 md:max-w-2xl ${
                  isRTL ? "border-r pr-5 sm:pr-6 text-right" : "border-l pl-5 sm:pl-6 text-left"
                }`}
              >
                <p className="font-semibold text-white">
                  {t.narrativeP1}
                </p>
                <p>
                  {t.narrativeP2.before}
                  <span className="text-orange-500 font-bold">{t.narrativeP2.brand}</span>
                  {t.narrativeP2.after}
                </p>
                <p>
                  {t.narrativeP3}
                </p>
                <p>
                  {t.narrativeP4}
                </p>
                <p className="text-orange-400 font-bold text-sm sm:text-base flex items-center gap-2">
                  <span className="inline-block w-4 h-0.5 bg-orange-500 shrink-0"></span>
                  {t.narrativeP5}
                </p>
              </motion.div>
            </div>

            {/* Countdown visual widget - Sophisticated Dark style (15 Days from today) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-[#111111] border border-zinc-800 p-6 rounded-none glow-orange relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
                  {t.countdownTitle}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                  {t.countdownBadge}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center font-mono" id="countdown-widget">
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850 hover:border-orange-500/40 transition-colors">
                  <div className="text-2xl sm:text-4xl font-light text-white">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">{t.days}</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850 hover:border-orange-500/40 transition-colors">
                  <div className="text-2xl sm:text-4xl font-light text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">{t.hours}</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850 hover:border-orange-500/40 transition-colors">
                  <div className="text-2xl sm:text-4xl font-light text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">{t.minutes}</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850 hover:border-orange-500/40 transition-colors">
                  <div className="text-2xl sm:text-4xl font-light text-orange-500">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-orange-500/80 mt-1.5 font-bold">{t.seconds}</div>
                </div>
              </div>

              {/* Target date indicator */}
              <div className="mt-4 pt-3.5 border-t border-zinc-900/90 flex items-center justify-between text-[11px] text-zinc-500 flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/70" />
                  {t.countdownEndDateLabel}
                </span>
                <span className="font-mono text-zinc-300 font-medium">
                  {targetDateFormatted}
                </span>
              </div>
            </motion.div>

            {/* Email Registration form - Styled to match Sophisticated Dark */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-[#111111] border border-zinc-800 rounded-none p-6 sm:p-8 relative overflow-hidden"
              id="registration-container"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {t.formTitle}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {t.formDesc}
                      </p>
                    </div>

                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.emailPlaceholder}
                            className={`w-full bg-[#0a0a0a] border border-zinc-850 rounded-none py-4 px-4 ${
                              isRTL ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
                            } text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-sm`}
                            id="email-input-field"
                          />
                          <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650 ${
                            isRTL ? "right-4" : "left-4"
                          }`} />
                        </div>
                        <button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold px-8 py-4 rounded-none transition-all duration-300 text-sm hover:shadow-[0_0_25px_rgba(249,115,22,0.45)] shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                          id="submit-register-btn"
                        >
                          {t.submitButton}
                          <ArrowUpRight className={`w-4 h-4 text-black ${!isRTL ? "rotate-45" : ""}`} />
                        </button>
                      </div>

                      {errorMsg && (
                        <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5" id="error-message">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          {errorMsg}
                        </p>
                      )}
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                    id="success-message-container"
                  >
                    <div className="inline-flex items-center justify-center bg-orange-500/10 border border-orange-500/30 p-3.5 rounded-none mb-2">
                      <CheckCircle2 className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{t.successTitle}</h3>
                    <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                      {t.successDesc.before}
                      <span className="text-orange-500 font-bold">{t.successDesc.brand}</span>
                      {t.successDesc.after}
                    </p>
                    <button
                      onClick={() => setIsSubscribed(false)}
                      className="text-xs text-orange-500 underline hover:text-orange-400 cursor-pointer mt-2"
                      id="register-another-btn"
                    >
                      {t.registerAnother}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </section>

          {/* Column 2: Interactive Real-Time Trading Speed Simulator (5 Cols) */}
          <section className="lg:col-span-5 space-y-8">
            
            {/* The Execution Simulator Widget - Elegant Dark Theme */}
            <div className="bg-[#111111] border border-zinc-800 rounded-none overflow-hidden shadow-2xl relative">
              
              {/* Simulator Header */}
              <div className="bg-[#18181b] p-4 border-b border-zinc-800/85 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-300 font-mono tracking-wider uppercase">
                    {t.simulatorHeader}
                  </span>
                </div>
                <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-none font-mono">
                  {t.realtimeBadge}
                </span>
              </div>

              {/* Simulator Body */}
              <div className="p-6 space-y-6">
                
                {/* Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">{t.selectPairLabel}</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#090909] p-1 rounded-none border border-zinc-850">
                    {["EUR/USD", "BTC/USD", "Gold (XAU)"].map((pair) => (
                      <button
                        key={pair}
                        onClick={() => {
                          setSimPair(pair);
                          setSimStatus("idle");
                          setSimProfit(null);
                        }}
                        className={`text-xs font-bold py-2 rounded-none transition-all cursor-pointer ${
                          simPair === pair
                            ? "bg-orange-500 text-black shadow-md"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        {pair}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Current Live Price */}
                <div className="bg-[#090909] border border-zinc-850 rounded-none p-4 flex items-center justify-between relative overflow-hidden">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      {t.marketPriceLabel}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 tracking-tight">
                      {currentSimPrice}
                    </div>
                  </div>
                  
                  {/* Flashing speed rate indicator */}
                  <div className={`${isRTL ? "text-left" : "text-right"} font-mono`}>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      {t.expectedLatencyLabel}
                    </div>
                    <div className={`text-orange-500 font-bold text-sm sm:text-base flex items-center gap-1 mt-0.5 ${
                      isRTL ? "justify-end" : "justify-end"
                    }`}>
                      <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />
                      &lt; 0.003s
                    </div>
                  </div>
                </div>

                {/* Mini chart visualizer */}
                <div className="h-28 bg-[#050505] border border-zinc-850 rounded-none p-2 relative overflow-hidden flex items-end gap-[3px]">
                  {chartData.map((val, idx) => {
                    const heightPercent = val;
                    const isUp = idx === 0 ? true : chartData[idx] >= chartData[idx - 1];
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-none transition-all duration-300"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: isUp ? "rgba(249, 115, 22, 0.45)" : "rgba(63, 63, 70, 0.45)",
                          boxShadow: isUp ? "0 0 4px rgba(249, 115, 22, 0.1)" : "none",
                        }}
                      />
                    );
                  })}
                  
                  <div className={`absolute top-2 ${isRTL ? "right-2" : "left-2"} text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 bg-[#0e0e0e] border border-zinc-850 px-2 py-0.5`}>
                    <Activity className="w-3 h-3 text-orange-500 animate-pulse" />
                    {t.chartIndicatorLabel}
                  </div>
                </div>

                {/* Buy / Sell Buttons */}
                <div className="grid grid-cols-2 gap-3" id="trade-simulator-buttons">
                  <button
                    onClick={() => triggerMockTrade("buy")}
                    disabled={simStatus === "sending" || simStatus === "filled"}
                    className="bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold py-3.5 rounded-none transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-45"
                  >
                    <span className="text-[10px] uppercase opacity-75">{t.instantExecLabel}</span>
                    <span className="text-sm font-extrabold flex items-center gap-1">
                      {t.buyAction} <TrendingUp className="w-4 h-4" />
                    </span>
                  </button>

                  <button
                    onClick={() => triggerMockTrade("sell")}
                    disabled={simStatus === "sending" || simStatus === "filled"}
                    className="bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-bold py-3.5 rounded-none transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-45"
                  >
                    <span className="text-[10px] uppercase opacity-75">{t.instantExecLabel}</span>
                    <span className="text-sm font-extrabold flex items-center gap-1">
                      {t.sellAction} <TrendingDown className="w-4 h-4" />
                    </span>
                  </button>
                </div>

                {/* Results Screen for Trade */}
                <AnimatePresence mode="wait">
                  {simStatus !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#090909] border border-zinc-850 rounded-none p-4 space-y-3 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                      {simStatus === "sending" && (
                        <div className="flex items-center gap-3 py-1 text-xs text-zinc-400">
                          <div className="w-4 h-4 rounded-full border border-orange-500 border-t-transparent animate-spin shrink-0" />
                          <span>{t.connectingEngine}</span>
                        </div>
                      )}

                      {(simStatus === "filled" || simStatus === "settled") && (
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center text-[10px] text-zinc-550 pb-2 border-b border-zinc-850">
                            <span>{t.actualLatencyLabel}</span>
                            <span className="text-orange-500 font-bold flex items-center gap-0.5">
                              ⚡ {executionTime}ms {t.subsecondLabel}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.entryPriceLabel}</span>
                            <span className="text-white font-semibold">{entryPrice}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.orderTypeLabel}</span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded-none ${
                                simDirection === "buy" ? "bg-emerald-950/30 text-emerald-400" : "bg-rose-950/30 text-rose-400"
                              }`}
                            >
                              {simDirection === "buy" ? t.buyOrderType : t.sellOrderType}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500 font-sans">{t.simResultLabel}</span>
                            {simStatus === "filled" ? (
                              <span className="text-zinc-550 animate-pulse flex items-center gap-1 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                                {t.calculatingResult}
                              </span>
                            ) : (
                              <span
                                className={`font-bold text-sm ${
                                  (simProfit ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {(simProfit ?? 0) >= 0 ? "+" : ""}
                                {simProfit}$
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Simulated Trades History */}
                {simHistory.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {t.recentTradesTitle}
                    </div>
                    <div className="space-y-1.5">
                      {simHistory.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#090909] px-3 py-2 rounded-none border border-zinc-850 flex items-center justify-between text-[11px] font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-bold">{item.pair}</span>
                            <span className={item.dir === "buy" ? "text-emerald-400" : "text-rose-400"}>
                              {item.dir === "buy" ? "BUY" : "SELL"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-600 text-[10px] font-sans">
                              {t.latencyPrefix} {item.speed}ms
                            </span>
                            <span className={`font-bold ${(item.profit ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {item.profit >= 0 ? "+" : ""}
                              {item.profit}$
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Quick Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-[#111111] border border-zinc-800 p-5 rounded-none ${
                isRTL ? "text-right" : "text-left"
              }`}>
                <div className="inline-flex p-2 bg-orange-500/10 rounded-none text-orange-500 mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">{t.badge1Title}</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{t.badge1Desc}</div>
              </div>

              <div className={`bg-[#111111] border border-zinc-800 p-5 rounded-none ${
                isRTL ? "text-right" : "text-left"
              }`}>
                <div className="inline-flex p-2 bg-orange-500/10 rounded-none text-orange-500 mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">{t.badge2Title}</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{t.badge2Desc}</div>
              </div>
            </div>

          </section>

        </main>

        {/* Brand Core Pillars / Why Us Section with Orange Hover Glow */}
        <section className="mt-24 md:mt-32 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="text-xs uppercase tracking-widest text-orange-500 font-bold font-mono">
              {t.coreAdvantagesKicker}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t.whyUsTitle}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {t.whyUsSubtitle}
            </p>
          </div>

          {/* 3 Core Pillars with subtle orange hover glow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-zinc-800 bg-[#111111]" id="market-stats-pillar-section">
            
            {/* Pillar 1 */}
            <div className={`card-hover-glow border-x-0 ${
              isRTL ? "md:border-l" : "md:border-r"
            } border-zinc-800 p-8 sm:p-10 ${
              isRTL ? "text-right" : "text-left"
            } space-y-4`}>
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">
                {t.pillar1Kicker}
              </div>
              <div className="text-4xl font-light text-white italic font-mono flex items-baseline gap-1">
                {t.pillar1Value}
                <span className="text-xs text-zinc-500 not-italic font-sans font-bold">
                  {t.pillar1Unit}
                </span>
              </div>
              <h4 className="text-white font-bold text-base mt-2">
                {t.pillar1Title}
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.pillar1Desc}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className={`card-hover-glow border-y md:border-y-0 ${
              isRTL ? "md:border-l" : "md:border-r"
            } border-zinc-800 p-8 sm:p-10 ${
              isRTL ? "text-right" : "text-left"
            } space-y-4`}>
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">
                {t.pillar2Kicker}
              </div>
              <div className="text-4xl font-light text-white italic font-mono">
                {t.pillar2Value}
              </div>
              <h4 className="text-white font-bold text-base mt-2">
                {t.pillar2Title}
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.pillar2Desc}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className={`card-hover-glow p-8 sm:p-10 ${
              isRTL ? "text-right" : "text-left"
            } space-y-4`}>
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">
                {t.pillar3Kicker}
              </div>
              <div className="text-4xl font-light text-white italic font-mono">
                {t.pillar3Value}
              </div>
              <h4 className="text-white font-bold text-base mt-2">
                {t.pillar3Title}
              </h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.pillar3Desc}
              </p>
            </div>

          </div>
        </section>

        {/* Private Dashboard Section for verifying registered subscribers */}
        {subscribers.length > 0 && (
          <div className="mt-20 text-center border-t border-zinc-900 pt-8">
            <button
              onClick={() => setShowSubscribers(!showSubscribers)}
              className="inline-flex items-center gap-2 bg-[#111111] border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-none text-xs font-mono transition-all duration-200 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-orange-500" />
              {showSubscribers ? t.hideSubscribersBtn : t.showSubscribersBtn}
            </button>

            {showSubscribers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 max-w-md mx-auto bg-[#111] border border-zinc-800 rounded-none p-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-orange-500 font-mono">
                    {t.totalSubscribersLabel} {subscribers.length}
                  </span>
                  <button
                    onClick={handleClearSubscribers}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    {t.clearAllSubscribersBtn}
                  </button>
                </div>
                <ul className="text-xs font-mono text-zinc-300 space-y-1.5 divide-y divide-zinc-900 max-h-40 overflow-y-auto">
                  {subscribers.map((sub, i) => (
                    <li key={i} className="pt-1.5 first:pt-0">
                      {sub}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* Footer conforming to explicit user requirements and "Sophisticated Dark" specs */}
      <footer className="bg-[#030303] border-t border-zinc-900 py-16 px-4 sm:px-6 lg:px-8 mt-auto relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-zinc-900 pb-12">
            {/* Logo & Brand Info */}
            <div className={`md:col-span-5 flex flex-col items-center ${
              isRTL ? "md:items-start" : "md:items-start"
            } gap-4`}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm blur-sm opacity-50" />
                  <img
                    src={logoUrl}
                    alt="FAST FX Logo"
                    className="relative w-8 h-8 rounded-sm object-cover border border-zinc-900"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xl font-bold text-white font-mono tracking-wider">FAST FX</span>
              </div>
              <p className={`text-xs text-zinc-500 text-center ${
                isRTL ? "md:text-right" : "md:text-left"
              } max-w-sm leading-relaxed`}>
                {t.footerDescription}
              </p>
            </div>

            {/* Middle: Stats / Infrastructure note */}
            <div className="md:col-span-3 text-center text-xs text-zinc-500 space-y-2 leading-relaxed">
              <p className="font-semibold text-zinc-400">{t.globalInfraTitle}</p>
              <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
              <p className="text-[11px]">{t.globalInfraSubtitle}</p>
            </div>

            {/* London Headquarters */}
            <div className={`md:col-span-4 flex flex-col items-center ${
              isRTL ? "md:items-end" : "md:items-end"
            } gap-1.5 text-center`}>
              <span className="text-[10px] text-orange-500 uppercase tracking-[0.25em] font-extrabold font-mono">
                {t.headquartersLabel}
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-widest text-white hover:text-orange-500 transition-colors duration-300 font-mono">
                {t.headquartersCity}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500 max-w-3xl mx-auto space-y-3.5 leading-relaxed">
            <p>
              {t.riskWarningText}
            </p>
            <p className="text-zinc-400 font-semibold">
              {t.regulatoryText}
            </p>
          </div>

          {/* Fast Flow Group LTD credit */}
          <div className="border-t border-zinc-900/60 w-full pt-8 flex flex-col items-center justify-center text-xs text-zinc-500 text-center gap-3">
            <div>
              &copy; {new Date().getFullYear()} {t.copyrightText}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
