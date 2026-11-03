import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header, ActiveView } from "./components/Header";
import { TradingTerminal } from "./components/TradingTerminal";
import { AdminDashboard } from "./components/AdminDashboard";
import { LandingSection } from "./components/LandingSection";
import { AuthModal } from "./components/AuthModal";
import { translations, Language } from "./translations";
import { MarketPair } from "./types";
import { Globe, Shield, Sparkles, Building2, AlertTriangle } from "lucide-react";

// Initial Market Instruments Data
const initialMarketPairs: MarketPair[] = [
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    type: "forex",
    price: 1.0945,
    bid: 1.0944,
    ask: 1.0946,
    change24h: 0.18,
    high24h: 1.0975,
    low24h: 1.0921,
    volume24h: "$4.2B",
    spreadPips: 0.2
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    type: "forex",
    price: 1.2721,
    bid: 1.2720,
    ask: 1.2723,
    change24h: -0.09,
    high24h: 1.2760,
    low24h: 1.2690,
    volume24h: "$2.8B",
    spreadPips: 0.3
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    type: "forex",
    price: 155.80,
    bid: 155.78,
    ask: 155.82,
    change24h: 0.35,
    high24h: 156.10,
    low24h: 155.30,
    volume24h: "$3.1B",
    spreadPips: 0.4
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    type: "crypto",
    price: 96450.0,
    bid: 96445.0,
    ask: 96455.0,
    change24h: 1.85,
    high24h: 97800.0,
    low24h: 94900.0,
    volume24h: "$18.5B",
    spreadPips: 1.0
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    type: "crypto",
    price: 3450.25,
    bid: 3449.80,
    ask: 3450.70,
    change24h: -0.72,
    high24h: 3520.0,
    low24h: 3410.0,
    volume24h: "$8.4B",
    spreadPips: 0.9
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    type: "crypto",
    price: 188.40,
    bid: 188.35,
    ask: 188.45,
    change24h: 3.42,
    high24h: 194.20,
    low24h: 181.50,
    volume24h: "$4.1B",
    spreadPips: 0.8
  },
  {
    symbol: "Gold (XAU)",
    name: "Spot Gold / USD",
    type: "commodities",
    price: 2342.1,
    bid: 2341.9,
    ask: 2342.3,
    change24h: -0.15,
    high24h: 2355.0,
    low24h: 2332.0,
    volume24h: "$5.6B",
    spreadPips: 0.4
  },
  {
    symbol: "Crude Oil",
    name: "WTI Crude Oil",
    type: "commodities",
    price: 78.45,
    bid: 78.43,
    ask: 78.47,
    change24h: 1.25,
    high24h: 79.10,
    low24h: 77.80,
    volume24h: "$3.9B",
    spreadPips: 0.4
  }
];

function AppContent() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fast_fx_lang");
      return saved === "en" ? "en" : "ar";
    }
    return "ar";
  });

  const [activeView, setActiveView] = useState<ActiveView>("landing");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USD");
  const [marketPairs, setMarketPairs] = useState<MarketPair[]>(initialMarketPairs);

  const t = translations[lang];

  // Sync document direction and title
  useEffect(() => {
    localStorage.setItem("fast_fx_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  // Real-time market tick jitter for realistic institutional market feed
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPairs((prevPairs) =>
        prevPairs.map((pair) => {
          const deltaRate = (Math.random() - 0.495) * 0.0006;
          const newPrice = pair.price * (1 + deltaRate);
          const spreadHalf = (pair.price >= 100 ? 0.02 : 0.00015);
          return {
            ...pair,
            price: Number(newPrice.toFixed(pair.price >= 100 ? 2 : 4)),
            bid: Number((newPrice - spreadHalf).toFixed(pair.price >= 100 ? 2 : 4)),
            ask: Number((newPrice + spreadHalf).toFixed(pair.price >= 100 ? 2 : 4))
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectPairAndTrade = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveView("trading");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-sans selection:bg-[#00c087] selection:text-black">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        activeView={activeView}
        onViewChange={setActiveView}
        marketPairs={marketPairs}
        onSelectPair={handleSelectPairAndTrade}
      />

      {/* Main Body View */}
      <main className="flex-1">
        {activeView === "landing" && (
          <LandingSection
            lang={lang}
            marketPairs={marketPairs}
            onNavigateToTrading={() => setActiveView("trading")}
            onSelectPairAndTrade={handleSelectPairAndTrade}
          />
        )}

        {activeView === "trading" && (
          <TradingTerminal
            lang={lang}
            marketPairs={marketPairs}
            initialSymbol={selectedSymbol}
          />
        )}

        {activeView === "admin" && (
          <AdminDashboard lang={lang} />
        )}
      </main>

      {/* Auth Modal for Login and Registration */}
      <AuthModal
        lang={lang}
        onLoginSuccess={(isAdminUser) => {
          if (isAdminUser) {
            setActiveView("admin");
          } else {
            setActiveView("trading");
          }
        }}
      />

      {/* Institutional OKX Global Footer */}
      <footer className="mt-24 border-t border-[#1e2329] bg-[#000000] text-xs text-zinc-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#1e2329]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                {/* OKX style geometric mark */}
                <div className="w-5 h-5 bg-white text-black flex items-center justify-center font-black text-[10px] tracking-tighter">
                  FX
                </div>
                <span className="text-base font-black text-white font-mono tracking-tight">FAST FX</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  SQL RELATIONAL
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% POR
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">{t.footerDescription}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">{t.headquartersLabel}</div>
                <div className="text-white font-bold">{t.headquartersCity}</div>
              </div>
              <div className="w-px h-8 bg-[#1e2329] hidden sm:block" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">{t.globalInfraTitle}</div>
                <div className="text-[#00c087] font-bold">EQUINIX LD4 & NY4</div>
              </div>
              <div className="w-px h-8 bg-[#1e2329] hidden sm:block" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">MATCHING CORE</div>
                <div className="text-white font-bold">&lt; 0.003ms ULTRA-FAST</div>
              </div>
            </div>
          </div>

          {/* Legal and Risk Notice */}
          <div className="space-y-3 text-[11px] leading-relaxed text-zinc-500">
            <p>{t.riskWarningText}</p>
            <p>{t.regulatoryText}</p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e2329] text-[10px]">
              <div>© {new Date().getFullYear()} {t.copyrightText}</div>
              <div className="flex items-center gap-3 font-mono text-zinc-400">
                <span>SQL Engine v2.4</span>
                <span>•</span>
                <span>OKX Pro Architecture</span>
                <span>•</span>
                <span>Tier-1 Prime Brokerage</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
