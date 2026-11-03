export type Language = "ar" | "en";

export interface Translations {
  // Global & Meta
  pageTitle: string;
  pageDescription: string;

  // Header & Nav
  comingSoon: string;
  waitlistBtn: string;
  langAr: string;
  langEn: string;
  navHome: string;
  navTrading: string;
  navPortfolio: string;
  navAdmin: string;
  navBuyCrypto: string;
  navMarkets: string;
  navTrade: string;
  navFutures: string;
  navGrow: string;
  navWeb3: string;
  searchPlaceholder: string;
  depositBtn: string;
  tradeAction: string;
  marketHot: string;
  marketGainers: string;
  marketForex: string;
  marketCrypto: string;
  marketNew: string;
  marketVolume: string;
  fundingRateLabel: string;
  orderTypeLimit: string;
  orderTypeMarket: string;
  orderTypeStop: string;
  recentTradesTab: string;
  depthTab: string;
  time: string;
  price: string;
  amount: string;
  proofOfReservesTitle: string;
  proofOfReservesDesc: string;
  ultraFastMatchingTitle: string;
  ultraFastMatchingDesc: string;
  sqlSecurityTitle: string;
  sqlSecurityDesc: string;
  loginBtn: string;
  registerBtn: string;
  logoutBtn: string;
  adminBadge: string;
  traderBadge: string;
  balanceLabel: string;
  equityLabel: string;
  marginLabel: string;
  freeMarginLabel: string;

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
  countdownBadge: string;
  countdownEndDateLabel: string;
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

  // Trading Terminal
  terminalTitle: string;
  terminalSub: string;
  buyLong: string;
  sellShort: string;
  orderVolume: string;
  leverage: string;
  stopLoss: string;
  takeProfit: string;
  executeOrder: string;
  openPositions: string;
  closedTrades: string;
  closePosition: string;
  symbol: string;
  type: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  status: string;
  actions: string;
  orderBookTitle: string;
  bidsLabel: string;
  asksLabel: string;
  spreadLabel: string;
  depthLabel: string;
  timeframe1m: string;
  timeframe5m: string;
  timeframe15m: string;
  timeframe1h: string;
  timeframe1d: string;
  noOpenPositions: string;
  noTradesHistory: string;

  // Admin Dashboard
  adminTitle: string;
  adminSubtitle: string;
  adminRestrictedNotice: string;
  adminAccessDenied: string;
  adminSwitchToAdmin: string;
  tabUsers: string;
  tabSupervision: string;
  tabSqlConsole: string;
  tabSubscribers: string;
  tabRiskControls: string;
  metricTotalUsers: string;
  metricPlatformVolume: string;
  metricOpenPositions: string;
  metricTotalEquity: string;
  metricWaitlistLeads: string;
  sqlQueryPlaceholder: string;
  runSqlBtn: string;
  exportSqlBtn: string;
  resetDbBtn: string;
  sqlTerminalTitle: string;
  schemaViewerTitle: string;
  recentQueriesPreset: string;

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
    navHome: "الرئيسية",
    navTrading: "منصة التداول المباشرة",
    navPortfolio: "المحفظة والسجل",
    navAdmin: "لوحة تحكم الإدارة",
    navBuyCrypto: "شراء العملات",
    navMarkets: "الأسواق",
    navTrade: "التداول",
    navFutures: "العقود الآجلة",
    navGrow: "الأرباح",
    navWeb3: "محفظة Web3",
    searchPlaceholder: "ابحث عن أصل، زوج أو عقد...",
    depositBtn: "إيداع سريع",
    tradeAction: "تداول",
    marketHot: "الأكثر رواجاً",
    marketGainers: "الأعلى صعوداً",
    marketForex: "الفوركس والذهب",
    marketCrypto: "العملات المشفرة",
    marketNew: "إدراجات جديدة",
    marketVolume: "حجم التداول 24س",
    fundingRateLabel: "معدل التمويل / العد",
    orderTypeLimit: "أمر محدد (Limit)",
    orderTypeMarket: "سعر السوق (Market)",
    orderTypeStop: "أمر وقف (Stop)",
    recentTradesTab: "الصفقات المباشرة",
    depthTab: "دفتر الأوامر",
    time: "الوقت",
    price: "السعر",
    amount: "الكمية",
    proofOfReservesTitle: "إثبات احتياطيات 1:1 بنسبة 100%",
    proofOfReservesDesc: "أصول مفحوصة ومؤكدة بنسبة 100% بتقنية Merkle-tree وسجلات SQL العلاقية. كل دولار وأصل مدعوم بالكامل 1:1 بحفظ آمن منفصل.",
    ultraFastMatchingTitle: "محرك مطابقة فائق السرعة",
    ultraFastMatchingDesc: "تنفيذ فائق السرعة عبر شبكة الألياف الضوئية في Equinix LD4 بزمن استجابة يقل عن 0.003ms وبلا أي انزلاق سعري.",
    sqlSecurityTitle: "أمان وتدقيق SQL العلاقية",
    sqlSecurityDesc: "سجل علاقي مدقق بمعايير ACID، وتحقق لحظي من سلامة الأرصدة، ورقابة إدارية فورية.",
    loginBtn: "تسجيل الدخول",
    registerBtn: "فتح حساب",
    logoutBtn: "تسجيل الخروج",
    adminBadge: "مدير النظام (Super Admin)",
    traderBadge: "متداول معتمد",
    balanceLabel: "الرصيد المتاح",
    equityLabel: "حقوق الملكية",
    marginLabel: "الهامش المستخدم",
    freeMarginLabel: "الهامش الحر",

