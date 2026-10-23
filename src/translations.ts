export type Language = "ar" | "en";

export interface Translations {
  // Global & Meta
  pageTitle: string;
  pageDescription: string;

  // Header
  comingSoon: string;
  waitlistBtn: string;
  langAr: string;
  langEn: string;

  // Hero Section
  kicker: string;
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  narrativeP1: string;
  narrativeP2: {
    before: string;
    brand: string;
    after: string;
  };
  narrativeP3: string;
  narrativeP4: string;
  narrativeP5: string;

  // Countdown
  countdownTitle: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;

  // Waitlist Form
  formTitle: string;
  formDesc: string;
  emailPlaceholder: string;
  submitButton: string;
  errorEmpty: string;
  errorInvalid: string;
  errorDuplicate: string;
  successTitle: string;
  successDesc: {
    before: string;
    brand: string;
    after: string;
  };
  registerAnother: string;

  // Trading Speed Simulator
  simulatorHeader: string;
  realtimeBadge: string;
  selectPairLabel: string;
  marketPriceLabel: string;
  expectedLatencyLabel: string;
  chartIndicatorLabel: string;
  instantExecLabel: string;
  buyAction: string;
  sellAction: string;
  connectingEngine: string;
  actualLatencyLabel: string;
  subsecondLabel: string;
  entryPriceLabel: string;
  orderTypeLabel: string;
  buyOrderType: string;
  sellOrderType: string;
  simResultLabel: string;
  calculatingResult: string;
  recentTradesTitle: string;
  latencyPrefix: string;

  // Trust Badges
  badge1Title: string;
  badge1Desc: string;
  badge2Title: string;
  badge2Desc: string;

  // Core Advantages
  coreAdvantagesKicker: string;
  whyUsTitle: string;
  whyUsSubtitle: string;
  pillar1Kicker: string;
  pillar1Value: string;
  pillar1Unit: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Kicker: string;
  pillar2Value: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Kicker: string;
  pillar3Value: string;
  pillar3Title: string;
  pillar3Desc: string;

  // Private Subscriber Viewer
  showSubscribersBtn: string;
  hideSubscribersBtn: string;
  totalSubscribersLabel: string;
  clearAllSubscribersBtn: string;

  // Footer
  footerDescription: string;
  globalInfraTitle: string;
  globalInfraSubtitle: string;
  headquartersLabel: string;
  headquartersCity: string;
  riskWarningText: string;
  regulatoryText: string;
  copyrightText: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    pageTitle: "Fast Fx | المنصة المؤسسية للتداول فائق السرعة",
    pageDescription: "منصة تداول متطورة - قريباً من مجموعة Fast Flow Group LTD",

    comingSoon: "قريباً جداً",
    waitlistBtn: "قائمة الانتظار",
    langAr: "العربية",
    langEn: "English",

    kicker: "أحدث تكنولوجيا في الأسواق العالمية",
    heroLine1: "سرعة فائقة.",
    heroLine2: "دقة متناهية.",
    heroLine3: "تداول بلا حدود.",

    narrativeP1: "في عالم يتحرك بأجزاء من الثانية، نحن لا نواكب المستقبل فحسب، بل نصنعه.",
    narrativeP2: {
      before: "منصة ",
      brand: "Fast Fx",
      after: " ليست مجرد بوابة تقليدية للأسواق المالية؛ إنها بوابتك الذكية المجهزة بأحدث تقنيات المعالجة اللحظية، لتصل بك إلى الأسواق العالمية بقوة تكنولوجية لا مثيل لها.",
    },
    narrativeP3:
      "لقد صممنا بيئة التداول الخاصة بنا لتمنحك الأفضلية المطلقة على الدوام: تنفيذ صفقات فائق السرعة يتم في أجزاء من الملي ثانية، تحليلات متطورة ترسم لك خارطة الفرص المتاحة، وواجهة تداول سلسة ومرنة تلائم طموحك الاستثماري وتطلعاتك.",
    narrativeP4:
      "سواء كنت تتداول في العملات الأجنبية (Forex)، الأسهم، المؤشرات، أو السلع الاستراتيجية، استعد لتجربة تداول استثنائية تعيد بالكامل تعريف مفهوم الكفاءة، السرعة، والسيطرة الكاملة على محفظتك المالية.",
    narrativeP5:
      "الرحلة تبدأ قريباً. انضم إلينا وكن جزءاً من النخبة التي تتداول بذكاء وسرعة البرق.",

