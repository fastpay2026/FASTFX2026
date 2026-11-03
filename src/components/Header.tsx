import React, { useState, useRef, useEffect } from "react";
import logoUrl from "../assets/images/fast_fx_luxury_emblem_1783197785440.jpg";
import { useAuth } from "../context/AuthContext";
import { translations, Language } from "../translations";
import {
  Globe,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  User as UserIcon,
  LogOut,
  CandlestickChart,
  Home,
  Crown,
  ChevronDown,
  Search,
  Wallet,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  Layers
} from "lucide-react";
import { MarketPair } from "../types";

export type ActiveView = "landing" | "trading" | "admin";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  marketPairs: MarketPair[];
  onSelectPair?: (symbol: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  activeView,
  onViewChange,
  marketPairs,
  onSelectPair
}) => {
  const { currentUser, isAdmin, isLoggedIn, openAuthModal, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const isAr = lang === "ar";

  // Filtered search results
  const filteredPairs = marketPairs.filter((p) =>
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePairClick = (symbol: string) => {
    if (onSelectPair) {
      onSelectPair(symbol);
    } else {
      onViewChange("trading");
    }
    setSearchFocused(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000] border-b border-[#1e2329]">
      {/* OKX-Style Top Live Market Marquee Strip */}
      <div className="bg-[#08090b] border-b border-[#1e2329]/90 py-1 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-5 min-w-max text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400 font-bold tracking-wider text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
            <span>MARKETS</span>
          </div>

          {marketPairs.map((pair) => {
            const isUp = pair.change24h >= 0;
            return (
              <div
                key={pair.symbol}
                className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-[#161a22] transition-colors cursor-pointer"
                onClick={() => handlePairClick(pair.symbol)}
              >
                <span className="text-zinc-300 font-bold">{pair.symbol}</span>
                <span className="text-white font-semibold font-tabular">
                  {pair.price >= 100 ? pair.price.toFixed(2) : pair.price.toFixed(4)}
                </span>
                <span
                  className={`flex items-center text-[10px] font-bold ${
                    isUp ? "text-[#00c087]" : "text-[#f6465d]"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3 inline mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline mr-0.5" />
                  )}
                  {isUp ? "+" : ""}
                  {pair.change24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main OKX Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: OKX-Style Geometric Logo & Exchange Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer group select-none"
              onClick={() => onViewChange("landing")}
            >
              {/* OKX Signature Geometric Pixel Grid Logo */}
              <div className="relative w-8 h-8 bg-black border border-white/20 rounded flex items-center justify-center p-1 group-hover:border-white transition-colors">
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                  <div className="bg-white rounded-[1px]" />
                  <div className="bg-[#00c087] rounded-[1px]" />
                  <div className="bg-[#00c087] rounded-[1px]" />
                  <div className="bg-white rounded-[1px]" />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-black tracking-tight text-white font-mono group-hover:text-zinc-200 transition-colors">
                    FAST FX
                  </span>
                  <span className="px-1 py-0.2 text-[8px] font-mono font-bold bg-[#1e2329] text-zinc-300 rounded border border-[#262d38]">
                    EXCHANGE
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono tracking-widest mt-0.5">
                  PRO TRADING
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (OKX style) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => onViewChange("landing")}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  activeView === "landing"
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.navMarkets}
              </button>

              <button
                onClick={() => onViewChange("trading")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  activeView === "trading"
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{t.navTrade}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c087]" />
              </button>

              <button
                onClick={() => onViewChange("trading")}
                className="px-3 py-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                {t.navFutures}
              </button>

              <button
                onClick={() => onViewChange("landing")}
                className="px-3 py-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                {t.navGrow}
              </button>

              <button
                onClick={() => onViewChange("landing")}
                className="px-3 py-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                {t.navWeb3}
              </button>

              {/* Admin Portal Tab - STRICTLY visible only when logged in as admin */}
              {isAdmin && (
                <button
                  onClick={() => onViewChange("admin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                    activeView === "admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-amber-400 hover:bg-amber-500/10"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.navAdmin}</span>
                  <span className="px-1 py-0.2 text-[8px] bg-amber-500/30 text-amber-200 rounded font-mono">
                    SUPER
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Center: OKX Quick Pair Search Input */}
          <div ref={searchRef} className="relative hidden md:block max-w-xs w-full mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#0b0e11] border border-[#1e2329] focus:border-zinc-500 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none transition-colors font-mono"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Search Dropdown Menu */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0b0e11] border border-[#1e2329] rounded-xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto no-scrollbar">
                <div className="text-[10px] text-zinc-500 uppercase px-2 py-1 font-mono">
                  {isAr ? "أدوات التداول الفوري" : "Spot & Multi-Asset Pairs"}
                </div>
                {filteredPairs.length === 0 ? (
                  <div className="text-xs text-zinc-500 p-3 text-center">
                    {isAr ? "لا توجد نتائج مطابقة" : "No instruments found"}
                  </div>
                ) : (
                  filteredPairs.map((p) => (
                    <button
                      key={p.symbol}
                      onClick={() => handlePairClick(p.symbol)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#161a22] transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{p.symbol}</div>
                        <div className="text-[10px] text-zinc-400">{p.name}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs text-white font-bold font-tabular">
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
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Actions, Balance, Language, Login & OKX-Style White Sign-Up Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-zinc-300 bg-[#0b0e11] border border-[#1e2329] hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* If Logged In: OKX Balance and Profile Menu */}
            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewChange("trading")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#161a22] border border-[#222832] text-zinc-200 hover:text-white hover:border-zinc-600 transition-all cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#00c087]" />
                  <span>{t.depositBtn}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#0b0e11] border border-[#1e2329] hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                      {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserIcon className="w-3.5 h-3.5" />}
                    </div>

                    <div className="hidden sm:block text-left font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white max-w-[100px] truncate">
                          {currentUser.name}
                        </span>
                        {isAdmin && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#00c087] font-bold font-tabular">
                        ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-[#0b0e11] border border-[#1e2329] rounded-xl shadow-2xl p-3 z-50 font-mono text-xs"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="p-2 border-b border-[#1e2329] mb-2 font-sans">
                        <div className="text-xs font-bold text-white">{currentUser.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate">
                          {currentUser.email}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs font-mono bg-[#161a22] p-2 rounded-lg border border-[#222832]">
                          <span className="text-zinc-400">{t.balanceLabel}:</span>
                          <span className="text-[#00c087] font-bold font-tabular">
                            ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 font-sans">
                        <button
                          onClick={() => {
                            onViewChange("trading");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-[#161a22] rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <CandlestickChart className="w-3.5 h-3.5 text-[#00c087]" />
                          <span>{t.navTrading}</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              onViewChange("admin");
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t.navAdmin}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            onViewChange("landing");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-[#f6465d] hover:bg-[#f6465d]/10 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t.logoutBtn}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* OKX Iconic High-Contrast Auth Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg bg-[#0b0e11] border border-[#1e2329] hover:border-zinc-700 transition-all cursor-pointer"
                >
                  {t.loginBtn}
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-4 py-1.5 text-xs font-bold text-black rounded-lg bg-white hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                >
                  {t.registerBtn}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Subnav (OKX style) */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#1e2329] text-xs">
          <button
            onClick={() => onViewChange("landing")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "landing" ? "text-white font-bold bg-zinc-900" : "text-zinc-400"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navMarkets}</span>
          </button>
          <button
            onClick={() => onViewChange("trading")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "trading" ? "text-[#00c087] font-bold bg-zinc-900" : "text-zinc-400"
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            <span>{t.navTrade}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => onViewChange("admin")}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
                activeView === "admin" ? "text-amber-300 font-bold bg-amber-500/20" : "text-amber-400"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{t.navAdmin}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
