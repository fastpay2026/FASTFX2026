import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { sqlDb, SUPER_ADMIN_EMAIL } from "../db/sqlEngine";
import { translations, Language } from "../translations";
import {
  User,
  Trade,
  Subscriber,
  SqlQueryResult,
  PlatformSettings,
  FundRequest,
  ManagedMarketPair,
  PlatformBroadcast,
  AuditLog
} from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  TrendingUp,
  TrendingDown,
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
  Sparkles,
  ArrowRight,
  ChevronRight,
  Wallet,
  Building2,
  AlertCircle,
  FileText,
  BadgeCheck,
  XCircle,
  Radio,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight,
  Snowflake,
  Unlock,
  Send,
  Check,
  MinusCircle,
  HelpCircle
} from "lucide-react";

interface AdminDashboardProps {
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const { currentUser, isAdmin, openAuthModal } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  // Navigation Tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<
    "users" | "funds" | "kyc" | "markets" | "risk" | "sql" | "audit" | "subscribers"
  >("users");

  // State loaded from SQL DB
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [marketInstruments, setMarketInstruments] = useState<ManagedMarketPair[]>([]);
  const [broadcasts, setBroadcasts] = useState<PlatformBroadcast[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(sqlDb.getSettings());

  // Search & Filters
  const [userSearch, setUserSearch] = useState<string>("");
  const [fundFilter, setFundFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [fundTypeFilter, setFundTypeFilter] = useState<"ALL" | "WITHDRAWAL" | "DEPOSIT">("ALL");
  const [auditFilter, setAuditFilter] = useState<string>("ALL");
  const [subSearch, setSubSearch] = useState<string>("");

  // 1. Add balance modal state
  const [selectedUserForAddBalance, setSelectedUserForAddBalance] = useState<User | null>(null);
  const [addBalanceAmount, setAddBalanceAmount] = useState<string>("1000");
  const [addBalanceNote, setAddBalanceNote] = useState<string>("إيداع إداري مباشر");

  // 2. Freeze user modal state
  const [selectedUserForFreeze, setSelectedUserForFreeze] = useState<User | null>(null);
  const [freezeReasonInput, setFreezeReasonInput] = useState<string>("فحص أمني وتدقيق الامتثال المالي");

  // 3. Transfer Balance modal state
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferSourceUserId, setTransferSourceUserId] = useState<string>("");
  const [transferTargetUserId, setTransferTargetUserId] = useState<string>("");
  const [transferAmountInput, setTransferAmountInput] = useState<string>("");
  const [transferNoteInput, setTransferNoteInput] = useState<string>("");

  // 4. Reject Withdrawal modal state
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<FundRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>("عدم استيفاء شروط التحقق والامتثال");

  // 5. Create Withdrawal request on behalf of client modal state
  const [showCreateWithdrawalModal, setShowCreateWithdrawalModal] = useState<boolean>(false);
  const [newWithdrawalUserId, setNewWithdrawalUserId] = useState<string>("");
  const [newWithdrawalAmount, setNewWithdrawalAmount] = useState<string>("1000");
  const [newWithdrawalMethod, setNewWithdrawalMethod] = useState<FundRequest["paymentMethod"]>("CRYPTO_USDT");
  const [newWithdrawalDestination, setNewWithdrawalDestination] = useState<string>("");
  const [newWithdrawalNote, setNewWithdrawalNote] = useState<string>("");

  // Balance edit modal state
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");

  // KYC review modal state
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<User | null>(null);
  const [kycStatusInput, setKycStatusInput] = useState<User["kycStatus"]>("verified");
  const [kycTierInput, setKycTierInput] = useState<NonNullable<User["kycTier"]>>("TIER_2_INSTITUTIONAL");
  const [kycNotesInput, setKycNotesInput] = useState<string>("");

  // New Market Instrument modal state
  const [showAddPairModal, setShowAddPairModal] = useState<boolean>(false);
  const [newPairSymbol, setNewPairSymbol] = useState<string>("");
  const [newPairName, setNewPairName] = useState<string>("");
  const [newPairType, setNewPairType] = useState<ManagedMarketPair["type"]>("forex");
  const [newPairPrice, setNewPairPrice] = useState<string>("100.00");
  const [newPairSpread, setNewPairSpread] = useState<string>("0.4");
  const [newPairLeverage, setNewPairLeverage] = useState<number>(200);

  // New Broadcast modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [bcTitle, setBcTitle] = useState<string>("");
  const [bcMessage, setBcMessage] = useState<string>("");
  const [bcSeverity, setBcSeverity] = useState<PlatformBroadcast["severity"]>("info");

  // SQL Console States
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM users ORDER BY balance DESC;");
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Reload data from SQL DB
  const refreshAll = () => {
    setUsers(sqlDb.getUsers());
    setTrades(sqlDb.getTrades());
    setFundRequests(sqlDb.getFundRequests());
    setMarketInstruments(sqlDb.getMarketInstruments());
    setBroadcasts(sqlDb.getBroadcasts());
    setAuditLogs(sqlDb.getAuditLogs());
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

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setStatusFeedback({ text, type });
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  // SQL Execution Handler
  const handleRunSql = (queryToRun?: string) => {
    const q = (queryToRun || sqlQuery).trim();
    if (!q) return;

    setIsExecutingSql(true);
    setStatusFeedback(null);

    setTimeout(() => {
      const res = sqlDb.execute(q);
      setSqlResult(res);
      setIsExecutingSql(false);
      refreshAll();
    }, 120);
  };

  // Export .sql dump
  const handleExportSqlDump = () => {
    const dump = sqlDb.exportSqlDump();
    const blob = new Blob([dump], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fast_fx_institutional_dump_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(isAr ? "تم تصدير ملف قاعدة بيانات SQL بنجاح" : "SQL database dump exported successfully");
  };

  // Reset Database
  const handleResetDb = () => {
    if (
      window.confirm(
        isAr
          ? "تحذير: هل أنت متأكد من إعادة تعيين قاعدة البيانات لبيانات البدء الأصلية؟"
          : "Warning: Reset entire database to initial institutional seed?"
      )
    ) {
      sqlDb.resetDatabase();
      refreshAll();
      handleRunSql("SELECT * FROM users;");
      showNotification(isAr ? "تمت استعادة حالة قاعدة البيانات الأولية" : "Database restored to default seed state");
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
    showNotification(isAr ? "تم تعديل رصيد المتداول بنجاح وتسجيل المعاملة" : "Trader balance adjusted and transaction committed");
  };

  // 1. Add balance to user handler
  const handleAddBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAddBalance) return;
    const amt = parseFloat(addBalanceAmount);
    if (isNaN(amt) || amt <= 0) {
      showNotification(isAr ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount greater than 0", "error");
      return;
    }

    const res = sqlDb.addBalanceToUser(selectedUserForAddBalance.id, amt, addBalanceNote);
    if (res.success) {
      showNotification(
        isAr
          ? `تمت إضافة $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} بنجاح إلى حساب ${selectedUserForAddBalance.name}`
          : `Successfully credited $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${selectedUserForAddBalance.name}`
      );
      setSelectedUserForAddBalance(null);
      setAddBalanceAmount("1000");
      refreshAll();
    } else {
      showNotification(res.error || "Error adding balance", "error");
    }
  };

  // 2. Freeze user account handler
  const handleFreezeUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForFreeze) return;
    const res = sqlDb.freezeUser(selectedUserForFreeze.id, freezeReasonInput);
    if (res.success) {
      showNotification(
        isAr
          ? `تم تجميد حساب العميل ${selectedUserForFreeze.name} بنجاح وحظر التداول والسحب`
          : `Account ${selectedUserForFreeze.name} frozen successfully (trading and withdrawals halted)`
      );
      setSelectedUserForFreeze(null);
      refreshAll();
    } else {
      showNotification(res.error || "Error freezing user", "error");
    }
  };

  // Unfreeze user account handler
  const handleUnfreezeUser = (u: User) => {
    const res = sqlDb.unfreezeUser(u.id);
    if (res.success) {
      showNotification(
        isAr
          ? `تم إلغاء تجميد حساب العميل ${u.name} وتفعيله بالكامل`
          : `Account ${u.name} unfrozen and fully restored`
      );
      refreshAll();
    } else {
      showNotification(res.error || "Error unfreezing user", "error");
    }
  };

  // 3. Client-to-client transfer handler
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmountInput);
    if (isNaN(amt) || amt <= 0) {
      showNotification(isAr ? "يرجى إدخال مبلغ تحويل صحيح أكبر من الصفر" : "Please enter a valid transfer amount", "error");
      return;
    }
    const res = sqlDb.transferBalance(transferSourceUserId, transferTargetUserId, amt, transferNoteInput);
    if (res.success) {
      const sourceUser = users.find((u) => u.id === transferSourceUserId);
      const targetUser = users.find((u) => u.id === transferTargetUserId);
      showNotification(
        isAr
          ? `تم تحويل $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} بنجاح من ${sourceUser?.name || "المرسل"} إلى ${targetUser?.name || "المستلم"}`
          : `Successfully transferred $${amt.toLocaleString()} from ${sourceUser?.name} to ${targetUser?.name}`
      );
      setShowTransferModal(false);
      setTransferAmountInput("");
      setTransferNoteInput("");
      refreshAll();
    } else {
      showNotification(res.error || "Error during transfer", "error");
    }
  };

  // 4. Approve fund request (Deposit or Withdrawal)
  const handleApproveFundRequest = (req: FundRequest) => {
    const res = sqlDb.approveFundRequest(req.id);
    if (res.success) {
      showNotification(
        isAr
          ? `تمت الموافقة بنجاح على طلب ${req.type === "WITHDRAWAL" ? "سحب الأموال" : "الإيداع"} بمبلغ $${req.amount.toLocaleString()} للعميل ${req.userName}`
          : `Approved ${req.type} request of $${req.amount.toLocaleString()} for ${req.userName}`
      );
      refreshAll();
    } else {
      showNotification(res.error || "Error approving request", "error");
    }
  };

  // Reject fund request (Refunds held funds if withdrawal)
  const handleRejectFundRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReject) return;
    const res = sqlDb.rejectFundRequest(selectedRequestForReject.id, rejectReasonInput);
    if (res.success) {
      showNotification(
        isAr
          ? `تم رفض طلب السحب وإعادة المبلغ المحجوز ($${selectedRequestForReject.amount.toLocaleString()}) إلى رصيد العميل`
          : `Rejected withdrawal request and refunded $${selectedRequestForReject.amount.toLocaleString()} to client balance`
      );
      setSelectedRequestForReject(null);
      refreshAll();
    } else {
      showNotification(res.error || "Error rejecting request", "error");
    }
  };

  // 5. Create withdrawal request for a client
  const handleCreateWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWithdrawalUserId) {
      showNotification(isAr ? "يرجى اختيار العميل المطلوب سحب الرصيد له" : "Please select target client", "error");
      return;
    }
    const amt = parseFloat(newWithdrawalAmount);
    if (isNaN(amt) || amt <= 0) {
      showNotification(isAr ? "يرجى إدخال مبلغ سحب صحيح" : "Invalid withdrawal amount", "error");
      return;
    }

    const res = sqlDb.requestWithdrawal(
      newWithdrawalUserId,
      amt,
      newWithdrawalMethod,
      newWithdrawalDestination || "USDT-TRC20-0xAutoAdminGeneratedRef",
      newWithdrawalNote || "طلب سحب مباشر من لوحة الإدارة"
    );
    if (res.success) {
      showNotification(
        isAr
          ? `تم إنشاء طلب سحب بمبلغ $${amt.toLocaleString()} بنجاح وحجز الرصيد قيد المراجعة`
          : `Withdrawal request of $${amt.toLocaleString()} created and placed in pending queue`
      );
      setShowCreateWithdrawalModal(false);
      setNewWithdrawalAmount("1000");
      setNewWithdrawalDestination("");
      setNewWithdrawalNote("");
      refreshAll();
    } else {
      showNotification(res.error || "Failed to create withdrawal", "error");
    }
  };

  // KYC review submission
  const handleSaveKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForKyc) return;

    sqlDb.updateUserKyc(selectedUserForKyc.id, kycStatusInput, kycNotesInput, kycTierInput);
    setSelectedUserForKyc(null);
    refreshAll();
    showNotification(isAr ? "تم تحديث مستوى التوثيق والامتثال KYC للمتداول" : "KYC compliance tier and status updated successfully");
  };

  // Add Market Instrument submission
  const handleAddMarketPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPairSymbol.trim() || !newPairName.trim()) return;

    const price = parseFloat(newPairPrice) || 1.0;
    const spread = parseFloat(newPairSpread) || 0.4;

    sqlDb.addMarketInstrument({
      symbol: newPairSymbol.trim().toUpperCase(),
      name: newPairName.trim(),
      type: newPairType,
      price,
      bid: Number((price - spread * 0.0001).toFixed(4)),
      ask: Number((price + spread * 0.0001).toFixed(4)),
      change24h: 0.0,
      high24h: Number((price * 1.01).toFixed(4)),
      low24h: Number((price * 0.99).toFixed(4)),
      volume24h: "$1.0M",
      spreadPips: spread,
      minLots: 0.01,
      maxLots: 100.0,
      maxLeverage: newPairLeverage,
      tradingEnabled: true
    });

    setShowAddPairModal(false);
    setNewPairSymbol("");
    setNewPairName("");
    refreshAll();
    showNotification(isAr ? "تم إدراج زوج التداول الجديد بنجاح في محرك المطابقة" : "New market instrument added and deployed to matching engine");
  };

  // Add Broadcast submission
  const handleAddBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;

    sqlDb.createBroadcast(bcTitle.trim(), bcMessage.trim(), bcSeverity);
    setShowBroadcastModal(false);
    setBcTitle("");
    setBcMessage("");
    refreshAll();
    showNotification(isAr ? "تم نشر الإشعار العام عبر المنصة" : "Broadcast announcement published platform-wide");
  };

  // Risk summary metrics
  const riskSummary = useMemo(() => sqlDb.getRiskSummary(), [trades, users]);

  // Security Gate
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 font-sans">
        <div className="bg-[#0c1322] border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {t.adminAccessDenied}
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {t.adminRestrictedNotice}
          </p>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto mb-8 font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-1">{isAr ? "الحساب الحالي:" : "Current User:"}</div>
            <div className="text-white font-bold">{currentUser?.email || "غير مسجل (Guest)"}</div>
            <div className="text-slate-500 mt-2 mb-1">{isAr ? "البريد المصرح به:" : "Required Clearance:"}</div>
            <div className="text-sky-400 font-bold">{SUPER_ADMIN_EMAIL}</div>
          </div>

          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95 shadow-xl shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "تسجيل الدخول بحساب المدير" : "Sign In as Admin"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFundRequests = fundRequests.filter((r) => {
    if (fundTypeFilter !== "ALL" && r.type !== fundTypeFilter) return false;
    if (fundFilter !== "ALL" && r.status !== fundFilter) return false;
    return true;
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (auditFilter === "ALL") return true;
    return l.action.includes(auditFilter);
  });

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subSearch.toLowerCase())
  );

  const pendingFundsCount = fundRequests.filter((r) => r.status === "PENDING").length;
  const pendingWithdrawalsCount = fundRequests.filter((r) => r.type === "WITHDRAWAL" && r.status === "PENDING").length;
  const pendingDepositsCount = fundRequests.filter((r) => r.type === "DEPOSIT" && r.status === "PENDING").length;
  const pendingKycCount = users.filter((u) => u.kycStatus === "pending").length;
  const frozenUsersCount = users.filter((u) => u.status === "frozen").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Root Admin Header with Real-Time SQL Status */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                    {t.adminTitle}
                  </h1>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  CLEARANCE: {SUPER_ADMIN_EMAIL} · EQUINIX LD4 CORE
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Export, Reset, Live SQL indicator) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSqlDump}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.exportSqlBtn}</span>
            </button>

            <button
              onClick={handleResetDb}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDbBtn}</span>
            </button>

            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SQL RELATIONAL ENGINE: ONLINE</span>
            </div>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {statusFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 font-mono animate-in fade-in ${
              statusFeedback.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            {statusFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{statusFeedback.text}</span>
          </div>
        )}

        {/* 2. High-Density Executive Metrics Strip (6 Columns) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{t.metricTotalUsers}</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">{users.length}</div>
            <div className="text-[10px] font-mono mt-0.5">
              {frozenUsersCount > 0 ? (
                <span className="text-cyan-400 font-semibold">{isAr ? `${frozenUsersCount} حسابات مجمدة 🔒` : `${frozenUsersCount} Frozen`}</span>
              ) : (
                <span className="text-emerald-400">100% Active</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{t.metricTotalEquity}</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              ${users.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-sky-400 font-mono mt-0.5">Audited 1:1</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{t.metricOpenPositions}</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {trades.filter((t) => t.status === "OPEN").length}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Net Exp: ${(riskSummary.netExposure / 1000).toFixed(0)}k
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? "طلبات سحب الأموال" : "Pending Withdrawals"}</div>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums mt-0.5 flex items-center gap-1.5">
              <span>{pendingWithdrawalsCount}</span>
              {pendingWithdrawalsCount > 0 && (
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  {isAr ? "بانتظار القرار" : "Action"}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {pendingDepositsCount > 0 ? (isAr ? `${pendingDepositsCount} إيداعات قيد المراجعة` : `${pendingDepositsCount} Deposits`) : (isAr ? "الخزينة مطابقة" : "Treasury Synced")}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? "توثيقات KYC المعلقة" : "Pending KYC"}</div>
            <div className="text-xl font-bold text-sky-400 font-mono tabular-nums mt-0.5">
              {pendingKycCount}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Identity Verification</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? "مشتركو السباق (15 يوم)" : "Grand Prix Leads"}</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
              {subscribers.length}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">VIP Priority List</div>
          </div>
        </div>
      </div>

      {/* 3. Primary Segmented Navigation Bar (8 Comprehensive Modules) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0c1322] rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "users" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>{t.tabUsers}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("funds")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "funds" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? "طلبات الإيداع والسحب" : "Cashier & Treasury"}</span>
          {pendingFundsCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              {pendingFundsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "kyc" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <BadgeCheck className="w-4 h-4 text-sky-400" />
          <span>{isAr ? "التوثيق والامتثال KYC" : "KYC & Compliance"}</span>
          {pendingKycCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("markets")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "markets" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>{isAr ? "إدارة الأزواج والأسعار" : "Market Pairs & Liquidity"}</span>
        </button>

        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "risk" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{isAr ? "إدارة المخاطر والصفقات" : "Risk & Exposure"}</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "sql" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>{t.tabSqlConsole}</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "audit" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>{isAr ? "سجل الأمان والإعلانات" : "Security & Broadcasts"}</span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "subscribers" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4 text-slate-400" />
          <span>{t.tabSubscribers}</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}

      {/* --- TAB 1: USERS MANAGEMENT --- */}
      {activeTab === "users" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{t.tabUsers}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {users.length} {isAr ? "حساب" : "Accounts"}
                </span>
                {frozenUsersCount > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {frozenUsersCount} {isAr ? "حسابات مجمدة 🔒" : "Frozen"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? "إدارة شاملة: إضافة رصيد، تجميد/تفعيل الحساب، تحويل الرصيد بين العملاء وتعديل الصلاحيات"
                  : "Complete management: add balance, freeze/unfreeze accounts, transfer between clients, and adjust roles"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setTransferSourceUserId(users[0]?.id || "");
                  setTransferTargetUserId(users[1]?.id || "");
                  setTransferAmountInput("");
                  setTransferNoteInput("");
                  setShowTransferModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:opacity-90 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isAr ? "تحويل رصيد بين العملاء" : "Transfer Between Clients"}</span>
              </button>

              <div className="relative max-w-xs w-full sm:w-60">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={isAr ? "ابحث بالاسم أو البريد..." : "Search user or email..."}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3">{isAr ? "المتداول / الحساب" : "User / Account"}</th>
                  <th className="pb-3">{isAr ? "الدولة" : "Country"}</th>
                  <th className="pb-3">{isAr ? "الرصيد المتاح" : "Balance"}</th>
                  <th className="pb-3">{isAr ? "حقوق الملكية" : "Equity"}</th>
                  <th className="pb-3">{isAr ? "حالة KYC" : "KYC Tier"}</th>
                  <th className="pb-3">{isAr ? "الدور" : "Role"}</th>
                  <th className="pb-3">{isAr ? "الحالة" : "Status"}</th>
                  <th className="pb-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isSuperAdmin = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                  const isFrozen = u.status === "frozen";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isFrozen ? "bg-cyan-950/15 border-l-2 border-cyan-500" : ""
                      }`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-white font-sans flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isFrozen && (
                                <span className="inline-flex items-center text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/30">
                                  <Lock className="w-2.5 h-2.5 mr-0.5 inline" />
                                  {isAr ? "مُجمّد" : "FROZEN"}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-300 font-sans">{u.country || "Global"}</td>

                      <td className="py-3 font-bold text-amber-400 tabular-nums">
                        ${u.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 text-emerald-400 font-bold tabular-nums">
                        ${u.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-block font-sans text-[11px] font-semibold ${
                            u.kycStatus === "verified"
                              ? "text-emerald-400"
                              : u.kycStatus === "pending"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {u.kycStatus.toUpperCase()} {u.kycTier ? `(${u.kycTier.replace("TIER_", "T")})` : ""}
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            u.role === "admin" ? "text-amber-400" : "text-slate-300"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3">
                        {isFrozen ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <Snowflake className="w-3 h-3 text-cyan-400" />
                            <span>{isAr ? "مُجمّد" : "FROZEN"}</span>
                          </span>
                        ) : u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{isAr ? "نشط" : "ACTIVE"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>{isAr ? "موقوف" : "SUSPENDED"}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. Add Balance Action */}
                          <button
                            onClick={() => {
                              setSelectedUserForAddBalance(u);
                              setAddBalanceAmount("1000");
                              setAddBalanceNote("إيداع إداري مباشر");
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                            title={isAr ? "إضافة رصيد لهذا العميل" : "Add Balance to Client"}
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>{isAr ? "+ إضافة رصيد" : "+ Add $"}</span>
                          </button>

                          {/* 2. Transfer From Client Action */}
                          <button
                            onClick={() => {
                              setTransferSourceUserId(u.id);
                              const other = users.find((otherU) => otherU.id !== u.id);
                              setTransferTargetUserId(other ? other.id : "");
                              setTransferAmountInput("");
                              setTransferNoteInput("");
                              setShowTransferModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 text-sky-400 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                            title={isAr ? "تحويل رصيد من هذا العميل إلى عميل آخر" : "Transfer Balance to Another Client"}
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>{isAr ? "تحويل" : "Transfer"}</span>
                          </button>

                          {/* 3. Freeze / Unfreeze Action */}
                          {!isSuperAdmin && (
                            <>
                              {isFrozen ? (
                                <button
                                  onClick={() => handleUnfreezeUser(u)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                  title={isAr ? "إلغاء تجميد الحساب وإعادة تفعيله" : "Unfreeze and reactivate account"}
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>{isAr ? "إلغاء التجميد" : "Unfreeze"}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUserForFreeze(u);
                                    setFreezeReasonInput("فحص أمني وتدقيق الامتثال المالي");
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                  title={isAr ? "تجميد حساب العميل وحظر فتح الصفقات والسحب" : "Freeze account to block trading & withdrawals"}
                                >
                                  <Snowflake className="w-3 h-3" />
                                  <span>{isAr ? "تجميد الحساب" : "Freeze"}</span>
                                </button>
                              )}

                              {/* Direct Override Modal button */}
                              <button
                                onClick={() => {
                                  setSelectedUserForBalance(u);
                                  setBalanceAmount(u.balance.toString());
                                  setBalanceNote("");
                                }}
                                className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                                title={isAr ? "تعديل الرصيد يدوياً" : "Set exact balance"}
                              >
                                {isAr ? "تعديل" : "Edit"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CASHIER & TREASURY (FUND REQUESTS & 4. WITHDRAWALS APPROVAL/REJECTION) --- */}
      {activeTab === "funds" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {isAr ? "خزينة المنصة وعمليات سحب وإيداع الأموال" : "Treasury, Deposits & Client Withdrawals"}
                </h2>
                {pendingWithdrawalsCount > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                    {pendingWithdrawalsCount} {isAr ? "طلبات سحب معلقة" : "Pending Withdrawals"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? "معالجة فورية لعمليات سحب الأرباح للعملاء (موافقة أو رفض مع استرجاع الرصيد)، وإدارة الحوالات والودائع"
                  : "Instant processing of client withdrawals (approve or reject with automatic refund), plus deposit matching"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setNewWithdrawalUserId(users[0]?.id || "");
                  setNewWithdrawalAmount("1000");
                  setNewWithdrawalMethod("CRYPTO_USDT");
                  setNewWithdrawalDestination("");
                  setNewWithdrawalNote("");
                  setShowCreateWithdrawalModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{isAr ? "+ إنشاء طلب سحب لعميل" : "+ New Client Withdrawal"}</span>
              </button>
            </div>
          </div>

          {/* Sub-Filters: Type Filter + Status Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            {/* 1. Transaction Type Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-sans text-[11px] mr-1">{isAr ? "نوع العملية:" : "Type:"}</span>
              <button
                onClick={() => setFundTypeFilter("ALL")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  fundTypeFilter === "ALL"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {isAr ? "الكل" : "All"} ({fundRequests.length})
              </button>
              <button
                onClick={() => setFundTypeFilter("WITHDRAWAL")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  fundTypeFilter === "WITHDRAWAL"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? "سحب الأموال" : "Withdrawals"}</span>
                {pendingWithdrawalsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFundTypeFilter("DEPOSIT")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  fundTypeFilter === "DEPOSIT"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? "الإيداعات" : "Deposits"}</span>
                {pendingDepositsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold">
                    {pendingDepositsCount}
                  </span>
                )}
              </button>
            </div>

            {/* 2. Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-sans text-[11px] mr-1">{isAr ? "الحالة:" : "Status:"}</span>
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFundFilter(status)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer text-[11px] ${
                    fundFilter === status
                      ? "bg-slate-800 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status === "ALL" && (isAr ? "الكل" : "All")}
                  {status === "PENDING" && (isAr ? "معلقة" : "Pending")}
                  {status === "APPROVED" && (isAr ? "موافق عليها" : "Approved")}
                  {status === "REJECTED" && (isAr ? "مرفوضة" : "Rejected")}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">{isAr ? "العميل" : "Trader"}</th>
                  <th className="pb-3">{isAr ? "النوع" : "Type"}</th>
                  <th className="pb-3">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="pb-3">{isAr ? "طريقة التحويل والوجهة" : "Method & Destination"}</th>
                  <th className="pb-3">{isAr ? "المرجع المالي" : "Reference"}</th>
                  <th className="pb-3">{isAr ? "الحالة" : "Status"}</th>
                  <th className="pb-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFundRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {isAr ? "لا توجد طلبات تطابق الفلتر المحدد" : "No requests match the selected filter"}
                    </td>
                  </tr>
                ) : (
                  filteredFundRequests.map((req) => {
                    const isWithdrawal = req.type === "WITHDRAWAL";
                    const isPending = req.status === "PENDING";

                    return (
                      <tr
                        key={req.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isPending && isWithdrawal ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <td className="py-3 text-slate-400 font-mono text-[11px]">{req.id}</td>

                        <td className="py-3 font-sans">
                          <div className="text-white font-semibold flex items-center gap-1.5">
                            <span>{req.userName}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono">{req.userEmail}</div>
                        </td>

                        <td className="py-3 font-bold">
                          {isWithdrawal ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                              <ArrowDownRight className="w-3 h-3" />
                              <span>{isAr ? "سحب أرباح" : "WITHDRAWAL"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                              <ArrowUpRight className="w-3 h-3" />
                              <span>{isAr ? "إيداع" : "DEPOSIT"}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 font-bold text-white text-sm tabular-nums">
                          ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 text-slate-300">
                          <div className="font-semibold text-white">{req.paymentMethod}</div>
                          {req.destinationAddress ? (
                            <div className="text-slate-400 text-[10px] font-mono truncate max-w-[180px]">
                              {isAr ? "الوجهة: " : "Dest: "}
                              {req.destinationAddress}
                            </div>
                          ) : null}
                        </td>

                        <td className="py-3 text-slate-400 text-[11px] font-mono">{req.txReference}</td>

                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : req.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {req.status === "APPROVED" && <Check className="w-3 h-3" />}
                            {req.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {req.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                            <span>
                              {req.status === "APPROVED"
                                ? (isAr ? "مقبول" : "APPROVED")
                                : req.status === "PENDING"
                                ? (isAr ? "قيد التدقيق" : "PENDING")
                                : (isAr ? "مرفوض" : "REJECTED")}
                            </span>
                          </span>
                        </td>

                        <td className="py-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Approve Button */}
                              <button
                                onClick={() => handleApproveFundRequest(req)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                title={isAr ? "الموافقة على العملية وتحويل المبلغ" : "Approve and authorize transaction"}
                              >
                                <Check className="w-3 h-3" />
                                <span>{isAr ? "موافقة" : "Approve"}</span>
                              </button>

                              {/* 2. Reject Button (Opens Modal with reason + refund) */}
                              <button
                                onClick={() => {
                                  setSelectedRequestForReject(req);
                                  setRejectReasonInput("عدم استيفاء شروط التحقق والامتثال المالي");
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                title={isAr ? "رفض العملية وإعادة الرصيد لحساب العميل" : "Reject and refund client balance"}
                              >
                                <XCircle className="w-3 h-3" />
                                <span>{isAr ? "رفض" : "Reject"}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 font-sans">
                              <div>{req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "-"}</div>
                              {req.reviewNote && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={req.reviewNote}>
                                  {req.reviewNote}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: KYC & COMPLIANCE --- */}
      {activeTab === "kyc" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">{isAr ? "بوابة الامتثال ومكافحة غسيل الأموال (KYC & Compliance)" : "KYC Verification & Regulatory Compliance"}</h2>
              <p className="text-xs text-slate-400">{isAr ? "توثيق هويات المستثمرين، تحديد مستويات السحب، ومراجعة سجلات الامتثال" : "Verify investor credentials, set account tiers, and enforce compliance guidelines"}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3">{isAr ? "المتداول" : "Trader"}</th>
                  <th className="pb-3">{isAr ? "الدولة والهاتف" : "Country & Contact"}</th>
                  <th className="pb-3">{isAr ? "المستوى الحالي" : "Tier"}</th>
                  <th className="pb-3">{isAr ? "حالة التحقق" : "Verification Status"}</th>
                  <th className="pb-3">{isAr ? "ملاحظات الامتثال" : "Compliance Notes"}</th>
                  <th className="pb-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-sans">
                      <div className="text-white font-semibold">{u.name}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 font-sans text-slate-300">
                      <div>{u.country || "International"}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.phone || "Verified Session"}</div>
                    </td>

                    <td className="py-3 font-bold text-sky-400">
                      {u.kycTier ? u.kycTier.replace("TIER_", "") : "TIER_1"}
                    </td>

                    <td className="py-3">
                      <span
                        className={`font-semibold ${
                          u.kycStatus === "verified"
                            ? "text-emerald-400"
                            : u.kycStatus === "pending"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {u.kycStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 text-slate-400 text-[11px] max-w-xs truncate font-sans">
                      {u.kycNotes || "-"}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedUserForKyc(u);
                          setKycStatusInput(u.kycStatus);
                          setKycTierInput(u.kycTier || "TIER_1_STANDARD");
                          setKycNotesInput(u.kycNotes || "");
                        }}
                        className="px-2.5 py-1 text-[11px] rounded bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition-colors cursor-pointer"
                      >
                        {isAr ? "مراجعة KYC" : "Review KYC"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: MARKETS & LIQUIDITY MANAGEMENT --- */}
      {activeTab === "markets" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">{isAr ? "إدارة أزواج العملات والسيولة والفوارق السعرية" : "Market Pairs, Spreads & Feeds"}</h2>
              <p className="text-xs text-slate-400">{isAr ? "التحكم في أسعار الأزواج، الفارق السعري (Pips)، الرافعة القصوى، وتعليق التداول" : "Configure live raw spreads, leverage ceilings, and active trading status"}</p>
            </div>

            <button
              onClick={() => setShowAddPairModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95 shadow-md cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? "إدراج زوج جديد" : "Add Instrument"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3">{isAr ? "الأصل / الرمز" : "Symbol"}</th>
                  <th className="pb-3">{isAr ? "الفئة" : "Type"}</th>
                  <th className="pb-3">{isAr ? "السعر اللحظي" : "Market Price"}</th>
                  <th className="pb-3">{isAr ? "الفارق السعري" : "Spread"}</th>
                  <th className="pb-3">{isAr ? "أقصى رافعة" : "Max Leverage"}</th>
                  <th className="pb-3">{isAr ? "حجم التداول" : "24h Vol"}</th>
                  <th className="pb-3">{isAr ? "حالة التداول" : "Trading State"}</th>
                  <th className="pb-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {marketInstruments.map((m) => (
                  <tr key={m.symbol} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white">
                      <div>{m.symbol}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{m.name}</div>
                    </td>

                    <td className="py-3 uppercase text-slate-300">{m.type}</td>

                    <td className="py-3 font-bold text-white tabular-nums">
                      ${m.price >= 100 ? m.price.toFixed(2) : m.price.toFixed(4)}
                    </td>

                    <td className="py-3 font-bold text-sky-400 tabular-nums">
                      {m.spreadPips} Pips
                    </td>

                    <td className="py-3 text-slate-300 tabular-nums">{m.maxLeverage}x</td>
                    <td className="py-3 text-slate-400 tabular-nums">{m.volume24h}</td>

                    <td className="py-3">
                      <span className={m.tradingEnabled ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {m.tradingEnabled ? (isAr ? "مفعل" : "ACTIVE") : (isAr ? "معطل" : "HALTED")}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          sqlDb.toggleMarketInstrument(m.symbol);
                          refreshAll();
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                          m.tradingEnabled
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {m.tradingEnabled ? (isAr ? "إيقاف التداول" : "Halt") : (isAr ? "تفعيل" : "Resume")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: RISK & EXPOSURE MONITOR --- */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          {/* Risk KPI Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="text-xs text-slate-400">{isAr ? "التعرض الصافي (Net Long / Short)" : "Net Open Exposure"}</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
                ${Math.abs(riskSummary.netExposure).toLocaleString()}
                <span className="text-xs text-slate-400 font-sans ml-2">
                  {riskSummary.netExposure >= 0 ? "NET LONG" : "NET SHORT"}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-400 font-mono">
                <span>Longs: ${(riskSummary.totalLongVolume / 1000).toFixed(0)}k</span>
                <span>Shorts: ${(riskSummary.totalShortVolume / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="text-xs text-slate-400">{isAr ? "أرباح/خسائر الوساطة (B-Book PnL)" : "Broker Dealing Desk PnL"}</div>
              <div
                className={`text-2xl font-black font-mono tabular-nums mt-1 ${
                  riskSummary.brokerBookPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {riskSummary.brokerBookPnL >= 0 ? "+" : ""}${riskSummary.brokerBookPnL.toFixed(2)}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {isAr ? "التحوط المؤسسي متوازن عبر مزودي السيولة Prime" : "Institutional hedging synchronized with Tier-1 LPs"}
              </div>
            </div>

            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="text-xs text-slate-400">{isAr ? "حسابات تحت ضغط الهامش (< 120%)" : "Margin Call Watchlist"}</div>
              <div className="text-2xl font-black text-amber-400 font-mono tabular-nums mt-1">
                {riskSummary.atRiskAccounts.length} {isAr ? "حساب" : "Accounts"}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {isAr ? "نسبة التصفية التلقائية الحالية: 20%" : `Auto-Liquidation Level: ${settings.autoLiquidationLevel}%`}
              </div>
            </div>
          </div>

          {/* Active Live Trades Supervision Table with Force Liquidation */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white">{isAr ? "مراقبة الصفقات المفتوحة اللحظية وإمكانية الإغلاق الإجباري" : "Live Positions & Forced Liquidation Engine"}</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="pb-3">Trade ID</th>
                    <th className="pb-3">{isAr ? "المتداول" : "Trader Email"}</th>
                    <th className="pb-3">{isAr ? "الأصل" : "Symbol"}</th>
                    <th className="pb-3">{isAr ? "النوع" : "Side"}</th>
                    <th className="pb-3">{isAr ? "اللوت" : "Lots"}</th>
                    <th className="pb-3">{isAr ? "سعر الدخول" : "Entry"}</th>
                    <th className="pb-3">{isAr ? "السعر اللحظي" : "Current"}</th>
                    <th className="pb-3">{isAr ? "الهامش" : "Margin"}</th>
                    <th className="pb-3">{isAr ? "الربح/الخسارة" : "PnL"}</th>
                    <th className="pb-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trades.filter((t) => t.status === "OPEN").length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        {isAr ? "لا توجد صفقات مفتوحة حالياً في السوق" : "No open trades in matching engine"}
                      </td>
                    </tr>
                  ) : (
                    trades
                      .filter((t) => t.status === "OPEN")
                      .map((trd) => {
                        const isProfit = trd.pnl >= 0;
                        return (
                          <tr key={trd.id} className="hover:bg-slate-800/40">
                            <td className="py-3 text-slate-400">{trd.id}</td>
                            <td className="py-3 text-slate-200">{trd.userEmail}</td>
                            <td className="py-3 font-bold text-white">{trd.symbol}</td>
                            <td className="py-3">
                              <span className={trd.type === "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                {trd.type}
                              </span>
                            </td>
                            <td className="py-3 tabular-nums">{trd.lots}</td>
                            <td className="py-3 tabular-nums">${trd.entryPrice}</td>
                            <td className="py-3 tabular-nums">${trd.currentPrice}</td>
                            <td className="py-3 tabular-nums">${trd.margin}</td>
                            <td className="py-3">
                              <span className={`font-bold tabular-nums ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                                {isProfit ? "+" : ""}${trd.pnl.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  if (window.confirm(isAr ? `تأكيد إغلاق الصفقة إجبارياً ${trd.id}؟` : `Confirm forced liquidation of trade ${trd.id}?`)) {
                                    sqlDb.forceLiquidatePosition(trd.id, "Admin Intervention Risk Close");
                                    refreshAll();
                                    showNotification(isAr ? "تم إغلاق الصفقة إجبارياً وتحديث رصيد العميل" : "Position liquidated and settled to ledger");
                                  }
                                }}
                                className="px-2.5 py-1 text-[11px] rounded bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                {isAr ? "تصفية إجبارية" : "Liquidate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: INTERACTIVE SQL TERMINAL --- */}
      {activeTab === "sql" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">{t.sqlTerminalTitle}</h2>
            <p className="text-xs text-slate-400">{isAr ? "تنفيذ استعلامات SQL حية مباشرة (SELECT, INSERT, UPDATE, DELETE) على قاعدة البيانات العلاقية" : "Execute raw SQL statements against relational state with execution profiling"}</p>
          </div>

          {/* Quick Query Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">{t.recentQueriesPreset}</span>
            {[
              "SELECT * FROM users ORDER BY balance DESC;",
              "SELECT * FROM trades WHERE status = 'OPEN';",
              "SELECT * FROM fund_requests WHERE status = 'PENDING';",
              "SELECT * FROM market_instruments WHERE trading_enabled = true;",
              "SELECT * FROM audit_logs LIMIT 10;"
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSqlQuery(preset);
                  handleRunSql(preset);
                }}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-sky-400 transition-colors cursor-pointer text-[11px]"
              >
                {preset.split("WHERE")[0].split("ORDER")[0]}...
              </button>
            ))}
          </div>

          {/* SQL Input Area */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full bg-[#070b14] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-emerald-300 focus:outline-none focus:border-sky-400"
                placeholder={t.sqlQueryPlaceholder}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleRunSql()}
                disabled={isExecutingSql}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition-all cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isExecutingSql ? "Executing SQL..." : t.runSqlBtn}</span>
              </button>

              {sqlResult && (
                <div className="text-xs font-mono text-slate-400">
                  Executed in <span className="text-sky-400 font-bold tabular-nums">{sqlResult.executionTimeMs}ms</span> ·{" "}
                  <span className="text-emerald-400 font-bold tabular-nums">{sqlResult.rowCount} rows</span>
                </div>
              )}
            </div>
          </div>

          {/* SQL Output Results Table */}
          {sqlResult && (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#070b14]">
              {sqlResult.error ? (
                <div className="p-4 text-xs font-mono text-rose-400 bg-rose-500/10 border-b border-rose-500/30">
                  Error: {sqlResult.error}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 no-scrollbar">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                      <tr>
                        {sqlResult.columns.map((col, idx) => (
                          <th key={idx} className="p-3 text-slate-300 font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sqlResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-200">
                              {val === null ? <span className="text-slate-600">NULL</span> : String(val)}
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
      )}

      {/* --- TAB 7: SECURITY AUDIT & BROADCASTS --- */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Platform Broadcasts Manager */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{isAr ? "مركز الإشعارات والبث المالي العام" : "Platform Broadcasts & Announcements"}</h2>
                <p className="text-xs text-slate-400">{isAr ? "بث تنبيهات الصيانة أو سرعة الاستجابة أو تحديثات السيولة لجميع المتداولين" : "Publish real-time system alerts and maintenance announcements"}</p>
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95 shadow-md cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? "إنشاء إشعار جديد" : "Create Broadcast"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-sans text-sm">{b.title}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        b.severity === "urgent"
                          ? "bg-rose-500/15 text-rose-400"
                          : b.severity === "warning"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-sky-500/15 text-sky-400"
                      }`}
                    >
                      {b.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{b.message}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                    <span>{new Date(b.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => {
                        sqlDb.deleteBroadcast(b.id);
                        refreshAll();
                      }}
                      className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      {isAr ? "حذف" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Audit Logs Table */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{isAr ? "سجل التدقيق الأمني المحمي (Relational Audit Trail)" : "Audited SQL Security Trail"}</h2>
                <p className="text-xs text-slate-400">{isAr ? "سجل غير قابل للتعديل يوثق جميع العمليات الإدارية، حركات الأموال، والتحوط" : "Immutable ledger recording all administrative, financial, and compliance events"}</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none font-mono"
                >
                  <option value="ALL">{isAr ? "جميع الأحداث" : "All Events"}</option>
                  <option value="BALANCE_ADJUST">BALANCE_ADJUST</option>
                  <option value="KYC_UPDATE">KYC_UPDATE</option>
                  <option value="FUND_REQUEST">FUND_REQUEST</option>
                  <option value="ORDER_">ORDERS</option>
                  <option value="MARKET_">MARKETS</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 no-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                  <tr className="text-slate-400 text-[11px]">
                    <th className="p-3">Log ID</th>
                    <th className="p-3">{isAr ? "المسؤول / الحساب" : "Actor"}</th>
                    <th className="p-3">{isAr ? "الحدث" : "Action"}</th>
                    <th className="p-3">{isAr ? "التفاصيل" : "Details"}</th>
                    <th className="p-3 text-right">{isAr ? "التوقيت" : "Timestamp"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{log.id}</td>
                      <td className="p-3 text-sky-400 font-semibold">{log.actorEmail}</td>
                      <td className="p-3 font-bold text-white">{log.action}</td>
                      <td className="p-3 text-slate-300 font-sans max-w-md truncate">{log.details}</td>
                      <td className="p-3 text-right text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 8: SUBSCRIBERS (GRAND PRIX LEADS) --- */}
      {activeTab === "subscribers" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">{t.tabSubscribers}</h2>
              <p className="text-xs text-slate-400">{isAr ? "قائمة المستثمرين المسجلين في العد التنازلي لإطلاق سباق التداول" : "Waitlist leads and VIP accounts registered from the 15-day countdown"}</p>
            </div>

            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder={isAr ? "ابحث بالبريد الإلكتروني..." : "Search email..."}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-sky-400 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">{isAr ? "البريد الإلكتروني" : "Email Address"}</th>
                  <th className="pb-3">{isAr ? "المصدر" : "Source"}</th>
                  <th className="pb-3">{isAr ? "الحالة" : "Status"}</th>
                  <th className="pb-3 text-right">{isAr ? "تاريخ التسجيل" : "Registered At"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 text-slate-400">{s.id}</td>
                    <td className="py-3 font-bold text-white">{s.email}</td>
                    <td className="py-3 text-slate-300 font-sans">{s.source}</td>
                    <td className="py-3 text-emerald-400 font-semibold">{s.status.toUpperCase()}</td>
                    <td className="py-3 text-right text-slate-400 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL 1: BALANCE ADJUSTMENT MODAL --- */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isAr ? "تعديل رصيد المتداول" : "Adjust Trader Balance"}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedUserForBalance.name} ({selectedUserForBalance.email})
            </p>

            <form onSubmit={handleUpdateBalance} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الرصيد الجديد ($)" : "New Balance ($)"}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-400 tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-sans">{isAr ? "بيان سبب التعديل (قيد محاسبي)" : "Accounting Audit Note"}</label>
                <input
                  type="text"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder={isAr ? "مثال: تسوية تحويل بنكي / منحة سيولة" : "e.g. Bank wire settlement"}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 font-sans focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold transition-all cursor-pointer shadow-md"
                >
                  {isAr ? "حفظ وتحديث الرصيد" : "Save Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: KYC REVIEW MODAL --- */}
      {selectedUserForKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isAr ? "مراجعة وتعديل توثيق KYC" : "Review Trader KYC Compliance"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {selectedUserForKyc.name} ({selectedUserForKyc.email})
            </p>

            <form onSubmit={handleSaveKyc} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "حالة التحقق" : "Verification Status"}</label>
                <select
                  value={kycStatusInput}
                  onChange={(e) => setKycStatusInput(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none font-mono"
                >
                  <option value="verified">VERIFIED (موثق)</option>
                  <option value="pending">PENDING (قيد المراجعة)</option>
                  <option value="unverified">UNVERIFIED (غير موثق)</option>
                  <option value="rejected">REJECTED (مرفوض)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "مستوى وسقف الحساب (Tier)" : "Account Clearance Tier"}</label>
                <select
                  value={kycTierInput}
                  onChange={(e) => setKycTierInput(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none font-mono"
                >
                  <option value="TIER_1_STANDARD">TIER 1 (Standard: $50,000 limit)</option>
                  <option value="TIER_2_INSTITUTIONAL">TIER 2 (Institutional: $500,000 limit)</option>
                  <option value="TIER_3_UNLIMITED">TIER 3 (Unlimited VIP Custody)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "ملاحظات الامتثال (Compliance Notes)" : "Compliance Review Notes"}</label>
                <textarea
                  value={kycNotesInput}
                  onChange={(e) => setKycNotesInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none"
                  placeholder={isAr ? "سجل تفاصيل الهوية وفحص السجلات..." : "Record passport/national ID validation notes..."}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForKyc(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold transition-all cursor-pointer shadow-md"
                >
                  {isAr ? "حفظ التوثيق" : "Confirm Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD MARKET INSTRUMENT MODAL --- */}
      {showAddPairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isAr ? "إدراج زوج تداول جديد" : "Add New Market Instrument"}
            </h3>

            <form onSubmit={handleAddMarketPair} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الرمز (Symbol)" : "Symbol"}</label>
                  <input
                    type="text"
                    value={newPairSymbol}
                    onChange={(e) => setNewPairSymbol(e.target.value)}
                    placeholder="e.g. AUD/USD"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 uppercase focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الفئة" : "Type"}</label>
                  <select
                    value={newPairType}
                    onChange={(e) => setNewPairType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none uppercase"
                  >
                    <option value="forex">Forex</option>
                    <option value="crypto">Crypto</option>
                    <option value="commodities">Commodities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الاسم الكامل" : "Instrument Full Name"}</label>
                <input
                  type="text"
                  value={newPairName}
                  onChange={(e) => setNewPairName(e.target.value)}
                  placeholder="e.g. Australian Dollar / US Dollar"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 font-sans focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans">{isAr ? "السعر" : "Base Price"}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newPairPrice}
                    onChange={(e) => setNewPairPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الفارق (Pips)" : "Spread"}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPairSpread}
                    onChange={(e) => setNewPairSpread(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-sans">{isAr ? "الرافعة" : "Leverage"}</label>
                  <input
                    type="number"
                    value={newPairLeverage}
                    onChange={(e) => setNewPairLeverage(parseInt(e.target.value, 10) || 100)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAddPairModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold transition-all cursor-pointer shadow-md"
                >
                  {isAr ? "إدراج الأداة" : "Deploy Instrument"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD BROADCAST MODAL --- */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isAr ? "نشر إشعار إداري عام" : "Publish Global Platform Broadcast"}
            </h3>

            <form onSubmit={handleAddBroadcast} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "عنوان الإشعار" : "Announcement Title"}</label>
                <input
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="e.g. Scheduled Network Upgrade"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "مستوى الأهمية" : "Severity"}</label>
                <select
                  value={bcSeverity}
                  onChange={(e) => setBcSeverity(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none font-mono"
                >
                  <option value="info">INFO (معلومات عامة)</option>
                  <option value="warning">WARNING (تنبيه مهم)</option>
                  <option value="urgent">URGENT (عاجل / طوارئ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">{isAr ? "نص الإشعار" : "Message Body"}</label>
                <textarea
                  value={bcMessage}
                  onChange={(e) => setBcMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-sky-400"
                  placeholder="e.g. All trading systems operating normally on Equinix LD4 cross-connect..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold transition-all cursor-pointer shadow-md"
                >
                  {isAr ? "نشر الإشعار" : "Publish Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: ADD BALANCE TO CLIENT (إضافة رصيد للعميل) --- */}
      {selectedUserForAddBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "إضافة رصيد إلى حساب العميل" : "Add Balance to Client"}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUserForAddBalance.name} · {selectedUserForAddBalance.email}
                </p>
              </div>
            </div>

            {/* Current Balance & Live Preview */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>{isAr ? "الرصيد الحالي:" : "Current Balance:"}</span>
                <span className="text-white font-bold tabular-nums">
                  ${selectedUserForAddBalance.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-amber-400 font-bold border-t border-slate-800 pt-2">
                <span>{isAr ? "الرصيد بعد الإضافة:" : "New Balance Preview:"}</span>
                <span className="tabular-nums">
                  ${(
                    selectedUserForAddBalance.balance + (parseFloat(addBalanceAmount) || 0)
                  ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <form onSubmit={handleAddBalanceSubmit} className="space-y-4 text-xs font-sans">
              {/* Quick Amount Presets */}
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">
                  {isAr ? "مبالغ إيداع سريعة:" : "Quick Preset Amounts:"}
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {[500, 1000, 2500, 5000, 10000, 25000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddBalanceAmount(preset.toString())}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        addBalanceAmount === preset.toString()
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50"
                      }`}
                    >
                      +${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium font-sans">
                  {isAr ? "المبلغ المضاف ($)" : "Amount to Credit ($)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={addBalanceAmount}
                  onChange={(e) => setAddBalanceAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium font-sans">
                  {isAr ? "بيان القيد المحاسبي / ملاحظة" : "Accounting Note / Reference"}
                </label>
                <input
                  type="text"
                  value={addBalanceNote}
                  onChange={(e) => setAddBalanceNote(e.target.value)}
                  placeholder={isAr ? "مثال: تسوية حوالة بنكية / بونص ترحيبي" : "e.g. Direct wire settlement / welcome incentive"}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAddBalance(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isAr ? "إضافة الرصيد الآن" : "Credit Balance Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: FREEZE CLIENT ACCOUNT (تجميد حساب العميل) --- */}
      {selectedUserForFreeze && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "تجميد حساب العميل" : "Freeze Client Account"}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUserForFreeze.name} ({selectedUserForFreeze.email})
                </p>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? "إجراءات التجميد الأمنية:" : "Freezing Security Effects:"}</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-cyan-200/80">
                <li>{isAr ? "منع العميل من فتح أي صفقات جديدة على منصة التداول" : "Blocks opening new trades in terminal"}</li>
                <li>{isAr ? "إيقاف وحظر إمكانية طلب سحب أو تحويل الأموال" : "Freezes fund withdrawals and transfers"}</li>
                <li>{isAr ? "يمكنك إلغاء التجميد وإعادة التفعيل في أي وقت" : "You can unfreeze and restore at any time"}</li>
              </ul>
            </div>

            <form onSubmit={handleFreezeUserSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {isAr ? "سبب التجميد المعتمد:" : "Freeze Reason:"}
                </label>
                <div className="space-y-1.5 mb-2">
                  {[
                    "فحص أمني وتدقيق الامتثال المالي",
                    "اشتباه في نشاط غير مصرح به",
                    "عدم اكتمال بيانات توثيق الهوية KYC",
                    "بناءً على طلب العميل المباشر"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFreezeReasonInput(preset)}
                      className={`block w-full text-right px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        freezeReasonInput === preset
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-200 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={freezeReasonInput}
                  onChange={(e) => setFreezeReasonInput(e.target.value)}
                  placeholder={isAr ? "أو اكتب سبباً مخصصاً..." : "Or type custom reason..."}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForFreeze(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? "تأكيد تجميد الحساب" : "Confirm Freeze"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 7: TRANSFER BALANCE BETWEEN CLIENTS (تحويل رصيد بين العملاء) --- */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c1322] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "تحويل رصيد بين حسابات العملاء" : "Transfer Balance Between Clients"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? "نقل مباشر وفوري للأرصدة مع تقييد الحركات في سجل الحسابات المالي" : "Instant direct ledger transfer between two customer accounts"}
                </p>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Source Client */}
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    {isAr ? "العميل المحوّل منه (المرسل):" : "Source Client (From):"}
                  </label>
                  <select
                    value={transferSourceUserId}
                    onChange={(e) => setTransferSourceUserId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-mono text-xs"
                    required
                  >
                    <option value="" disabled>{isAr ? "اختر العميل المرسل..." : "Select source client..."}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} disabled={u.status === "frozen"}>
                        {u.name} (${u.balance.toLocaleString()}) {u.status === "frozen" ? (isAr ? "[مجمد]" : "[FROZEN]") : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Target Client */}
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    {isAr ? "العميل المحوّل إليه (المستلم):" : "Target Client (To):"}
                  </label>
                  <select
                    value={transferTargetUserId}
                    onChange={(e) => setTransferTargetUserId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-mono text-xs"
                    required
                  >
                    <option value="" disabled>{isAr ? "اختر العميل المستلم..." : "Select target client..."}</option>
                    {users
                      .filter((u) => u.id !== transferSourceUserId)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (${u.balance.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Transfer Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium font-sans">
                    {isAr ? "مبلغ التحويل ($):" : "Transfer Amount ($):"}
                  </label>
                  {transferSourceUserId && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      {isAr ? "الرصيد المتاح: " : "Available: "}
                      <span className="text-amber-400 font-bold">
                        ${(users.find((u) => u.id === transferSourceUserId)?.balance || 0).toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={transferAmountInput}
                  onChange={(e) => setTransferAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  required
                />

                {/* Percentage Shortcuts */}
                {transferSourceUserId && (
                  <div className="flex items-center gap-2 mt-2 font-mono">
                    {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                      const srcBal = users.find((u) => u.id === transferSourceUserId)?.balance || 0;
                      const val = (srcBal * pct).toFixed(2);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTransferAmountInput(val)}
                          className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors cursor-pointer"
                        >
                          {pct * 100}% (${Number(val).toLocaleString()})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium font-sans">
                  {isAr ? "سبب التحويل / الملاحظة الإدارية:" : "Transfer Reason / Admin Note:"}
                </label>
                <input
                  type="text"
                  value={transferNoteInput}
                  onChange={(e) => setTransferNoteInput(e.target.value)}
                  placeholder={isAr ? "مثال: تسوية داخلية معتمدة / تحويل حساب فرعي" : "e.g. Authorized internal settlement / linked account"}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* Visual Balance Preview Card */}
              {transferSourceUserId && transferTargetUserId && parseFloat(transferAmountInput) > 0 && (
                <div className="p-3 bg-slate-950/60 border border-amber-500/20 rounded-xl space-y-2 text-xs font-mono">
                  <div className="text-slate-400 text-[11px] font-sans font-semibold">
                    {isAr ? "معاينة الأرصدة بعد تنفيذ التحويل:" : "Balances After Transfer:"}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                    <div>
                      <div className="text-slate-400 text-[10px] truncate">
                        {users.find((u) => u.id === transferSourceUserId)?.name} (المرسل)
                      </div>
                      <div className="text-rose-400 font-bold tabular-nums">
                        ${(
                          (users.find((u) => u.id === transferSourceUserId)?.balance || 0) -
                          (parseFloat(transferAmountInput) || 0)
                        ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] truncate">
                        {users.find((u) => u.id === transferTargetUserId)?.name} (المستلم)
                      </div>
                      <div className="text-emerald-400 font-bold tabular-nums">
                        ${(
                          (users.find((u) => u.id === transferTargetUserId)?.balance || 0) +
                          (parseFloat(transferAmountInput) || 0)
                        ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? "تنفيذ تحويل الرصيد" : "Execute Transfer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 8: REJECT WITHDRAWAL MODAL (رفض سحب مع استرجاع الرصيد) --- */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "رفض طلب سحب الأموال" : "Reject Withdrawal Request"}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedRequestForReject.id} · {selectedRequestForReject.userName}
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة الرصيد التلقائية للمتداول:" : "Automatic Balance Refund:"}</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                {isAr
                  ? `عند تأكيد الرفض، سيتم استرجاع مبلغ $${selectedRequestForReject.amount.toLocaleString()} تلقائياً وفورياً إلى رصيد حساب العميل المتاح.`
                  : `Upon rejection, $${selectedRequestForReject.amount.toLocaleString()} will be automatically refunded back to the client's available balance.`}
              </p>
            </div>

            <form onSubmit={handleRejectFundRequestSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {isAr ? "سبب الرفض المعتمد (يظهر للعميل في كشف الحساب):" : "Official Rejection Reason:"}
                </label>
                <div className="space-y-1.5 mb-2">
                  {[
                    "عدم تطابق اسم الحساب البنكي / المحفظة مع الهوية",
                    "عدم استيفاء شروط التحقق والامتثال المالي KYC",
                    "تجاوز الحد الأقصى المسموح للسحب اليومي",
                    "تدقيق أمني ومراجعة مع قسم مكافحة الاحتيال"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReasonInput(preset)}
                      className={`block w-full text-right px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        rejectReasonInput === preset
                          ? "bg-rose-500/20 border-rose-500 text-rose-200 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder={isAr ? "أو أدخل سبباً مخصصاً..." : "Or enter custom reason..."}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForReject(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/20 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? "تأكيد الرفض واسترجاع الرصيد" : "Confirm Rejection & Refund"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 9: CREATE WITHDRAWAL FOR CLIENT (إنشاء طلب سحب لعميل) --- */}
      {showCreateWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "إنشاء طلب سحب لعميل" : "Create Withdrawal for Client"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? "حجز المبلغ من رصيد العميل وإضافته لقائمة السحوبات المعلقة للمراجعة" : "Deducts funds and queues withdrawal for compliance audit"}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateWithdrawalSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-medium font-sans">
                  {isAr ? "اختيار العميل:" : "Target Client:"}
                </label>
                <select
                  value={newWithdrawalUserId}
                  onChange={(e) => setNewWithdrawalUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-mono text-xs"
                  required
                >
                  <option value="" disabled>{isAr ? "اختر العميل..." : "Select client..."}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} disabled={u.status === "frozen" || u.balance <= 0}>
                      {u.name} (الرصيد: ${u.balance.toLocaleString()}) {u.status === "frozen" ? "[مُجمّد]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    {isAr ? "مبلغ السحب ($):" : "Withdrawal Amount ($):"}
                  </label>
                  {newWithdrawalUserId && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      {isAr ? "المتاح: " : "Available: "}
                      <span className="text-amber-400 font-bold">
                        ${(users.find((u) => u.id === newWithdrawalUserId)?.balance || 0).toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={users.find((u) => u.id === newWithdrawalUserId)?.balance || 99999999}
                  value={newWithdrawalAmount}
                  onChange={(e) => setNewWithdrawalAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {isAr ? "طريقة التحويل:" : "Payment Channel:"}
                </label>
                <select
                  value={newWithdrawalMethod}
                  onChange={(e) => setNewWithdrawalMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none font-mono text-xs"
                >
                  <option value="CRYPTO_USDT">USDT (Tether TRC-20 / ERC-20)</option>
                  <option value="BANK_WIRE">International Bank Wire (SWIFT)</option>
                  <option value="SEPA">SEPA European Clearing</option>
                  <option value="INSTITUTIONAL_LEDGER">Institutional Custody Ledger</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {isAr ? "عنوان المحفظة أو الآيبان (IBAN/Wallet):" : "Destination IBAN or Wallet Address:"}
                </label>
                <input
                  type="text"
                  value={newWithdrawalDestination}
                  onChange={(e) => setNewWithdrawalDestination(e.target.value)}
                  placeholder="e.g. TRC20: TLp7d... or IBAN: GB29..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {isAr ? "ملاحظة تدقيق إدارية:" : "Admin Audit Note:"}
                </label>
                <input
                  type="text"
                  value={newWithdrawalNote}
                  onChange={(e) => setNewWithdrawalNote(e.target.value)}
                  placeholder={isAr ? "مثال: بطلب عبر الدعم الفني المباشر" : "e.g. Requested via priority VIP desk"}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWithdrawalModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isAr ? "إنشاء طلب السحب" : "Create Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