    countdownTitle: "العد التنازلي للإنطلاق الرسمي:",
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",

    formTitle: "كن من أوائل المستثمرين المنضمين",
    formDesc:
      "سجل اهتمامك الآن لتلقي دعوة حصرية لتجربة المنصة قبل الإطلاق الرسمي والاستفادة من رسوم تداول تبلغ 0% للشهر الأول.",
    emailPlaceholder: "أدخل بريدك الإلكتروني هنا",
    submitButton: "سجل اهتمامك الآن",
    errorEmpty: "الرجاء إدخال البريد الإلكتروني",
    errorInvalid: "الرجاء إدخال بريد إلكتروني صالح",
    errorDuplicate: "هذا البريد الإلكتروني مسجل بالفعل لدينا!",
    successTitle: "تم تسجيل اهتمامك بنجاح!",
    successDesc: {
      before: "شكراً لاهتمامك بـ ",
      brand: "Fast Fx",
      after:
        ". لقد أضفنا بريدك الإلكتروني إلى قائمة المدعوين الأوائل الحصريين. سنرسل لك رمز تفعيل الحساب فور بدء المرحلة التجريبية المغلقة.",
    },
    registerAnother: "تسجيل بريد إلكتروني آخر",

    simulatorHeader: "MATCHING ENGINE SPEED SIMULATOR",
    realtimeBadge: "REAL-TIME",
    selectPairLabel: "اختر الأداة المالية لتجربة سرعة المنصة:",
    marketPriceLabel: "سعر السوق المباشر",
    expectedLatencyLabel: "معدل التأخير المتوقع",
    chartIndicatorLabel: "مؤشر تدفق البيانات التجريبي",
    instantExecLabel: "تنفيذ سريع",
    buyAction: "شراء (BUY)",
    sellAction: "بيع (SELL)",
    connectingEngine: "يرتبط الآن مع محرك المطابقة فائق السرعة...",
    actualLatencyLabel: "سرعة الاستجابة الفعلية",
    subsecondLabel: "(جزء من الثانية)",
    entryPriceLabel: "سعر الدخول:",
    orderTypeLabel: "نوع العملية:",
    buyOrderType: "شراء مالي (BUY)",
    sellOrderType: "بيع على المكشوف (SELL)",
    simResultLabel: "النتيجة التجريبية:",
    calculatingResult: "جاري الاحتساب اللحظي...",
    recentTradesTitle: "آخر صفقاتك التجريبية:",
    latencyPrefix: "التأخير:",

    badge1Title: "ترخيص دولي معتمد",
    badge1Desc: "تداول ببيئة آمنة ومنظمة بالكامل",
    badge2Title: "سيرفرات فائقة القرب",
    badge2Desc: "في لندن وميونيخ لضمان سرعة فائقة",

    coreAdvantagesKicker: "CORE ADVANTAGES",
    whyUsTitle: "لماذا منصة Fast Fx هي خيارك القادم؟",
    whyUsSubtitle:
      "تكامل فريد بين قوة البنية التحتية البرمجية وسهولة الواجهة لتقديم أفضل بيئة استثمارية للمتداول العربي والعالمي.",
    pillar1Kicker: "سرعة التنفيذ",
    pillar1Value: "0.003ms",
    pillar1Unit: "/صفقة",
    pillar1Title: "بنية تحتية برمجية متطورة",
    pillar1Desc:
      "نقوم بتوجيه صفقاتك مباشرة عبر شبكة ألياف ضوئية فائقة السرعة ومتصلة بأكبر مزودي السيولة العالميين لضمان التنفيذ الفوري وبدون أي انزلاق سعري.",
    pillar2Kicker: "فروقات الأسعار",
    pillar2Value: "0.0 Pips",
    pillar2Title: "سيولة مؤسسية عميقة",
    pillar2Desc:
      "استفد من سبريد (Spread) يبدأ من 0.0 نقطة على العملات الرئيسية، وسيولة عميقة تضمن لك بيع وشراء كميات تداول ضخمة بسلاسة تامة ومثالية.",
    pillar3Kicker: "الأمان المتكامل",
    pillar3Value: "SSL+ 256",
    pillar3Title: "حماية عسكرية لأصولك",
    pillar3Desc:
      "حماية أصولك هي أولويتنا القصوى. نستخدم بروتوكولات حماية متطورة وتشفير عالي المستوى، بالإضافة إلى فصل كامل لحسابات العملاء في بنوك عالمية رائدة.",

