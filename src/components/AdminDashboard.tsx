import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { sqlDb, SUPER_ADMIN_EMAIL } from "../db/sqlEngine";
import { translations, Language } from "../translations";
import { User, Trade, Subscriber, SqlQueryResult, PlatformSettings } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Mail,
  Terminal,
  Database,
  Sliders,
  Play,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  FileCode,
  Clock,
  Sparkles
} from "lucide-react";

interface AdminDashboardProps {
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const { currentUser, isAdmin, openAuthModal } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  // Navigation Tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<"users" | "supervision" | "sql" | "subscribers" | "risk">("users");

  // State loaded from SQL DB
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(sqlDb.getSettings());

  // Balance edit modal state
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");

  // SQL Console States
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM users ORDER BY balance DESC;");
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [sqlSuccessMsg, setSqlSuccessMsg] = useState<string | null>(null);

  // Search filter for subscribers / users
  const [userSearch, setUserSearch] = useState<string>("");
  const [subSearch, setSubSearch] = useState<string>("");

  // Reload data from SQL DB
  const refreshAll = () => {
    setUsers(sqlDb.getUsers());
    setTrades(sqlDb.getTrades());
    setSubscribers(sqlDb.getSubscribers());
    setSettings(sqlDb.getSettings());
  };

  useEffect(() => {
    refreshAll();
    const unsubscribe = sqlDb.subscribe(() => {
      refreshAll();
    });
    return unsubscribe;
  }, []);

  // Run initial default SQL query so console has immediate preview
  useEffect(() => {
    if (isAdmin && !sqlResult) {
      handleRunSql("SELECT * FROM users ORDER BY balance DESC;");
    }
  }, [isAdmin]);

  // SQL Execution Handler
  const handleRunSql = (queryToRun?: string) => {
    const q = (queryToRun || sqlQuery).trim();
    if (!q) return;

    setIsExecutingSql(true);
    setSqlSuccessMsg(null);

    setTimeout(() => {
      const res = sqlDb.execute(q);
      setSqlResult(res);
      setIsExecutingSql(false);
      refreshAll();
    }, 150);
  };

  // Export .sql dump
  const handleExportSqlDump = () => {
    const dump = sqlDb.exportSqlDump();
    const blob = new Blob([dump], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fast_fx_database_dump_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    setSqlSuccessMsg(isAr ? "تم تصدير ملف SQL بنجاح" : "SQL dump exported successfully");
    setTimeout(() => setSqlSuccessMsg(null), 3500);
  };

  // Reset Database
  const handleResetDb = () => {
    if (window.confirm(isAr ? "هل أنت متأكد من إعادة تعيين قاعدة البيانات لبيانات البدء؟" : "Reset database to initial seed?")) {
      sqlDb.resetDatabase();
      refreshAll();
      handleRunSql("SELECT * FROM users;");
      setSqlSuccessMsg(isAr ? "تمت استعادة حالة قاعدة البيانات الأولية" : "Database restored to default seed");
      setTimeout(() => setSqlSuccessMsg(null), 3500);
    }
  };

  // Balance adjustment submission
  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const newBal = parseFloat(balanceAmount);
    if (isNaN(newBal) || newBal < 0) return;

    sqlDb.updateUserBalance(selectedUserForBalance.id, newBal, balanceNote);
    setSelectedUserForBalance(null);
    setBalanceAmount("");
    setBalanceNote("");
    refreshAll();
  };

  // Security Check: If current user is not h07806480810@gmail.com, render Access Denied Shield
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-[#0e0f17] border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {t.adminAccessDenied}
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {t.adminRestrictedNotice}
          </p>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl max-w-md mx-auto mb-8 font-mono text-xs text-zinc-300">
            <div className="text-zinc-500 mb-1">{isAr ? "الحساب الحالي:" : "Current User:"}</div>
            <div className="text-white font-bold">{currentUser?.email || "غير مسجل (Guest)"}</div>
            <div className="text-zinc-500 mt-2 mb-1">{isAr ? "البريد المصرح به:" : "Required Clearance:"}</div>
            <div className="text-amber-400 font-bold">{SUPER_ADMIN_EMAIL}</div>
          </div>

          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-95 shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "تسجيل الدخول كمدير (اسم المستخدم: admin)" : "Sign In as Admin (username: admin)"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate Metrics from SQL data
  const totalUsersCount = users.length;
  const totalVolume = trades.reduce((acc, t) => acc + (t.amount || 0), 0);
  const openPositionsCount = trades.filter((t) => t.status === "OPEN").length;
  const totalEquity = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const subscribersCount = subscribers.length;

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header with verified status */}
      <div className="bg-[#0b0c13] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {t.adminTitle}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-500 text-black rounded-full">
                ROOT SUPER ADMIN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">{t.adminSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSqlDump}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.exportSqlBtn}</span>
            </button>

