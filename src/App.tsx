import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Database,
  Lock,
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

export default function App() {
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

  // Time Countdown state (Target: August 15, 2026)
  const targetDate = new Date("2026-08-15T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

    // Set initial countdown
    calculateTimeLeft();

    // Intervals
    const countdownInterval = setInterval(calculateTimeLeft, 1000);

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

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setTimeLeft({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    });
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("الرجاء إدخال بريد إلكتروني صالح");
      return;
    }

    // Check if duplicate
    if (subscribers.includes(email)) {
      setErrorMsg("هذا البريد الإلكتروني مسجل بالفعل لدينا!");
      return;
    }

    const updated = [...subscribers, email];
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

    // Simulate precise ultra-fast micro-execution speed (from Sophisticated Dark specs - 3ms delay!)
    const speed = Number((2 + Math.random() * 3).toFixed(0)); // 2ms - 5ms delay!

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

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden relative"
    >
      {/* Background glow effects - Sophisticated Dark theme */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-orange-950/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-[150px] right-[15%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[350px] -left-[100px] w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Real-Time Ticker Bar with sophisticated borders */}
      <div className="bg-[#090909] border-b border-zinc-900 overflow-hidden py-3 z-50 relative">
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
        
        {/* Navigation / Header - Sophisticated Dark Layout */}
        <header className="flex flex-col sm:flex-row-reverse items-center justify-between py-8 border-b border-zinc-900 gap-6 mb-12 md:mb-16">
          {/* Real custom-designed image logo with glowing hover effect */}
          <div className="relative group shrink-0">
            {/* Super premium large double glow ring for extra prestige/presence */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 group-hover:blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-md opacity-40" />
            
            <img
              src="/src/assets/images/fast_fx_luxury_emblem_1783197785440.jpg"
              alt="FAST FX Logo"
              className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-2xl object-cover border-2 border-zinc-800/80 shadow-[0_0_45px_rgba(249,115,22,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:border-orange-500/50"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold font-mono">قريباً جداً</span>
            </div>
            
            <a 
              href="#registration-container"
              className="px-5 py-2.5 bg-transparent border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
            >
              قائمة الانتظار
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
                  أحدث تكنولوجيا في الأسواق العالمية
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.12] sm:leading-[1.15] bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                  سرعة فائقة. <br />
                  <span className="text-orange-500 font-sans font-extrabold">دقة متناهية.</span> <br />
                  تداول بلا حدود.
                </h1>
              </motion.div>

              {/* Epic Arabic Copy about the company */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-base sm:text-lg text-zinc-300 leading-relaxed space-y-5 border-r border-zinc-800 pr-5 sm:pr-6 md:max-w-2xl"
              >
                <p className="font-semibold text-white">
                  في عالم يتحرك بأجزاء من الثانية، نحن لا نواكب المستقبل فحسب، بل نصنعه.
                </p>
                <p>
                  منصة <span className="text-orange-500 font-bold">Fast Fx</span> ليست مجرد بوابة تقليدية للأسواق المالية؛ إنها بوابتك الذكية المجهزة بأحدث تقنيات المعالجة اللحظية، لتصل بك إلى الأسواق العالمية بقوة تكنولوجية لا مثيل لها.
                </p>
                <p>
                  لقد صممنا بيئة التداول الخاصة بنا لتمنحك الأفضلية المطلقة على الدوام: تنفيذ صفقات فائق السرعة يتم في أجزاء من الملي ثانية، تحليلات متطورة ترسم لك خارطة الفرص المتاحة، وواجهة تداول سلسة ومرنة تلائم طموحك الاستثماري وتطلعاتك.
                </p>
                <p>
                  سواء كنت تتداول في العملات الأجنبية (Forex)، الأسهم، المؤشرات، أو السلع الاستراتيجية، استعد لتجربة تداول استثنائية تعيد بالكامل تعريف مفهوم الكفاءة، السرعة، والسيطرة الكاملة على محفظتك المالية.
                </p>
                <p className="text-orange-400 font-bold text-sm sm:text-base flex items-center gap-2">
                  <span className="inline-block w-4 h-0.5 bg-orange-500"></span>
                  الرحلة تبدأ قريباً. انضم إلينا وكن جزءاً من النخبة التي تتداول بذكاء وسرعة البرق.
                </p>
              </motion.div>
            </div>

            {/* Countdown visual widget - Sophisticated Dark style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-[#111111] border border-zinc-800 p-6 rounded-none glow-orange"
            >
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                العد التنازلي للإنطلاق الرسمي:
              </h3>
              
              <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center font-mono" id="countdown-widget">
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850">
                  <div className="text-2xl sm:text-4xl font-light text-white">{timeLeft.days}</div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">يوم</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850">
                  <div className="text-2xl sm:text-4xl font-light text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">ساعة</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850">
                  <div className="text-2xl sm:text-4xl font-light text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-zinc-500 mt-1.5 font-bold">دقيقة</div>
                </div>
                <div className="bg-[#090909] rounded-none p-4 border border-zinc-850">
                  <div className="text-2xl sm:text-4xl font-light text-orange-500">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-orange-500/80 mt-1.5 font-bold">ثانية</div>
                </div>
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
                        كن من أوائل المستثمرين المنضمين
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        سجل اهتمامك الآن لتلقي دعوة حصرية لتجربة المنصة قبل الإطلاق الرسمي والاستفادة من رسوم تداول تبلغ 0% للشهر الأول.
                      </p>
                    </div>

                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="أدخل بريدك الإلكتروني هنا"
                            className="w-full bg-[#0a0a0a] border border-zinc-850 rounded-none py-4 px-4 pr-11 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-right text-sm"
                            id="email-input-field"
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                        </div>
                        <button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold px-8 py-4 rounded-none transition-all duration-300 text-sm hover:shadow-[0_0_25px_rgba(249,115,22,0.45)] shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                          id="submit-register-btn"
                        >
                          سجل اهتمامك الآن
                          <ArrowUpRight className="w-4 h-4 text-black" />
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
                    <h3 className="text-xl sm:text-2xl font-bold text-white">تم تسجيل اهتمامك بنجاح!</h3>
                    <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                      شكراً لاهتمامك بـ <span className="text-orange-500 font-bold">Fast Fx</span>. لقد أضفنا بريدك الإلكتروني إلى قائمة المدعوين الأوائل الحصريين. سنرسل لك رمز تفعيل الحساب فور بدء المرحلة التجريبية المغلقة.
                    </p>
                    <button
                      onClick={() => setIsSubscribed(false)}
                      className="text-xs text-orange-500 underline hover:text-orange-400 cursor-pointer mt-2"
                      id="register-another-btn"
                    >
                      تسجيل بريد إلكتروني آخر
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
                    MATCHING ENGINE SPEED SIMULATOR
                  </span>
                </div>
                <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-none font-mono">
                  REAL-TIME
                </span>
              </div>

              {/* Simulator Body */}
              <div className="p-6 space-y-6">
                
                {/* Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">اختر الأداة المالية لتجربة سرعة المنصة:</label>
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
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">سعر السوق المباشر</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 tracking-tight">
                      {currentSimPrice}
                    </div>
                  </div>
                  
                  {/* Neon flashing speed rate indicator */}
                  <div className="text-left font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">معدل التأخير المتوقع</div>
                    <div className="text-orange-500 font-bold text-sm sm:text-base flex items-center gap-1 mt-0.5 justify-end">
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
                  
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 bg-[#0e0e0e] border border-zinc-850 px-2 py-0.5">
                    <Activity className="w-3 h-3 text-orange-500 animate-pulse" />
                    مؤشر تدفق البيانات التجريبي
                  </div>
                </div>

                {/* Buy / Sell Buttons */}
                <div className="grid grid-cols-2 gap-3" id="trade-simulator-buttons">
                  <button
                    onClick={() => triggerMockTrade("buy")}
                    disabled={simStatus === "sending" || simStatus === "filled"}
                    className="bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold py-3.5 rounded-none transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-45"
                  >
                    <span className="text-[10px] uppercase opacity-75">تنفيذ سريع</span>
                    <span className="text-sm font-extrabold flex items-center gap-1">
                      شراء (BUY) <TrendingUp className="w-4 h-4" />
                    </span>
                  </button>

                  <button
                    onClick={() => triggerMockTrade("sell")}
                    disabled={simStatus === "sending" || simStatus === "filled"}
                    className="bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-bold py-3.5 rounded-none transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-45"
                  >
                    <span className="text-[10px] uppercase opacity-75">تنفيذ سريع</span>
                    <span className="text-sm font-extrabold flex items-center gap-1">
                      بيع (SELL) <TrendingDown className="w-4 h-4" />
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
                          <span>يرتبط الآن مع محرك المطابقة فائق السرعة...</span>
                        </div>
                      )}

                      {(simStatus === "filled" || simStatus === "settled") && (
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center text-[10px] text-zinc-550 pb-2 border-b border-zinc-850">
                            <span>سرعة الاستجابة الفعلية</span>
                            <span className="text-orange-500 font-bold flex items-center gap-0.5">
                              ⚡ {executionTime}ms (جزء من الثانية)
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-zinc-500">سعر الدخول:</span>
                            <span className="text-white font-semibold">{entryPrice}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-zinc-500">نوع العملية:</span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded-none ${
                                simDirection === "buy" ? "bg-emerald-950/30 text-emerald-400" : "bg-rose-950/30 text-rose-400"
                              }`}
                            >
                              {simDirection === "buy" ? "شراء مالي (BUY)" : "بيع على المكشوف (SELL)"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500 font-sans">النتيجة التجريبية:</span>
                            {simStatus === "filled" ? (
                              <span className="text-zinc-550 animate-pulse flex items-center gap-1 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                                جاري الاحتساب اللحظي...
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
                      آخر صفقاتك التجريبية:
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
                            <span className="text-zinc-600 text-[10px] font-sans">التأخير: {item.speed}ms</span>
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

            {/* Quick Trust Badges - Styled exactly like the design guidelines */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111111] border border-zinc-800 p-5 rounded-none text-right">
                <div className="inline-flex p-2 bg-orange-500/10 rounded-none text-orange-500 mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">ترخيص دولي معتمد</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">تداول ببيئة آمنة ومنظمة بالكامل</div>
              </div>

              <div className="bg-[#111111] border border-zinc-800 p-5 rounded-none text-right">
                <div className="inline-flex p-2 bg-orange-500/10 rounded-none text-orange-500 mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">سيرفرات فائقة القرب</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">في لندن وميونيخ لضمان سرعة فائقة</div>
              </div>
            </div>

          </section>

        </main>

        {/* Brand Core Pillars / Why Us Section - Styled exactly like "Market Stats Mockup" from Design instructions */}
        <section className="mt-24 md:mt-32 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="text-xs uppercase tracking-widest text-orange-500 font-bold font-mono">CORE ADVANTAGES</div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">لماذا منصة Fast Fx هي خيارك القادم؟</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              تكامل فريد بين قوة البنية التحتية البرمجية وسهولة الواجهة لتقديم أفضل بيئة استثمارية للمتداول العربي والعالمي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-zinc-800 bg-[#111111]" id="market-stats-pillar-section">
            
            {/* Pillar 1 */}
            <div className="border-x-0 md:border-l border-zinc-800 p-8 sm:p-10 text-right space-y-4">
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">سرعة التنفيذ</div>
              <div className="text-4xl font-light text-white italic font-mono flex items-baseline gap-1">
                0.003ms
                <span className="text-xs text-zinc-500 not-italic font-sans font-bold">/صفقة</span>
              </div>
              <h4 className="text-white font-bold text-base mt-2">بنية تحتية برمجية متطورة</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                نقوم بتوجيه صفقاتك مباشرة عبر شبكة ألياف ضوئية فائقة السرعة ومتصلة بأكبر مزودي السيولة العالميين لضمان التنفيذ الفوري وبدون أي انزلاق سعري.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="border-y border-zinc-800 md:border-y-0 md:border-l border-zinc-800 p-8 sm:p-10 text-right space-y-4">
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">فروقات الأسعار</div>
              <div className="text-4xl font-light text-white italic font-mono">
                0.0 Pips
              </div>
              <h4 className="text-white font-bold text-base mt-2">سيولة مؤسسية عميقة</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                استفد من سبريد (Spread) يبدأ من 0.0 نقطة على العملات الرئيسية، وسيولة عميقة تضمن لك بيع وشراء كميات تداول ضخمة بسلاسة تامة ومثالية.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 sm:p-10 text-right space-y-4">
              <div className="text-orange-500 text-xs uppercase tracking-widest font-bold font-mono">الأمان المتكامل</div>
              <div className="text-4xl font-light text-white italic font-mono">
                SSL+ 256
              </div>
              <h4 className="text-white font-bold text-base mt-2">حماية عسكرية لأصولك</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                حماية أصولك هي أولويتنا القصوى. نستخدم بروتوكولات حماية متطورة وتشفير عالي المستوى، بالإضافة إلى فصل كامل لحسابات العملاء في بنوك عالمية رائدة.
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
              {showSubscribers ? "إخفاء قائمة المشتركين التجريبية" : "إظهار قائمة المشتركين التجريبية (مخزن محلياً)"}
            </button>

            {showSubscribers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-md mx-auto bg-[#111] border border-zinc-800 rounded-none p-4 text-right"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-orange-500 font-mono">إجمالي المسجلين: {subscribers.length}</span>
                  <button
                    onClick={handleClearSubscribers}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    حذف الكل
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
            {/* Right side (RTL start): Logo & Brand info */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm blur-sm opacity-50" />
                  <img
                    src="/src/assets/images/fast_fx_luxury_emblem_1783197785440.jpg"
                    alt="FAST FX Logo"
                    className="relative w-8 h-8 rounded-sm object-cover border border-zinc-900"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xl font-bold text-white font-mono tracking-wider">FAST FX</span>
              </div>
              <p className="text-xs text-zinc-500 text-center md:text-right max-w-sm leading-relaxed">
                منصة تداول متطورة تقدم أقصى درجات السرعة والكفاءة في تنفيذ الصفقات بالأسواق المالية العالمية برعاية مجموعة Fast Flow Group LTD.
              </p>
            </div>

            {/* Middle: Brief message/stats spacer */}
            <div className="md:col-span-3 text-center text-xs text-zinc-500 space-y-2 leading-relaxed">
              <p className="font-semibold text-zinc-400">البنية التحتية العالمية</p>
              <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
              <p className="text-[11px]">اتصال فوري ومباشر مع كبرى مراكز التداول</p>
            </div>

            {/* Left side (RTL end / Aligned to absolute Left of page): LONDON */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end gap-1.5 text-center md:text-left">
              <span className="text-[10px] text-orange-550 uppercase tracking-[0.25em] font-extrabold font-mono">
                HEADQUARTERS
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-widest text-white hover:text-orange-500 transition-colors duration-300 font-mono">
                LONDON
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500 max-w-3xl mx-auto space-y-3.5 leading-relaxed">
            <p>
              تحذير المخاطر: إن تداول العملات الأجنبية (الفوركس) وعقود الفروقات (CFDs) ينطوي على مخاطر عالية وخسائر قد تفوق رأسمالك المستثمر. تأكد تماماً من فهمك للمخاطر المرتبطة وتلقي التدريب الكافي قبل البدء.
            </p>
            <p className="text-zinc-400 font-semibold">
              تخضع جميع العمليات والخدمات للشروط والتعليمات التنظيمية بموجب ترخيص الشركة الأم.
            </p>
          </div>

          {/* Explicit User Requirement: By Fast Flow Group LTD */}
          <div className="border-t border-zinc-900/60 w-full pt-8 flex flex-col items-center justify-center text-xs text-zinc-500 text-center gap-3">
            <div>
              &copy; {new Date().getFullYear()} Fast Fx. جميع الحقوق محفوظة لمجموعة Fast Flow Group LTD.
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
