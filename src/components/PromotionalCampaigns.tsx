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
  Globe2,
  Coins,
  Scale
} from "lucide-react";

// Professional Forex Broker advertising imagery
const PROMO_IMAGES = {
  goldBullion: "/src/assets/images/forex_trading_gold_bullion_1794041068046.jpg",
  forexTraderDesk: "/src/assets/images/forex_currency_trader_desk_1794041068635.jpg",
  swapFreeIslamic: "/src/assets/images/forex_swap_free_islamic_1794041069028.jpg",
  mobileForex: "/src/assets/images/forex_mobile_execution_lifestyle_1794041069776.jpg",
  bullMarket: "/src/assets/images/promo_forex_crypto_bull_1794040561899.jpg",
  grandPrix: "/src/assets/images/promo_grand_prix_trading_1793964724719.jpg"
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
      id: "gold_and_forex",
      badge: isAr ? "وساطة فوركس وذهب مؤسسية" : "INSTITUTIONAL FOREX & GOLD",
      title: isAr
        ? "تداول الذهب والعملات الأجنبية بفروقات أسعار خام تبدأ من 0.0 نقطة وبدون عمولات خفية"
        : "Trade Gold & Major Forex Pairs with Raw 0.0 Pip Spreads and Zero Hidden Fees",
      subtitle: isAr
        ? "اربط حسابك مباشرة بسيولة البنوك الاستثمارية الكبرى في لندن مع رافعة مالية مرنة تصل إلى 1:100"
        : "Direct interbank STP liquidity routing with up to 1:100 flexible institutional leverage",
      description: isAr
        ? "تقدم Fast FX بيئة تداول متطورة لأسواق العملات الأجنبية (الفوركس) وتداول سبائك الذهب XAU/USD والنفط، بأقل هوامش في السوق العالمي وتنفيذ فوري بدون غرفة مقاصة، مع حماية معتمدة لرأس المال."
        : "Fast FX delivers pure institutional ECN/STP execution across major currency pairs and Gold bullion (XAU/USD). Direct pricing from Tier-1 liquidity providers with guaranteed negative balance protection.",
      image: PROMO_IMAGES.goldBullion,
      altText: "Pure Gold Bullion Bars and Real-Time Financial Forex Rates in Vault",
      metrics: [
        { value: "0.0 Pips", label: isAr ? "أدنى فارق سعري خام" : "Raw Spread from" },
        { value: "XAU/USD", label: isAr ? "تداول الذهب اللحظي" : "Gold Spot Bullion" },
        { value: "1:100", label: isAr ? "الرافعة المالية القصوى" : "Max Leverage" },
        { value: "100%", label: isAr ? "حماية الرصيد السلبي" : "Negative Protection" }
      ],
      perks: isAr
        ? [
            "تداول فوري لسبائك الذهب XAU/USD وأكثر من 80 زوج عملات",
            "تنفيذ بنظام STP المباشر دون غرفة مقاصة وبدون انزلاق سعري",
            "حسابات ائتمانية مفصولة 100% في بنوك بريطانية كبرى"
          ]
        : [
            "Spot Gold (XAU/USD) & 80+ global currency pairs",
            "100% Direct STP routing without dealing desk markups",
            "Segregated client trust accounts in top British banks"
          ],
      primaryCta: isAr ? "فتح حساب فوركس ممول" : "Open Funded FX Account",
      primaryAction: onOpenRegister,
      secondaryCta: isAr ? "استعراض أسعار العملات الحية" : "Explore Currency Rates",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-amber-500/50",
      accentGlow: "from-amber-500/25 via-yellow-500/10 to-transparent",
      icon: Coins
    },
    {
      id: "swap_free_islamic",
      badge: isAr ? "تداول إسلامي خالي من الربا 100%" : "100% SWAP-FREE ISLAMIC FOREX",
      title: isAr
        ? "حسابات فوركس إسلامية معتمدة خالية تماماً من فوائد التبييت (Swap-Free)"
        : "Certified Sharia-Compliant Islamic Forex Accounts with Zero Overnight Swaps",
      subtitle: isAr
        ? "احتفظ بصفقاتك مفتوحة لأي فترة دون احتساب أي فوائد ربوية أو رسوم إضافية وبشفافية كاملة"
        : "Hold overnight positions indefinitely with zero interest rollover charges and full pricing transparency",
      description: isAr
        ? "صُممت حساباتنا الإسلامية خصيصاً للمتداولين في العالم العربي والشرق الأوسط وفقاً لأحكام الشريعة الإسلامية. لا توجد أي فوائد تبييت أو رسوم مخفية، مع الحفاظ على نفس الفروقات السعرية الضيقة والسرعة الفائقة."
        : "Engineered specifically for traders requiring strict Sharia compliance. Enjoy unrestricted overnight holding without rollover interest, with identical raw spreads and institutional execution speed.",
      image: PROMO_IMAGES.swapFreeIslamic,
      altText: "Luxury Sharia-Compliant Private Banking Atrium Dubai DIFC",
      metrics: [
        { value: "0.0% Swap", label: isAr ? "فوائد تبييت منعدمة" : "Zero Rollover Fees" },
        { value: "100%", label: isAr ? "متوافق مع الشريعة" : "Sharia Compliant" },
        { value: "Instant", label: isAr ? "تفعيل فوري للحساب" : "Instant Activation" },
        { value: "0.0 Pips", label: isAr ? "نفس السبريد القياسي" : "Identical Raw Spreads" }
      ],
      perks: isAr
        ? [
            "انعدام كامل لرسوم التبييت (Swap) على أزواج العملات والذهب",
            "فروقات أسعار ضيقة مطابقة للحسابات القياسية دون فروق خفية",
            "تفعيل فوري بنقرة واحدة لجميع المتداولين في الشرق الأوسط"
          ]
        : [
            "Zero overnight interest on all Forex and Commodity pairs",
            "Identical tight institutional spreads without hidden markups",
            "Instant one-click Islamic account activation for Middle East traders"
          ],
      primaryCta: isAr ? "فتح حساب إسلامي خالي من الفوائد" : "Open Islamic Swap-Free Account",
      primaryAction: onOpenRegister,
      secondaryCta: isAr ? "قراءة شروط الحساب الإسلامي" : "View Islamic Terms",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-emerald-500/50",
      accentGlow: "from-emerald-500/25 via-teal-500/10 to-transparent",
      icon: Scale
    },
    {
      id: "london_equinix_exec",
      badge: isAr ? "سرعة تنفيذ الألياف الضوئية لندن" : "LONDON EQUINIX LD4 FIBER SPEED",
      title: isAr
        ? "سرعة تنفيذ صفقات دون 1.2 ملي ثانية لخبراء السكالبينج والتداول الخوارزمي"
        : "Sub-1.2ms Execution Latency Engineered for High-Frequency FX Scalpers & EAs",
      subtitle: isAr
        ? "اتصال فايبر مباشر بمركز بيانات Equinix لندن لضمان انعدام الانزلاق السعري وإعادة التسعير"
        : "Direct optical cross-connects to global investment bank liquidity pools with zero re-quotes",
      description: isAr
        ? "تمتع بميزة السرعة التنافسية؛ خوادمنا موصولة مباشرة بأكبر مجمعات السيولة المصرفية العالمية في لندن، مما يمنحك سرعة استجابة مذهلة في فتح وإغلاق الصفقات، ودعماً كاملاً للسكالبينج والتداول الآلي."
        : "Gain the speed edge with co-located matching engines inside Equinix London LD4. Sub-millisecond execution minimizes slippage and delivers pure execution stability for high-volume traders.",
      image: PROMO_IMAGES.forexTraderDesk,
      altText: "Executive Forex Trader Station in London with Curved Ultrawide Monitors",
      metrics: [
        { value: "1.18ms", label: isAr ? "متوسط سرعة التنفيذ" : "Average Fill Speed" },
        { value: "0 Re-Quotes", label: isAr ? "انعدام إعادة التسعير" : "Zero Re-Quotes" },
        { value: "99.99%", label: isAr ? "جاهزية الخوادم السحابية" : "Server Uptime" },
        { value: "Direct ECN", label: isAr ? "اتصال مصرفي فوري" : "Direct Interbank" }
      ],
      perks: isAr
        ? [
            "دعم كامل للسكالبينج السريع والمستشارين الخبراء (EAs)",
            "انعدام إعادة التسعير تماماً بفضل محرك المطابقة الذكي",
            "عمق سوق كامل من المستوى الثاني L2 مع تدفق لحظي للأسعار"
          ]
        : [
            "Unrestricted scalping, hedging & automated expert advisors",
            "Zero re-quotes policy with smart liquidity aggregation",
            "Full Level-2 order book market depth with real-time ticks"
          ],
      primaryCta: isAr ? "بدء التداول السريع" : "Start Low-Latency Trading",
      primaryAction: onNavigateToTrading,
      secondaryCta: isAr ? "استعراض أزواج الفوركس" : "Browse FX Currency Pairs",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-sky-500/50",
      accentGlow: "from-sky-500/25 via-blue-500/10 to-transparent",
      icon: Zap
    },
    {
      id: "mobile_web_fx",
      badge: isAr ? "تطبيق تداول الفوركس الذكي" : "SMART MOBILE & WEB FX SUITE",
      title: isAr
        ? "تحكم كامل بصفقات العملات ومحفظتك من هاتفك الذكي وحاسوبك بأعلى درجات المرونة"
        : "Total Portfolio Control & Real-Time Forex Trading Across Mobile & Desktop",
      subtitle: isAr
        ? "منصة سحابية متطورة تتيح فتح وإدارة الصفقات دون الحاجة لتحميل برامج مع إدارة مخاطر ذكية"
        : "Zero-install web terminal with real-time candlestick charts, TP/SL brackets and instant deposit",
      description: isAr
        ? "راقب صفقاتك المفتوحة، تحركات أزواج العملات، وأرصدة محفظتك لحظة بلحظة. واجهة سريعة الاستجابة مصممة لتمنح المتداول تحكماً كاملاً بأوامر السوق والأوامر المعلقة من أي مكان في العالم."
        : "Experience frictionless currency trading with intuitive position management, live tick charts, and instant multi-channel account funding on any smartphone, tablet, or desktop browser.",
      image: PROMO_IMAGES.mobileForex,
      altText: "Executive Monitoring Real-Time Forex Trading on Smartphone in London Office",
      metrics: [
        { value: "Zero Install", label: isAr ? "يعمل مباشرة في المتصفح" : "Browser Native" },
        { value: "< 50ms", label: isAr ? "استجابة الواجهة الفورية" : "UI Latency" },
        { value: "80+ Pairs", label: isAr ? "أزواج عملات ومعادن" : "Forex & Metals" },
        { value: "Instant", label: isAr ? "إيداع وسحب فوري" : "Instant Cashier" }
      ],
      perks: isAr
        ? [
            "شارت تفاعلي لحظي للشموع اليابانية مع مؤشرات فنية دقيقة",
            "إيداع وسحب فوري متعدد القنوات (حوالة بنكية، USDT، بطاقات)",
            "حماية آلية متقدمة من الرصيد السلبي لجميع المتداولين"
          ]
        : [
            "Interactive candlestick charting with live technical indicators",
            "Instant multi-channel deposits and withdrawals (Wire, USDT)",
            "Automated negative balance protection on all accounts"
          ],
      primaryCta: isAr ? "دخول محطة التداول" : "Launch Trading Terminal",
      primaryAction: onNavigateToTrading,
      secondaryCta: isAr ? "استعراض الأسعار" : "Check Live Rates",
      secondaryAction: onScrollToMarkets,
      accentBorder: "border-amber-400/50",
      accentGlow: "from-amber-400/25 via-yellow-400/10 to-transparent",
      icon: Smartphone
    }
  ];

  // Auto-advance slideshow every 7.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % campaigns.length);
    }, 7500);
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
      {/* Subtle Heartbeat Ambient Glow behind Forex campaigns */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-r from-amber-500/12 via-yellow-500/8 to-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-faint-bg-pulse -z-10" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase mb-2">
            <span>PREMIER FOREX BROKERAGE ADVANTAGES</span>
            <span aria-hidden="true" className="text-amber-600">·</span>
            <span>FAST FX 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isAr ? "عروض وحملات شركة وساطة الفوركس الرائدة" : "Leading Forex Brokerage Campaigns & Offers"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-sans">
            {isAr
              ? "فروقات أسعار خام تبدأ من 0.0 نقطة، وحسابات إسلامية خالية تماماً من التبييت، وسيولة بنكية مباشرة من كبرى البنوك العالمية."
              : "Institutional raw spreads from 0.0 pips, 100% swap-free Islamic trading accounts, and direct Tier-1 bank execution."}
          </p>
        </div>

        {/* Campaign Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121622] rounded-xl border border-amber-500/20 self-start md:self-auto overflow-x-auto no-scrollbar max-w-full shadow-lg">
          {campaigns.map((camp, idx) => {
            const Icon = camp.icon;
            return (
              <button
                key={camp.id}
                onClick={() => setActiveSlide(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeSlide === idx
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeSlide === idx ? "text-slate-950" : "text-amber-400"}`} />
                <span className="hidden sm:inline">0{idx + 1}.</span>
                <span>{camp.badge.split("·")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Marquee Card with Golden Accents */}
      <div className={`relative rounded-3xl bg-[#0f131d] border ${current.accentBorder} overflow-hidden shadow-2xl transition-all duration-500`}>
        {/* Top Gold & Amber Highlight Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px]">
          {/* Left Column (Forex Ad Copy): 7 Cols */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10 space-y-6">
            <div className="space-y-4">
              {/* Category & Badge (Zero-Pill) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 tracking-wide">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <CurrentIcon className="w-4 h-4" />
                  {current.badge}
                </span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="text-slate-300">FAST FX INSTITUTIONAL</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="text-emerald-400 font-semibold">{isAr ? "عرض نشط الآن" : "ACTIVE OFFER"}</span>
              </div>

              {/* Main Headline */}
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug font-sans"
                style={{ textWrap: "balance" }}
              >
                {current.title}
              </h3>

              {/* Sub-headline in Warm Amber */}
              <p className="text-sm sm:text-base font-medium text-amber-300/90 leading-relaxed font-sans">
                {current.subtitle}
              </p>

              {/* Ad Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {current.description}
              </p>

              {/* Forex Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {current.perks.map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-200 bg-[#161c2b] border border-slate-800 p-2.5 rounded-xl shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Performance Metric Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 font-mono">
              {current.metrics.map((m, idx) => (
                <div key={idx} className="bg-[#141926] p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-lg sm:text-xl font-black text-amber-400 tabular-nums">{m.value}</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={current.primaryAction}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <span>{current.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={current.secondaryAction}
                className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-[#161c2a] border border-amber-500/30 hover:border-amber-400 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-2 font-sans"
              >
                <span>{current.secondaryCta}</span>
              </button>
            </div>
          </div>

          {/* Right Column (High-Resolution Professional Forex Image): 5 Cols */}
          <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full overflow-hidden bg-black flex items-center justify-center">
            {imageErrors[current.id] ? (
              <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#121622] via-[#090b10] to-[#121622] border-l border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
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

                {/* Scrim Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0f131d] via-[#0f131d]/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                {/* Floating Technology & Regulatory Stamp */}
                <div className="absolute bottom-4 right-4 left-4 lg:left-auto p-3 rounded-xl bg-[#0f131e]/90 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-amber-300">TIER-1 INTERBANK FOREX POOL</span>
                  </div>
                  <span className="text-slate-400 tabular-nums">0{activeSlide + 1} / 0{campaigns.length}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Carousel Pagination & Arrows */}
        <div className="p-4 bg-[#0a0d14] border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {campaigns.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === i ? "w-8 bg-amber-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + campaigns.length) % campaigns.length)}
              className="p-2 rounded-lg bg-[#161c2a] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              aria-label="Previous Campaign"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % campaigns.length)}
              className="p-2 rounded-lg bg-[#161c2a] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              aria-label="Next Campaign"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 High-Impact Forex Broker Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {/* Card 1: Gold & Spot Bullion */}
        <div className="rounded-2xl bg-[#0e121b] border border-amber-500/20 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-black">
            <img
              src={PROMO_IMAGES.goldBullion}
              alt="Fast FX Spot Gold Bullion Trading"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e121b] via-[#0e121b]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-amber-500/40 text-amber-400 text-[11px] font-mono font-bold">
              {isAr ? "سبائك الذهب الخالص" : "XAU/USD SPOT GOLD"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "تداول الذهب والسلع بفروقات خام" : "Raw Spread Gold Trading"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "فروقات أسعار فائقة الضيق لسبائك الذهب XAU/USD والفضة مع تنفيذ مباشر من كبرى أسواق لندن للسلع."
                : "Ultra-tight spreads on Gold & Silver with direct matching against London bullion markets."}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                0.0 PIPS SPREAD
              </span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "فتح حساب ذهب ←" : "Open Gold FX ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Islamic Swap-Free Account */}
        <div className="rounded-2xl bg-[#0e121b] border border-emerald-500/20 overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-black">
            <img
              src={PROMO_IMAGES.swapFreeIslamic}
              alt="Fast FX Sharia-Compliant Islamic Forex Trading"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e121b] via-[#0e121b]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-bold">
              {isAr ? "حساب إسلامي 100%" : "SWAP-FREE ISLAMIC"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "خالي من أي فوائد تبييت ربوية" : "Zero Interest Rollover"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "تداول العملات والذهب بثقة تامة وتوافق شرعي كامل مع الاحتفاظ بصفقاتك دون فوائد تبييت أو رسوم خفية."
                : "Certified Sharia-compliant forex trading. Hold overnight positions with zero swap charges."}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                0% ROLLEVER FEES
              </span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "تفعيل الحساب ←" : "Open Islamic ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Sub-1.2ms London Equinix Execution */}
        <div className="rounded-2xl bg-[#0e121b] border border-sky-500/20 overflow-hidden flex flex-col justify-between hover:border-sky-500/50 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-black">
            <img
              src={PROMO_IMAGES.forexTraderDesk}
              alt="Fast FX Equinix London Direct Forex Execution"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e121b] via-[#0e121b]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-sky-500/40 text-sky-400 text-[11px] font-mono font-bold">
              {isAr ? "سرعة فايبر 1.18ms" : "EQUINIX LD4 FIBER"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "تنفيذ فائق السرعة بدون وسيط" : "Direct ECN/STP Routing"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "خوادم فائقة التجاوب في Equinix لندن توفر سرعة استجابة دون 1.2 ملي ثانية مع انعدام إعادة التسعير."
                : "Ultra-low latency execution direct to tier-1 banks with zero re-quotes and pure market depth."}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-sky-400 font-bold">
                1.18ms EXECUTION
              </span>
              <button
                type="button"
                onClick={onNavigateToTrading}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "محطة التداول ←" : "Terminal ←"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Mobile & Multi-Device Control */}
        <div className="rounded-2xl bg-[#0e121b] border border-amber-400/20 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl group">
          <div className="relative h-44 overflow-hidden bg-black">
            <img
              src={PROMO_IMAGES.mobileForex}
              alt="Fast FX Mobile Forex App and Trading Suite"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e121b] via-[#0e121b]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold">
              {isAr ? "تطبيق ويب وهاتف" : "WEB & MOBILE FX"}
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm">
              {isAr ? "تداول من أي شاشة بضغطة زر" : "One-Click Mobile Trading"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isAr
                ? "تحكم كامل بصفقاتك ومحفظتك من هاتفك الذكي وحاسوبك مع إيداع وسحب فوري وأوامر جني الأرباح التلقائية."
                : "Full control on any smartphone or laptop. Dynamic stop-loss brackets and multi-channel cashier."}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                INSTANT CASHIER
              </span>
              <button
                type="button"
                onClick={onNavigateToTrading}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "دخول المنصة ←" : "Launch App ←"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