    kicker: "أحدث تكنولوجيا في الأسواق العالمية",
    heroLine1: "سرعة فائقة.",
    heroLine2: "دقة متناهية.",
    heroLine3: "تداول بلا حدود.",

    narrativeP1: "في عالم يتحرك بأجزاء من الثانية، نحن لا نواكب المستقبل فحسب، بل نصنعه.",
    narrativeP2: {
      before: "منصة ",
      brand: "Fast Fx",
      after:
        " ليست مجرد بوابة تقليدية للأسواق المالية؛ إنها بوابتك الذكية المجهزة بأحدث تقنيات المعالجة اللحظية، لتصل بك إلى الأسواق العالمية بقوة تكنولوجية لا مثيل لها.",
    },
    narrativeP3:
      "لقد صممنا بيئة التداول الخاصة بنا لتمنحك الأفضلية المطلقة على الدوام: تنفيذ صفقات فائق السرعة يتم في أجزاء من الملي ثانية، تحليلات متطورة ترسم لك خارطة الفرص المتاحة، وواجهة تداول سلسة ومرنة تلائم طموحك الاستثماري وتطلعاتك.",
    narrativeP4:
      "سواء كنت تتداول في العملات الأجنبية (Forex)، الأسهم، المؤشرات، أو السلع الاستراتيجية، استعد لتجربة تداول استثنائية تعيد بالكامل تعريف مفهوم الكفاءة، السرعة، والسيطرة الكاملة على محفظتك المالية.",
    narrativeP5:
      "الرحلة تبدأ قريباً. انضم إلينا وكن جزءاً من النخبة التي تتداول بذكاء وسرعة البرق.",

    countdownTitle: "العد التنازلي للإنطلاق الرسمي:",
    countdownBadge: "15 يوماً متبقية",
    countdownEndDateLabel: "تاريخ الإنطلاق المستهدف:",
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

    // Trading Terminal
    terminalTitle: "منصة التداول الحي المتقدمة",
    terminalSub: "محرك مطابقة بأجزاء من الملي ثانية متصل بمزودي السيولة المباشرين (Tier-1 Liquidity)",
    buyLong: "شراء (BUY)",
    sellShort: "بيع (SELL)",
    orderVolume: "حجم الصفقة (Lots)",
    leverage: "الرافعة المالية",
    stopLoss: "وقف الخسارة (SL)",
    takeProfit: "جني الأرباح (TP)",
    executeOrder: "تنفيذ أمر السوق فوراً في قاعدة البيانات SQL",
    openPositions: "الصفقات المفتوحة اللحظية",
    closedTrades: "سجل الصفقات المكتملة",
    closePosition: "إغلاق فوري",
    symbol: "الأداة المالية",
    type: "النوع",
    entryPrice: "سعر الدخول",
    currentPrice: "السعر الحالي",
    pnl: "الربح/الخسارة اللحظية",
    status: "الحالة",
    actions: "الإجراء",
    orderBookTitle: "دفتر الأوامر اللحظي (Order Book)",
    bidsLabel: "طلبات الشراء (Bids)",
    asksLabel: "عروض البيع (Asks)",
    spreadLabel: "الفارق السعري (Spread)",
    depthLabel: "عمق السيولة",
    timeframe1m: "1د",
    timeframe5m: "5د",
    timeframe15m: "15د",
    timeframe1h: "1س",
    timeframe1d: "1ي",
    noOpenPositions: "لا توجد صفقات مفتوحة حالياً. يمكنك فتح صفقة جديدة من لوحة التنفيذ.",
    noTradesHistory: "لا توجد صفقات مسجلة بعد في قاعدة بيانات SQL.",

