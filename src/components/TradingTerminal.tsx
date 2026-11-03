import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { sqlDb } from "../db/sqlEngine";
import { translations, Language } from "../translations";
import { Trade, MarketPair } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  DollarSign,
  AlertCircle,
  Database,
  ChevronDown,
  Search,
  SlidersHorizontal,
  History,
  FileText,
  Sliders
} from "lucide-react";

interface TradingTerminalProps {
  lang: Language;
  marketPairs: MarketPair[];
  initialSymbol?: string;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  lang,
  marketPairs,
  initialSymbol = "BTC/USD"
}) => {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol || "BTC/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("15m");
  const [chartMode, setChartMode] = useState<"candle" | "area">("candle");
  const [showIndicators, setShowIndicators] = useState(true);
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [rightTab, setRightTab] = useState<"orderbook" | "trades">("orderbook");

  // Pair selector dropdown state
  const [pairSelectorOpen, setPairSelectorOpen] = useState(false);
  const [pairSearch, setPairSearch] = useState("");
  const pairSelectorRef = useRef<HTMLDivElement>(null);

  // Sync initial symbol if parent changes it
  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Order Ticket States
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [lots, setLots] = useState<number>(1.0);
  const [leverage, setLeverage] = useState<number>(20);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execMessage, setExecMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Bottom Workstation Tab
  const [activeBottomTab, setActiveBottomTab] = useState<"positions" | "history" | "ledger">("positions");

  // Trades and Transactions from SQL DB
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Active instrument object
  const activePair = useMemo(() => {
    return marketPairs.find((p) => p.symbol === selectedSymbol) || marketPairs[0];
  }, [marketPairs, selectedSymbol]);

  // Autofill limit price to active pair price if empty
  useEffect(() => {
    if (!limitPrice || orderType === "MARKET") {
      setLimitPrice(activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4));
    }
  }, [activePair.price, orderType]);

  // Load trades and transactions from SQL engine
  const loadTrades = () => {
    if (currentUser) {
      setUserTrades(sqlDb.getTrades(currentUser.id));
      setTransactions(sqlDb.getTransactions(currentUser.id));
    } else {
      setUserTrades(sqlDb.getTrades());
      setTransactions(sqlDb.getTransactions());
    }
  };

  useEffect(() => {
    loadTrades();
    const unsubscribe = sqlDb.subscribe(() => {
      loadTrades();
    });
    return unsubscribe;
  }, [currentUser]);

  // Close pair selector on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pairSelectorRef.current && !pairSelectorRef.current.contains(e.target as Node)) {
        setPairSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time PnL simulation for open positions
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser) return;
      const openTrades = sqlDb.getTrades(currentUser.id).filter((t) => t.status === "OPEN");
      if (openTrades.length === 0) return;

      openTrades.forEach((trd) => {
        const pair = marketPairs.find((p) => p.symbol === trd.symbol);
        const currentP = pair ? pair.price : trd.entryPrice;
        const priceDiff = trd.type === "BUY" ? currentP - trd.entryPrice : trd.entryPrice - currentP;
        const multiplier = trd.symbol.includes("BTC") || trd.symbol.includes("Gold") ? 100 : 100000;
        const livePnl = priceDiff * trd.lots * multiplier * 0.1;
        sqlDb.updateTradeLivePnL(trd.id, currentP, livePnl);
      });
      loadTrades();
    }, 1500);

    return () => clearInterval(interval);
  }, [currentUser, marketPairs]);

  // Generate synthetic candlestick chart data with moving averages
  const chartPoints = useMemo(() => {
    const base = activePair.price;
    const count = 35;
    const points = [];
    let current = base * 0.994;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.49) * (base * 0.0018);
      const open = current;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (base * 0.001);
      const low = Math.min(open, close) - Math.random() * (base * 0.001);
      const volume = Math.floor(Math.random() * 50 + 10);
      current = close;
      points.push({ open, close, high, low, volume, time: i });
    }

    if (points.length > 0) {
      points[points.length - 1].close = activePair.price;
    }

    // Calculate MA7 and MA25
    const withMAs = points.map((p, idx, arr) => {
      const slice7 = arr.slice(Math.max(0, idx - 6), idx + 1);
      const ma7 = slice7.reduce((acc, curr) => acc + curr.close, 0) / slice7.length;

      const slice25 = arr.slice(Math.max(0, idx - 24), idx + 1);
      const ma25 = slice25.reduce((acc, curr) => acc + curr.close, 0) / slice25.length;

      return { ...p, ma7, ma25 };
    });

    return withMAs;
  }, [activePair.symbol, selectedTimeframe]);

  // Simulated Order Book (Bids & Asks with depth percentage)
  const orderBook = useMemo(() => {
    const p = activePair.price;
    const spread = p * 0.00012;
    const asks = [];
    const bids = [];

    for (let i = 1; i <= 6; i++) {
      const askVol = Number((Math.random() * 3.5 + 0.4).toFixed(3));
      asks.unshift({
        price: p + spread * i,
        volume: askVol,
        depthPercent: Math.min(95, 18 + i * 14)
      });

      const bidVol = Number((Math.random() * 3.5 + 0.4).toFixed(3));
      bids.push({
        price: p - spread * i,
        volume: bidVol,
        depthPercent: Math.min(95, 18 + i * 14)
      });
    }

    return { asks, bids, spread: (spread * 2).toFixed(5) };
  }, [activePair.price]);

  // Simulated Recent Trades tape
  const recentTradesStream = useMemo(() => {
    const p = activePair.price;
    const count = 10;
    const trades = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const isBuy = Math.random() > 0.48;
      const variance = (Math.random() - 0.5) * (p * 0.0004);
      const tradePrice = p + variance;
      const size = (Math.random() * 2 + 0.05).toFixed(3);
      const tradeTime = new Date(now.getTime() - i * 3500);
      const timeStr = tradeTime.toTimeString().split(" ")[0];

      trades.push({
        id: i,
        time: timeStr,
        price: tradePrice,
        size,
        side: isBuy ? "BUY" : "SELL"
      });
    }
    return trades;
  }, [activePair.price, selectedSymbol]);

  // Required Margin Calculation
  const requiredMargin = useMemo(() => {
    const notional = lots * (activePair.price >= 100 ? activePair.price : 100000);
    return Number((notional / leverage).toFixed(2));
  }, [lots, activePair.price, leverage]);

  // Estimated Liquidation Price
  const estimatedLiquidationPrice = useMemo(() => {
    const p = activePair.price;
    const factor = 1 / leverage;
    if (orderSide === "BUY") {
      return Number((p * (1 - factor * 0.9)).toFixed(p >= 100 ? 2 : 4));
    } else {
      return Number((p * (1 + factor * 0.9)).toFixed(p >= 100 ? 2 : 4));
    }
  }, [activePair.price, leverage, orderSide]);

  // Max Buy/Sell calculation based on available balance
  const maxLotsAffordable = useMemo(() => {
    if (!currentUser || currentUser.balance <= 0) return 0;
    const unitPrice = (activePair.price >= 100 ? activePair.price : 100000) / leverage;
    return Number((currentUser.balance / unitPrice).toFixed(2));
  }, [currentUser, activePair.price, leverage]);

  // Execute Trade Handler
  const handleExecuteTrade = () => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    if (currentUser.balance < requiredMargin) {
      setExecMessage({
        text: isAr ? "رصيد الحساب غير كافٍ لتغطية الهامش المطلوب" : "Insufficient account balance for required margin",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);
    setExecMessage(null);

    const execPrice = orderType === "LIMIT" && limitPrice ? parseFloat(limitPrice) : activePair.price;

    setTimeout(() => {
      try {
        const notional = lots * (activePair.price >= 100 ? activePair.price : 100000);
        sqlDb.createTrade({
          userId: currentUser.id,
          userEmail: currentUser.email,
          symbol: activePair.symbol,
          type: orderSide,
          orderType: orderType === "LIMIT" ? "LIMIT" : "MARKET",
          lots,
          amount: notional,
          entryPrice: execPrice,
          currentPrice: activePair.price,
          leverage,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          margin: requiredMargin
        });

        loadTrades();
        refreshUser();
        setIsSubmitting(false);
        setExecMessage({
          text: isAr
            ? `تم تنفيذ صفقة ${orderSide} بنجاح وتسجيلها في قاعدة بيانات SQL!`
            : `Order ${orderSide} filled and committed to SQL ledger!`,
          type: "success"
        });

        setTimeout(() => setExecMessage(null), 4000);
      } catch (err: any) {
        setIsSubmitting(false);
        setExecMessage({
          text: err.message || "Failed to execute order",
          type: "error"
        });
      }
    }, 350);
  };

  // Close Position Handler
  const handleClosePosition = (trade: Trade) => {
    const pair = marketPairs.find((p) => p.symbol === trade.symbol);
    const closeP = pair ? pair.price : trade.entryPrice;
    sqlDb.closeTrade(trade.id, closeP, trade.pnl);
    loadTrades();
    refreshUser();
  };

  const openPositions = userTrades.filter((t) => t.status === "OPEN");
  const closedPositions = userTrades.filter((t) => t.status === "CLOSED");

  // Filtered pairs for the dropdown selector
  const filteredDropdownPairs = marketPairs.filter((p) =>
    p.symbol.toLowerCase().includes(pairSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(pairSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-[#070b14] text-slate-200 min-h-screen py-4 px-2 sm:px-4 lg:px-6 space-y-3 font-sans">
      {/* Institutional Top Ticker Ribbon */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Pair Switcher & Live Price */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Pair Selector Dropdown Button */}
          <div ref={pairSelectorRef} className="relative">
            <button
              onClick={() => setPairSelectorOpen(!pairSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all cursor-pointer font-mono"
            >
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-bold text-white text-[10px]">
                {activePair.symbol.slice(0, 3)}
              </div>
              <span className="text-sm sm:text-base font-bold text-white">{activePair.symbol}</span>
              <span className="text-[10px] text-slate-400 font-sans uppercase">
                {activePair.type}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Pair Selector Dropdown Menu */}
            {pairSelectorOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0c1322] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in max-h-80 overflow-y-auto no-scrollbar font-mono text-xs">
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={pairSearch}
                    onChange={(e) => setPairSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>
                <div className="space-y-1">
                  {filteredDropdownPairs.map((p) => (
                    <button
                      key={p.symbol}
                      onClick={() => {
                        setSelectedSymbol(p.symbol);
                        setPairSelectorOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <div className="font-bold text-white">{p.symbol}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{p.name}</div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-white font-bold">
                          {p.price >= 100 ? p.price.toFixed(2) : p.price.toFixed(4)}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            p.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {p.change24h >= 0 ? "+" : ""}
                          {p.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prominent Live Price Display */}
          <div className="flex items-center gap-3 font-mono">
            <div
              className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight flex items-center gap-1 ${
                activePair.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {activePair.change24h >= 0 ? (
                <ArrowUpRight className="w-5 h-5 inline" />
              ) : (
                <ArrowDownRight className="w-5 h-5 inline" />
              )}
              <span>
                ${activePair.price >= 100 ? activePair.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : activePair.price.toFixed(4)}
              </span>
            </div>

            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded tabular-nums ${
                activePair.change24h >= 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {activePair.change24h >= 0 ? "+" : ""}
              {activePair.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Right Stats Tickers */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">24h High</div>
            <div className="text-white font-bold tabular-nums">
              ${activePair.high24h >= 100 ? activePair.high24h.toFixed(2) : activePair.high24h.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">24h Low</div>
            <div className="text-white font-bold tabular-nums">
              ${activePair.low24h >= 100 ? activePair.low24h.toFixed(2) : activePair.low24h.toFixed(4)}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase">24h Volume</div>
            <div className="text-slate-200 font-bold tabular-nums">{activePair.volume24h}</div>
          </div>
          <div className="hidden md:block">
            <div className="text-[10px] text-slate-400 uppercase">{t.fundingRateLabel}</div>
            <div className="text-emerald-400 font-bold tabular-nums">0.0100% / 03:22:15</div>
          </div>
        </div>
      </div>

      {/* Main Trading Workstation Grid: Chart + Order Book + Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center Area: Candlestick Chart (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
          {/* Chart Header Bar: Timeframes, Indicators, Chart Type */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            {/* Timeframe selector buttons */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {["1s", "1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedTimeframe === tf
                      ? "bg-slate-700 text-white font-bold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Technical Indicators Toggle */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className={`px-2.5 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
                  showIndicators
                    ? "bg-slate-800 border-slate-600 text-sky-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                MA (7, 25)
              </button>

              <button
                onClick={() => setChartMode(chartMode === "candle" ? "area" : "candle")}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] border border-slate-700 cursor-pointer"
              >
                {chartMode === "candle" ? "Candles" : "Line"}
              </button>
            </div>
          </div>

          {/* Interactive SVG Candlestick & Volume Chart */}
          <div className="h-80 sm:h-96 w-full relative bg-[#070b14] rounded-lg p-2 overflow-hidden border border-slate-800/60">
            {/* Legend / Overlay Price Info */}
            <div className="absolute top-3 left-4 z-10 text-[11px] font-mono flex items-center gap-3 text-slate-400">
              <span className="text-white font-bold">{activePair.symbol}</span>
              {showIndicators && (
                <>
                  <span className="text-amber-400">MA7: ${chartPoints[chartPoints.length - 1]?.ma7.toFixed(2)}</span>
                  <span className="text-cyan-400">MA25: ${chartPoints[chartPoints.length - 1]?.ma25.toFixed(2)}</span>
                </>
              )}
            </div>

            <svg className="w-full h-full overflow-visible" viewBox="0 0 650 320" preserveAspectRatio="none">
              {/* Grid Horizontal Guidelines */}
              {[50, 110, 170, 230].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="650"
                  y2={y}
                  stroke="#152033"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Candlesticks & Volume Histogram */}
              {chartPoints.map((pt, idx) => {
                const x = (idx / (chartPoints.length - 1)) * 620 + 15;
                const min = Math.min(...chartPoints.map((p) => p.low));
                const max = Math.max(...chartPoints.map((p) => p.high));
                const range = max - min || 1;

                const scaleY = (val: number) => 240 - ((val - min) / range) * 200;

                const openY = scaleY(pt.open);
                const closeY = scaleY(pt.close);
                const highY = scaleY(pt.high);
                const lowY = scaleY(pt.low);
                const isGreen = pt.close >= pt.open;
                const volHeight = Math.min(45, (pt.volume / 60) * 45);

                return (
                  <g key={idx}>
                    {/* Volume Histogram Bar at the bottom */}
                    <rect
                      x={x - 3.5}
                      y={310 - volHeight}
                      width="7"
                      height={volHeight}
                      fill={isGreen ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)"}
                    />

                    {/* Candlestick High/Low Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={isGreen ? "#10b981" : "#f43f5e"}
                      strokeWidth="1.2"
                    />

                    {/* Candlestick Body */}
                    <rect
                      x={x - 4}
                      y={Math.min(openY, closeY)}
                      width="8"
                      height={Math.max(2, Math.abs(closeY - openY))}
                      fill={isGreen ? "#10b981" : "#f43f5e"}
                      rx="0.5"
                    />
                  </g>
                );
              })}

              {/* Moving Average 7 (Amber Line) */}
              {showIndicators && (
                <path
                  d={chartPoints.reduce((acc, pt, idx) => {
                    const x = (idx / (chartPoints.length - 1)) * 620 + 15;
                    const min = Math.min(...chartPoints.map((p) => p.low));
                    const max = Math.max(...chartPoints.map((p) => p.high));
                    const range = max - min || 1;
                    const y = 240 - ((pt.ma7 - min) / range) * 200;
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, "")}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
              )}

              {/* Moving Average 25 (Cyan Line) */}
              {showIndicators && (
                <path
                  d={chartPoints.reduce((acc, pt, idx) => {
                    const x = (idx / (chartPoints.length - 1)) * 620 + 15;
                    const min = Math.min(...chartPoints.map((p) => p.low));
                    const max = Math.max(...chartPoints.map((p) => p.high));
                    const range = max - min || 1;
                    const y = 240 - ((pt.ma25 - min) / range) * 200;
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, "")}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                />
              )}

              {/* Active Market Price Dashed Horizontal Line */}
              <line
                x1="0"
                y1="140"
                x2="650"
                y2="140"
                stroke={activePair.change24h >= 0 ? "#10b981" : "#f43f5e"}
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Current Price Floating Badge on Right Border */}
            <div className="absolute right-2 top-[128px] bg-slate-100 text-slate-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
              ${activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4)}
            </div>

            {/* Bottom Meta */}
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <Database className="w-3 h-3 text-sky-400" />
              <span>MATCHING ENGINE · LD4 DIRECT SUB-MILLISECOND FEED</span>
            </div>
          </div>
        </div>

        {/* Center-Right Column: Live Order Book & Recent Trades (2.5 cols) */}
        <div className="lg:col-span-2 bg-[#0c1322] border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2">
          {/* Tabs: Order Book vs Recent Trades */}
          <div className="flex border-b border-slate-800 pb-2 text-xs font-semibold">
            <button
              onClick={() => setRightTab("orderbook")}
              className={`flex-1 pb-1 transition-colors cursor-pointer text-center ${
                rightTab === "orderbook"
                  ? "text-sky-400 border-b-2 border-sky-400 font-bold"
                  : "text-slate-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              {t.depthTab}
            </button>
            <button
              onClick={() => setRightTab("trades")}
              className={`flex-1 pb-1 transition-colors cursor-pointer text-center ${
                rightTab === "trades"
                  ? "text-sky-400 border-b-2 border-sky-400 font-bold"
                  : "text-slate-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              {t.recentTradesTab}
            </button>
          </div>

          {rightTab === "orderbook" ? (
            /* Dual-View Order Book */
            <div className="flex-1 flex flex-col justify-between text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-500 text-[10px] pb-1">
                <span>{t.price} (USD)</span>
                <span>{t.amount}</span>
              </div>

              {/* Asks (Sell Orders in Crimson/Rose) */}
              <div className="space-y-0.5">
                {orderBook.asks.map((a, i) => (
                  <div
                    key={i}
                    onClick={() => setLimitPrice(a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4))}
                    className="relative flex justify-between py-0.5 px-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none"
                      style={{ width: `${a.depthPercent}%` }}
                    />
                    <span className="text-rose-400 font-bold tabular-nums relative z-10">
                      {a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4)}
                    </span>
                    <span className="text-slate-300 tabular-nums relative z-10">{a.volume}</span>
                  </div>
                ))}
              </div>

              {/* Center Spread & Mark Price */}
              <div className="py-2 my-1 px-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white tabular-nums">
                  ${activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  Spread: {orderBook.spread}
                </span>
              </div>

              {/* Bids (Buy Orders in Emerald) */}
              <div className="space-y-0.5">
                {orderBook.bids.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => setLimitPrice(b.price >= 100 ? b.price.toFixed(2) : b.price.toFixed(4))}
                    className="relative flex justify-between py-0.5 px-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none"
                      style={{ width: `${b.depthPercent}%` }}
                    />
                    <span className="text-emerald-400 font-bold tabular-nums relative z-10">
                      {b.price >= 100 ? b.price.toFixed(2) : b.price.toFixed(4)}
                    </span>
                    <span className="text-slate-300 tabular-nums relative z-10">{b.volume}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Recent Trades Stream */
            <div className="flex-1 flex flex-col text-[11px] font-mono space-y-1 overflow-y-auto no-scrollbar max-h-72">
              <div className="flex justify-between text-slate-500 text-[10px] pb-1">
                <span>{t.price}</span>
                <span>{t.amount}</span>
                <span>{t.time}</span>
              </div>
              {recentTradesStream.map((tr) => (
                <div key={tr.id} className="flex justify-between py-0.5 px-1 text-[10px] tabular-nums">
                  <span className={tr.side === "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {tr.price >= 100 ? tr.price.toFixed(2) : tr.price.toFixed(4)}
                  </span>
                  <span className="text-slate-300">{tr.size}</span>
                  <span className="text-slate-500">{tr.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Institutional Order Ticket (3 cols) */}
        <div className="lg:col-span-3 bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-sky-400">
              CROSS MARGIN {leverage}x
            </span>

            {/* Order Types */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderType("MARKET")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  orderType === "MARKET" ? "bg-slate-700 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {t.orderTypeMarket}
              </button>
              <button
                type="button"
                onClick={() => setOrderType("LIMIT")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  orderType === "LIMIT" ? "bg-slate-700 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {t.orderTypeLimit}
              </button>
            </div>
          </div>

          {/* Buy / Long vs Sell / Short Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderSide("BUY")}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition-all cursor-pointer ${
                orderSide === "BUY"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t.buyLong}
            </button>
            <button
              type="button"
              onClick={() => setOrderSide("SELL")}
              className={`py-2 rounded-lg font-bold text-xs uppercase transition-all cursor-pointer ${
                orderSide === "SELL"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t.sellShort}
            </button>
          </div>

          {/* Limit Price Input (if LIMIT order selected) */}
          {orderType === "LIMIT" && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                <span>{t.price}</span>
                <span className="text-slate-500">USD</span>
              </div>
              <input
                type="number"
                step="0.0001"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 text-white rounded-lg p-2 text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
          )}

          {/* Volume / Lots Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{t.orderVolume}</span>
              <span className="text-white font-bold">{lots} Lots</span>
            </div>
            <input
              type="number"
              min="0.01"
              max="50"
              step="0.1"
              value={lots}
              onChange={(e) => setLots(parseFloat(e.target.value) || 0.1)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 text-white rounded-lg p-2 text-xs font-mono tabular-nums focus:outline-none"
            />

            {/* Quick Percentage Presets */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
              {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                <button
                  key={frac}
                  type="button"
                  onClick={() => {
                    const maxAllowed = maxLotsAffordable > 0 ? maxLotsAffordable : 5.0;
                    setLots(Math.max(0.1, Number((maxAllowed * frac).toFixed(2))));
                  }}
                  className="py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {frac * 100}%
                </button>
              ))}
            </div>
          </div>

          {/* Leverage Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{t.leverage}</span>
              <span className="text-white font-bold">{leverage}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
              {[5, 10, 20, 50].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-1 rounded cursor-pointer border ${
                    leverage === lev
                      ? "bg-slate-700 text-white font-bold border-slate-500"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* TP & SL Inputs */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <label className="block text-slate-400 mb-1">{t.stopLoss}</label>
              <input
                type="number"
                step="0.0001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{t.takeProfit}</label>
              <input
                type="number"
                step="0.0001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Margin & Account Summary */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>{t.marginLabel}:</span>
              <span className="text-white font-bold tabular-nums">${requiredMargin.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{t.freeMarginLabel}:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                ${currentUser ? Math.max(0, currentUser.balance - requiredMargin).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800">
              <span>Est. Liq Price:</span>
              <span className="text-slate-300 tabular-nums">${estimatedLiquidationPrice}</span>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {execMessage && (
            <div
              className={`p-2 rounded text-xs flex items-center gap-1.5 font-mono ${
                execMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              }`}
            >
              {execMessage.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{execMessage.text}</span>
            </div>
          )}

          {/* Order Execution Action Button */}
          <button
            type="button"
            onClick={handleExecuteTrade}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              orderSide === "BUY"
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
            }`}
          >
            {isSubmitting
              ? isAr ? "جاري الإرسال إلى SQL..." : "Routing to SQL engine..."
              : `${orderSide} ${lots} Lots ${activePair.symbol}`}
          </button>
        </div>
      </div>

      {/* Bottom Workstation: Open Positions, History & SQL Ledger */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-3 mb-3">
          <button
            onClick={() => setActiveBottomTab("positions")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "positions"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>{t.openPositions}</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
              {openPositions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveBottomTab("history")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "history"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>{t.closedTrades}</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
              {closedPositions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveBottomTab("ledger")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "ledger"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Relational Ledger</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-sky-500/20 text-sky-400">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Live Positions */}
        {activeBottomTab === "positions" && (
          <div className="overflow-x-auto">
            {openPositions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                {t.noOpenPositions}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">{t.symbol}</th>
                    <th className="pb-2">{t.type}</th>
                    <th className="pb-2">{t.orderVolume}</th>
                    <th className="pb-2">{t.entryPrice}</th>
                    <th className="pb-2">{t.currentPrice}</th>
                    <th className="pb-2">{t.marginLabel}</th>
                    <th className="pb-2">{t.pnl}</th>
                    <th className="pb-2 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {openPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 text-slate-400">{trd.id}</td>
                        <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-2.5 tabular-nums">{trd.lots} Lots</td>
                        <td className="py-2.5 tabular-nums">${trd.entryPrice}</td>
                        <td className="py-2.5 tabular-nums">${trd.currentPrice}</td>
                        <td className="py-2.5 tabular-nums text-slate-300">${trd.margin}</td>
                        <td className="py-2.5">
                          <span
                            className={`font-bold tabular-nums ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleClosePosition(trd)}
                            className="px-2.5 py-1 text-[11px] rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                          >
                            {t.closePosition}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Trade History */}
        {activeBottomTab === "history" && (
          <div className="overflow-x-auto">
            {closedPositions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                {t.noTradesHistory}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">{t.symbol}</th>
                    <th className="pb-2">{t.type}</th>
                    <th className="pb-2">{t.orderVolume}</th>
                    <th className="pb-2">{t.entryPrice}</th>
                    <th className="pb-2">{isAr ? "سعر الإغلاق" : "Close Price"}</th>
                    <th className="pb-2">{t.pnl}</th>
                    <th className="pb-2 text-right">{isAr ? "تاريخ الإغلاق" : "Closed At"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {closedPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 text-slate-400">{trd.id}</td>
                        <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-2.5 tabular-nums">{trd.lots} Lots</td>
                        <td className="py-2.5 tabular-nums">${trd.entryPrice}</td>
                        <td className="py-2.5 tabular-nums">${trd.closePrice}</td>
                        <td className="py-2.5">
                          <span
                            className={`font-bold tabular-nums ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-400 text-[11px]">
                          {trd.closedAt ? new Date(trd.closedAt).toLocaleTimeString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Relational SQL Ledger */}
        {activeBottomTab === "ledger" && (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                {isAr ? "لا توجد معاملات مسجلة في دفتر الأستاذ" : "No transactions recorded in ledger"}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="pb-2">TX ID</th>
                    <th className="pb-2">{isAr ? "نوع المعاملة" : "Transaction Type"}</th>
                    <th className="pb-2">{isAr ? "المبلغ" : "Amount"}</th>
                    <th className="pb-2">{isAr ? "الرصيد بعدها" : "Balance After"}</th>
                    <th className="pb-2">{isAr ? "بيان القيد" : "Audit Note"}</th>
                    <th className="pb-2 text-right">{isAr ? "التوقيت" : "Timestamp"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-400">{tx.id}</td>
                      <td className="py-2.5 font-bold text-sky-400">{tx.type}</td>
                      <td className="py-2.5 font-bold text-white tabular-nums">${tx.amount.toLocaleString()}</td>
                      <td className="py-2.5 text-emerald-400 font-bold tabular-nums">${tx.balanceAfter.toLocaleString()}</td>
                      <td className="py-2.5 text-slate-300 font-sans text-xs">{tx.note}</td>
                      <td className="py-2.5 text-right text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
