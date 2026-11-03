import React, { useState } from "react";
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
  ChevronDown
} from "lucide-react";
import { MarketPair } from "../types";

export type ActiveView = "landing" | "trading" | "admin";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  marketPairs: MarketPair[];
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  activeView,
  onViewChange,
  marketPairs
}) => {
  const { currentUser, isAdmin, isLoggedIn, openAuthModal, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const t = translations[lang];
  const isAr = lang === "ar";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090d]/95 backdrop-blur-xl border-b border-zinc-800/80">
      {/* Top Real-time Market Ticker Tape */}
      <div className="bg-[#050608] border-b border-zinc-900 py-1.5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 min-w-max text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-amber-500 font-semibold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>FAST FX TICKER</span>
          </div>

          {marketPairs.map((pair) => {
            const isPositive = pair.change24h >= 0;
            return (
              <div
                key={pair.symbol}
                className="flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-900/50 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                onClick={() => onViewChange("trading")}
              >
                <span className="text-zinc-300 font-medium">{pair.symbol}</span>
                <span className="text-white font-bold">
                  {pair.price >= 100 ? pair.price.toFixed(2) : pair.price.toFixed(4)}
                </span>
                <span
                  className={`flex items-center text-[10px] ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 inline mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline mr-0.5" />
                  )}
                  {isPositive ? "+" : ""}
                  {pair.change24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onViewChange("landing")}
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-500/40 p-0.5 bg-black shadow-lg shadow-orange-500/10 group-hover:border-amber-400 transition-colors">
                <img
                  src={logoUrl}
                  alt="Fast Fx Emblem"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors font-mono">
                  FAST FX
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gradient-to-r from-amber-500 to-orange-500 text-black">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                FAST FLOW GROUP LTD
              </div>
            </div>
          </div>

          {/* Nav Tabs - Public tabs only: Home & Trading (Admin tab completely removed from public interface) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#10121a] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => onViewChange("landing")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "landing"
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.navHome}</span>
            </button>

            <button
              onClick={() => onViewChange("trading")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "trading"
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>{t.navTrading}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* Admin Dashboard tab - ONLY visible when authenticated as Admin */}
            {isAdmin && (
              <button
                onClick={() => onViewChange("admin")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "admin"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-orange-500/20 font-bold"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t.navAdmin}</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/30 text-amber-300 rounded font-mono">
                  ADMIN
                </span>
              </button>
            )}
          </nav>

          {/* Right Header Actions: User Profile, Balance, Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <button
              onClick={() => onLanguageChange(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Auth / Profile Area */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#11131c] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-bold text-xs shadow-sm">
                    {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>

                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white max-w-[120px] truncate">
                        {currentUser.name}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono font-semibold">
                          SUPER ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">
                      ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-[#0d0f17] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="p-2 border-b border-zinc-800 mb-2">
                      <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                        <span className="text-zinc-400">{t.balanceLabel}:</span>
                        <span className="text-emerald-400 font-bold">
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
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.navTrading}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onViewChange("admin");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{t.navAdmin}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          onViewChange("landing");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left"
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                >
                  {t.loginBtn}
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-3.5 py-1.5 text-xs font-bold text-black rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  {t.registerBtn}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav Tabs - Public tabs only: Home & Trading (Admin tab hidden unless authenticated) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-900 text-xs">
          <button
            onClick={() => onViewChange("landing")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "landing" ? "text-orange-400 font-bold bg-orange-500/10" : "text-zinc-400"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navHome}</span>
          </button>
          <button
            onClick={() => onViewChange("trading")}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
              activeView === "trading" ? "text-orange-400 font-bold bg-orange-500/10" : "text-zinc-400"
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            <span>{t.navTrading}</span>
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