    // Admin Dashboard
    adminTitle: "لوحة التحكم والرقابة الإدارية",
    adminSubtitle: "بوابة التحكم الفوري المخصصة حصرياً لمدير النظام مع وحدة استعلامات SQL حية",
    adminRestrictedNotice: "منطقة أمان مشددة: الوصول مصرح به فقط لمدير النظام المصرح له.",
    adminAccessDenied: "وصول محظور - غير مصرح لك بدخول لوحة الإدارة",
    adminSwitchToAdmin: "تسجيل الدخول بحساب المدير (admin)",
    tabUsers: "إدارة المتداولين",
    tabSupervision: "مراقبة الصفقات اللحظية",
    tabSqlConsole: "قاعدة بيانات SQL ولوحة الاستعلامات",
    tabSubscribers: "مشتركو العد التنازلي",
    tabRiskControls: "التحكم في المخاطر والسيولة",
    metricTotalUsers: "إجمالي حسابات المستخدمين",
    metricPlatformVolume: "حجم التداول التراكمي",
    metricOpenPositions: "الصفقات المفتوحة النشطة",
    metricTotalEquity: "إجمالي رأس المال بالمنصة",
    metricWaitlistLeads: "مشتركو قائمة الإطلاق (15 يوم)",
    sqlQueryPlaceholder: "اكتب أمر SQL مباشرة (مثال: SELECT * FROM users; أو UPDATE users SET balance = 500000;)",
    runSqlBtn: "تنفيذ الاستعلام الآن (Run SQL)",
    exportSqlBtn: "تصدير نسخة احتياطية (.sql)",
    resetDbBtn: "إعادة ضبط قاعدة البيانات",
    sqlTerminalTitle: "طرفية تنفيذ استعلامات SQL الحية (Interactive SQL Console)",
    schemaViewerTitle: "مخطط الجداول العلاقية (Relational Schema)",
    recentQueriesPreset: "استعلامات سريعة جاهزة:",

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
    navHome: "Home",
    navTrading: "Live Terminal",
    navPortfolio: "Portfolio & Ledger",
    navAdmin: "Admin Portal",
    navBuyCrypto: "Buy Crypto",
    navMarkets: "Markets",
    navTrade: "Trade",
    navFutures: "Futures",
    navGrow: "Earn",
    navWeb3: "Web3",
    searchPlaceholder: "Search coin, pair or contract...",
    depositBtn: "Deposit",
    tradeAction: "Trade",
    marketHot: "Hot",
    marketGainers: "Top Gainers",
    marketForex: "Forex & Gold",
    marketCrypto: "Crypto",
    marketNew: "New Listings",
    marketVolume: "24h Volume",
    fundingRateLabel: "Funding / Countdown",
    orderTypeLimit: "Limit",
    orderTypeMarket: "Market",
    orderTypeStop: "Stop / Trigger",
    recentTradesTab: "Recent Trades",
    depthTab: "Order Book",
    time: "Time",
    price: "Price",
    amount: "Amount",
    proofOfReservesTitle: "100% Proof of Reserves",
    proofOfReservesDesc: "Merkle-tree verified on-chain and in SQL transactional ledgers. Every client dollar and coin is 100% backed in 1:1 segregated custody.",
    ultraFastMatchingTitle: "Sub-millisecond Execution Core",
    ultraFastMatchingDesc: "Equinix LD4 ultra-low latency optical execution under 0.003ms with zero slippage.",
    sqlSecurityTitle: "Relational SQL Audit Security",
    sqlSecurityDesc: "Live relational ledger with ACID transactions, real-time balance integrity checks, and instant administrative oversight.",
    loginBtn: "Sign In",
    registerBtn: "Sign Up",
    logoutBtn: "Sign Out",
    adminBadge: "Super Admin",
    traderBadge: "Verified Trader",
    balanceLabel: "Available Balance",
    equityLabel: "Total Equity",
    marginLabel: "Used Margin",
    freeMarginLabel: "Free Margin",

