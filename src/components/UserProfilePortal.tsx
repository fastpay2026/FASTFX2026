import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { sqlDb, SUPER_ADMIN_EMAIL } from "../db/sqlEngine";
import { translations, Language } from "../translations";
import { User, Transaction, KycSubmissionPayload } from "../types";
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  ArrowRightLeft,
  Send,
  Wallet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Key,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Search,
  DollarSign,
  Layers,
  Globe,
  Building2,
  Eye,
  EyeOff,
  Smartphone,
  PlusCircle,
  CandlestickChart,
  ArrowDownRight,
  ArrowUpRight,
  FileCheck,
  Award,
  UploadCloud,
  ChevronRight
} from "lucide-react";

interface UserProfilePortalProps {
  lang: Language;
  onNavigateToTrading: () => void;
  onNavigateToLanding: () => void;
}

export const UserProfilePortal: React.FC<UserProfilePortalProps> = ({
  lang,
  onNavigateToTrading,
  onNavigateToLanding
}) => {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  // Active Tab inside User Portal
  const [activeTab, setActiveTab] = useState<"overview" | "transfer" | "kyc" | "ledger" | "security">("overview");

  // Notifications & Copy state
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Transfer State
  const [transferRecipientQuery, setTransferRecipientQuery] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string; email: string; kycStatus: string } | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferNote, setTransferNote] = useState<string>("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [completedTransferReceipt, setCompletedTransferReceipt] = useState<Transaction | null>(null);

  // KYC Verification Form State
  const [kycDocType, setKycDocType] = useState<"PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE">("PASSPORT");
  const [kycDocNumber, setKycDocNumber] = useState<string>("");
  const [kycCountry, setKycCountry] = useState<string>(currentUser?.country || "المملكة العربية السعودية");
  const [kycAddressType, setKycAddressType] = useState<"BANK_STATEMENT" | "UTILITY_BILL" | "GOV_TAX_LETTER">("BANK_STATEMENT");
  const [kycNotes, setKycNotes] = useState<string>("");
  const [kycSimulatedFileName, setKycSimulatedFileName] = useState<string>("");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState<boolean>(false);

  // Security / API Key state
  const [showApiSecret, setShowApiSecret] = useState<boolean>(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState<boolean>(false);

  // Transaction Ledger Filters
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>("ALL");
  const [ledgerSearch, setLedgerSearch] = useState<string>("");

  // Show alert banner
  const showAlert = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showAlert(isAr ? "تم النسخ إلى الحافظة بنجاح" : "Copied to clipboard successfully", "success");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Live Recipient Search
  const searchResults = useMemo(() => {
    if (!currentUser || !transferRecipientQuery.trim()) return [];
    return sqlDb.searchUsersForTransfer(transferRecipientQuery, currentUser.id);
  }, [transferRecipientQuery, currentUser]);

  // Client's Transactions
  const userTransactions = useMemo(() => {
    if (!currentUser) return [];
    return sqlDb.getTransactions(currentUser.id);
  }, [currentUser]);

  // Filtered Ledger
  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((tx) => {
      if (ledgerTypeFilter !== "ALL" && tx.type !== ledgerTypeFilter) return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase();
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchId = tx.id.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchNote && !matchId && !matchAmount) return false;
      }
      return true;
    });
  }, [userTransactions, ledgerTypeFilter, ledgerSearch]);

  // Client Trades for Performance KPI
  const userTrades = useMemo(() => {
    if (!currentUser) return [];
    return sqlDb.getTrades(currentUser.id);
  }, [currentUser]);

  const closedTrades = userTrades.filter((t) => t.status === "CLOSED");
  const winningTrades = closedTrades.filter((t) => t.pnl > 0);
  const winRate = closedTrades.length > 0 ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : "0.0";
  const netPnL = closedTrades.reduce((acc, t) => acc + t.pnl, 0);

  // VIP Rank calculation
  const vipRankBadge = useMemo(() => {
    if (!currentUser) return { label: "Standard", color: "text-slate-300", bg: "bg-slate-800" };
    if (currentUser.role === "admin") {
      return { label: isAr ? "المدير العام (Super Admin)" : "Super Admin", color: "text-amber-300", bg: "bg-amber-500/20 border-amber-500/40" };
    }
    if (currentUser.balance >= 100000) {
      return { label: isAr ? "عضوية ماسية (Black Diamond VIP)" : "Black Diamond VIP", color: "text-amber-400", bg: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50" };
    }
    if (currentUser.balance >= 25000) {
      return { label: isAr ? "عضوية بلاتينية مؤسسية (Institutional Platinum)" : "Platinum Elite", color: "text-sky-300", bg: "bg-sky-500/20 border-sky-500/40" };
    }
    return { label: isAr ? "عضوية ذهبية قياسية (Gold Trader)" : "Gold Trader", color: "text-indigo-300", bg: "bg-indigo-500/20 border-indigo-500/40" };
  }, [currentUser, isAr]);

  // Handle Demo Balance Refill
  const handleRefillDemo = () => {
    if (!currentUser) return;
    const res = sqlDb.refillDemoBalance(currentUser.id, 50000);
    if (res.success) {
      refreshUser();
      showAlert(isAr ? "تمت إعادة تعبئة رصيد الحساب التجريبي بمبلغ $50,000 بنجاح" : "Demo balance refilled with $50,000 successfully");
    }
  };

  // Handle Client-to-Client Transfer Submission
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!selectedRecipient) {
      showAlert(isAr ? "يرجى تحديد العميل المستلم للتحويل" : "Please select a valid recipient", "error");
      return;
    }

    const numAmount = parseFloat(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert(isAr ? "يرجى إدخال مبلغ تحويل صالح أكبر من صفر" : "Please enter a valid transfer amount", "error");
      return;
    }

    if (numAmount > currentUser.balance) {
      showAlert(
        isAr
          ? `الرصيد المتاح غير كافٍ. رصيدك الحالي: $${currentUser.balance.toLocaleString()}`
          : `Insufficient funds. Available: $${currentUser.balance.toLocaleString()}`,
        "error"
      );
      return;
    }

    setIsSubmittingTransfer(true);

    setTimeout(() => {
      const res = sqlDb.transferBalance(
        currentUser.id,
        selectedRecipient.id,
        numAmount,
        transferNote.trim() || undefined
      );

      setIsSubmittingTransfer(false);

      if (res.success) {
        refreshUser();
        // Get the newly created outgoing transfer transaction
        const updatedTxs = sqlDb.getTransactions(currentUser.id);
        const latestTx = updatedTxs[0] || null;
        setCompletedTransferReceipt(latestTx);

        setTransferAmount("");
        setTransferNote("");
        setSelectedRecipient(null);
        setTransferRecipientQuery("");

        showAlert(
          isAr
            ? `تم تحويل مبلغ $${numAmount.toLocaleString()} بنجاح إلى ${selectedRecipient.name}`
            : `Successfully transferred $${numAmount.toLocaleString()} to ${selectedRecipient.name}`,
          "success"
        );
      } else {
        showAlert(res.error || (isAr ? "فشلت عملية التحويل" : "Transfer failed"), "error");
      }
    }, 600);
  };

  // Handle KYC Request Submission
  const handleSubmitKycForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!kycDocNumber.trim()) {
      showAlert(isAr ? "يرجى كتابة رقم وثيقة إثبات الهوية" : "Please enter your document identification number", "error");
      return;
    }

    setIsSubmittingKyc(true);

    setTimeout(() => {
      const payload: KycSubmissionPayload = {
        documentType: kycDocType,
        documentNumber: kycDocNumber.trim(),
        issuingCountry: kycCountry.trim(),
        proofOfAddressType: kycAddressType,
        notes: kycNotes.trim() || undefined
      };

      const res = sqlDb.submitKycVerificationRequest(currentUser.id, payload);
      setIsSubmittingKyc(false);

      if (res.success) {
        refreshUser();
        showAlert(
          isAr
            ? "تم إرسال طلب توثيق الحساب بنجاح! فريق الامتثال في Fast FX يراجع طلبك الآن."
            : "KYC verification request submitted successfully! London compliance is reviewing your documents.",
          "success"
        );
      } else {
        showAlert(res.error || (isAr ? "فشل تقديم طلب التوثيق" : "KYC submission failed"), "error");
      }
    }, 700);
  };

  // Handle 2FA Toggle
  const handleToggle2FA = () => {
    if (!currentUser) return;
    const res = sqlDb.toggle2FA(currentUser.id);
    refreshUser();
    showAlert(
      res.enabled
        ? (isAr ? "تم تفعيل التحقق بخطوتين (2FA) بنجاح لحماية حسابك" : "2FA protection activated successfully")
        : (isAr ? "تم تعطيل التحقق بخطوتين (2FA)" : "2FA protection deactivated")
    );
    setTwoFactorModalOpen(false);
  };

  // Handle API Key Generation
  const handleGenerateApiKeys = () => {
    if (!currentUser) return;
    sqlDb.generateApiCredentials(currentUser.id);
    refreshUser();
    showAlert(isAr ? "تم توليد مفاتيح التداول المؤسسي البرمجي (FIX/REST) بنجاح" : "Institutional API trading keys generated successfully");
  };

  // If user is not logged in, show an institutional gateway card to sign in
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 font-sans">
        <div className="bg-[#0c1322] border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {isAr ? "بوابة حساب العميل المحمية" : "Client Account Portal Access"}
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
            {isAr
              ? "يرجى تسجيل الدخول إلى حسابك للوصول إلى محفظتك المالية، التحويل المباشر بين العملاء، وإدارة توثيق الهوية والامتثال المؤسسي."
              : "Please sign in to access your financial vault, instant peer-to-peer balance transfers, and official KYC verification."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:opacity-95 shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>{isAr ? "تسجيل الدخول إلى حسابي" : "Sign In to Account"}</span>
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>{isAr ? "فتح حساب جديد" : "Open New Account"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Flash Alert Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl transition-all animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/15 border border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 1. Prestigious Hero Client Profile Card */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Pulse Accent */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-sky-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Badges */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar / Initials */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-indigo-600/30 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl sm:text-3xl font-black font-mono shadow-inner shrink-0 relative">
              {currentUser.name.slice(0, 2).toUpperCase()}
              {currentUser.kycStatus === "verified" && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-[#0c1322]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                {/* VIP Rank Chip */}
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${vipRankBadge.bg} ${vipRankBadge.color} font-mono`}>
                  {vipRankBadge.label}
                </span>
              </div>

              {/* Account Metadata Row (Zero-Pill Typography) */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
                <span className="text-amber-400 font-bold">
                  ID: #{currentUser.id.slice(-8).toUpperCase()}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{currentUser.email}</span>
                <span aria-hidden="true">·</span>
                <span>{currentUser.country || "Global Institutional"}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">
                  {currentUser.status === "frozen" ? "🔒 مُجمّد" : "100% نشط"}
                </span>
              </div>

              {/* KYC Status Indicator */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400">{isAr ? "حالة توثيق الهوية (KYC):" : "Verification Status:"}</span>
                {currentUser.kycStatus === "verified" && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                    <BadgeCheck className="w-4 h-4" />
                    <span>{isAr ? "حساب موثق رسمياً (Verified Institutional)" : "Verified Institutional"}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      · {currentUser.kycTier?.replace(/_/g, " ") || "TIER 2"}
                    </span>
                  </span>
                )}
                {currentUser.kycStatus === "pending" && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>{isAr ? "قيد المراجعة والتدقيق (Under Compliance Review)" : "Under Review"}</span>
                  </span>
                )}
                {(currentUser.kycStatus === "unverified" || !currentUser.kycStatus) && (
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline text-xs"
                  >
                    <span>{isAr ? "طلب التوثيق الآن (Verify Now)" : "Verify Now"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {currentUser.kycStatus === "rejected" && (
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline text-xs"
                  >
                    <span>{isAr ? "مرفوض - إعادة تقديم المستندات" : "Rejected - Resubmit KYC"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Open Terminal, Copy ID) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleCopy(currentUser.id, "userId")}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs font-mono transition-colors cursor-pointer flex items-center gap-2"
              title={isAr ? "نسخ كود الحساب الفريد" : "Copy Account ID"}
            >
              {copiedKey === "userId" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isAr ? "نسخ معرّف الحساب" : "Copy Account ID"}</span>
            </button>

            <button
              onClick={onNavigateToTrading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <CandlestickChart className="w-4 h-4" />
              <span>{isAr ? "فتح منصة التداول" : "Open Trading Terminal"}</span>
            </button>
          </div>
        </div>

        {/* 2. Financial Treasury & Liquidity Strip (4 Blocks) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          {/* Real Balance */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{isAr ? "الرصيد الحقيقي المتاح" : "Real Vault Balance"}</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {isAr ? "محمي بوديعة مصرفية 1:1" : "Audited 1:1 Reserves"}
            </div>
          </div>

          {/* Equity & Leverage */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{isAr ? "رأس المال وقوة الرافعة" : "Equity & Leverage"}</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              ${(currentUser.equity || currentUser.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-sky-400 mt-1 font-mono">
              {isAr ? "رافعة مالية تصل 1:500" : "Max Leverage 1:500"}
            </div>
          </div>

          {/* Demo Trading Balance */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{isAr ? "رصيد الحساب التجريبي" : "Demo Balance"}</span>
              <button
                onClick={handleRefillDemo}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                title={isAr ? "إعادة تعبئة $50,000 مجاناً" : "Refill $50,000"}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isAr ? "تعبئة" : "Refill"}</span>
              </button>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              ${(currentUser.demoBalance || 50000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {isAr ? "بيئة محاكاة فوركس حية" : "Live Simulated Environment"}
            </div>
          </div>

          {/* Trading Performance KPI */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{isAr ? "أداء التداول ونسبة النجاح" : "Win Rate & PnL"}</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums flex items-baseline gap-2">
              <span>{winRate}%</span>
              <span className={`text-xs font-bold ${netPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({netPnL >= 0 ? "+" : ""}${netPnL.toFixed(2)})
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {closedTrades.length} {isAr ? "صفقة مكتملة" : "Closed Trades"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0c1322] rounded-2xl border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar shadow-lg">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-slate-800 text-white font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>{isAr ? "نظرة عامة ومزايا الحساب" : "Account Overview"}</span>
        </button>

        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "transfer"
              ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          <span>{isAr ? "التحويل الفوري بين العملاء" : "Client-to-Client Transfer"}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-bold">
            0% {isAr ? "عمولة" : "Fee"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "kyc"
              ? "bg-gradient-to-r from-indigo-500/20 to-sky-500/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCheck className="w-4 h-4 text-indigo-400" />
          <span>{isAr ? "طلب توثيق الحساب والامتثال" : "KYC Verification"}</span>
          {currentUser.kycStatus === "pending" && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ledger"
              ? "bg-slate-800 text-white font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? "سجل المعاملات والتحويلات" : "Financial Ledger"}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
            {userTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "security"
              ? "bg-slate-800 text-white font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Key className="w-4 h-4 text-purple-400" />
          <span>{isAr ? "الأمان والمفاتيح المؤسسية" : "Security & API Keys"}</span>
        </button>
      </div>

      {/* 4. Tab 1: Account Overview & Institutional Benefits */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Tier Benefits & Specifications */}
          <div className="lg:col-span-2 bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{isAr ? "مواصفات ومزايا الحساب المؤسسي" : "Institutional Tier Specifications"}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? "حسابك مجهز بأحدث معايير التداول المنخفض الكمون عبر ربط مباشر بمراكز Equinix LD4 في لندن."
                  : "Your account is provisioned with ultra-low latency direct access to Equinix LD4 London."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "فروق أسعار خام (Raw Spreads)" : "Raw Spreads from 0.0 Pips"}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isAr
                    ? "تداول بفروق أسعار تبدأ من 0.0 نقطة على أزواج العملات والذهب بفضل سيولة البنوك الكبرى مباشرة."
                    : "Access tier-1 liquidity pricing with zero markup on major currencies and gold."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "تنفيذ فائق السرعة (< 0.003ms)" : "Execution Speed (< 0.003ms)"}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isAr
                    ? "محرك مطابقة أوامر مؤسسي يعمل في أجزاء من الميكروثانية دون إعادة تسعير أو انزلاق سعري."
                    : "Zero slippage and sub-millisecond fill times powered by our LD4 matching engine."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "تحويل فوري بين العملاء (0% عمولة)" : "Instant P2P Client Transfers"}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isAr
                    ? "أرسل واستقبل الأموال بين أي حسابين في Fast FX بشكل فوري عبر المقاصة الداخلية بدون رسوم."
                    : "Send and receive funds between any Fast FX trader accounts instantly with 0% fee."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "حسابات إسلامية خالية من التبييت (Swap-Free)" : "100% Swap-Free Islamic Accounts"}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isAr
                    ? "تداول متوافق مع أحكام الشريعة بدون أي رسوم تبييت أو فوائد ربوية مخفية."
                    : "Completely Sharia-compliant trading with zero overnight interest or carry fees."}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setActiveTab("transfer")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{isAr ? "تحويل رصيد لعميل آخر" : "Transfer Funds"}</span>
              </button>

              <button
                onClick={() => setActiveTab("kyc")}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>{isAr ? "بوابة توثيق الهوية KYC" : "KYC Verification"}</span>
              </button>

              <button
                onClick={onNavigateToTrading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <CandlestickChart className="w-4 h-4" />
                <span>{isAr ? "بدء التداول الحي" : "Trade Now"}</span>
              </button>
            </div>
          </div>

          {/* Right Col: Account Security & Status Summary */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              {isAr ? "معلومات الأمان والتسجيل" : "Security & Regulatory Status"}
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">{isAr ? "تاريخ التسجيل:" : "Registered At:"}</span>
                <span className="text-white">
                  {new Date(currentUser.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">{isAr ? "التحقق بخطوتين (2FA):" : "2FA Protection:"}</span>
                <span className={currentUser.twoFactorEnabled ? "text-emerald-400 font-bold" : "text-amber-400"}>
                  {currentUser.twoFactorEnabled ? (isAr ? "مفعل ومحمي ✅" : "Enabled") : (isAr ? "غير مفعل ⚠️" : "Disabled")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">{isAr ? "خادم الحساب الرئيسي:" : "Core Server:"}</span>
                <span className="text-sky-400 font-bold">Equinix LD4 (London)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">{isAr ? "نوع الترخيص:" : "Regulatory License:"}</span>
                <span className="text-slate-200">FSA & FCA Compliant</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? "ضمان أموال العملاء 100%" : "Client Fund Segregation"}</span>
              </div>
              {isAr
                ? "يتم إيداع كافة أرصدة العملاء في حسابات بنكية بريطانية منفصلة من الفئة الأولى ولا يتم خلطها مع أصول الشركة التشغيلية."
                : "All client funds are held in segregated Tier-1 British banking vaults, fully ring-fenced from operational capital."}
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Client-to-Client Instant Transfer (امكانية التحويل بين عميل وعميل) */}
      {activeTab === "transfer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form (2 Cols) */}
          <div className="lg:col-span-2 bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isAr ? "التحويل المالي المباشر بين العملاء (P2P Transfer)" : "Instant Client-to-Client Transfer"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? "تحويل فوري بدون عمولة (0.00%) وبدون حد أقصى للتحويلات الداخلية بين حسابات Fast FX"
                    : "Zero-fee instant balance transfer between Fast FX client trading accounts"}
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-5 text-xs">
              {/* Step 1: Select Recipient */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {isAr ? "العميل المستلم (ابحث بالاسم، البريد الإلكتروني، أو معرف الحساب):" : "Recipient (Search by Name, Email, or Account ID):"}
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={transferRecipientQuery}
                    onChange={(e) => {
                      setTransferRecipientQuery(e.target.value);
                      if (selectedRecipient && selectedRecipient.email !== e.target.value) {
                        setSelectedRecipient(null);
                      }
                    }}
                    placeholder={isAr ? "مثال: trader.alex@fastfx.com أو Alex Mercer..." : "e.g. trader.alex@fastfx.com..."}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pr-10 pl-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                {/* Recipient Dropdown Auto-Suggestions */}
                {searchResults.length > 0 && !selectedRecipient && (
                  <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto z-10 space-y-0.5 p-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedRecipient(user);
                          setTransferRecipientQuery(user.email);
                        }}
                        className="w-full text-right p-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{user.name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{user.email}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                          {isAr ? "عميل موثق" : "Verified Client"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Recipient Card */}
                {selectedRecipient && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold font-mono">
                        {selectedRecipient.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{selectedRecipient.name}</div>
                        <div className="text-[11px] text-amber-300/80 font-mono">{selectedRecipient.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(null);
                        setTransferRecipientQuery("");
                      }}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1"
                    >
                      {isAr ? "تغيير" : "Change"}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Amount with Quick Percentage Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">
                    {isAr ? "مبلغ التحويل ($ USD):" : "Transfer Amount ($ USD):"}
                  </label>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {isAr ? "الرصيد المتاح: " : "Available Balance: "}
                    <span className="text-emerald-400 font-bold">
                      ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                </div>

                <div className="relative">
                  <DollarSign className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={currentUser.balance}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 font-mono tabular-nums font-bold"
                    required
                  />
                </div>

                {/* Quick percentage shortcuts */}
                <div className="flex items-center gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                    const calculated = (currentUser.balance * ratio).toFixed(2);
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setTransferAmount(calculated)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                      >
                        {ratio * 100}%
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Reference Note / Memo */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {isAr ? "ملاحظة أو بيان التحويل (اختياري):" : "Transfer Memo / Reference (Optional):"}
                </label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder={isAr ? "مثال: تسوية حساب، تمويل مشترك، أرباح تداول..." : "e.g. Shared portfolio settlement, trade profit..."}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* Fee and Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "رسوم التحويل الداخلي:" : "Internal Transfer Fee:"}</span>
                  <span className="text-emerald-400 font-bold">$0.00 (مجاني وفوري)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "طريقة التنفيذ:" : "Execution Route:"}</span>
                  <span className="text-white">Fast FX Instant Internal Ledger</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">{isAr ? "إجمالي المبلغ المخصوم:" : "Total Deducted:"}</span>
                  <span className="text-amber-400 text-sm tabular-nums">
                    ${(parseFloat(transferAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingTransfer || currentUser.status === "frozen" || currentUser.balance <= 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingTransfer ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isAr ? "تأكيد وتنفيذ التحويل المالي الفوري" : "Confirm Instant Transfer"}</span>
              </button>
            </form>
          </div>

          {/* Right Col: Instant Transfer Rules & Safeguards */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? "ضوابط الأمان والتحويل المؤسسي" : "Security & P2P Safeguards"}</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{isAr ? "التحويل بين عملاء Fast FX فوري ولا يحتاج إلى موافقة بنكية خارجية." : "Transfers between registered clients are instant with zero wait time."}</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{isAr ? "يتم إصدار إشعار مالي وإيصال رسمي رقمي لكل عملية تحويل في حساب الطرفين." : "Both parties receive digital cryptographically hashed transaction receipts."}</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{isAr ? "الحد الأدنى للتحويل هو 1.00 دولار أمريكي، ولا يوجد حد أقصى للحسابات الموثقة." : "Minimum transfer is $1.00 USD with unlimited capacity for verified accounts."}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="text-slate-400">{isAr ? "رقم حسابك للتحويلات الواردة:" : "Your Account ID for Receiving:"}</div>
              <div className="text-amber-400 font-bold select-all">{currentUser.email}</div>
              <div className="text-[11px] text-slate-500">ID: {currentUser.id}</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Official KYC Account Verification (امكانية طلب توثيق للحساب) */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          {/* Status Stepper Card */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-indigo-400" />
                  <span>{isAr ? "بوابة توثيق الهوية والامتثال المؤسسي (KYC & AML Compliance)" : "Official KYC Verification Portal"}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? "وفقاً للوائح هيئة السلوك المالي البريطانية (FCA) ولوائح FSA، يتيح توثيق الحساب سحب أرباح غير محدود ورافعة 1:500."
                    : "Complies with British FCA & FSA compliance standards. Unlocks unlimited withdrawals and Tier-2 institutional routing."}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {currentUser.kycStatus === "verified" && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAr ? "الحساب موثق رسمياً (APPROVED)" : "VERIFIED & APPROVED"}</span>
                  </span>
                )}
                {currentUser.kycStatus === "pending" && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{isAr ? "قيد المراجعة الفنية (IN REVIEW)" : "UNDER REVIEW"}</span>
                  </span>
                )}
                {(currentUser.kycStatus === "unverified" || !currentUser.kycStatus) && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs font-mono">
                    {isAr ? "غير موثق (UNVERIFIED)" : "UNVERIFIED"}
                  </span>
                )}
                {currentUser.kycStatus === "rejected" && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isAr ? "مرفوض - يرجى إعادة الإرسال" : "REJECTED"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Visual Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className={`p-3.5 rounded-xl border ${currentUser.kycStatus ? "bg-slate-900 border-emerald-500/40 text-emerald-300" : "bg-slate-900/40 border-slate-800 text-slate-500"}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>{isAr ? "تقديم المستندات" : "Document Submit"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{isAr ? "رفع وثيقة الهوية وإثبات السكن" : "ID & proof of address"}</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${currentUser.kycStatus === "pending" || currentUser.kycStatus === "verified" ? "bg-slate-900 border-amber-500/40 text-amber-300" : "bg-slate-900/40 border-slate-800 text-slate-500"}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>{isAr ? "الفحص الآلي AML" : "AML Screening"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{isAr ? "مطابقة القوائم والوثائق الرسمية" : "Sanctions & PEP checks"}</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${currentUser.kycStatus === "pending" || currentUser.kycStatus === "verified" ? "bg-slate-900 border-sky-500/40 text-sky-300" : "bg-slate-900/40 border-slate-800 text-slate-500"}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>{isAr ? "مراجعة إدارة الامتثال" : "Officer Review"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{isAr ? "فحص فريق Fast FX في لندن" : "London Compliance Desk"}</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${currentUser.kycStatus === "verified" ? "bg-slate-900 border-emerald-500/60 text-emerald-300" : "bg-slate-900/40 border-slate-800 text-slate-500"}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">4</span>
                  <span>{isAr ? "اعتماد الحساب المؤسسي" : "Tier 2 Activated"}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{isAr ? "سحب غير محدود وفروق 0.0" : "Unlimited withdrawals"}</p>
              </div>
            </div>
          </div>

          {/* If already Verified: Display Elite Certificate Badge */}
          {currentUser.kycStatus === "verified" ? (
            <div className="bg-[#0c1322] border border-emerald-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-4 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isAr ? "حسابك موثق رسمياً بأعلى معايير الامتثال (Tier 2/3)" : "Officially Verified Institutional Client"}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                {isAr
                  ? `تم توثيق بيانات العميل ${currentUser.name} واعتماد مستندات الهوية الرسمية. حسابك الآن مؤهل لسحب فوري غير محدود ورافعة مالية تصل إلى 1:500 مع حماية رأس المال.`
                  : `Account verification complete for ${currentUser.name}. Full institutional access and unlimited withdrawal clearance active.`}
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto text-xs font-mono text-slate-400">
                <div>FSA / FCA Reference: FX-VERIFIED-{currentUser.id.slice(-6).toUpperCase()}</div>
                <div className="text-emerald-400 mt-1">{currentUser.kycNotes || "Root clearance active"}</div>
              </div>
            </div>
          ) : (
            /* KYC Submission Form */
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? "تقديم طلب توثيق الحساب (Submit KYC Documents)" : "Submit Verification Documents"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? "يرجى إدخال بيانات وثيقة الهوية الرسمية وإثبات السكن لتفعيل السحب غير المحدود."
                      : "Please provide official government ID information to unlock institutional tier limits."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitKycForm} className="space-y-5 text-xs">
                {/* Document Type Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    {isAr ? "نوع وثيقة إثبات الهوية الرسمية:" : "Government ID Type:"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "PASSPORT", labelAr: "جواز سفر دولي", labelEn: "International Passport", icon: Globe },
                      { id: "NATIONAL_ID", labelAr: "بطاقة الهوية الوطنية", labelEn: "National ID Card", icon: UserIcon },
                      { id: "DRIVERS_LICENSE", labelAr: "رخصة قيادة معتمدة", labelEn: "Driver's License", icon: Award }
                    ].map((doc) => {
                      const Icon = doc.icon;
                      const isSelected = kycDocType === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setKycDocType(doc.id as any)}
                          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10 font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs">{isAr ? doc.labelAr : doc.labelEn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Tier-1 Validated</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Document ID Number & Issuing Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      {isAr ? "رقم الوثيقة الرسمية:" : "Document ID Number:"}
                    </label>
                    <input
                      type="text"
                      value={kycDocNumber}
                      onChange={(e) => setKycDocNumber(e.target.value)}
                      placeholder="e.g. N94820194 or 1084920194"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      {isAr ? "بلد إصدار الوثيقة والجنسية:" : "Issuing Country & Nationality:"}
                    </label>
                    <input
                      type="text"
                      value={kycCountry}
                      onChange={(e) => setKycCountry(e.target.value)}
                      placeholder="e.g. المملكة العربية السعودية، الإمارات، الكويت، مصر..."
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-sans"
                      required
                    />
                  </div>
                </div>

                {/* Proof of Address Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {isAr ? "وثيقة إثبات العنوان والسكن (Proof of Address):" : "Proof of Address Document Type:"}
                  </label>
                  <select
                    value={kycAddressType}
                    onChange={(e) => setKycAddressType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="BANK_STATEMENT">{isAr ? "كشف حساب بنكي رسمي حديث (آخر 3 أشهر)" : "Recent Official Bank Statement (< 3 months)"}</option>
                    <option value="UTILITY_BILL">{isAr ? "فاتورة خدمات سكنية (كهرباء أو مياه أو هاتف)" : "Utility Bill (Electricity, Water, or Telecom)"}</option>
                    <option value="GOV_TAX_LETTER">{isAr ? "شهادة إقامة ضريبية أو خطاب حكومي موثق" : "Government Tax Residency Certificate"}</option>
                  </select>
                </div>

                {/* Simulated Document Upload Dropzone */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {isAr ? "نسخة ممسوحة ضوئياً أو صورة عالية الدقة للوثيقة:" : "Scanned Copy or High-Resolution Photo:"}
                  </label>
                  <div
                    onClick={() => {
                      const sampleName = `${kycDocType.toLowerCase()}_${currentUser.name.replace(/\s+/g, "_")}_doc.pdf`;
                      setKycSimulatedFileName(sampleName);
                    }}
                    className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-slate-900/40 group"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                    <div className="text-xs font-semibold text-white">
                      {kycSimulatedFileName ? (
                        <span className="text-emerald-400 font-mono">✅ تم تجهيز الملف: {kycSimulatedFileName}</span>
                      ) : (
                        <span>{isAr ? "انقر هنا لاختيار المستند (PDF, PNG, JPG)" : "Click here to upload document (PDF, PNG, JPG)"}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {isAr ? "حجم الملف الأقصى: 15MB · تشفير آمن End-to-End" : "Max size 15MB · 256-bit AES encryption"}
                    </p>
                  </div>
                </div>

                {/* Notes & Declaration */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {isAr ? "ملاحظات إضافية لفريق الامتثال (اختياري):" : "Additional Notes for Compliance (Optional):"}
                  </label>
                  <textarea
                    rows={2}
                    value={kycNotes}
                    onChange={(e) => setKycNotes(e.target.value)}
                    placeholder={isAr ? "أي معلومات إضافية ترغب في إرفاقها لمسؤول الامتثال..." : "Any additional notes or account references..."}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <span>
                    {isAr
                      ? "إقرار: أقر بأن كافة البيانات والوثائق المقدمة صحيحة ومطابقة للواقع وتخصني شخصياً وفق لوائح مكافحة غسيل الأموال الدولية."
                      : "Declaration: I hereby affirm that all provided identity documentation is authentic and accurate under international AML laws."}
                  </span>
                </div>

                {/* Submit KYC Button */}
                <button
                  type="submit"
                  disabled={isSubmittingKyc || currentUser.status === "frozen"}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-600 text-white font-bold text-sm transition-all cursor-pointer shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingKyc ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCheck className="w-4 h-4" />
                  )}
                  <span>{isAr ? "إرسال طلب التوثيق الرسمي للإدارة" : "Submit Official KYC Verification Request"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 4: Financial Ledger & Transfer History */}
      {activeTab === "ledger" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? "سجل المعاملات والتحويلات المالية" : "Financial Transactions & Transfers Ledger"}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? "سجل حساب موحد يسجل كافة التحويلات الصادرة والواردة، الإيداعات والسحوبات مع ختم رقمي."
                  : "Complete ledger tracking deposits, withdrawals, and peer-to-peer client transfers."}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {[
                { id: "ALL", labelAr: "الكل", labelEn: "All" },
                { id: "TRANSFER_OUT", labelAr: "تحويلات صادرة", labelEn: "Transfers Out" },
                { id: "TRANSFER_IN", labelAr: "تحويلات واردة", labelEn: "Transfers In" },
                { id: "DEPOSIT", labelAr: "إيداعات", labelEn: "Deposits" },
                { id: "WITHDRAWAL", labelAr: "سحوبات", labelEn: "Withdrawals" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLedgerTypeFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                    ledgerTypeFilter === f.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder={isAr ? "بحث في سجل المعاملات بالبيان أو رقم العملية..." : "Filter transactions by memo or ID..."}
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{isAr ? "رقم العملية والوقت" : "Tx ID & Time"}</th>
                  <th className="py-3 px-4">{isAr ? "نوع المعاملة" : "Type"}</th>
                  <th className="py-3 px-4">{isAr ? "البيان والتفاصيل" : "Description / Memo"}</th>
                  <th className="py-3 px-4">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="py-3 px-4">{isAr ? "الرصيد بعدها" : "Balance After"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "الإيصال" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                      {isAr ? "لا توجد معاملات مسجلة تطابق التصفية الحالية." : "No transactions match the selected filter."}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit =
                      tx.type === "DEPOSIT" ||
                      tx.type === "ADMIN_CREDIT" ||
                      tx.type === "TRANSFER_IN" ||
                      tx.type === "TRADE_PROFIT";

                    return (
                      <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-white font-bold">{tx.id}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(tx.timestamp).toLocaleString(isAr ? "ar-EG" : "en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === "TRANSFER_OUT"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : tx.type === "TRANSFER_IN"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : tx.type === "DEPOSIT"
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {tx.type.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate">
                          {tx.note}
                        </td>

                        <td className={`py-3 px-4 font-bold tabular-nums text-sm ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isCredit ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 text-slate-300 tabular-nums">
                          ${tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setCompletedTransferReceipt(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] font-sans"
                            title={isAr ? "عرض وطباعة الإيصال الرقمي" : "View Receipt"}
                          >
                            {isAr ? "عرض الإيصال" : "Receipt"}
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
      )}

      {/* 8. Tab 5: Security & Institutional API Keys */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? "التحقق بخطوتين (2-Factor Authentication)" : "Two-Factor Authentication (2FA)"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? "حماية إضافية لحسابك وسحوباتك عبر تطبيق Google Authenticator" : "Extra protection using TOTP authenticator"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">
                  {currentUser.twoFactorEnabled ? (isAr ? "الحماية بخطوتين مفعلة" : "2FA Active") : (isAr ? "الحماية غير مفعلة" : "2FA Inactive")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentUser.twoFactorEnabled
                    ? (isAr ? "يطلب رمز OTP عند كل تسجيل دخول أو سحب مالي" : "OTP required for login and withdrawals")
                    : (isAr ? "يوصى بتفعيلها لرفع تصنيف أمان الحساب" : "Recommended for maximum account security")}
                </div>
              </div>

              <button
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentUser.twoFactorEnabled
                    ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                }`}
              >
                {currentUser.twoFactorEnabled ? (isAr ? "تعطيل 2FA" : "Disable 2FA") : (isAr ? "تفعيل الآن" : "Enable 2FA")}
              </button>
            </div>
          </div>

          {/* Institutional Algorithmic API Credentials */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? "مفاتيح التداول الخوارزمي المؤسسي (FIX 4.4 / REST)" : "Institutional Algorithmic API Keys"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? "ربط برامج التداول الآلي وExpert Advisors ومحركات Python" : "Connect MT4/MT5 bridges, Python algorithms, or FIX engines"}
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">API Key:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUser.apiKey || "fastfx_live_institutional_uninitialized"}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() => handleCopy(currentUser.apiKey || "fastfx_live_institutional_demo", "apiKey")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
                    title="Copy API Key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">API Secret:</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showApiSecret ? "text" : "password"}
                    readOnly
                    value={currentUser.apiSecret || "sec_e8472910482019482019482"}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
                    title={showApiSecret ? "Hide" : "Show"}
                  >
                    {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateApiKeys}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-sans font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? "إعادة توليد مفاتيح جديدة" : "Regenerate Keys"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Digital Cryptographic Receipt Modal */}
      {completedTransferReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0c1322] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded uppercase">
                FAST FX OFFICIAL LEDGER RECEIPT
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                {isAr ? "إيصال تحويل مالي معتمد" : "Official Transfer Receipt"}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                TX: {completedTransferReceipt.id}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono text-right">
              <div className="flex items-center justify-between text-slate-400">
                <span>{isAr ? "المبلغ المحول:" : "Amount:"}</span>
                <span className="text-emerald-400 font-bold text-base tabular-nums">
                  ${completedTransferReceipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{isAr ? "التاريخ والوقت:" : "Timestamp:"}</span>
                <span className="text-slate-200">
                  {new Date(completedTransferReceipt.timestamp).toLocaleString(isAr ? "ar-EG" : "en-US")}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{isAr ? "نوع المعاملة:" : "Type:"}</span>
                <span className="text-white">{completedTransferReceipt.type}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-sans">
                {completedTransferReceipt.note}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>{isAr ? "طباعة الإيصال" : "Print"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedTransferReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
