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
  Sliders,
  DollarSign,
  AlertCircle,
  Database,
  ChevronDown,
  Maximize2,
  Search,
  SlidersHorizontal,
  History,
  FileText
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
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP">("MARKET");
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

  // Simulated OKX Order Book (Bids & Asks with depth percentage)
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

  // Simulated OKX Recent Trades stream
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
          orderType: orderType === "STOP" ? "LIMIT" : orderType,
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
            ? `تم تنفيذ أمر ${orderSide} بنجاح وتسجيله في قاعدة بيانات SQL!`
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
    <div className="w-full bg-[#000000] text-zinc-200 min-h-screen py-4 px-2 sm:px-4 lg:px-6 space-y-3 font-sans">
      {/* OKX Pro Ticker Header Ribbon */}
      <div className="bg-[#08090b] border border-[#1e2329] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Pair Switcher & Live Price */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Pair Selector Dropdown Button */}
          <div ref={pairSelectorRef} className="relative">
            <button
              onClick={() => setPairSelectorOpen(!pairSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14171d] border border-[#222832] hover:border-zinc-500 transition-all cursor-pointer font-mono"
            >
              <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-bold text-white text-[10px]">
                {activePair.symbol.slice(0, 3)}
              </div>
              <span className="text-sm sm:text-base font-black text-white">{activePair.symbol}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#1e2329] text-zinc-400 rounded">
                PERP
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Pair Selector Dropdown Menu */}
            {pairSelectorOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0b0e11] border border-[#1e2329] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in max-h-80 overflow-y-auto no-scrollbar font-mono text-xs">
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={pairSearch}
                    onChange={(e) => setPairSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-[#14171d] border border-[#1e2329] rounded-lg pl-7 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                </div>
                <div className="space-y-1">
                  {filteredDropdownPairs.map((p) => (
                    <button
                      key={p.symbol}
                      onClick={() => {
                        setSelectedSymbol(p.symbol);
                        setPairSelectorOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#161a22] transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <div className="font-bold text-white">{p.symbol}</div>
                        <div className="text-[10px] text-zinc-400">{p.name}</div>
                      </div>
                      <div className="text-right font-tabular">
                        <div className="text-white font-bold">
                          {p.price >= 100 ? p.price.toFixed(2) : p.price.toFixed(4)}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            p.change24h >= 0 ? "text-[#00c087]" : "text-[#f6465d]"
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
              className={`text-xl sm:text-2xl font-black font-tabular tracking-tight flex items-center gap-1 ${
                activePair.change24h >= 0 ? "text-[#00c087]" : "text-[#f6465d]"
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
              className={`text-xs font-bold px-2 py-0.5 rounded font-tabular ${
                activePair.change24h >= 0
                  ? "bg-[#00c087]/15 text-[#00c087] border border-[#00c087]/30"
                  : "bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/30"
              }`}
            >
              {activePair.change24h >= 0 ? "+" : ""}
              {activePair.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Right Stats Tickers (OKX Style: 24h High/Low/Vol, Funding Rate) */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">24h High</div>
            <div className="text-white font-bold font-tabular">
              ${activePair.high24h >= 100 ? activePair.high24h.toFixed(2) : activePair.high24h.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">24h Low</div>
            <div className="text-white font-bold font-tabular">
              ${activePair.low24h >= 100 ? activePair.low24h.toFixed(2) : activePair.low24h.toFixed(4)}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] text-zinc-500 uppercase">24h Volume</div>
            <div className="text-zinc-300 font-bold font-tabular">{activePair.volume24h}</div>
          </div>
          <div className="hidden md:block">
            <div className="text-[10px] text-zinc-500 uppercase">{t.fundingRateLabel}</div>
            <div className="text-[#00c087] font-bold font-tabular">0.0100% / 03:22:15</div>
          </div>
        </div>
      </div>

      {/* Main Trading Workstation Grid: Chart + Order Book + Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center Area: Candlestick Chart (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-[#08090b] border border-[#1e2329] rounded-xl p-3 sm:p-4 space-y-3">
          {/* Chart Header Bar: Timeframes, Indicators, Chart Type */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1e2329]">
            {/* Timeframe selector buttons (OKX style) */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {["1s", "1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    selectedTimeframe === tf
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-[#161a22]"
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
                    ? "bg-[#161a22] border-zinc-600 text-white font-bold"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                MA (7, 25)
              </button>

              <button
                onClick={() => setChartMode(chartMode === "candle" ? "area" : "candle")}
                className="px-2 py-1 rounded bg-[#161a22] text-zinc-300 hover:text-white text-[11px] border border-[#222832] cursor-pointer"
              >
                {chartMode === "candle" ? "Candles" : "Line"}
              </button>
            </div>
          </div>

          {/* Interactive SVG Candlestick & Volume Chart */}
          <div className="h-80 sm:h-96 w-full relative bg-[#040507] rounded-lg p-2 overflow-hidden border border-[#1e2329]/50">
            {/* Legend / Overlay Price Info */}
            <div className="absolute top-3 left-4 z-10 text-[11px] font-mono flex items-center gap-3 text-zinc-400">
              <span className="text-white font-bold">{activePair.symbol}</span>
              {showIndicators && (
                <>
                  <span className="text-amber-400">MA7: ${chartPoints[chartPoints.length - 1]?.ma7.toFixed(2)}</span>
                  <span className="text-cyan-400">MA25: ${chartPoints[chartPoints.length - 1]?.ma25.toFixed(2)}</span>
                </>
              )}
            </div>

            <svg className="w-full h-full overflow-visible" viewBox="0 0 650 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c087" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00c087" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Guidelines */}
              {[50, 110, 170, 230].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="650"
                  y2={y}
                  stroke="#14171f"
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

                // Price coordinates mapping
                const scaleY = (val: number) => 240 - ((val - min) / range) * 200;

                const openY = scaleY(pt.open);
                const closeY = scaleY(pt.close);
                const highY = scaleY(pt.high);
                const lowY = scaleY(pt.low);
                const isGreen = pt.close >= pt.open;

                // Volume Bar height at bottom
                const volHeight = Math.min(45, (pt.volume / 60) * 45);

                return (
                  <g key={idx}>
                    {/* Volume Histogram Bar at the bottom */}
                    <rect
                      x={x - 3.5}
                      y={310 - volHeight}
                      width="7"
                      height={volHeight}
                      fill={isGreen ? "rgba(0, 192, 135, 0.25)" : "rgba(246, 70, 93, 0.25)"}
                    />

                    {/* Candlestick High/Low Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={isGreen ? "#00c087" : "#f6465d"}
                      strokeWidth="1.2"
                    />

                    {/* Candlestick Body */}
                    <rect
                      x={x - 4}
                      y={Math.min(openY, closeY)}
                      width="8"
                      height={Math.max(2, Math.abs(closeY - openY))}
                      fill={isGreen ? "#00c087" : "#f6465d"}
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
                stroke={activePair.change24h >= 0 ? "#00c087" : "#f6465d"}
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Current Price Floating Badge on Right Border */}
            <div className="absolute right-2 top-[128px] bg-white text-black font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
              ${activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4)}
            </div>

            {/* Bottom Watermark */}
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-zinc-600 flex items-center gap-2">
              <Database className="w-3 h-3 text-[#00c087]" />
              <span>OKX MATCHING PROTOCOL • LD4 SUB-MILLISECOND FEED</span>
            </div>
          </div>
        </div>

        {/* Center-Right Column: Live Order Book & Recent Trades (2.5 cols) */}
        <div className="lg:col-span-2 bg-[#08090b] border border-[#1e2329] rounded-xl p-3 flex flex-col justify-between space-y-2">
          {/* Tabs: Order Book vs Recent Trades */}
          <div className="flex border-b border-[#1e2329] pb-2 text-xs font-semibold">
            <button
              onClick={() => setRightTab("orderbook")}
              className={`flex-1 pb-1 transition-colors cursor-pointer text-center ${
                rightTab === "orderbook"
                  ? "text-white border-b-2 border-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
              }`}
            >
              {t.depthTab}
            </button>
            <button
              onClick={() => setRightTab("trades")}
              className={`flex-1 pb-1 transition-colors cursor-pointer text-center ${
                rightTab === "trades"
                  ? "text-white border-b-2 border-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
              }`}
            >
              {t.recentTradesTab}
            </button>
          </div>

          {rightTab === "orderbook" ? (
            /* OKX Dual-View Order Book */
            <div className="flex-1 flex flex-col justify-between text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-zinc-500 text-[10px] pb-1">
                <span>{t.price} (USD)</span>
                <span>{t.amount}</span>
              </div>

              {/* Asks (Sell Orders in Red) */}
              <div className="space-y-0.5">
                {orderBook.asks.map((a, i) => (
                  <div
                    key={i}
                    onClick={() => setLimitPrice(a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4))}
                    className="relative flex justify-between py-0.5 px-1 rounded hover:bg-[#161a22] transition-colors cursor-pointer overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/12 pointer-events-none"
                      style={{ width: `${a.depthPercent}%` }}
                    />
                    <span className="text-[#f6465d] font-bold font-tabular relative z-10">
                      {a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4)}
                    </span>
                    <span className="text-zinc-400 font-tabular relative z-10">{a.volume}</span>
                  </div>
                ))}
              </div>

              {/* Center Spread & Mark Price */}
              <div className="py-2 my-1 px-1.5 bg-[#12161c] rounded border border-[#1e2329] flex items-center justify-between text-xs">
                <span className="font-bold text-white font-tabular">
                  ${activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-500 font-tabular">
                  Spread: {orderBook.spread}
                </span>
              </div>

              {/* Bids (Buy Orders in Green) */}
              <div className="space-y-0.5">
                {orderBook.bids.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => setLimitPrice(b.price >= 100 ? b.price.toFixed(2) : b.price.toFixed(4))}
                    className="relative flex justify-between py-0.5 px-1 rounded hover:bg-[#161a22] transition-colors cursor-pointer overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#00c087]/12 pointer-events-none"
                      style={{ width: `${b.depthPercent}%` }}
                    />
                    <span className="text-[#00c087] font-bold font-tabular relative z-10">
                      {b.price >= 100 ? b.price.toFixed(2) : b.price.toFixed(4)}
                    </span>
                    <span className="text-zinc-400 font-tabular relative z-10">{b.volume}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* OKX Recent Trades Stream */
            <div className="flex-1 flex flex-col text-[11px] font-mono space-y-1 overflow-y-auto no-scrollbar max-h-72">
              <div className="flex justify-between text-zinc-500 text-[10px] pb-1">
                <span>{t.price}</span>
                <span>{t.amount}</span>
                <span>{t.time}</span>
              </div>
              {recentTradesStream.map((tr) => (
                <div key={tr.id} className="flex justify-between py-0.5 px-1 text-[10px] font-tabular">
                  <span className={tr.side === "BUY" ? "text-[#00c087] font-bold" : "text-[#f6465d] font-bold"}>
                    {tr.price >= 100 ? tr.price.toFixed(2) : tr.price.toFixed(4)}
                  </span>
                  <span className="text-zinc-300">{tr.size}</span>
                  <span className="text-zinc-500">{tr.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: OKX Pro Order Form (2.5 cols) */}
        <div className="lg:col-span-3 bg-[#08090b] border border-[#1e2329] rounded-xl p-4 space-y-4">
          {/* Cross Margin Badge & Order Type selector */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2329]">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#161a22] text-zinc-300 border border-[#222832]">
                CROSS {leverage}x
              </span>
            </div>

            {/* Order Types */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderType("MARKET")}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  orderType === "MARKET" ? "text-white font-bold" : "text-zinc-500 hover:text-white"
                }`}
              >
                {t.orderTypeMarket}
              </button>
              <button
                type="button"
                onClick={() => setOrderType("LIMIT")}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  orderType === "LIMIT" ? "text-white font-bold" : "text-zinc-500 hover:text-white"
                }`}
              >
                {t.orderTypeLimit}
              </button>
            </div>
          </div>

          {/* OKX Buy / Long vs Sell / Short Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderSide("BUY")}
              className={`py-2 rounded-lg font-black text-xs uppercase transition-all cursor-pointer ${
                orderSide === "BUY"
                  ? "bg-[#00c087] text-black shadow-lg shadow-[#00c087]/20"
                  : "bg-[#14171d] text-zinc-400 hover:text-white border border-[#1e2329]"
              }`}
            >
              {t.buyLong}
            </button>
            <button
              type="button"
              onClick={() => setOrderSide("SELL")}
              className={`py-2 rounded-lg font-black text-xs uppercase transition-all cursor-pointer ${
                orderSide === "SELL"
                  ? "bg-[#f6465d] text-white shadow-lg shadow-[#f6465d]/20"
                  : "bg-[#14171d] text-zinc-400 hover:text-white border border-[#1e2329]"
              }`}
            >
              {t.sellShort}
            </button>
          </div>

          {/* Limit Price Input (if LIMIT order selected) */}
          {orderType === "LIMIT" && (
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
                <span>{t.price}</span>
                <span className="text-zinc-500">USD</span>
              </div>
              <input
                type="number"
                step="0.0001"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-[#12161c] border border-[#1e2329] focus:border-zinc-400 text-white rounded-lg p-2 text-xs font-mono font-tabular focus:outline-none"
              />
            </div>
          )}

          {/* Volume / Lots Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
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
              className="w-full bg-[#12161c] border border-[#1e2329] focus:border-zinc-400 text-white rounded-lg p-2 text-xs font-mono font-tabular focus:outline-none"
            />

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
              {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                <button
                  key={frac}
                  type="button"
                  onClick={() => {
                    const maxAllowed = maxLotsAffordable > 0 ? maxLotsAffordable : 5.0;
                    setLots(Math.max(0.1, Number((maxAllowed * frac).toFixed(2))));
                  }}
                  className="py-1 rounded bg-[#161a22] border border-[#222832] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {frac * 100}%
                </button>
              ))}
            </div>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
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
                      ? "bg-white text-black font-bold border-white"
                      : "bg-[#161a22] border-[#222832] text-zinc-400 hover:text-white"
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
              className="w-full accent-[#00c087] cursor-pointer"
            />
          </div>

          {/* TP & SL Inputs */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <label className="block text-zinc-500 mb-1">{t.stopLoss}</label>
              <input
                type="number"
                step="0.0001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#12161c] border border-[#1e2329] text-white rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">{t.takeProfit}</label>
              <input
                type="number"
                step="0.0001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#12161c] border border-[#1e2329] text-white rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Margin & Account Summary */}
          <div className="bg-[#12161c] p-2.5 rounded-lg border border-[#1e2329] text-xs font-mono space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>{t.marginLabel}:</span>
              <span className="text-white font-bold font-tabular">${requiredMargin.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>{t.freeMarginLabel}:</span>
              <span className="text-[#00c087] font-bold font-tabular">
                ${currentUser ? Math.max(0, currentUser.balance - requiredMargin).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[10px] pt-1 border-t border-[#1e2329]">
              <span>Est. Liq Price:</span>
              <span className="text-zinc-400 font-tabular">${estimatedLiquidationPrice}</span>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {execMessage && (
            <div
              className={`p-2 rounded text-xs flex items-center gap-1.5 font-mono ${
                execMessage.type === "success"
                  ? "bg-[#00c087]/15 border border-[#00c087]/40 text-[#00c087]"
                  : "bg-[#f6465d]/15 border border-[#f6465d]/40 text-[#f6465d]"
              }`}
            >
              {execMessage.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{execMessage.text}</span>
            </div>
          )}

          {/* Big Action Button (OKX Green for Long / OKX Red for Short) */}
          <button
            type="button"
            onClick={handleExecuteTrade}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              orderSide === "BUY"
                ? "bg-[#00c087] hover:bg-[#00c087]/90 text-black shadow-[#00c087]/20"
                : "bg-[#f6465d] hover:bg-[#f6465d]/90 text-white shadow-[#f6465d]/20"
            }`}
          >
            {isSubmitting
              ? isAr ? "جاري الإرسال إلى SQL..." : "Routing to SQL engine..."
              : `${orderSide} ${lots} Lots ${activePair.symbol}`}
          </button>
        </div>
      </div>

      {/* Bottom Workstation: Open Positions, History & SQL Ledger */}
      <div className="bg-[#08090b] border border-[#1e2329] rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-[#1e2329] pb-3 mb-3">
          <button
            onClick={() => setActiveBottomTab("positions")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "positions"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>{t.openPositions}</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-[#161a22] text-white">
              {openPositions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveBottomTab("history")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "history"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>{t.closedTrades}</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-[#161a22] text-white">
              {closedPositions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveBottomTab("ledger")}
            className={`flex items-center gap-2 text-xs font-bold pb-1 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "ledger"
                ? "border-[#00c087] text-[#00c087]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Ledger</span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-[#00c087]/20 text-[#00c087]">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Live Positions */}
        {activeBottomTab === "positions" && (
          <div className="overflow-x-auto">
            {openPositions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                {t.noOpenPositions}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-[#1e2329] text-[11px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">{t.symbol}</th>
                    <th className="pb-2">{t.type}</th>
                    <th className="pb-2">{t.orderVolume}</th>
                    <th className="pb-2">{t.entryPrice}</th>
                    <th className="pb-2">{t.currentPrice}</th>
                    <th className="pb-2">{t.pnl}</th>
                    <th className="pb-2 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2329]/60">
                  {openPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-[#12161c] transition-colors">
                        <td className="py-2.5 text-zinc-500">{trd.id}</td>
                        <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-[#00c087]/15 text-[#00c087]"
                                : "bg-[#f6465d]/15 text-[#f6465d]"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-300 font-tabular">{trd.lots}</td>
                        <td className="py-2.5 text-zinc-300 font-tabular">
                          ${trd.entryPrice >= 100 ? trd.entryPrice.toFixed(2) : trd.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-zinc-300 font-tabular">
                          ${trd.currentPrice >= 100 ? trd.currentPrice.toFixed(2) : trd.currentPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 font-tabular">
                          <span className={`font-bold ${isProfit ? "text-[#00c087]" : "text-[#f6465d]"}`}>
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleClosePosition(trd)}
                            className="px-2.5 py-1 rounded bg-[#161a22] hover:bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/30 text-[10px] font-bold transition-all cursor-pointer"
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

        {/* Tab 2: Closed Trades History */}
        {activeBottomTab === "history" && (
          <div className="overflow-x-auto">
            {closedPositions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                {t.noTradesHistory}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-[#1e2329] text-[11px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">{t.symbol}</th>
                    <th className="pb-2">{t.type}</th>
                    <th className="pb-2">{t.orderVolume}</th>
                    <th className="pb-2">{t.entryPrice}</th>
                    <th className="pb-2">Close Price</th>
                    <th className="pb-2">{t.pnl}</th>
                    <th className="pb-2">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2329]/60">
                  {closedPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-[#12161c] transition-colors">
                        <td className="py-2.5 text-zinc-500">{trd.id}</td>
                        <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-[#00c087]/15 text-[#00c087]"
                                : "bg-[#f6465d]/15 text-[#f6465d]"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-300 font-tabular">{trd.lots}</td>
                        <td className="py-2.5 text-zinc-300 font-tabular">
                          ${trd.entryPrice >= 100 ? trd.entryPrice.toFixed(2) : trd.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-zinc-300 font-tabular">
                          ${trd.closePrice ? (trd.closePrice >= 100 ? trd.closePrice.toFixed(2) : trd.closePrice.toFixed(4)) : "-"}
                        </td>
                        <td className="py-2.5 font-tabular">
                          <span className={`font-bold ${isProfit ? "text-[#00c087]" : "text-[#f6465d]"}`}>
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="text-zinc-400 bg-[#161a22] px-1.5 py-0.5 rounded text-[9px]">
                            {trd.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: SQL Ledger */}
        {activeBottomTab === "ledger" && (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                No SQL ledger transactions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-[#1e2329] text-[11px]">
                    <th className="pb-2">TX ID</th>
                    <th className="pb-2">User</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Balance After</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2329]/60">
                  {transactions.slice(0, 15).map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#12161c] transition-colors">
                      <td className="py-2 text-zinc-500">{tx.id}</td>
                      <td className="py-2 text-zinc-300">{tx.userEmail}</td>
                      <td className="py-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161a22] text-[#00c087] font-bold">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 font-bold font-tabular text-white">${tx.amount.toFixed(2)}</td>
                      <td className="py-2 text-zinc-400 font-tabular">${tx.balanceAfter.toFixed(2)}</td>
                      <td className="py-2 text-zinc-500 text-[10px]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
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