    kicker: "Next-Gen Institutional Liquidity & Execution",
    heroLine1: "Ultra-Fast Speed.",
    heroLine2: "Pinpoint Precision.",
    heroLine3: "Boundless Trading.",

    narrativeP1: "In a financial world moving in microseconds, we do not merely follow the future — we forge it.",
    narrativeP2: {
      before: "",
      brand: "Fast Fx",
      after:
        " is not merely a trading venue; it is an ultra-low latency gateway engineered to connect institutional and ambitious retail traders directly to global interbank liquidity.",
    },
    narrativeP3:
      "Our infrastructure is tailored for undisputed edge: sub-millisecond execution, institutional depth, advanced quantitative charting, and a distraction-free trading workstation.",
    narrativeP4:
      "Whether your strategy spans Forex pairs, Global Indices, Crypto assets, or Commodities — welcome to execution re-imagined.",
    narrativeP5:
      "Launch is approaching. Join the waitlist or test our matching engine live right now.",

    countdownTitle: "Official Launch Countdown:",
    countdownBadge: "15 Days Remaining",
    countdownEndDateLabel: "Target Launch Date:",
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs",

    formTitle: "Reserve Institutional Early Access",
    formDesc:
      "Register today for VIP early access prior to global launch and enjoy 0% trading commissions for your inaugural 30 days.",
    emailPlaceholder: "Enter your corporate or personal email",
    submitButton: "Request Early Access",
    errorEmpty: "Please enter an email address",
    errorInvalid: "Please enter a valid email address",
    errorDuplicate: "This email is already registered on our VIP list!",
    successTitle: "Access Invitation Reserved!",
    successDesc: {
      before: "Thank you for selecting ",
      brand: "Fast Fx",
      after:
        ". Your credentials have been added to our priority institutional rollout queue. Onboarding codes will dispatch shortly.",
    },
    registerAnother: "Register Another Email",

    simulatorHeader: "MATCHING ENGINE SPEED SIMULATOR",
    realtimeBadge: "REAL-TIME",
    selectPairLabel: "Select Instrument to Test Latency:",
    marketPriceLabel: "Live Market Feed",
    expectedLatencyLabel: "Target Execution Delay",
    chartIndicatorLabel: "Simulated Data Flow",
    instantExecLabel: "Instant Fill",
    buyAction: "BUY (Long)",
    sellAction: "SELL (Short)",
    connectingEngine: "Routing order packet to matching core...",
    actualLatencyLabel: "Measured Round-Trip Latency",
    subsecondLabel: "(fraction of second)",
    entryPriceLabel: "Fill Price:",
    orderTypeLabel: "Order Type:",
    buyOrderType: "Market BUY",
    sellOrderType: "Market SELL",
    simResultLabel: "Simulated Result:",
    calculatingResult: "Computing live tick variance...",
    recentTradesTitle: "Recent Simulated Fills:",
    latencyPrefix: "Latency:",

    badge1Title: "Global Financial Standard",
    badge1Desc: "Institutional Grade Segregated Custody",
    badge2Title: "Equinix LD4 / NY4 Cross-Connect",
    badge2Desc: "Ultra-low latency fiber backbone",

    coreAdvantagesKicker: "CORE ADVANTAGES",
    whyUsTitle: "Why Fast Fx Stands Above?",
    whyUsSubtitle:
      "Where high-frequency computing meets intuitive execution, delivering an uncompromising environment for discerning market operators.",
    pillar1Kicker: "EXECUTION SPEED",
    pillar1Value: "0.003ms",
    pillar1Unit: "/fill",
    pillar1Title: "Optical Cross-Connect Core",
    pillar1Desc:
      "Direct dark fiber routing to Tier-1 liquidity centers eliminates slippage and ensures algorithmic orders fill at your requested price.",
    pillar2Kicker: "RAW SPREADS",
    pillar2Value: "0.0 Pips",
    pillar2Title: "Tier-1 Deep Liquidity",
    pillar2Desc:
      "Institutional order books with zero markup on majors and multi-million dollar single-ticket capacity without market distortion.",
    pillar3Kicker: "MILITARY-GRADE SECURITY",
    pillar3Value: "SSL+ 256",
    pillar3Title: "Fortified Asset Protection",
    pillar3Desc:
      "End-to-end cryptographic shielding, cold-storage segregation, and automated risk circuit breakers protect every dollar.",

