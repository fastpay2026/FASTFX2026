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
  Database
} from "lucide-react";

interface TradingTerminalProps {
  lang: Language;
  marketPairs: MarketPair[];
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ lang, marketPairs }) => {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  const [selectedSymbol, setSelectedSymbol] = useState<string>("EUR/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [chartMode, setChartMode] = useState<"candle" | "area">("candle");

  // Order Ticket States
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [lots, setLots] = useState<number>(1.0);
  const [leverage, setLeverage] = useState<number>(100);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execMessage, setExecMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Tab for bottom panel
  const [activeBottomTab, setActiveBottomTab] = useState<"positions" | "history">("positions");

  // Trades from SQL DB
  const [userTrades, setUserTrades] = useState<Trade[]>([]);

  // Active instrument object
  const activePair = useMemo(() => {
    return marketPairs.find((p) => p.symbol === selectedSymbol) || marketPairs[0];
  }, [marketPairs, selectedSymbol]);

  // Load trades from SQL
  const loadTrades = () => {
    if (currentUser) {
      setUserTrades(sqlDb.getTrades(currentUser.id));
    } else {
      setUserTrades(sqlDb.getTrades());
    }
  };

  useEffect(() => {
    loadTrades();
    const unsubscribe = sqlDb.subscribe(() => {
      loadTrades();
    });
    return unsubscribe;
  }, [currentUser]);

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

  // Generate synthetic candlestick chart data
  const chartPoints = useMemo(() => {
    const base = activePair.price;
    const count = 30;
    const points = [];
    let current = base * 0.998;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.49) * (base * 0.0015);
      const open = current;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (base * 0.0008);
      const low = Math.min(open, close) - Math.random() * (base * 0.0008);
      current = close;
      points.push({ open, close, high, low, time: i });
    }
    // Make the last point align with active price
    if (points.length > 0) {
      points[points.length - 1].close = activePair.price;
    }
    return points;
  }, [activePair.symbol, selectedTimeframe]);

  // Simulated Order Book (Bids & Asks)
  const orderBook = useMemo(() => {
    const p = activePair.price;
    const spread = p * 0.00015;
    const asks = [];
    const bids = [];

    for (let i = 1; i <= 5; i++) {
      asks.unshift({
        price: p + spread * i,
        volume: Number((Math.random() * 4 + 0.5).toFixed(2)),
        depthPercent: Math.min(95, 20 + i * 15)
      });
      bids.push({
        price: p - spread * i,
        volume: Number((Math.random() * 4 + 0.5).toFixed(2)),
        depthPercent: Math.min(95, 20 + i * 15)
      });
    }

    return { asks, bids, spread: (spread * 2).toFixed(5) };
  }, [activePair.price]);

  // Required Margin Calculation
  const requiredMargin = useMemo(() => {
    const notional = lots * (activePair.price >= 100 ? activePair.price : 100000);
    return Number((notional / leverage).toFixed(2));
  }, [lots, activePair.price, leverage]);

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

    setTimeout(() => {
      try {
        const notional = lots * (activePair.price >= 100 ? activePair.price : 100000);
        sqlDb.createTrade({
          userId: currentUser.id,
          userEmail: currentUser.email,
          symbol: activePair.symbol,
          type: orderSide,
          orderType: "MARKET",
          lots,
          amount: notional,
          entryPrice: activePair.price,
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
            ? `تم تسجيل أمر ${orderSide} بنجاح في قاعدة بيانات SQL!`
            : `Order ${orderSide} filled and logged into SQL database successfully!`,
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
    }, 450);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0f17] border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.terminalTitle}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
              SQL ENGINE ONLINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{t.terminalSub}</p>
        </div>

        {/* User Account Snapshot */}
        {currentUser && (
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-xs">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">{t.balanceLabel}</div>
              <div className="text-sm font-bold text-white">
                ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">{t.equityLabel}</div>
              <div className="text-sm font-bold text-emerald-400">
                ${currentUser.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Chart & Orderbook, Right Order Execution Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Instruments bar + Interactive Chart + Orderbook (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Instruments Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {marketPairs.map((pair) => {
              const isSelected = pair.symbol === selectedSymbol;
              const isUp = pair.change24h >= 0;
              return (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedSymbol(pair.symbol)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-white shadow-lg shadow-orange-500/10"
                      : "bg-[#0e1017] border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <span className="font-bold">{pair.symbol}</span>
                  <span className="font-mono text-white">
                    {pair.price >= 100 ? pair.price.toFixed(2) : pair.price.toFixed(4)}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {pair.change24h.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chart Card */}
          <div className="bg-[#0b0c13] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {activePair.symbol}
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {activePair.price >= 100 ? activePair.price.toFixed(2) : activePair.price.toFixed(4)}
                </div>
                <div
                  className={`flex items-center text-xs font-mono px-2 py-0.5 rounded ${
                    activePair.change24h >= 0
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {activePair.change24h >= 0 ? "+" : ""}
                  {activePair.change24h.toFixed(2)}%
                </div>
              </div>

              {/* Timeframes */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                {["1M", "5M", "15M", "1H", "1D"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      selectedTimeframe === tf
                        ? "bg-amber-500 text-black font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart Drawing */}
            <div className="h-64 sm:h-72 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[40, 90, 140, 190].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="#1f2430"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Render Candlesticks */}
                {chartPoints.map((pt, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 580 + 10;
                  const min = Math.min(...chartPoints.map((p) => p.low));
                  const max = Math.max(...chartPoints.map((p) => p.high));
                  const range = max - min || 1;

                  const scaleY = (val: number) => 220 - ((val - min) / range) * 190;

                  const openY = scaleY(pt.open);
                  const closeY = scaleY(pt.close);
                  const highY = scaleY(pt.high);
                  const lowY = scaleY(pt.low);
                  const isGreen = pt.close >= pt.open;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* High/Low Wick */}
                      <line
                        x1={x}
                        y1={highY}
                        x2={x}
                        y2={lowY}
                        stroke={isGreen ? "#10b981" : "#ef4444"}
                        strokeWidth="1.5"
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - 4}
                        y={Math.min(openY, closeY)}
                        width="8"
                        height={Math.max(2, Math.abs(closeY - openY))}
                        fill={isGreen ? "#10b981" : "#ef4444"}
                        rx="1"
                      />
                    </g>
                  );
                })}

                {/* Live Price Horizontal Line */}
                <line
                  x1="0"
                  y1="120"
                  x2="600"
                  y2="120"
                  stroke="#f97316"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>

              {/* Floating watermark */}
              <div className="absolute bottom-3 left-4 text-[11px] font-mono text-zinc-600 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-amber-500/70" />
                <span>FAST FX LIQUIDITY BRIDGE • STREAM ID #LD4-FX-99</span>
              </div>
            </div>
          </div>

          {/* Live Order Book & Depth */}
          <div className="bg-[#0b0c13] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t.orderBookTitle}</span>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                {t.spreadLabel}: <span className="text-amber-400 font-bold">{orderBook.spread}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              {/* Bids Column (Green) */}
              <div>
                <div className="flex justify-between text-zinc-500 text-[10px] pb-1 border-b border-zinc-800">
                  <span>{t.bidsLabel}</span>
                  <span>{t.depthLabel}</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {orderBook.bids.map((b, i) => (
                    <div
                      key={i}
                      className="relative flex justify-between py-1 px-2 rounded bg-emerald-950/20 overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                        style={{ width: `${b.depthPercent}%` }}
                      />
                      <span className="text-emerald-400 font-bold relative z-10">
                        {b.price >= 100 ? b.price.toFixed(2) : b.price.toFixed(4)}
                      </span>
                      <span className="text-zinc-300 relative z-10">{b.volume} Lots</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks Column (Red) */}
              <div>
                <div className="flex justify-between text-zinc-500 text-[10px] pb-1 border-b border-zinc-800">
                  <span>{t.asksLabel}</span>
                  <span>{t.depthLabel}</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {orderBook.asks.map((a, i) => (
                    <div
                      key={i}
                      className="relative flex justify-between py-1 px-2 rounded bg-rose-950/20 overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                        style={{ width: `${a.depthPercent}%` }}
                      />
                      <span className="text-rose-400 font-bold relative z-10">
                        {a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4)}
                      </span>
                      <span className="text-zinc-300 relative z-10">{a.volume} Lots</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Execution Ticket (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e1018] border border-zinc-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
              <div className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>تنفيذ الصفقة (Order Ticket)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                MARKET
              </span>
            </div>

            {/* Buy / Sell Tab buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setOrderSide("BUY")}
                className={`py-3 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  orderSide === "BUY"
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <span>{t.buyLong}</span>
                <span className="text-[10px] font-mono opacity-80">
                  {activePair.ask >= 100 ? activePair.ask.toFixed(2) : activePair.ask.toFixed(4)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderSide("SELL")}
                className={`py-3 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  orderSide === "SELL"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-black"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <span>{t.sellShort}</span>
                <span className="text-[10px] font-mono opacity-80">
                  {activePair.bid >= 100 ? activePair.bid.toFixed(2) : activePair.bid.toFixed(4)}
                </span>
              </button>
            </div>

            {/* Lots / Volume Selector */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{t.orderVolume}</span>
                  <span className="font-mono text-white">{lots} Lots</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[0.1, 0.5, 1.0, 5.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLots(val)}
                      className={`py-1 text-xs font-mono rounded cursor-pointer border ${
                        lots === val
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="10"
                  step="0.05"
                  value={lots}
                  onChange={(e) => setLots(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              {/* Leverage Selector */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{t.leverage}</span>
                  <span className="font-mono text-amber-400 font-bold">{leverage}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 50, 100, 500].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`py-1 text-xs font-mono rounded cursor-pointer border ${
                        leverage === lev
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* TP & SL Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.stopLoss}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#13151f] border border-zinc-800 text-white rounded-lg p-2 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.takeProfit}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#13151f] border border-zinc-800 text-white rounded-lg p-2 text-xs font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Margin Requirement Summary */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 mb-4 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>{t.marginLabel}:</span>
                <span className="text-white font-bold">${requiredMargin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{t.freeMarginLabel}:</span>
                <span className="text-emerald-400 font-bold">
                  $
                  {currentUser
                    ? Math.max(0, currentUser.balance - requiredMargin).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-900">
                <span>قاعدة البيانات:</span>
                <span className="text-amber-400 text-[10px]">SQL Transaction Ledger</span>
              </div>
            </div>

            {/* Feedback notification */}
            {execMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  execMessage.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {execMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{execMessage.text}</span>
              </div>
            )}

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleExecuteTrade}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                orderSide === "BUY"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:opacity-95 shadow-rose-500/20"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? isAr
                    ? "جاري إرسال الأمر لمحرك SQL..."
                    : "Routing to SQL engine..."
                  : `${orderSide} ${lots} Lots ${activePair.symbol}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Open Positions & Closed Trades Log */}
      <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-3 mb-4">
          <button
            onClick={() => setActiveBottomTab("positions")}
            className={`flex items-center gap-2 text-sm font-bold pb-2 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "positions"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <span>{t.openPositions}</span>
            <span className="px-2 py-0.2 rounded-full text-xs font-mono bg-zinc-800 text-zinc-200">
              {openPositions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveBottomTab("history")}
            className={`flex items-center gap-2 text-sm font-bold pb-2 transition-all border-b-2 cursor-pointer ${
              activeBottomTab === "history"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <span>{t.closedTrades}</span>
            <span className="px-2 py-0.2 rounded-full text-xs font-mono bg-zinc-800 text-zinc-200">
              {closedPositions.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Open Positions */}
        {activeBottomTab === "positions" && (
          <div className="overflow-x-auto">
            {openPositions.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">
                {t.noOpenPositions}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800/80">
                    <th className="pb-2.5">ID</th>
                    <th className="pb-2.5">{t.symbol}</th>
                    <th className="pb-2.5">{t.type}</th>
                    <th className="pb-2.5">{t.orderVolume}</th>
                    <th className="pb-2.5">{t.entryPrice}</th>
                    <th className="pb-2.5">{t.currentPrice}</th>
                    <th className="pb-2.5">{t.pnl}</th>
                    <th className="pb-2.5 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {openPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 text-zinc-400">{trd.id}</td>
                        <td className="py-3 font-bold text-white">{trd.symbol}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-300">{trd.lots}</td>
                        <td className="py-3 text-zinc-300">
                          {trd.entryPrice >= 100 ? trd.entryPrice.toFixed(2) : trd.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-3 text-zinc-300">
                          {trd.currentPrice >= 100
                            ? trd.currentPrice.toFixed(2)
                            : trd.currentPrice.toFixed(4)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-bold ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleClosePosition(trd)}
                            className="px-3 py-1 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer"
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
              <div className="py-10 text-center text-zinc-500 text-xs">
                {t.noTradesHistory}
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800/80">
                    <th className="pb-2.5">ID</th>
                    <th className="pb-2.5">{t.symbol}</th>
                    <th className="pb-2.5">{t.type}</th>
                    <th className="pb-2.5">{t.orderVolume}</th>
                    <th className="pb-2.5">{t.entryPrice}</th>
                    <th className="pb-2.5">Close Price</th>
                    <th className="pb-2.5">{t.pnl}</th>
                    <th className="pb-2.5">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {closedPositions.map((trd) => {
                    const isProfit = trd.pnl >= 0;
                    return (
                      <tr key={trd.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 text-zinc-400">{trd.id}</td>
                        <td className="py-3 font-bold text-white">{trd.symbol}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trd.type === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {trd.type}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-300">{trd.lots}</td>
                        <td className="py-3 text-zinc-300">
                          {trd.entryPrice >= 100 ? trd.entryPrice.toFixed(2) : trd.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-3 text-zinc-300">
                          {trd.closePrice
                            ? trd.closePrice >= 100
                              ? trd.closePrice.toFixed(2)
                              : trd.closePrice.toFixed(4)
                            : "-"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-bold ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
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
      </div>
    </div>
  );
};
