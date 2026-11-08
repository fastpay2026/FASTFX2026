import React, { useState, useRef, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
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
  Wallet,
  Layers,
  Database,
  ArrowRight
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
  const profileRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const isAr = lang === "ar";

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
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
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070913]/95 backdrop-blur-md border-b border-indigo-900/30">
      {/* Top Live Institutional Ticker Ribbon */}
      <div className="bg-[#05060e] border-b border-indigo-950/70 py-1 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-5 min-w-max">
            <div className="flex items-center gap-2 text-slate-400 font-semibold text-[10px] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{isAr ? "الأسعار اللحظية" : "TICK FEED"}</span>
            </div>

            {marketPairs.slice(0, 5).map((pair) => {
              const isUp = pair.change24h >= 0;
              return (
                <div
                  key={pair.symbol}
                  onClick={() => handlePairClick(pair.symbol)}
                  className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <span className="text-slate-300 font-bold group-hover:text-white transition-colors">
                    {pair.symbol}
                  </span>
                  <span className="text-slate-100 font-medium tabular-nums">
                    {pair.price >= 100 ? pair.price.toFixed(2) : pair.price.toFixed(4)}
                  </span>
                  <span
                    className={`flex items-center text-[10px] font-semibold tabular-nums ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {pair.change24h.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[10px] text-slate-400">
            <span>EQUINIX LD4 · NY4</span>
            <span aria-hidden="true">·</span>
            <span>0.003ms ULTRA-FAST MATCHING</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">100% AUDITED RESERVES</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Conforms strictly to 3-Zone Top Bar Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Zone (Single Interactive Element with Logo + Wordmark) */}
          <button
            onClick={() => onViewChange("landing")}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <BrandLogo size="md" />
          </button>

          {/* Zone 2: 4–5 Single-Line Concise Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onViewChange("landing")}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeView === "landing"
                  ? "text-amber-400 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t.navMarkets}
            </button>

            <button
              onClick={() => onViewChange("trading")}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === "trading"
                  ? "text-amber-400 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>{t.navTrade}</span>
            </button>

            <button
              onClick={() => {
                onViewChange("landing");
                setTimeout(() => {
                  const el = document.getElementById("proof-of-reserves-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="whitespace-nowrap shrink-0 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? "إثبات الاحتياطيات" : "Proof of Reserves"}
            </button>

            <button
              onClick={() => {
                onViewChange("landing");
                setTimeout(() => {
                  const el = document.getElementById("promotional-campaigns-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="whitespace-nowrap shrink-0 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? "العروض والحملات" : "Campaigns"}
            </button>

            <button
              onClick={() => {
                onViewChange("landing");
                setTimeout(() => {
                  const el = document.getElementById("grand-prix-countdown");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="whitespace-nowrap shrink-0 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? "سباق الـ 15 يوماً" : "15-Day Grand Prix"}
            </button>

            {/* Admin Portal Tab - strictly shown only when logged in as admin */}
            {isAdmin && (
              <button
                onClick={() => onViewChange("admin")}
                className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "admin"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t.navAdmin}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions + Language Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-700/80 hover:text-white hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* User Session or Auth Actions */}
            {isLoggedIn && currentUser ? (
              <div ref={profileRef} className="relative flex items-center gap-2">
                <button
                  onClick={() => onViewChange("trading")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.depositBtn}</span>
                </button>

                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-300" /> : <UserIcon className="w-3.5 h-3.5" />}
                  </div>

                  <div className="hidden sm:block text-left font-mono">
                    <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold tabular-nums">
                      ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0d1424] border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 text-xs font-sans">
                    <div className="p-2 border-b border-slate-800 mb-2">
                      <div className="font-semibold text-white">{currentUser.name}</div>
                      <div className="text-slate-400 text-[11px] truncate font-mono">{currentUser.email}</div>
                      <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                        <span className="text-slate-400">{t.balanceLabel}:</span>
                        <span className="text-emerald-400 font-bold font-mono tabular-nums">
                          ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onViewChange("trading");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <CandlestickChart className="w-3.5 h-3.5 text-sky-400" />
                        <span>{t.navTrading}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onViewChange("admin");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 font-semibold text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left"
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
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logoutBtn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {t.loginBtn}
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg shadow-sm shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  {t.registerBtn}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onViewChange("landing")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "landing" ? "text-sky-400 font-semibold bg-slate-800" : "text-slate-400"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navMarkets}</span>
          </button>
          <button
            onClick={() => onViewChange("trading")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "trading" ? "text-sky-400 font-semibold bg-slate-800" : "text-slate-400"
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            <span>{t.navTrade}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => onViewChange("admin")}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
                activeView === "admin" ? "text-amber-300 font-semibold bg-amber-500/20" : "text-amber-400"
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