    // Trading Terminal
    terminalTitle: "Fast FX Live Trading Terminal",
    terminalSub: "Sub-millisecond institutional matching engine connected directly to Tier-1 liquidity providers",
    buyLong: "BUY (Long)",
    sellShort: "SELL (Short)",
    orderVolume: "Volume (Lots)",
    leverage: "Leverage",
    stopLoss: "Stop Loss (SL)",
    takeProfit: "Take Profit (TP)",
    executeOrder: "Execute Instant Order into SQL Database",
    openPositions: "Live Open Positions",
    closedTrades: "Historical Trades Log",
    closePosition: "Close Position",
    symbol: "Symbol",
    type: "Type",
    entryPrice: "Entry Price",
    currentPrice: "Current Price",
    pnl: "Floating PnL",
    status: "Status",
    actions: "Action",
    orderBookTitle: "Live Order Book & Market Depth",
    bidsLabel: "Bids (Buy Orders)",
    asksLabel: "Asks (Sell Orders)",
    spreadLabel: "Spread",
    depthLabel: "Market Depth",
    timeframe1m: "1M",
    timeframe5m: "5M",
    timeframe15m: "15M",
    timeframe1h: "1H",
    timeframe1d: "1D",
    noOpenPositions: "No active open positions. Submit an order from the execution ticket above.",
    noTradesHistory: "No completed trades logged yet in the SQL database.",

    // Admin Dashboard
    adminTitle: "Fast FX Administrative Center",
    adminSubtitle: "Exclusively restricted to Administrator with live SQL console",
    adminRestrictedNotice: "Secured Area: Authorized access granted strictly to verified Administrator.",
    adminAccessDenied: "Access Forbidden - Administrator Clearance Required",
    adminSwitchToAdmin: "Sign In to Administrator Account",
    tabUsers: "User Accounts",
    tabSupervision: "Trade Supervision",
    tabSqlConsole: "SQL Database Console",
    tabSubscribers: "Launch Waitlist",
    tabRiskControls: "Risk & Engine Controls",
    metricTotalUsers: "Registered Accounts",
    metricPlatformVolume: "Cumulative Volume",
    metricOpenPositions: "Active Floating Positions",
    metricTotalEquity: "Total Platform Equity",
    metricWaitlistLeads: "15-Day Launch Leads",
    sqlQueryPlaceholder: "Enter SQL query (e.g. SELECT * FROM users; or UPDATE users SET balance = 500000;)",
    runSqlBtn: "Run SQL Query",
    exportSqlBtn: "Export SQL Backup (.sql)",
    resetDbBtn: "Reset DB Seed",
    sqlTerminalTitle: "Interactive SQL Execution Console",
    schemaViewerTitle: "Relational Schema Catalog",
    recentQueriesPreset: "Quick Preset Queries:",

    showSubscribersBtn: "Show Local Waitlist Leads",
    hideSubscribersBtn: "Hide Local Waitlist Leads",
    totalSubscribersLabel: "Total Registered:",
    clearAllSubscribersBtn: "Clear All",

    footerDescription:
      "Institutional-grade digital trading venue delivering sub-millisecond execution and raw spreads. Powered by Fast Flow Group LTD.",
    globalInfraTitle: "Global Infrastructure",
    globalInfraSubtitle: "Interconnected with top global liquidity providers",
    headquartersLabel: "HEADQUARTERS",
    headquartersCity: "LONDON, UK",
    riskWarningText:
      "High Risk Warning: Trading Forex and CFDs involves substantial risk of loss and is not suitable for all investors. Ensure you fully comprehend the mechanics before deploying capital.",
    regulatoryText:
      "All services and client relationships subject to operational terms governed under parent entity license.",
    copyrightText: "Fast Fx. All rights reserved by Fast Flow Group LTD.",
  },
};
