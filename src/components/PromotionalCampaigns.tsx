import React, { useState, useEffect } from "react";
import { Language } from "../translations";
import {
  Trophy,
  Zap,
  Shield,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
  Sparkles,
  Server,
  DollarSign,
  TrendingUp,
  Cpu,
  BarChart3,
  Globe2
} from "lucide-react";

// Generated professional images from AI Studio
const PROMO_IMAGES = {
  grandPrix: "/src/assets/images/promo_grand_prix_trading_1793964724719.jpg",
  primeLiquidity: "/src/assets/images/promo_prime_liquidity_servers_1793964725040.jpg",
  capitalSecurity: "/src/assets/images/promo_capital_security_vault_1793964725362.jpg",
  webTerminal: "/src/assets/images/promo_mobile_web_terminal_1793964725882.jpg",
  bullMarket: "/src/assets/images/promo_forex_crypto_bull_1794040561899.jpg",
  quantStation: "/src/assets/images/promo_algo_execution_charts_1794040561094.jpg"
};

export interface PromotionalCampaignsProps {
  lang: Language;
  onOpenRegister: () => void;
  onNavigateToTrading: () => void;
  onScrollToMarkets: () => void;
  onScrollToCountdown: () => void;
}

export const PromotionalCampaigns: React.FC<PromotionalCampaignsProps> = ({
  lang,
  onOpenRegister,
  onNavigateToTrading,
  onScrollToMarkets,
  onScrollToCountdown
}) => {
  const isAr = lang === "ar";
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const campaigns = [
    {
      id: "bull_market",
      badge: isAr ? "سيولة الأسواق العالمية 2026" : "GLOBAL MARKET LIQUIDITY 2026",
      title: isAr
        ? "تداول العملات والذهب والعملات المشفرة بأعلى سيولة مصرفية وفروقات تبدأ من صفر نقطة"
        : "Trade Forex, Gold & Crypto with Institutional Liquidity and 0.0 Pip Spreads",
      subtitle: isAr
        ? "استفد من تحركات الأسواق الصاعدة والهابطة برافعة مالية مرنة تصل إلى 1:100 وبدون رسوم خفية"
        : "Capture bull & bear market momentum with flexible 1:100 leverage and 100% transparent pricing",
      description: isAr
        ? "منصة Fast FX توفر لك بوابة متطورة لتداول أكثر من 100 أصل مالي عالمي مع أسعار حية مباشرة من بنوك الاستثمار العالمية من الفئة الأولى، مدعومة بسجل تداول SQL علائقي دقيق."
        : "Fast FX delivers direct access to over 100 global instruments with live institutional pricing sourced from top Tier-1 investment banks and committed directly to an immutable ACID SQL ledger.",
      image: PROMO_IMAGES.bullMarket,
      altText: "Fast FX Institutional Bull Market Liquidity and Financial Data Tickers",
      metrics: [
        { value: "0.0 Pips", label: isAr ? "أدنى فارق سعري" : "Raw Spread" },
        { value: "100+", label: isAr ? "أصول للتداول المباشر" : "Tradeable Assets" },
        { value: "1:100", label: isAr ? "الرافعة المالية القصوى" : "Max Leverage" },
        { value: "100%", label: isAr ? "حماية الرصيد السلبي" : "Negative Protection" }
      ],
      perks: isAr
        ? [
            "تداول الذهب، النفط، العملات الرئيسية والكريبتو",
            "تنفيذ فوري بدون وسيط (STP/ECN)",
            "أمان مالي كامل وعزل لأموال المتداولين"
          ]
        : [
            "Trade Gold, Crude Oil, Major FX & Crypto",
            "Direct STP/ECN non-dealing desk execution",
            "Complete segregation of all client funds"
          ],
      primaryCta: isAr ? "فتح حساب تداول ممول" : "Open Funded Trading Account",
      primaryAction: onOpenRegister,
      secondaryCta: isAr ? "استعراض أسعار السوق" : "Explore Live Prices",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-amber-500/40",
      accentGlow: "from-amber-500/20 via-sky-500/10 to-transparent",
      icon: TrendingUp
    },
    {
      id: "quant_terminal",
      badge: isAr ? "محطة التحليل والتداول الخوارزمي" : "QUANTITATIVE ALGORITHMIC TRADING",
      title: isAr
        ? "شاشات تداول ذكية وتحليلات بيانية حية مع عمق السوق الكامل من المستوى الثاني (L2)"
        : "Smart Trading Screens & Real-Time Depth of Market with Level 2 Order Flow",
      subtitle: isAr
        ? "بيئة تداول احترافية مصممة لخبراء التداول اليومي والسكالبينج والمستشارين الآليين (EAs)"
        : "Engineered specifically for active day traders, high-frequency scalpers, and automated expert advisors",
      description: isAr
        ? "احصل على رؤية عميقة لحركات الأسعار عبر رسوم الشموع اليابانية التفاعلية، ومؤشرات التحليل الفني، ودفتر الأوامر اللحظي مع إمكانية تحديد أوامر جني الأرباح ووقف الخسارة بدقة متناهية."
        : "Gain superior market visibility with interactive Candlestick charting, technical indicators, and real-time streaming order books with precision take-profit and stop-loss brackets.",
      image: PROMO_IMAGES.quantStation,
      altText: "Canary Wharf Institutional Multi-Screen Quantitative Trading Workstation",
      metrics: [
        { value: "< 1.2ms", label: isAr ? "سرعة إرسال الأوامر" : "Routing Latency" },
        { value: "L2 Depth", label: isAr ? "عمق السوق الحقيقي" : "Book Transparency" },
        { value: "0 Slippage", label: isAr ? "انزلاق سعري منعدم" : "Zero Slippage" },
        { value: "24/7", label: isAr ? "استقرار الخوادم" : "Platform Uptime" }
      ],
      perks: isAr
        ? [
            "رسوم بيانية متقدمة متعددة الأطر الزمنية",
            "دعم كامل للتداول الآلي والسكالبينج",
            "تنفيذ بنقرة واحدة داخل محطة التداول"
          ]
        : [
            "Advanced multi-timeframe charting tools",
            "Unrestricted scalping & algorithmic trading",
            "One-click execution inside trading terminal"
          ],
      primaryCta: isAr ? "الدخول إلى محطة التداول" : "Launch Trading Terminal",
      primaryAction: onNavigateToTrading,
      secondaryCta: isAr ? "استعراض الأصول المتاحة" : "Browse Instruments",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-sky-500/40",
      accentGlow: "from-sky-500/20 via-cyan-500/10 to-transparent",
      icon: BarChart3
    },
    {
      id: "grand_prix",
      badge: isAr ? "البطولة المؤسسية الكبرى 2026" : "2026 GLOBAL TRADING GRAND PRIX",
      title: isAr
        ? "جوائز نقدية كبرى بقيمة 250,000$ في بطولة التداول العالمية الكبرى"
        : "$250,000 Grand Prize Pool · Global Institutional Trading Championship",
      subtitle: isAr
        ? "تنافس مع نخبة المتداولين المؤسسيين في بيئة تداول حقيقية بأقل فروقات سعرية خام تبدأ من 0.0 نقطة"
        : "Compete with elite global traders in ultra-low latency real execution with 0.0 pip raw spreads",
      description: isAr
        ? "انضم إلى أكبر تحدٍ سنوي في عالم الأسواق المالية. تُكافأ أفضل الاستراتيجيات بعوائد نقدية حقيقية مودعة مباشرة في رصيد الحساب الموثق مع سجلات تدقيق شفافة عبر قاعدة بيانات SQL."
        : "Participate in our premier annual trading championship. Top algorithmic and discretionary traders earn direct withdrawable cash rewards deposited into verified accounts.",
      image: PROMO_IMAGES.grandPrix,
      altText: "Fast FX London Institutional Trading Floor Grand Prix",
      metrics: [
        { value: "$250,000", label: isAr ? "إجمالي الجوائز النقدية" : "Total Cash Pool" },
        { value: "0.0 Pips", label: isAr ? "فروقات الأسعار للمشاركين" : "Raw Spread" },
        { value: "1:100", label: isAr ? "الرافعة المالية القصوى" : "Max Leverage" },
        { value: "15 Days", label: isAr ? "متبقي على انطلاق الجولة" : "Launch Countdown" }
      ],
      perks: isAr
        ? [
            "جوائز نقدية فورية قابلة للسحب دون قيود",
            "بيئة تداول ECN حقيقية موصولة بـ Equinix LD4",
            "لوحة متصدرين حية ومحدثة كل ثانية"
          ]
        : [
            "Immediate withdrawable cash rewards without restrictions",
            "True ECN direct market access via Equinix LD4 London",
            "Real-time transparent live leaderboard"
          ],
      primaryCta: isAr ? "حجز مقعد في البطولة مجاناً" : "Register for Grand Prix Free",
      primaryAction: onScrollToCountdown,
      secondaryCta: isAr ? "استعراض تفاصيل المسابقة" : "View Competition Details",
      secondaryAction: onScrollToCountdown,
      accentBorder: "border-emerald-500/40",
      accentGlow: "from-emerald-500/20 via-teal-500/10 to-transparent",
      icon: Trophy
    },
    {
      id: "prime_liquidity",
      badge: isAr ? "بنية الألياف الضوئية لندن LD4" : "LONDON EQUINIX LD4 ULTRA FIBER",
      title: isAr
        ? "تنفيذ صفقات فائق السرعة دون 1.2 ملي ثانية مع سيولة بنكية مباشرة"
        : "Sub-1.2ms Ultra-Low Latency Execution with Direct Tier-1 Bank Feeds",
      subtitle: isAr
        ? "اتصال فايبر مباشر مع كبرى البنوك العالمية بدون غرفة مقاصة وبدون انزلاق سعري"
        : "Direct optical cross-connect with global tier-1 investment banks without dealing desk or re-quotes",
      description: isAr
        ? "احصل على أفضل أسعار البيع والشراء لحظياً من خلال تجميع السيولة الذكية متعددة المصادر. بنية مهيأة للمتداولين النشطين ومستشاري التداول الخوارزمي (EAs) والسكالبينج السريع."
        : "Direct optical cross-connect to Tier-1 liquidity providers in London Equinix LD4. Zero dealing desk interference, zero markups, and pure institutional market depth.",
      image: PROMO_IMAGES.primeLiquidity,
      altText: "Equinix LD4 London Tier-4 Datacenter Ultra Low Latency Trading Servers",
      metrics: [
        { value: "1.18ms", label: isAr ? "متوسط سرعة التنفيذ الفعلي" : "Average Execution" },
        { value: "99.999%", label: isAr ? "جاهزية الخوادم السحابية" : "Equinix Uptime" },
        { value: "18+ Banks", label: isAr ? "مزودي السيولة من الفئة الأولى" : "Tier-1 Prime Banks" },
        { value: "0 Re-quotes", label: isAr ? "انعدام إعادة التسعير تماماً" : "Zero Re-Quotes" }
      ],
      perks: isAr
        ? [
            "تنفيذ فوري بنظام STP/ECN المباشر",
            "خوادم فائقة الاستجابة في Equinix لندن",
            "دعم كامل للسكالبينج والتداول الخوارزمي"
          ]
        : [
            "100% Direct STP/ECN Execution",
            "Equinix LD4 London co-located fiber architecture",
            "Unrestricted scalping & automated algorithmic trading"
          ],
      primaryCta: isAr ? "فتح حساب تداول فائق السرعة" : "Open Ultra-Fast Account",
      primaryAction: onOpenRegister,
      secondaryCta: isAr ? "استعراض الأسعار اللحظية" : "Check Live Rates",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-sky-500/40",
      accentGlow: "from-sky-500/20 via-cyan-500/10 to-transparent",
      icon: Zap
    },
    {
      id: "capital_protection",
      badge: isAr ? "أمان مصرفي بريطاني معتمد" : "BRITISH TIER-1 BANKING CUSTODY",
      title: isAr
        ? "حسابات ائتمانية مفصولة 100% وحماية كاملة من الرصيد السلبي"
        : "100% Segregated Trust Accounts with Negative Balance Protection",
      subtitle: isAr
        ? "أموالك مودعة في بنوك بريطانية كبرى مع سجل تدقيق SQL علائقي غير قابل للتلاعب"
        : "Your capital is held in segregated tier-1 British accounts, audited in real time via ACID SQL ledger",
      description: isAr
        ? "نلتزم بأعلى معايير الحوكمة المالية المؤسسية. أموال عملائنا معزولة تماماً عن أصول الشركة التشغيلية، ومؤمنة بالكامل مع استرداد فوري وتدقيق مستمر لنسب الاحتياطي."
        : "We enforce strict institutional custody standards. Client funds are fully segregated from company operating capital with independent real-time solvency audits.",
      image: PROMO_IMAGES.capitalSecurity,
      altText: "Fast FX Institutional Private Vault Asset Custody and Security",
      metrics: [
        { value: "100%", label: isAr ? "نسبة عزل أموال المتداولين" : "Segregation Ratio" },
        { value: "1:1 Backed", label: isAr ? "احتياطيات نقدية حقيقية" : "Verified Reserves" },
        { value: "256-Bit", label: isAr ? "تشفير سجلات SQL" : "Audit Encryption" },
        { value: "Instant", label: isAr ? "معالجة طلبات السحب" : "Withdrawal SLA" }
      ],
      perks: isAr
        ? [
            "حسابات بنكية بريطانية مفصولة للمتداولين",
            "حماية آلية متقدمة من الرصيد السلبي",
            "سحب وإيداع فوري عبر عدة قنوات آمنة"
          ]
        : [
            "Segregated client accounts in top UK banks",
            "Automated negative balance protection",
            "Instant multi-channel deposits and withdrawals"
          ],
      primaryCta: isAr ? "سجل حسابك الموثق بأمان" : "Open Verified Protected Account",
      primaryAction: onOpenRegister,
      secondaryCta: isAr ? "قراءة معايير الأمان المصرفي" : "Read Security Standards",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-indigo-500/40",
      accentGlow: "from-indigo-500/20 via-teal-500/10 to-transparent",
      icon: Shield
    }
  ];

  // Auto-advance slideshow every 7 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % campaigns.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, campaigns.length]);

  const current = campaigns[activeSlide];
  const CurrentIcon = current.icon;

  return (
    <section
      id="promotional-campaigns-section"
      className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Faint Heartbeat Ambient Aura behind advertising campaigns */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-sky-500/10 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none animate-heartbeat-glow -z-10" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-sky-400 uppercase mb-2">
            <span>OFFICIAL CAMPAIGNS & FINANCIAL PROMOTIONS</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>FAST FX 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isAr ? "عروض وحملات التداول المالي المؤسسي" : "Institutional Financial Trading Campaigns"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            {isAr
              ? "استكشف أحدث المبادرات التنافسية، وحوافز السيولة المصرفية، وبنية الأمان فائقة السرعة المعتمدة دولياً."
              : "Explore our flagship trading grand prix, zero-spread liquidity incentives, and verified institutional custody architecture."}
          </p>
        </div>

        {/* Slide Selector Buttons (Tabs) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto no-scrollbar max-w-full">
          {campaigns.map((camp, idx) => {
            const Icon = camp.icon;
            return (
              <button
                key={camp.id}
                onClick={() => setActiveSlide(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeSlide === idx
                    ? "bg-slate-800 text-white shadow-sm font-bold border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeSlide === idx ? "text-sky-400" : "text-slate-500"}`} />
                <span className="hidden sm:inline">0{idx + 1}.</span>
                <span>{camp.badge.split("·")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Spotlight Promotional Feature Card (Marquee Banner with High-Fidelity Photo) */}
      <div className={`relative rounded-3xl bg-[#0c1322] border ${current.accentBorder} overflow-hidden shadow-2xl transition-all duration-500`}>
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px]">
          {/* Left Column (Content & Ad Copy): 7 Cols */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10 space-y-6">
            <div className="space-y-4">
              {/* Campaign Category & Trust Markers (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 tracking-wide">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <CurrentIcon className="w-4 h-4" />
                  {current.badge}
                </span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span>FAST FX GLOBAL</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="text-emerald-400 font-semibold">{isAr ? "عرض تداول نشط" : "LIVE CAMPAIGN"}</span>
              </div>

              {/* Headline */}
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug"
                style={{ textWrap: "balance" }}
              >
                {current.title}
              </h3>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base font-medium text-sky-300 leading-relaxed">
                {current.subtitle}
              </p>

              {/* Long Description Copy */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {current.description}
              </p>

              {/* Key Highlights / Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {current.perks.map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Quantitative Proof Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 font-mono">
              {current.metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="text-lg sm:text-xl font-black text-white tabular-nums">{m.value}</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={current.primaryAction}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{current.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={current.secondaryAction}
                className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{current.secondaryCta}</span>
              </button>
            </div>
          </div>

          {/* Right Column (High-Fidelity Visual Asset): 5 Cols */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden bg-slate-950 flex items-center justify-center">
            {imageErrors[current.id] ? (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-l border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-sky-400 mb-4">
                  <CurrentIcon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{current.title}</h4>
                <p className="text-xs text-slate-400 max-w-xs">{current.subtitle}</p>
              </div>
            ) : (
              <>
                <img
                  src={current.image}
                  alt={current.altText}
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(current.id)}
                  className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
                />

                {/* Scrim Overlay Gradient for legibility and seamless blend */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0c1322] via-[#0c1322]/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                {/* Floating Image Attribution / Technology Stamp */}
                <div className="absolute bottom-4 right-4 left-4 lg:left-auto p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LONDON EQUINIX LD4 · LIVE MARKET FEED</span>
                  </div>
                  <span className="text-slate-400 tabular-nums">0{activeSlide + 1} / 0{campaigns.length}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {campaigns.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === i ? "w-8 bg-sky-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + campaigns.length) % campaigns.length)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              aria-label="Previous Campaign"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % campaigns.length)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              aria-label="Next Campaign"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Secondary Institutional Financial Trading Advertising Cards (Bento Showcase) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {/* Card 1: Multi-Asset Global Bull Liquidity */}
        <div className="rounded-2xl bg-[#0c1322] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-slate-900">
            <img
              src={PROMO_IMAGES.bullMarket}
              alt="Fast FX Multi-Asset Bull Liquidity"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-amber-400 text-[11px] font-mono font-bold">
              {isAr ? "سيولة عالمية" : "GLOBAL BULL"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "تداول الفوركس والذهب والكريبتو" : "Forex, Gold & Crypto Liquidity"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "فروقات أسعار خام تبدأ من 0.0 نقطة مع سيولة مصرفية مباشرة من كبرى البنوك الاستثمارية بدون عمولات خفية."
                : "Raw institutional spreads from 0.0 pips with direct Tier-1 bank feeds and zero hidden commission markups."}
            </p>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                0.0 PIPS SPREAD
              </span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "بدء التداول ←" : "Start Trading ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Quant & Algo Trading Multi-Screen */}
        <div className="rounded-2xl bg-[#0c1322] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-slate-900">
            <img
              src={PROMO_IMAGES.quantStation}
              alt="Fast FX Quant Trading Terminal"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-sky-400 text-[11px] font-mono font-bold">
              {isAr ? "تداول خوارزمي" : "QUANT SUITE"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "شاشات تداول ذكية وعمق سوق L2" : "Smart Multi-Screen L2 Terminal"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "رسوم بيانية متقدمة مع مؤشرات فنية دقيقة وأوامر وقف خسارة وجني أرباح آلية لحماية الصفقات."
                : "Advanced Candlestick charts with technical indicators, dynamic order brackets, and automated TP/SL."}
            </p>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-sky-400 font-bold">
                L2 REAL-TIME BOOK
              </span>
              <button
                type="button"
                onClick={onNavigateToTrading}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "دخول المنصة ←" : "Terminal ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: 20% Liquidity Margin Boost */}
        <div className="rounded-2xl bg-[#0c1322] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-slate-900">
            <img
              src={PROMO_IMAGES.primeLiquidity}
              alt="Fast FX Prime Liquidity 20% Margin Match"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-emerald-400 text-[11px] font-mono font-bold">
              {isAr ? "حافز سيولة ترحيبي" : "WELCOME INCENTIVE"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "بونص سيولة ترحيبي يصل إلى 20%" : "Up to 20% Margin Credit Boost"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "عزز حجم وقوة تداولاتك بهامش إضافي عند فتح وشحن حسابك الممول الأول عبر أحدث تقنيات الإيداع الفوري."
                : "Expand your trade capacity with institutional margin support on your first verified funded deposit."}
            </p>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                0% HIDDEN FEES
              </span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "تفعيل العرض ←" : "Claim Boost ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: 100% Segregated Ledger Security Guarantee */}
        <div className="rounded-2xl bg-[#0c1322] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-slate-900">
            <img
              src={PROMO_IMAGES.capitalSecurity}
              alt="Fast FX Segregated Vault Banking Standard"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-indigo-400 text-[11px] font-mono font-bold">
              {isAr ? "أمان مصرفي بريطاني" : "BRITISH CUSTODY"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "حسابات ائتمانية مفصولة 100%" : "100% Segregated Trust Accounts"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "أموال المتداولين معزولة تماماً في حسابات ثقة مستقلة في بنوك بريطانية كبرى مع سجل تدقيق SQL علائقي."
                : "All trader deposits are isolated in independent custody trust accounts backed by an immutable SQL relational audit ledger."}
            </p>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-400 font-bold">
                1:1 AUDITED SOLVENCY
              </span>
              <button
                type="button"
                onClick={onScrollToMarkets}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "فحص الأمان ←" : "Audit Proof ←"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