    showSubscribersBtn: "إظهار قائمة المشتركين التجريبية (مخزن محلياً)",
    hideSubscribersBtn: "إخفاء قائمة المشتركين التجريبية",
    totalSubscribersLabel: "إجمالي المسجلين:",
    clearAllSubscribersBtn: "حذف الكل",

    footerDescription:
      "منصة تداول متطورة تقدم أقصى درجات السرعة والكفاءة في تنفيذ الصفقات بالأسواق المالية العالمية برعاية مجموعة Fast Flow Group LTD.",
    globalInfraTitle: "البنية التحتية العالمية",
    globalInfraSubtitle: "اتصال فوري ومباشر مع كبرى مراكز التداول",
    headquartersLabel: "HEADQUARTERS",
    headquartersCity: "LONDON",
    riskWarningText:
      "تحذير المخاطر: إن تداول العملات الأجنبية (الفوركس) وعقود الفروقات (CFDs) ينطوي على مخاطر عالية وخسائر قد تفوق رأسمالك المستثمر. تأكد تماماً من فهمك للمخاطر المرتبطة وتلقي التدريب الكافي قبل البدء.",
    regulatoryText:
      "تخضع جميع العمليات والخدمات للشروط والتعليمات التنظيمية بموجب ترخيص الشركة الأم.",
    copyrightText: "Fast Fx. جميع الحقوق محفوظة لمجموعة Fast Flow Group LTD.",
  },

  en: {
    pageTitle: "Fast Fx | Institutional Ultra-Fast Trading Platform",
    pageDescription: "Cutting-Edge Institutional Trading Platform - Powered by Fast Flow Group LTD",

    comingSoon: "COMING SOON",
    waitlistBtn: "Join Waitlist",
    langAr: "العربية",
    langEn: "English",

    kicker: "Next-Gen Institutional Liquidity & Execution",
    heroLine1: "Ultra-Fast Speed.",
    heroLine2: "Pinpoint Precision.",
    heroLine3: "Boundless Trading.",

    narrativeP1: "In a financial world moving in microseconds, we do not merely follow the future — we forge it.",
    narrativeP2: {
      before: "The ",
      brand: "Fast Fx",
      after:
        " platform is not just another conventional brokerage portal. It is your intelligent gateway powered by real-time matching technology, connecting you to global liquidity venues with unprecedented technological execution.",
    },
    narrativeP3:
      "We engineered our trading infrastructure to give you an absolute competitive edge: sub-millisecond execution, advanced order flow analytics, and a frictionless interface tailored to institutional ambitions.",
    narrativeP4:
      "Whether you trade Foreign Exchange (FX), Equities, Indices, or Commodities, prepare for an unparalleled experience that redefines market efficiency, latency, and capital control.",
    narrativeP5:
      "The launch begins soon. Join the vanguard of institutional traders executing at lightning speed.",

    countdownTitle: "Official Launch Countdown:",
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs",

    formTitle: "Be Among the First Institutional Investors",
    formDesc:
      "Register your interest today to receive an exclusive early access invitation prior to public release, plus 0% trading commission for your first month.",
    emailPlaceholder: "Enter your corporate or personal email",
    submitButton: "Register Interest",
    errorEmpty: "Please enter your email address",
    errorInvalid: "Please enter a valid email address",
    errorDuplicate: "This email is already registered on our waitlist!",
    successTitle: "Registration Successful!",
    successDesc: {
      before: "Thank you for choosing ",
      brand: "Fast Fx",
      after:
        ". Your email has been added to our private alpha waitlist. An invitation and account activation key will be dispatched upon sandbox release.",
    },
    registerAnother: "Register another email",

    simulatorHeader: "MATCHING ENGINE SPEED SIMULATOR",
    realtimeBadge: "REAL-TIME",
    selectPairLabel: "Select an asset to test matching engine latency:",
    marketPriceLabel: "Live Market Price",
    expectedLatencyLabel: "Expected Latency",
    chartIndicatorLabel: "Simulated Data Feed Stream",
    instantExecLabel: "Instant Fill",
    buyAction: "BUY (Long)",
    sellAction: "SELL (Short)",
    connectingEngine: "Connecting to ultra-fast matching engine...",
    actualLatencyLabel: "Actual Engine Latency",
    subsecondLabel: "(sub-millisecond)",
    entryPriceLabel: "Entry Price:",
    orderTypeLabel: "Order Type:",
    buyOrderType: "BUY (Long)",
    sellOrderType: "SELL (Short)",
    simResultLabel: "Simulated P&L:",
    calculatingResult: "Calculating tick outcome...",
    recentTradesTitle: "Recent Simulated Fills:",
    latencyPrefix: "Latency:",

    badge1Title: "Global Tier-1 License",
    badge1Desc: "Fully segregated & compliant institutional custody",
    badge2Title: "Ultra-Low Latency Co-location",
    badge2Desc: "Equinix LD4 London & Frankfurt datacenters",

    coreAdvantagesKicker: "CORE ADVANTAGES",
    whyUsTitle: "Why Fast Fx is Your Next Trading Destination",
    whyUsSubtitle:
      "A seamless synthesis of institutional hardware architecture and intuitive user experience built for discerning global traders.",
    pillar1Kicker: "EXECUTION LATENCY",
    pillar1Value: "0.003ms",
    pillar1Unit: "/fill",
    pillar1Title: "Fiber-Optic Matching Engine",
    pillar1Desc:
      "Direct order routing through sub-millisecond optical fiber links paired directly with Tier-1 liquidity providers to eliminate slippage and latency.",
    pillar2Kicker: "RAW SPREADS",
    pillar2Value: "0.0 Pips",
    pillar2Title: "Deep Institutional Liquidity",
    pillar2Desc:
      "Benefit from razor-thin spreads starting from 0.0 pips on major FX pairs, backed by aggregate depth of book to fill high-volume tickets smoothly.",
    pillar3Kicker: "SECURE ARCHITECTURE",
    pillar3Value: "SSL+ 256",
    pillar3Title: "Military-Grade Asset Protection",
    pillar3Desc:
      "Asset safety is our cardinal principle: Tier-1 segregated client bank accounts, multi-sig cold storage, and end-to-end 256-bit encryption protocols.",

    showSubscribersBtn: "Show Local Waitlist Audit (Stored in Browser)",
    hideSubscribersBtn: "Hide Local Waitlist Audit",
    totalSubscribersLabel: "Total Registered:",
    clearAllSubscribersBtn: "Clear All",

    footerDescription:
      "Next-generation institutional trading venue delivering ultra-low latency execution across global capital markets, sponsored by Fast Flow Group LTD.",
    globalInfraTitle: "Global Infrastructure",
    globalInfraSubtitle: "Direct low-latency cross-connects with top tier liquidity hubs",
    headquartersLabel: "HEADQUARTERS",
    headquartersCity: "LONDON",
    riskWarningText:
      "Risk Warning: Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) involves high risk of capital loss. Ensure you fully comprehend the risks involved and obtain independent advice if necessary.",
    regulatoryText:
      "All financial services and operations are subject to regulatory terms and authorization under the parent company.",
    copyrightText: "Fast Fx. All rights reserved. Fast Flow Group LTD.",
  },
};