            <button
              onClick={handleResetDb}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-rose-400 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDbBtn}</span>
            </button>

            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SQL ENGINE: CONNECTED</span>
            </div>
          </div>
        </div>

        {sqlSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sqlSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 font-mono">
        <div className="bg-[#0e1017] border border-zinc-800/80 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>{t.metricTotalUsers}</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalUsersCount}</div>
          <div className="text-[10px] text-emerald-400 mt-1">100% Active in SQL</div>
        </div>

        <div className="bg-[#0e1017] border border-zinc-800/80 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>{t.metricPlatformVolume}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            ${(totalVolume / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Cumulative notional</div>
        </div>

        <div className="bg-[#0e1017] border border-zinc-800/80 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>{t.metricOpenPositions}</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{openPositionsCount}</div>
          <div className="text-[10px] text-amber-400 mt-1">Live matching fills</div>
        </div>

        <div className="bg-[#0e1017] border border-zinc-800/80 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>{t.metricTotalEquity}</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            ${(totalEquity / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Deposited Balance</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#0e1017] border border-zinc-800/80 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
            <span>{t.metricWaitlistLeads}</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{subscribersCount}</div>
          <div className="text-[10px] text-purple-400 mt-1">15-Day Countdown</div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800 no-scrollbar">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.tabUsers}</span>
        </button>

        <button
          onClick={() => setActiveTab("supervision")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "supervision"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{t.tabSupervision}</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "sql"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{t.tabSqlConsole}</span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>{t.tabSubscribers}</span>
        </button>

        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "risk"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.tabRiskControls}</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === "users" && (
        <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t.tabUsers} ({users.length})</span>
            </h2>

            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={isAr ? "بحث بالبريد أو الاسم..." : "Search user by email..."}
                className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 pl-8 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800 pb-2">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">KYC</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.map((u) => {
                  const isSuperAdmin = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-zinc-400">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-emerald-400">
                        ${u.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            u.kycStatus === "verified"
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-amber-400 bg-amber-500/10"
                          }`}
                        >
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            u.status === "active"
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-rose-400 bg-rose-500/10"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setBalanceAmount(u.balance.toString());
                          }}
                          className="px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                        >
                          {isAr ? "تعديل الرصيد" : "Edit Balance"}
                        </button>

                        {!isSuperAdmin && (
                          <button
                            onClick={() => sqlDb.toggleUserStatus(u.id)}
                            className="px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          >
                            {u.status === "active"
                              ? isAr
                                ? "تجميد"
                                : "Freeze"
                              : isAr
                              ? "تفعيل"
                              : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Trade Supervision */}
      {activeTab === "supervision" && (
        <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>{t.tabSupervision}</span>
            </h2>
            <div className="text-xs font-mono text-zinc-400">
              Total Recorded Orders: <span className="text-white font-bold">{trades.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800 pb-2">
                  <th className="pb-3">Trade ID</th>
                  <th className="pb-3">Trader Email</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Lots</th>
                  <th className="pb-3">Entry</th>
                  <th className="pb-3">PnL</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Supervision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {trades.map((trd) => {
                  const isProfit = trd.pnl >= 0;
                  return (
                    <tr key={trd.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 text-zinc-400">{trd.id}</td>
                      <td className="py-3 text-white font-medium">{trd.userEmail}</td>
                      <td className="py-3 font-bold text-amber-400">{trd.symbol}</td>
                      <td className="py-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                      <td className="py-3 font-bold">
                        <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                          {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            trd.status === "OPEN"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {trd.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {trd.status === "OPEN" ? (
                          <button
                            onClick={() => {
                              sqlDb.closeTrade(trd.id, trd.currentPrice, trd.pnl);
                              refreshAll();
                            }}
                            className="px-2.5 py-1 text-[11px] rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-all cursor-pointer font-bold"
                          >
                            {isAr ? "إغلاق إداري إجباري" : "Force Close"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive SQL Query Console & Schema Explorer */}
      {activeTab === "sql" && (
        <div className="space-y-6">
          <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">{t.sqlTerminalTitle}</h2>
              </div>

              {/* Preset Query Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-zinc-500 text-[11px]">{t.recentQueriesPreset}</span>
                <button
                  type="button"
                  onClick={() => {
                    const q = "SELECT * FROM users ORDER BY balance DESC;";
                    setSqlQuery(q);
                    handleRunSql(q);
                  }}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                >
                  Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "SELECT * FROM trades WHERE status = 'OPEN';";
                    setSqlQuery(q);
                    handleRunSql(q);
                  }}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                >
                  Open Trades
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "SELECT * FROM subscribers;";
                    setSqlQuery(q);
                    handleRunSql(q);
                  }}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                >
                  Subscribers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "SHOW TABLES;";
                    setSqlQuery(q);
                    handleRunSql(q);
                  }}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                >
                  Catalog
                </button>
              </div>
            </div>

            {/* SQL Input Box */}
            <div className="relative font-mono text-xs">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                placeholder={t.sqlQueryPlaceholder}
                className="w-full bg-[#11131c] border border-zinc-700/80 rounded-xl p-3.5 text-amber-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-zinc-400">
                Engine: <span className="text-emerald-400">Postgres / SQLite Syntax Compliant</span>
              </div>
              <button
                type="button"
                onClick={() => handleRunSql()}
                disabled={isExecutingSql}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-95 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isExecutingSql ? "Executing..." : t.runSqlBtn}</span>
              </button>
            </div>

            {/* Query Results Display */}
            {sqlResult && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <div>
                    Rows returned: <span className="text-white font-bold">{sqlResult.rowCount}</span>
                  </div>
                  <div>
                    Execution latency: <span className="text-emerald-400 font-bold">{sqlResult.executionTimeMs} ms</span>
                  </div>
                </div>

                {sqlResult.error ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    {sqlResult.error}
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-80 border border-zinc-800 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-900/80 sticky top-0">
                        <tr className="border-b border-zinc-800">
                          {sqlResult.columns.map((col, idx) => (
                            <th key={idx} className="p-2.5 text-zinc-300 font-bold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-[#0d0f17]">
                        {sqlResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-900/40">
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="p-2.5 text-zinc-300 whitespace-nowrap">
                                {val === null ? <span className="text-zinc-600">NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Relational Schema Card */}
          <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase">{t.schemaViewerTitle}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                <div className="font-bold text-amber-400 mb-1 flex justify-between">
                  <span>users</span>
                  <span className="text-zinc-500">{users.length} rows</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• id (VARCHAR, PK)</div>
                  <div>• email (VARCHAR, UNIQUE)</div>
                  <div>• name (VARCHAR)</div>
                  <div>• role (VARCHAR)</div>
                  <div>• balance (DECIMAL)</div>
                  <div>• equity (DECIMAL)</div>
                  <div>• status (VARCHAR)</div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                <div className="font-bold text-amber-400 mb-1 flex justify-between">
                  <span>trades</span>
                  <span className="text-zinc-500">{trades.length} rows</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• id (VARCHAR, PK)</div>
                  <div>• user_id (FK - users.id)</div>
                  <div>• symbol (VARCHAR)</div>
                  <div>• type (BUY/SELL)</div>
                  <div>• lots (DECIMAL)</div>
                  <div>• entry_price (DECIMAL)</div>
                  <div>• pnl (DECIMAL)</div>
                  <div>• status (OPEN/CLOSED)</div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                <div className="font-bold text-amber-400 mb-1 flex justify-between">
                  <span>subscribers</span>
                  <span className="text-zinc-500">{subscribers.length} rows</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• id (VARCHAR, PK)</div>
                  <div>• email (VARCHAR, UNIQUE)</div>
                  <div>• created_at (TIMESTAMP)</div>
                  <div>• source (VARCHAR)</div>
                  <div>• status (VARCHAR)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Launch Waitlist Subscribers */}
      {activeTab === "subscribers" && (
        <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>مشتركو العد التنازلي لإطلاق Fast FX ({subscribers.length})</span>
            </h2>

            <div className="relative">
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder={isAr ? "بحث بالبريد..." : "Search subscriber email..."}
                className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 pl-8 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800 pb-2">
                  <th className="pb-3">Subscriber ID</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Source Channel</th>
                  <th className="pb-3">Registered At</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 text-zinc-400">{s.id}</td>
                    <td className="py-3 font-bold text-white">{s.email}</td>
                    <td className="py-3 text-zinc-400">{s.source}</td>
                    <td className="py-3 text-zinc-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Risk & Market Controls */}
      {activeTab === "risk" && (
        <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">{t.tabRiskControls}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">قاطع الدائرة (Global Circuit Breaker)</div>
                  <div className="text-xs text-zinc-400">إيقاف مؤقت لكافة عمليات التداول في حالة تقلبات السوق العنيفة</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sqlDb.updateSettings({ tradingHalted: !settings.tradingHalted });
                    refreshAll();
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    settings.tradingHalted
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {settings.tradingHalted ? (
                    <span className="text-xs font-bold font-mono">HALTED</span>
                  ) : (
                    <span className="text-xs font-bold font-mono">ACTIVE</span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
              <div className="text-sm font-bold text-white">الحد الأقصى للرافعة المالية (Max Leverage Cap)</div>
              <div className="text-xs text-zinc-400">تحديد سقف الرافعة المتاحة للمتداولين عبر المنصة</div>
              <div className="flex items-center gap-2">
                {[100, 200, 500].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => {
                      sqlDb.updateSettings({ maxLeverage: lev });
                      refreshAll();
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border cursor-pointer ${
                      settings.maxLeverage === lev
                        ? "bg-amber-500 text-black border-amber-500"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f111a] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isAr ? "تعديل رصيد الحساب المالي" : "Adjust Account Balance"}
            </h3>
            <p className="text-xs text-zinc-400">
              {selectedUserForBalance.name} ({selectedUserForBalance.email})
            </p>

            <form onSubmit={handleUpdateBalance} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{isAr ? "الرصيد الجديد ($)" : "New Balance ($)"}</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">{isAr ? "ملاحظة التعديل" : "Audit Note"}</label>
                <input
                  type="text"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder={isAr ? "مثال: إيداع بنكي معتمد" : "e.g. Bank deposit approved"}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="px-4 py-2 text-xs rounded-xl text-zinc-400 hover:text-white"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 text-black rounded-xl hover:opacity-95"
                >
                  {isAr ? "تأكيد التحديث" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
