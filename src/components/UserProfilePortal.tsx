import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { sqlDb, SUPER_ADMIN_EMAIL } from "../db/sqlEngine";
import { translations, Language } from "../translations";
import { User, Transaction, KycSubmissionPayload, FundRequest, SubscriptionPlan, SubscriptionTierId } from "../types";
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
  Crown,
  UploadCloud,
  ChevronRight,
  CreditCard,
  Server,
  Zap,
  CheckCheck,
  X,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  Shield
} from "lucide-react";

interface UserProfilePortalProps {
  lang: Language;
  onNavigateToTrading: () => void;
  onNavigateToLanding: () => void;
}

type TabType =
  | "portfolio"
  | "subscription"
  | "transfer"
  | "kyc"
  | "ledger"
  | "funding"
  | "security"
  | "specs";

export const UserProfilePortal: React.FC<UserProfilePortalProps> = ({
  lang,
  onNavigateToTrading,
  onNavigateToLanding
}) => {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const t = translations[lang];
  const isAr = lang === "ar";

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");

  // Notifications & Copy state
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick Action Modals
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>("1000");
  const [depositMethod, setDepositMethod] = useState<"USDT_TRC20" | "VISA_MASTERCARD" | "BANK_WIRE" | "APPLE_PAY">("USDT_TRC20");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawMethod, setWithdrawMethod] = useState<"CRYPTO" | "BANK_WIRE" | "CARD">("CRYPTO");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawNote, setWithdrawNote] = useState<string>("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState<boolean>(false);

  // P2P Transfer State
  const [transferRecipientQuery, setTransferRecipientQuery] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string; email: string; kycStatus: string } | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferNote, setTransferNote] = useState<string>("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [completedTransferReceipt, setCompletedTransferReceipt] = useState<Transaction | null>(null);

  // KYC Verification Form State
  const [kycDocType, setKycDocType] = useState<"PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE">("PASSPORT");
  const [kycDocNumber, setKycDocNumber] = useState<string>("");
  const [kycCountry, setKycCountry] = useState<string>(currentUser?.country || (isAr ? "المملكة العربية السعودية" : "Saudi Arabia"));
  const [kycAddressType, setKycAddressType] = useState<"BANK_STATEMENT" | "UTILITY_BILL" | "GOV_TAX_LETTER">("BANK_STATEMENT");
  const [kycNotes, setKycNotes] = useState<string>("");
  const [kycSimulatedFileName, setKycSimulatedFileName] = useState<string>("");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState<boolean>(false);

  // Security / API Key state
  const [showApiSecret, setShowApiSecret] = useState<boolean>(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState<boolean>(false);

  // Transaction Ledger Filters & Receipt Modal
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>("ALL");
  const [ledgerSearch, setLedgerSearch] = useState<string>("");
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Demo Balance Refill Loading
  const [isRefillingDemo, setIsRefillingDemo] = useState<boolean>(false);

  // Alert handler
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

  const closedTrades = useMemo(() => {
    return userTrades.filter((t) => t.status === "closed");
  }, [userTrades]);

  const winRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
    return Math.round((winningTrades.length / closedTrades.length) * 100);
  }, [closedTrades]);

  const netPnL = useMemo(() => {
    return closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  }, [closedTrades]);

  // Pending withdrawals
  const userFundRequests = useMemo(() => {
    if (!currentUser) return [];
    const all = sqlDb.getFundRequests();
    return all.filter((r) => r.userId === currentUser.id);
  }, [currentUser]);

  // VIP Rank calculation
  const vipRankBadge = useMemo(() => {
    if (!currentUser) return { label: "Standard", color: "text-slate-400", bg: "bg-slate-800" };
    const b = currentUser.balance;
    if (b >= 250000) {
      return {
        label: isAr ? "عضوية سيادية (Sovereign VIP)" : "Sovereign VIP",
        color: "text-amber-400",
        border: "border-amber-400/50",
        glow: "shadow-amber-500/20"
      };
    }
    if (b >= 50000) {
      return {
        label: isAr ? "عضوية ماسية (Black Diamond)" : "Black Diamond",
        color: "text-sky-400",
        border: "border-sky-400/50",
        glow: "shadow-sky-500/20"
      };
    }
    if (b >= 10000) {
      return {
        label: isAr ? "عضوية بلاتينية (Platinum VIP)" : "Platinum VIP",
        color: "text-indigo-400",
        border: "border-indigo-400/50",
        glow: "shadow-indigo-500/20"
      };
    }
    return {
      label: isAr ? "حساب متداول معتمد" : "Standard Trader",
      color: "text-slate-300",
      border: "border-slate-700",
      glow: ""
    };
  }, [currentUser, isAr]);

  // Subscription Plans & Live Realtime Sync
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => sqlDb.getSubscriptionPlans());

  useEffect(() => {
    const unsub = sqlDb.subscribe(() => {
      setPlans(sqlDb.getSubscriptionPlans());
    });
    return unsub;
  }, []);

  const currentPlan = useMemo(() => {
    const tier = currentUser?.subscriptionTier || "bronze";
    return plans.find((p) => p.id === tier) || plans[0] || null;
  }, [currentUser?.subscriptionTier, plans]);

  // Handle Demo Refill
  const handleRefillDemo = () => {
    if (!currentUser) return;
    setIsRefillingDemo(true);
    setTimeout(() => {
      const res = sqlDb.refillDemoBalance(currentUser.id, 50000);
      setIsRefillingDemo(false);
      if (res.success) {
        refreshUser();
        showAlert(
          isAr
            ? "تمت إعادة تعبئة رصيد الحساب التجريبي بمبلغ $50,000 بنجاح"
            : "Demo account refilled with $50,000 successfully",
          "success"
        );
      } else {
        showAlert(isAr ? "فشلت إعادة التعبئة" : "Refill failed", "error");
      }
    }, 400);
  };

  // Handle Direct Deposit
  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const numAmount = parseFloat(depositAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert(isAr ? "يرجى إدخال مبلغ إيداع صحيح" : "Please enter a valid deposit amount", "error");
      return;
    }

    setIsDepositing(true);
    setTimeout(() => {
      const res = sqlDb.depositFunds(currentUser.id, numAmount, depositMethod);
      setIsDepositing(false);
      if (res.success) {
        refreshUser();
        setShowDepositModal(false);
        showAlert(
          isAr
            ? `تم إيداع $${numAmount.toLocaleString()} بنجاح في محفظتك عبر ${depositMethod}`
            : `Successfully deposited $${numAmount.toLocaleString()} via ${depositMethod}`,
          "success"
        );
      } else {
        showAlert(res.error || (isAr ? "فشلت عملية الإيداع" : "Deposit failed"), "error");
      }
    }, 600);
  };

  // Handle Withdrawal Request
  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert(isAr ? "يرجى إدخال مبلغ سحب صحيح" : "Please enter a valid withdrawal amount", "error");
      return;
    }
    if (numAmount > currentUser.balance) {
      showAlert(
        isAr
          ? `رصيدك الحالي ($${currentUser.balance.toLocaleString()}) أقل من المبلغ المطلوب سحبه`
          : `Insufficient balance. Available: $${currentUser.balance.toLocaleString()}`,
        "error"
      );
      return;
    }
    if (!withdrawAddress.trim()) {
      showAlert(isAr ? "يرجى تحديد عنوان المحفظة أو الحساب البنكي" : "Please provide destination address / IBAN", "error");
      return;
    }

    setIsSubmittingWithdrawal(true);
    setTimeout(() => {
      const res = sqlDb.requestWithdrawal(
        currentUser.id,
        numAmount,
        withdrawMethod,
        withdrawAddress.trim(),
        withdrawNote.trim() || undefined
      );
      setIsSubmittingWithdrawal(false);
      if (res.success) {
        refreshUser();
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setWithdrawAddress("");
        setWithdrawNote("");
        showAlert(
          isAr
            ? `تم إرسال طلب سحب بمبلغ $${numAmount.toLocaleString()} بنجاح وهو قيد معالجة الامتثال`
            : `Withdrawal request for $${numAmount.toLocaleString()} submitted for compliance review`,
          "success"
        );
      } else {
        showAlert(res.error || (isAr ? "فشل طلب السحب" : "Withdrawal request failed"), "error");
      }
    }, 600);
  };

  // Handle P2P Transfer Execution
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!selectedRecipient) {
      showAlert(isAr ? "يرجى اختيار العميل المستلم للتحويل" : "Please select a recipient", "error");
      return;
    }
    const numAmount = parseFloat(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert(isAr ? "يرجى إدخال مبلغ تحويل صحيح أكبر من صفر" : "Please enter a valid transfer amount", "error");
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
      showAlert(isAr ? "يرجى كتابة رقم الوثيقة الرسمية" : "Please enter the official document number", "error");
      return;
    }
    if (!kycCountry.trim()) {
      showAlert(isAr ? "يرجى تحديد دولة إصدار الوثيقة" : "Please specify issuing country", "error");
      return;
    }

    setIsSubmittingKyc(true);
    setTimeout(() => {
      const payload: KycSubmissionPayload = {
        documentType: kycDocType,
        documentNumber: kycDocNumber.trim().toUpperCase(),
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
            ? "تم إرسال مستندات التوثيق بنجاح وهي قيد التدقيق لدى مسؤولي الامتثال"
            : "KYC credentials submitted successfully. Under review by compliance team.",
          "success"
        );
      } else {
        showAlert(res.error || (isAr ? "فشل تقديم طلب التوثيق" : "Submission failed"), "error");
      }
    }, 600);
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    if (!currentUser) return;
    const res = sqlDb.toggle2FA(currentUser.id);
    if (res.success) {
      refreshUser();
      setTwoFactorModalOpen(false);
      showAlert(
        res.enabled
          ? (isAr ? "تم تفعيل المصادقة الثنائية (2FA) بنجاح" : "2FA enabled successfully")
          : (isAr ? "تم تعطيل المصادقة الثنائية" : "2FA disabled successfully"),
        "success"
      );
    }
  };

  // Generate Algorithmic API Keys
  const handleRegenerateApi = () => {
    if (!currentUser) return;
    const res = sqlDb.generateApiCredentials(currentUser.id);
    if (res.apiKey) {
      refreshUser();
      showAlert(
        isAr ? "تم إصدار مفاتيح الربط البرمجي (FIX / REST API) بنجاح" : "Generated new FIX / REST API credentials",
        "success"
      );
    }
  };

  // If user is not logged in
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#090e1a] border border-amber-500/30 flex items-center justify-center shadow-2xl">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? "بوابة حساب العميل المؤسسي" : "Institutional Client Portal"}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {isAr
              ? "يرجى تسجيل الدخول للوصول إلى لوحة إدارة الحساب، التحويل بين العملاء، التوثيق الرسمي، ومفاتيح التداول."
              : "Please sign in to access your institutional account management, client transfers, KYC compliance, and trading keys."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {isAr ? "تسجيل الدخول الآن" : "Sign In Now"}
          </button>
          <button
            onClick={() => openAuthModal("register")}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {isAr ? "فتح حساب جديد" : "Create Account"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-200 font-sans pb-16">
      {/* 1. Contextual Institutional Top Header Bar */}
      <div className="border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Breadcrumb Context */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate">
            <span className="text-amber-400 font-bold tracking-wider">FAST FX</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium">
              {isAr ? "لوحة العميل" : "CLIENT WORKSTATION"}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-bold truncate">
              #{currentUser.id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Institutional Telemetry & Live Fast Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Equinix Latency */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>LD4 LONDON</span>
              <span className="text-emerald-400 font-bold">11.8ms</span>
            </div>

            {/* Quick Deposit Button */}
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAr ? "إيداع" : "Deposit"}</span>
            </button>

            {/* Quick Withdraw Button */}
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isAr ? "سحب" : "Withdraw"}</span>
            </button>

            {/* Open Trading Terminal CTA */}
            <button
              onClick={onNavigateToTrading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? "منصة التداول" : "Trading Terminal"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Flash Alert Notification */}
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

        {/* 2. Executive Treasury Command Strip (4 High-Density Blocks) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Real Balance Card */}
          <div className="bg-[#0b101d] p-4 sm:p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{isAr ? "الرصيد الحقيقي المتاح" : "Real Available Balance"}</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums tracking-tight">
              ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <span className="text-slate-500">{isAr ? "حفظ منفصل Tier-1" : "Segregated Custody"}</span>
              <button
                onClick={() => setShowDepositModal(true)}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                + {isAr ? "إيداع" : "Deposit"}
              </button>
            </div>
          </div>

          {/* Equity & Leverage Card */}
          <div className="bg-[#0b101d] p-4 sm:p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{isAr ? "رأس المال والرافعة" : "Equity & Leverage"}</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums tracking-tight">
              ${currentUser.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <span className="text-sky-400 font-semibold">1:500 {isAr ? "رافعة مؤسسية" : "Leverage"}</span>
              <span className="text-slate-500">Raw 0.0 Pips</span>
            </div>
          </div>

          {/* Demo Balance Card with 1-Click Refill */}
          <div className="bg-[#0b101d] p-4 sm:p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{isAr ? "الرصيد التجريبي (Demo)" : "Practice Demo Balance"}</span>
              <CandlestickChart className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums tracking-tight">
              ${(currentUser.demoBalance ?? 50000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <span className="text-slate-500">{isAr ? "محاكاة واقعية" : "Live Feed"}</span>
              <button
                onClick={handleRefillDemo}
                disabled={isRefillingDemo}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefillingDemo ? "animate-spin" : ""}`} />
                <span>{isAr ? "شحن $50k" : "Refill"}</span>
              </button>
            </div>
          </div>

          {/* Win Rate & Performance Card */}
          <div className="bg-[#0b101d] p-4 sm:p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{isAr ? "أداء التداول ونسبة النجاح" : "Win Rate & Realized PnL"}</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums tracking-tight flex items-baseline gap-2">
              <span>{winRate}%</span>
              <span className={`text-xs font-bold ${netPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({netPnL >= 0 ? "+" : ""}${netPnL.toFixed(2)})
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
              <span>{closedTrades.length} {isAr ? "صفقة مكتملة" : "Closed Trades"}</span>
              <span className="text-emerald-400 font-semibold">{isAr ? "بدون عمولات" : "0% Fee"}</span>
            </div>
          </div>
        </div>

        {/* 3. Workstation Two-Column Grid (Sidebar Navigation + Main Content Canvas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Navigation Rail (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Client Profile Identity Card */}
            <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                {/* Visual Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-indigo-600/30 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg font-black font-mono shadow-inner shrink-0 relative">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                  {currentUser.kycStatus === "verified" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                    <span className="truncate">{currentUser.name}</span>
                  </div>
                  <div className="text-slate-400 text-xs font-mono truncate">{currentUser.email}</div>
                  <div className="text-[11px] font-mono text-amber-400 font-semibold mt-0.5">
                    {vipRankBadge.label}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      onClick={() => setActiveTab("subscription")}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        currentUser.subscriptionTier === "gold"
                          ? "border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-sm shadow-amber-500/20"
                          : currentUser.subscriptionTier === "silver"
                          ? "border-slate-400/50 bg-slate-400/15 text-slate-200 hover:bg-slate-400/25"
                          : "border-amber-700/50 bg-amber-700/15 text-amber-500 hover:bg-amber-700/25"
                      }`}
                      title={isAr ? "عرض تفاصيل باقة الاشتراك" : "View subscription details"}
                    >
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{currentPlan ? (isAr ? currentPlan.nameAr : currentPlan.nameEn) : (isAr ? "الاشتراك البرونزي" : "Bronze Tier")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Zero-Pill Account Specs Metadata */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "باقة الاشتراك:" : "Subscription Plan:"}</span>
                  <button
                    onClick={() => setActiveTab("subscription")}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{currentPlan ? (isAr ? currentPlan.nameAr : currentPlan.nameEn) : (isAr ? "برونزي" : "Bronze")}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "معرّف الحساب:" : "Account ID:"}</span>
                  <button
                    onClick={() => handleCopy(currentUser.id, "account_id")}
                    className="text-white hover:text-amber-400 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                  >
                    <span>#{currentUser.id.slice(-8).toUpperCase()}</span>
                    {copiedKey === "account_id" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "حالة الحساب:" : "Account Status:"}</span>
                  <span className={currentUser.status === "frozen" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {currentUser.status === "frozen" ? (isAr ? "مُجمّد" : "Frozen") : (isAr ? "نشط ومفعل" : "Active")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>{isAr ? "توثيق KYC:" : "KYC Status:"}</span>
                  <span
                    className={`font-semibold ${
                      currentUser.kycStatus === "verified"
                        ? "text-emerald-400"
                        : currentUser.kycStatus === "pending"
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    {currentUser.kycStatus === "verified"
                      ? (isAr ? "موثق معتمد" : "Verified")
                      : currentUser.kycStatus === "pending"
                      ? (isAr ? "قيد المراجعة" : "Under Review")
                      : (isAr ? "غير موثق" : "Unverified")}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-2 space-y-1 shadow-xl">
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "portfolio"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? "المحفظة والسيولة" : "Portfolio & Balances"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "subscription"
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? "باقة الاشتراك والخصائص" : "Subscription & Perks"}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                  currentUser.subscriptionTier === "gold"
                    ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    : currentUser.subscriptionTier === "silver"
                    ? "border-slate-500/40 text-slate-300 bg-slate-500/10"
                    : "border-amber-700/40 text-amber-500 bg-amber-700/10"
                }`}>
                  {currentUser.subscriptionTier === "gold" ? "GOLD" : currentUser.subscriptionTier === "silver" ? "SILVER" : "BRONZE"}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("transfer")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "transfer"
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? "التحويل بين العملاء" : "P2P Client Transfer"}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">0% FEE</span>
              </button>

              <button
                onClick={() => setActiveTab("kyc")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "kyc"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? "التوثيق والامتثال" : "KYC Compliance"}</span>
                </div>
                {currentUser.kycStatus === "verified" ? (
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono">REQUIRED</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("ledger")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "كشف الحساب والعمليات" : "Financial Ledger"}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{userTransactions.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("funding")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "funding"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-teal-400" />
                  <span>{isAr ? "الإيداع والسحب المؤسسي" : "Funding Desk"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? "الأمان ومفاتيح البرمجة" : "Security & API"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "specs"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? "الشروط والمزايا المؤسسية" : "Institutional Specs"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            {/* Quick Trading Terminal Launcher Box */}
            <div className="bg-[#0b101d] border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isAr ? "تداول فائق اللحظية" : "Ultra-Fast Execution"}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr
                  ? "فروق أسعار خام تبدأ من 0.0 نقطة مع سيولة بنكية من المستوى الأول وتنفيذ أسرع من 15 مللي ثانية."
                  : "Raw spreads from 0.0 pips with Tier-1 interbank liquidity and execution under 15ms."}
              </p>
              <button
                onClick={onNavigateToTrading}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? "فتح منصة التداول" : "Launch Terminal"}</span>
              </button>
            </div>
          </div>

          {/* Main Workstation Canvas (lg:col-span-9) */}
          <div className="lg:col-span-9 space-y-6">
            {/* ============================================================== */}
            {/* TAB 1: PORTFOLIO & BALANCES                                    */}
            {/* ============================================================== */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                {/* Visual Asset Allocation & Health Breakdown */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? "توزيع السيولة والضمانات المالية" : "Liquidity & Margin Breakdown"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "رؤية شاملة للسيولة الحرة، رأس المال المحجوز في الصفقات، والرافعة المالية النشطة"
                          : "Consolidated view of free liquidity, committed trade margins, and active leverage"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">{isAr ? "العملة الأساسية:" : "Base Currency:"}</span>
                      <span className="text-white font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">USD ($)</span>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${Math.min(100, Math.max(15, (currentUser.balance / (currentUser.balance + 1000)) * 100))}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title="Available Cash Balance"
                      />
                      <div
                        style={{ width: "10%" }}
                        className="bg-sky-500 h-full transition-all"
                        title="Forex Margin Requirement"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>{isAr ? "السيولة المتاحة للسحب والتداول (90%)" : "Available Cash (90%)"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                        <span>{isAr ? "الهامش المحجوز (10%)" : "Committed Margin (10%)"}</span>
                      </span>
                    </div>
                  </div>

                  {/* 3 Detail KPI Mini-Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400">{isAr ? "الهامش الحر (Free Margin)" : "Free Margin"}</div>
                      <div className="text-lg font-bold text-white font-mono tabular-nums mt-1">
                        ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{isAr ? "100% متاح لفتح مراكز جديدة" : "100% Available to trade"}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400">{isAr ? "مستوى الهامش (Margin Level)" : "Margin Level"}</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-1">
                        &gt; 999.00%
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{isAr ? "وضع الأمان: فائق الاستقرار" : "Safety: Highly Secure"}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400">{isAr ? "حماية الرصيد السلبي" : "Negative Balance Protection"}</div>
                      <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                        100% {isAr ? "مضمون" : "Guaranteed"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{isAr ? "لا يمكن أن يصبح رصيدك سالباً" : "Zero balance risk"}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quick Peer Transfer Banner */}
                  <div className="bg-[#0b101d] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                          {isAr ? "التحويل بين العملاء P2P" : "Internal Client Transfer"}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">0% FEE</span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {isAr ? "تحويل فوري بدون أي رسوم" : "Instant 0% Peer Transfer"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isAr
                          ? "حول رصيدك مباشرة إلى حساب متداول آخر داخل FAST FX برقم الحساب أو البريد الإلكتروني مع إيصال رقمي فوري."
                          : "Transfer balance instantaneously to any registered FAST FX client via account ID or email with instant digital voucher."}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("transfer")}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold transition-all shadow-md hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{isAr ? "بدء التحويل إلى عميل الآن" : "Transfer to Client"}</span>
                    </button>
                  </div>

                  {/* KYC Compliance Status Card */}
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                          {isAr ? "الامتثال والتنظيم الدولي" : "AML / KYC Compliance"}
                        </span>
                        <span className="text-[11px] font-mono text-sky-400 font-bold">
                          {currentUser.kycTier?.replace(/_/g, " ") || "TIER 1"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {currentUser.kycStatus === "verified"
                          ? (isAr ? "حسابك موثق ومعتمد رسمياً" : "Your Account is Fully Verified")
                          : currentUser.kycStatus === "pending"
                          ? (isAr ? "طلب التوثيق قيد المراجعة" : "KYC Review in Progress")
                          : (isAr ? "وثّق حسابك لرفع سقف السحب" : "Verify Account for Full Access")}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {currentUser.kycStatus === "verified"
                          ? (isAr ? "تم اعتماد وثائقك بنجاح. تتمتع بكافة ميزات السحب غير المحدود وفروق الأسعار الخام." : "Institutional clearance active with unrestricted daily withdrawal limits.")
                          : (isAr ? "قدم جواز السفر أو الهوية الوطنية لفتح السحب حتى 500,000$ يومياً." : "Submit official ID to unlock $500,000 daily limits.")}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("kyc")}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{currentUser.kycStatus === "verified" ? (isAr ? "عرض شهادة التوثيق" : "View Certificate") : (isAr ? "إدارة وتحديث التوثيق" : "Manage KYC")}</span>
                    </button>
                  </div>
                </div>

                {/* Recent Transactions Quick Peek */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{isAr ? "أحدث العمليات المالية" : "Recent Account Activity"}</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("ledger")}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                    >
                      {isAr ? "عرض السجل الكامل ←" : "View All History →"}
                    </button>
                  </div>

                  {userTransactions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-mono">
                      {isAr ? "لا توجد معاملات سابقة مسجلة حتى الآن." : "No transactions recorded yet."}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80">
                      {userTransactions.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="py-3 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                              {tx.type.includes("TRANSFER") ? (
                                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                              ) : tx.type === "DEPOSIT" || tx.type === "ADMIN_CREDIT" ? (
                                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-white font-medium font-sans">{tx.note}</div>
                              <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`font-bold tabular-nums ${tx.type === "TRANSFER_OUT" || tx.type === "WITHDRAWAL" ? "text-rose-400" : "text-emerald-400"}`}>
                              {tx.type === "TRANSFER_OUT" || tx.type === "WITHDRAWAL" ? "-" : "+"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <button
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer underline font-sans"
                            >
                              {isAr ? "الإيصال" : "Receipt"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SUBSCRIPTION PLANS & DYNAMIC PERKS                        */}
            {/* ============================================================== */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                {/* Active Plan Hero Header */}
                <div className={`p-6 sm:p-7 rounded-2xl border relative overflow-hidden shadow-2xl transition-all ${
                  currentUser.subscriptionTier === "gold"
                    ? "bg-gradient-to-br from-amber-950/30 via-[#0b101d] to-[#070b14] border-amber-500/50 shadow-amber-500/10"
                    : currentUser.subscriptionTier === "silver"
                    ? "bg-gradient-to-br from-slate-800/30 via-[#0b101d] to-[#070b14] border-slate-500/50 shadow-slate-500/10"
                    : "bg-gradient-to-br from-amber-900/20 via-[#0b101d] to-[#070b14] border-amber-700/50 shadow-amber-900/10"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          {isAr ? "باقة العضوية الحالية المعتمدة" : "Active Subscription Membership"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{isAr ? "نشطة ومفعّلة" : "ACTIVE"}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Crown className={`w-7 h-7 shrink-0 ${
                          currentUser.subscriptionTier === "gold"
                            ? "text-amber-400 animate-pulse"
                            : currentUser.subscriptionTier === "silver"
                            ? "text-slate-300"
                            : "text-amber-600"
                        }`} />
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {currentPlan ? (isAr ? currentPlan.nameAr : currentPlan.nameEn) : (isAr ? "الاشتراك البرونزي" : "Bronze Plan")}
                        </h1>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                        {currentPlan ? (isAr ? currentPlan.descriptionAr : currentPlan.descriptionEn) : ""}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1 shrink-0 font-mono">
                      <div className="text-[11px] text-slate-500">{isAr ? "الحد الأدنى المطلوب للإيداع" : "Min Deposit Required"}</div>
                      <div className="text-2xl font-black text-white tabular-nums">
                        ${(currentPlan?.minDeposit ?? 250).toLocaleString()} USD
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {isAr ? "تفعيل تلقائي مع كل إيداع" : "Auto-Qualified on Deposit"}
                      </div>
                    </div>
                  </div>

                  {/* High-Impact Technical Parameters Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">{isAr ? "فروق الأسعار (Spreads)" : "Raw Spreads"}</div>
                      <div className="text-lg font-black text-emerald-400 font-mono tabular-nums">
                        {currentPlan?.spreadFromPips === 0 ? "0.0 RAW" : `${currentPlan?.spreadFromPips ?? 1.4} Pips`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{isAr ? "بدون زيادة سعرية" : "Zero Markup"}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">{isAr ? "الرافعة المالية القصوى" : "Max Leverage"}</div>
                      <div className="text-lg font-black text-white font-mono tabular-nums">
                        1:{currentPlan?.maxLeverage ?? 100}
                      </div>
                      <div className="text-[10px] text-sky-400 font-mono mt-0.5">{isAr ? "تحكم مرن في الهامش" : "Dynamic Margin"}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">{isAr ? "سرعة تنفيذ الأوامر" : "Latency / Speed"}</div>
                      <div className="text-lg font-black text-amber-400 font-mono tabular-nums">
                        &lt;{currentPlan?.executionSpeedMs ?? 45}ms
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Equinix LD4 Fiber</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">{isAr ? "رسوم الصيانة الشهرية" : "Monthly Pricing"}</div>
                      <div className="text-lg font-black text-emerald-400 font-mono tabular-nums">
                        $0 / {isAr ? "مجاني" : "Free"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{isAr ? "للمتداولين النشطين" : "Active Traders"}</div>
                    </div>
                  </div>
                </div>

                {/* Core Privileges Status Grid */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? "المزايا الأساسية المضمونة في باقتك" : "Guaranteed Core Privileges"}</span>
                    </h2>
                    <span className="text-xs font-mono text-slate-400">FAST FX INSTITUTIONAL</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      currentPlan?.swapFreeIslamic ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      <div className="flex items-center gap-2.5 font-medium">
                        <CheckCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{isAr ? "حساب إسلامي شرعي 100% خالٍ من فوائد التبييت (Swap-Free)" : "100% Certified Islamic Swap-Free"}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-400">{isAr ? "مفعّل" : "ACTIVE"}</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      currentPlan?.dedicatedManager ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      <div className="flex items-center gap-2.5 font-medium">
                        {currentPlan?.dedicatedManager ? (
                          <CheckCheck className="w-4 h-4 shrink-0 text-amber-400" />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-600" />
                        )}
                        <span>{isAr ? "مدير حساب مؤسسي شخصي متاح 24/7" : "Dedicated Senior Account Manager"}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${currentPlan?.dedicatedManager ? "text-amber-400" : "text-slate-600"}`}>
                        {currentPlan?.dedicatedManager ? (isAr ? "مشمول" : "INCLUDED") : (isAr ? "غير مشمول" : "N/A")}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      currentPlan?.tradingSignals ? "bg-sky-500/10 border-sky-500/30 text-sky-300" : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      <div className="flex items-center gap-2.5 font-medium">
                        {currentPlan?.tradingSignals ? (
                          <CheckCheck className="w-4 h-4 shrink-0 text-sky-400" />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-600" />
                        )}
                        <span>{isAr ? "توصيات تداول حية وتحديثات التحليل الفني اليومية" : "Live Trading Signals & Market Intelligence"}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${currentPlan?.tradingSignals ? "text-sky-400" : "text-slate-600"}`}>
                        {currentPlan?.tradingSignals ? (isAr ? "مشمول" : "INCLUDED") : (isAr ? "غير مشمول" : "N/A")}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      currentPlan?.apiAccess ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      <div className="flex items-center gap-2.5 font-medium">
                        {currentPlan?.apiAccess ? (
                          <CheckCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-slate-600" />
                        )}
                        <span>{isAr ? "واجهات برمجة روبوتات التداول FIX 4.4 & REST Institutional API" : "FIX 4.4 & REST Algorithmic API"}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${currentPlan?.apiAccess ? "text-indigo-400" : "text-slate-600"}`}>
                        {currentPlan?.apiAccess ? (isAr ? "مشمول" : "INCLUDED") : (isAr ? "غير مشمول" : "N/A")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Custom Perks Configured Exclusively by Admin */}
                <div className="bg-[#0b101d] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? "الخصائص والمزايا الحصرية المحددة من الإدارة" : "Custom Perks Configured by Administration"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "خصائص ديناميكية تُخصصها وتُحدثها إدارة FAST FX حصرياً لكل باقة اشتراك."
                          : "Dynamic properties exclusively curated and maintained by broker leadership."}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono shrink-0">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{isAr ? "تحكم الإدارة فقط" : "Admin Managed"}</span>
                    </div>
                  </div>

                  {currentPlan && currentPlan.customPerks && currentPlan.customPerks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPlan.customPerks.map((perk, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 transition-colors flex items-start gap-3"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-mono text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-slate-200 text-xs font-semibold leading-snug">{perk}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{isAr ? "ميزة نشطة في حسابك" : "Active on your account"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-900/50 rounded-xl border border-slate-800">
                      {isAr ? "لا توجد خصائص إضافية مخصصة حالياً لهذه الباقة" : "No custom perks configured for this tier yet"}
                    </div>
                  )}
                </div>

                {/* All 3 Tiers Comparison Matrix */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="pb-3 border-b border-slate-800">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? "مقارنة باقات الاشتراكات الثلاث المعتمدة" : "All 3 Subscription Tiers Comparison"}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr
                        ? "استعرض الفروقات بين باقات الحساب البرونزي، الفضي، والذهبي VIP."
                        : "Compare features, execution models, and spreads across Bronze, Silver, and Gold VIP tiers."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => {
                      const isCurrent = (currentUser.subscriptionTier || "bronze") === p.id;
                      const isGold = p.id === "gold";
                      const isSilver = p.id === "silver";

                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl p-5 border relative flex flex-col justify-between transition-all ${
                            isCurrent
                              ? isGold
                                ? "bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/30"
                                : isSilver
                                ? "bg-slate-900/90 border-slate-400 ring-2 ring-slate-400/30"
                                : "bg-amber-950/10 border-amber-700 ring-2 ring-amber-700/30"
                              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {/* Active Plan Tag */}
                          {isCurrent && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                              {isAr ? "باقتك الحالية" : "YOUR ACTIVE TIER"}
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                isGold
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                  : isSilver
                                  ? "border-slate-500/40 text-slate-300 bg-slate-500/10"
                                  : "border-amber-700/40 text-amber-500 bg-amber-700/10"
                              }`}>
                                {p.id.toUpperCase()}
                              </span>
                              <div className="text-right">
                                <div className="text-xs text-slate-500 font-mono">{isAr ? "إيداع من" : "From"}</div>
                                <div className="text-sm font-black text-white font-mono">${p.minDeposit.toLocaleString()}</div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-base font-bold text-white">
                                {isAr ? p.nameAr : p.nameEn}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {isAr ? p.descriptionAr : p.descriptionEn}
                              </p>
                            </div>

                            {/* Core Specs */}
                            <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-slate-800">
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "فروق الأسعار:" : "Spreads:"}</span>
                                <span className="text-white font-bold">{p.spreadFromPips === 0 ? "0.0 Raw" : `${p.spreadFromPips} Pips`}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "الرافعة:" : "Leverage:"}</span>
                                <span className="text-white font-bold">1:{p.maxLeverage}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "زمن التنفيذ:" : "Speed:"}</span>
                                <span className="text-amber-400 font-bold">&lt;{p.executionSpeedMs}ms</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "حساب إسلامي:" : "Islamic:"}</span>
                                <span className="text-emerald-400 font-bold">{isAr ? "متاح" : "Yes"}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "مدير حساب خاص:" : "Manager:"}</span>
                                <span className={p.dedicatedManager ? "text-emerald-400 font-bold" : "text-slate-600"}>
                                  {p.dedicatedManager ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>{isAr ? "ربط FIX API:" : "API:"}</span>
                                <span className={p.apiAccess ? "text-emerald-400 font-bold" : "text-slate-600"}>
                                  {p.apiAccess ? (isAr ? "متاح" : "Yes") : (isAr ? "لا" : "No")}
                                </span>
                              </div>
                            </div>

                            {/* Custom Perks for this Plan */}
                            {p.customPerks && p.customPerks.length > 0 && (
                              <div className="pt-2 border-t border-slate-800 space-y-1">
                                <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                                  {isAr ? "الخصائص الإضافية المخصصة:" : "Configured Perks:"}
                                </div>
                                {p.customPerks.map((perk, i) => (
                                  <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="truncate">{perk}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-4 mt-3 border-t border-slate-800">
                            {isCurrent ? (
                              <div className="py-2 rounded-xl bg-slate-800 text-center text-xs font-bold text-emerald-400 font-mono">
                                {isAr ? "✓ باقتك الحالية المعتمدة" : "✓ Current Active Plan"}
                              </div>
                            ) : (
                              <div className="py-2 rounded-xl bg-slate-900 text-center text-xs text-slate-400 font-mono">
                                {isAr ? "تُمنح عبر إدارة المنصة" : "Assigned by Admin"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Authority Policy Notice */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 font-sans">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">
                        {isAr ? "سياسة إدارة وترقية الاشتراكات المؤسسية" : "Institutional Subscription Upgrade Policy"}
                      </div>
                      <div className="mt-1 leading-relaxed">
                        {isAr
                          ? "وفقاً لسياسة الامتثال في FAST FX، يستطيع المدير فقط من خلال لوحة التحكم الخاصة به التحكم في هذه الاشتراكات، تعديل خصائصها، وترقية حسابات العملاء بعد استيفاء شروط الإيداع والتداول."
                          : "In accordance with FAST FX compliance policies, only administrators in the Admin Control Panel have the authority to configure subscription tier parameters, add custom perks, and upgrade client accounts."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: P2P CLIENT-TO-CLIENT TRANSFER                           */}
            {/* ============================================================== */}
            {activeTab === "transfer" && (
              <div className="space-y-6">
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? "التحويل المالي المباشر بين العملاء (P2P Transfer)" : "Internal Client-to-Client Transfer"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "تحويل فوري فائق السرعة بدون عمولات (0% Fee) بين متداولي FAST FX مع توثيق إلكتروني معتمد"
                          : "Instant internal ledger transfer with zero fees and certified cryptographic receipt"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">{isAr ? "رصيدك المتاح:" : "Available:"}</span>
                      <span className="text-emerald-400 font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                        ${currentUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Form */}
                  <form onSubmit={handleExecuteTransfer} className="space-y-5">
                    {/* Step 1: Select Recipient */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        1. {isAr ? "تحديد المستلم (بالبريد الإلكتروني، الاسم، أو كود الحساب)" : "Recipient Lookup"}
                      </label>

                      {!selectedRecipient ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                            <input
                              type="text"
                              value={transferRecipientQuery}
                              onChange={(e) => setTransferRecipientQuery(e.target.value)}
                              placeholder={isAr ? "اكتب اسم العميل، بريده، أو رقم حسابه للبحث..." : "Search trader by name, email, or account ID..."}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                            />
                          </div>

                          {/* Live Search Suggestions Dropdown */}
                          {transferRecipientQuery.trim() && (
                            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl divide-y divide-slate-800 max-h-56 overflow-y-auto">
                              {searchResults.length === 0 ? (
                                <div className="p-3 text-xs text-slate-500 text-center font-mono">
                                  {isAr ? "لم يتم العثور على أي متداول مطابق للبحث" : "No matching clients found"}
                                </div>
                              ) : (
                                searchResults.map((u) => (
                                  <div
                                    key={u.id}
                                    onClick={() => {
                                      setSelectedRecipient(u);
                                      setTransferRecipientQuery("");
                                    }}
                                    className="p-3 flex items-center justify-between hover:bg-slate-800/70 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs">
                                        {u.name.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="text-white text-xs font-semibold">{u.name}</div>
                                        <div className="text-slate-400 text-[10px] font-mono">{u.email}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[11px] font-mono text-amber-400 font-bold">
                                        #{u.id.slice(-6).toUpperCase()}
                                      </div>
                                      <div className="text-[10px] text-slate-400 capitalize">{u.kycStatus}</div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Selected Recipient Card */
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-sm">
                              {selectedRecipient.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-bold text-xs flex items-center gap-1.5">
                                <span>{selectedRecipient.name}</span>
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <div className="text-slate-400 text-[11px] font-mono">{selectedRecipient.email}</div>
                              <div className="text-[10px] font-mono text-amber-400">
                                #{selectedRecipient.id.slice(-8).toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedRecipient(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {isAr ? "تغيير المستلم" : "Change"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Transfer Amount */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        2. {isAr ? "المبلغ المراد تحويله (USD)" : "Transfer Amount (USD)"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-sm font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          max={currentUser.balance}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 pl-8 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono font-bold"
                        />
                      </div>

                      {/* Percentage Shortcuts */}
                      <div className="flex items-center gap-2 pt-1">
                        {[0.25, 0.5, 0.75, 1].map((pct) => (
                          <button
                            type="button"
                            key={pct}
                            onClick={() => setTransferAmount((currentUser.balance * pct).toFixed(2))}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                          >
                            {pct * 100}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Optional Reference Note */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        3. {isAr ? "ملاحظة أو سبب التحويل (اختياري)" : "Transfer Reference Note (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        placeholder={isAr ? "مثال: تسوية صفقات مشتركة، دعم حساب، إلخ..." : "e.g., Shared trade settlement, internal allocation..."}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>

                    {/* Fee Summary */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{isAr ? "عمولة التحويل الداخلي:" : "Internal Network Fee:"}</span>
                        <span className="text-emerald-400 font-bold">$0.00 (مجاناً 100%)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{isAr ? "وقت التسوية والتنفيذ:" : "Execution Latency:"}</span>
                        <span className="text-amber-400 font-bold">{isAr ? "لحظي (< 1 ثانية)" : "Instant (<1 sec)"}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingTransfer || !selectedRecipient || !transferAmount}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:opacity-95 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingTransfer ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isAr ? "جاري تنفيذ التحويل الفوري..." : "Executing Ledger Transfer..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isAr ? "تأكيد وتنفيذ التحويل الآن" : "Confirm & Execute Transfer"}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Transfer Benefits Guarantee Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#0b101d] border border-slate-800/80 text-xs space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "أمان مصرفي مشفر" : "Cryptographic Security"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr ? "كل معاملة مسجلة في دفتر الأستاذ المشفر مع كود تدقيق رسمي." : "Every transfer is immutably logged with an official SHA-256 audit hash."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0b101d] border border-slate-800/80 text-xs space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? "تنفيذ لحظي 100%" : "Zero Latency"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr ? "ينتقل الرصيد إلى محفظة المستلم فوراً دون انتظار فترات تسوية." : "Funds clear into recipient balance instantly without settlement delay."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0b101d] border border-slate-800/80 text-xs space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-sky-400" />
                      <span>{isAr ? "إيصالات رقمية قابلة للطباعة" : "Digital Receipts"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr ? "احصل على سند قبض إلكتروني فوري جاهز للتصدير والطباعة." : "Download or print institutional payment vouchers anytime."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: KYC COMPLIANCE & VERIFICATION                           */}
            {/* ============================================================== */}
            {activeTab === "kyc" && (
              <div className="space-y-6">
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>{isAr ? "بوابة الامتثال وتوثيق الحساب الرسمي (KYC & AML)" : "Official KYC & Regulatory Compliance Center"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "توثيق الهوية الرسمية ومكافحة غسيل الأموال لفتح سقف السحب غير المحدود والحماية القانونية الكاملة"
                          : "Government-grade identity verification to unlock institutional limits and statutory asset protection"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                          currentUser.kycStatus === "verified"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : currentUser.kycStatus === "pending"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {currentUser.kycStatus === "verified"
                          ? (isAr ? "حساب موثق رسمي" : "VERIFIED INSTITUTIONAL")
                          : currentUser.kycStatus === "pending"
                          ? (isAr ? "قيد التدقيق والمراجعة" : "PENDING COMPLIANCE REVIEW")
                          : (isAr ? "غير موثق - يلزم تقديم البيانات" : "UNVERIFIED")}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Institutional Progress Stepper */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>1. {isAr ? "فتح الحساب" : "Registered"}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{isAr ? "مكتمل بنجاح" : "Completed"}</div>
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 font-bold ${currentUser.kycStatus !== "unverified" ? "text-emerald-400" : "text-slate-400"}`}>
                          {currentUser.kycStatus !== "unverified" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>2. {isAr ? "إرسال الوثائق" : "Submit Docs"}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {currentUser.kycStatus !== "unverified" ? (isAr ? "تم الاستلام" : "Received") : (isAr ? "بانتظار الإرسال" : "Pending")}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 font-bold ${currentUser.kycStatus === "verified" ? "text-emerald-400" : currentUser.kycStatus === "pending" ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                          <Activity className="w-3.5 h-3.5" />
                          <span>3. {isAr ? "فحص AML" : "AML Check"}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {currentUser.kycStatus === "verified" ? (isAr ? "تم الاجتياز" : "Passed") : currentUser.kycStatus === "pending" ? (isAr ? "جاري الفحص" : "Active") : "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 font-bold ${currentUser.kycStatus === "verified" ? "text-emerald-400" : "text-slate-500"}`}>
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>4. {isAr ? "الاعتماد المؤسسي" : "Verified Tier-2"}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {currentUser.kycStatus === "verified" ? (isAr ? "معتمد رسمياً" : "Tier-2 Active") : (isAr ? "قيد الانتظار" : "Awaiting")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form or Verified Stamp Display */}
                  {currentUser.kycStatus === "verified" ? (
                    /* Official Verification Certificate */
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-indigo-500/10 border border-emerald-500/40 text-center space-y-4 shadow-xl">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                        <BadgeCheck className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">
                          {isAr ? "شهادة الاعتماد والتوثيق المؤسسي المالي" : "Official Financial Compliance Verification Certificate"}
                        </h3>
                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                          {isAr
                            ? `تم التحقق من بيانات المستثمر ${currentUser.name} بالكامل وفق معايير هيئات الأوراق المالية وهيئة مكافحة غسيل الأموال الدولية.`
                            : `Identity credentials for investor ${currentUser.name} have been fully verified under statutory AML & KYC standards.`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-xs font-mono pt-2">
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">{isAr ? "المستوى المعتمد:" : "Clearance Tier:"}</span>
                          <span className="text-emerald-400 font-bold">{currentUser.kycTier?.replace(/_/g, " ") || "TIER 2"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">{isAr ? "سقف السحب اليومي:" : "Daily Limit:"}</span>
                          <span className="text-white font-bold">$500,000</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">{isAr ? "نوع الوثيقة:" : "Document:"}</span>
                          <span className="text-white font-bold">{currentUser.kycDocumentType || "Passport"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">{isAr ? "تاريخ التدقيق:" : "Audit Date:"}</span>
                          <span className="text-slate-300">
                            {currentUser.kycReviewedAt ? new Date(currentUser.kycReviewedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Submission Form */
                    <form onSubmit={handleSubmitKycForm} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 mb-1.5 font-bold">
                            {isAr ? "نوع وثيقة إثبات الهوية الرسمية" : "Official ID Document Type"}
                          </label>
                          <select
                            value={kycDocType}
                            onChange={(e) => setKycDocType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-mono"
                          >
                            <option value="PASSPORT">{isAr ? "جواز سفر دولي مميكن (Passport)" : "International Passport"}</option>
                            <option value="NATIONAL_ID">{isAr ? "بطاقة الهوية الوطنية الذكية (National ID)" : "National Identity Card"}</option>
                            <option value="DRIVERS_LICENSE">{isAr ? "رخصة قيادة سارية (Driver's License)" : "Valid Driver's License"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-1.5 font-bold">
                            {isAr ? "رقم الوثيقة الوطنية / الجواز" : "Document Number / ID No."}
                          </label>
                          <input
                            type="text"
                            required
                            value={kycDocNumber}
                            onChange={(e) => setKycDocNumber(e.target.value)}
                            placeholder={isAr ? "مثال: A12345678 أو 1089234812" : "e.g., A12345678 or 1089234812"}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-mono font-bold placeholder-slate-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 mb-1.5 font-bold">
                            {isAr ? "دولة إصدار الوثيقة" : "Issuing Country / Jurisdiction"}
                          </label>
                          <input
                            type="text"
                            required
                            value={kycCountry}
                            onChange={(e) => setKycCountry(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-1.5 font-bold">
                            {isAr ? "مستند إثبات محل الإقامة" : "Proof of Address Document"}
                          </label>
                          <select
                            value={kycAddressType}
                            onChange={(e) => setKycAddressType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-mono"
                          >
                            <option value="BANK_STATEMENT">{isAr ? "كشف حساب بنكي حديث (Bank Statement)" : "Certified Bank Statement (<3 months)"}</option>
                            <option value="UTILITY_BILL">{isAr ? "فاتورة خدمات كهرباء / ماء (Utility Bill)" : "Utility Bill (Water / Electricity)"}</option>
                            <option value="GOV_TAX_LETTER">{isAr ? "إشعار ضريبي أو صك سكني حكومي" : "Government Residence Registration"}</option>
                          </select>
                        </div>
                      </div>

                      {/* Simulated Drag & Drop Secure Upload Box */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-amber-400/60 transition-colors text-center space-y-2 cursor-pointer">
                        <UploadCloud className="w-8 h-8 text-amber-400 mx-auto" />
                        <div className="text-white font-bold">
                          {kycSimulatedFileName || (isAr ? "اضغط لرفع صور الوثيقة (الوجهين) أو اسحب الملفات هنا" : "Upload High-Resolution ID Scan (Front & Back)")}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {isAr ? "صيغ مقبولة: PDF, PNG, JPG (تشفير AES-256 بت آمن)" : "Accepted: PDF, PNG, JPG (Bank-grade AES-256 Encryption)"}
                        </p>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          id="kyc-upload-input"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setKycSimulatedFileName(e.target.files[0].name);
                              showAlert(
                                isAr ? `تم تحديد الملف: ${e.target.files[0].name}` : `Selected file: ${e.target.files[0].name}`,
                                "success"
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor="kyc-upload-input"
                          className="inline-block mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                        >
                          {isAr ? "اختيار الملف من الجهاز" : "Browse Files"}
                        </label>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">
                          {isAr ? "ملاحظات إضافية لمسؤولي الامتثال (اختياري)" : "Additional Compliance Remarks (Optional)"}
                        </label>
                        <textarea
                          rows={2}
                          value={kycNotes}
                          onChange={(e) => setKycNotes(e.target.value)}
                          placeholder={isAr ? "أضف أي تفاصيل خاصة بالحساب أو جهة العمل..." : "Any relevant occupational or residency disclosures..."}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-sans"
                        />
                      </div>

                      {/* Legal Acknowledgment Checkbox */}
                      <div className="flex items-start gap-2.5 pt-2">
                        <input
                          type="checkbox"
                          required
                          id="kyc-ack"
                          className="mt-1 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="kyc-ack" className="text-slate-400 text-[11px] leading-relaxed cursor-pointer">
                          {isAr
                            ? "أقر بصحة الوثائق والمستندات المقدمة وأن الأموال المودعة ناتجة عن مصادر مشروعة ومتوافقة مع المعايير الدولية لمكافحة غسيل الأموال (AML)."
                            : "I certify that all submitted credentials are valid and that source of funds is lawful and compliant with statutory AML guidelines."}
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingKyc}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white font-bold text-xs hover:opacity-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingKyc ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{isAr ? "جاري تدقيق وإرسال البيانات..." : "Submitting Credentials..."}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isAr ? "إرسال طلب التوثيق للاعتماد الرسمي" : "Submit KYC for Formal Clearance"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: FINANCIAL LEDGER & TRANSACTION HISTORY                  */}
            {/* ============================================================== */}
            {activeTab === "ledger" && (
              <div className="space-y-6">
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                  {/* Header & Filter Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? "كشف الحساب وسجل العمليات المالية المعتمد" : "Official Financial Ledger & Account Statement"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "سجل محاسبي رقمي شامل لكافة حركات الإيداع، السحب، التحويلات بين العملاء، وعوائد التداول"
                          : "Immutable accounting ledger of all deposits, withdrawals, peer transfers, and trading settlements"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-500">{isAr ? "عدد المعاملات:" : "Records:"}</span>
                      <span className="text-white font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {filteredTransactions.length}
                      </span>
                    </div>
                  </div>

                  {/* Filter Bar & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    {/* Type Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {[
                        { id: "ALL", label: isAr ? "الكل" : "All" },
                        { id: "TRANSFER_OUT", label: isAr ? "تحويل صادر" : "Transfers Out" },
                        { id: "TRANSFER_IN", label: isAr ? "تحويل وارد" : "Transfers In" },
                        { id: "DEPOSIT", label: isAr ? "إيداعات" : "Deposits" },
                        { id: "WITHDRAWAL", label: isAr ? "سحوبات" : "Withdrawals" }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setLedgerTypeFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            ledgerTypeFilter === f.id
                              ? "bg-slate-800 text-white font-bold border border-slate-700 shadow-sm"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        placeholder={isAr ? "بحث برقم المعاملة أو الوصف..." : "Search tx ID or note..."}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-sans w-full sm:w-60"
                      />
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800/80 text-[11px]">
                          <th className="pb-3">{isAr ? "رقم المرجع" : "TX Ref"}</th>
                          <th className="pb-3">{isAr ? "نوع المعاملة والوصف" : "Type & Description"}</th>
                          <th className="pb-3">{isAr ? "التوقيت" : "Timestamp"}</th>
                          <th className="pb-3 text-right">{isAr ? "المبلغ" : "Amount"}</th>
                          <th className="pb-3 text-right">{isAr ? "الرصيد بعد العملية" : "Balance After"}</th>
                          <th className="pb-3 text-right">{isAr ? "الإجراء" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                              {isAr ? "لا توجد معاملات مطابقة للفلتر المحدد" : "No transactions matching filter"}
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 text-slate-400 font-bold font-mono">
                                #{tx.id.slice(-8).toUpperCase()}
                              </td>

                              <td className="py-3 font-sans">
                                <div className="text-white font-medium">{tx.note}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{tx.type}</div>
                              </td>

                              <td className="py-3 text-slate-400 text-[11px] whitespace-nowrap">
                                {new Date(tx.timestamp).toLocaleString()}
                              </td>

                              <td className="py-3 text-right font-bold tabular-nums">
                                <span
                                  className={
                                    tx.type === "TRANSFER_OUT" || tx.type === "WITHDRAWAL"
                                      ? "text-rose-400"
                                      : "text-emerald-400"
                                  }
                                >
                                  {tx.type === "TRANSFER_OUT" || tx.type === "WITHDRAWAL" ? "-" : "+"}
                                  ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </td>

                              <td className="py-3 text-right text-slate-300 font-mono tabular-nums">
                                ${tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setSelectedReceiptTx(tx)}
                                  className="px-2.5 py-1 text-[11px] rounded bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 font-sans transition-colors cursor-pointer"
                                >
                                  {isAr ? "الإيصال" : "Voucher"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: FUNDING & WITHDRAWAL DESK                               */}
            {/* ============================================================== */}
            {activeTab === "funding" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deposit Card */}
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-white text-base">
                        <PlusCircle className="w-5 h-5 text-emerald-400" />
                        <span>{isAr ? "إيداع فوري في المحفظة" : "Instant Deposit"}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">0% FEE</span>
                    </div>

                    <form onSubmit={handleExecuteDeposit} className="space-y-4 text-xs font-sans">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">{isAr ? "طريقة الإيداع" : "Deposit Method"}</label>
                        <select
                          value={depositMethod}
                          onChange={(e) => setDepositMethod(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-mono"
                        >
                          <option value="USDT_TRC20">USDT (TRC-20 Network - فوري)</option>
                          <option value="VISA_MASTERCARD">Visa / Mastercard (دفع بطاقة بنكية)</option>
                          <option value="BANK_WIRE">International Wire Transfer (حوالة مصرفية)</option>
                          <option value="APPLE_PAY">Apple Pay (دفع سريع)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">{isAr ? "المبلغ (USD)" : "Amount (USD)"}</label>
                        <input
                          type="number"
                          step="10"
                          min="10"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-mono font-bold text-sm"
                        />

                        {/* Presets */}
                        <div className="flex items-center gap-2 pt-2">
                          {["250", "500", "1000", "5000", "10000"].map((preset) => (
                            <button
                              type="button"
                              key={preset}
                              onClick={() => setDepositAmount(preset)}
                              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              ${parseInt(preset).toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isDepositing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isDepositing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{isAr ? "جاري معالجة الإيداع..." : "Processing Deposit..."}</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>{isAr ? "تأكيد الإيداع الآن" : "Confirm Deposit"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Withdrawal Card */}
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-white text-base">
                        <ArrowUpRight className="w-5 h-5 text-rose-400" />
                        <span>{isAr ? "طلب سحب الأرباح" : "Withdrawal Request"}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {isAr ? "المتاح:" : "Available:"} <strong className="text-emerald-400">${currentUser.balance.toLocaleString()}</strong>
                      </span>
                    </div>

                    <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs font-sans">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">{isAr ? "طريقة استلام الأموال" : "Payout Method"}</label>
                        <select
                          value={withdrawMethod}
                          onChange={(e) => setWithdrawMethod(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-400 font-mono"
                        >
                          <option value="CRYPTO">USDT TRC20 / Crypto Wallet (محفظة رقمية)</option>
                          <option value="BANK_WIRE">Bank Wire Transfer (حساب بنكي دولي IBAN)</option>
                          <option value="CARD">Original Credit Card Refund (إرجاع للبطاقة)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">{isAr ? "المبلغ المراد سحبه (USD)" : "Amount (USD)"}</label>
                        <input
                          type="number"
                          step="1"
                          min="10"
                          max={currentUser.balance}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-400 font-mono font-bold text-sm placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-bold">
                          {isAr ? "عنوان المحفظة أو رقم الحساب البنكي (IBAN)" : "Wallet Address or IBAN"}
                        </label>
                        <input
                          type="text"
                          required
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder={isAr ? "اكتب عنوان المحفظة أو IBAN..." : "Enter TRC20 address or IBAN..."}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-400 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingWithdrawal || !withdrawAmount || !withdrawAddress}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingWithdrawal ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{isAr ? "جاري تسجيل طلب السحب..." : "Submitting Withdrawal..."}</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{isAr ? "تقديم طلب السحب" : "Submit Withdrawal"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Active Payout Requests */}
                {userFundRequests.length > 0 && (
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{isAr ? "سجل طلبات السحب الخاصة بك" : "Your Withdrawal Requests"}</span>
                    </h3>
                    <div className="divide-y divide-slate-800/80">
                      {userFundRequests.map((req) => (
                        <div key={req.id} className="py-3 flex items-center justify-between text-xs font-mono">
                          <div>
                            <div className="text-white font-bold">${req.amount.toLocaleString()} via {req.paymentMethod}</div>
                            <div className="text-[10px] text-slate-500">{new Date(req.createdAt).toLocaleString()} · Ref: {req.txReference}</div>
                          </div>
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                req.status === "APPROVED"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : req.status === "PENDING"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: SECURITY & ALGORITHMIC API                              */}
            {/* ============================================================== */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* 2FA Section */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-400" />
                        <span>{isAr ? "المصادقة الثنائية (Two-Factor Authentication - 2FA)" : "Two-Factor Authentication (2FA)"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "حماية فائقة للحساب عند تسجيل الدخول وإجراء التحويلات عبر Google Authenticator أو SMS"
                          : "Enhanced security requiring an OTP verification code for logins and balance withdrawals"}
                      </p>
                    </div>

                    <button
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentUser.twoFactorEnabled
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25"
                          : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
                      }`}
                    >
                      {currentUser.twoFactorEnabled
                        ? (isAr ? "المصادقة الثنائية مفعلة (انقر للتعطيل)" : "2FA Active (Click to Disable)")
                        : (isAr ? "تفعيل المصادقة الثنائية الآن" : "Enable 2FA Protection")}
                    </button>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {isAr
                      ? "المصادقة الثنائية تضيف طبقة حماية بنكية لأصولك تمنع أي وصول غير مصرح به حتى في حالة تسريب كلمة المرور."
                      : "2FA enforces hardware-backed TOTP verification ensuring complete custody defense."}
                  </div>
                </div>

                {/* Algorithmic Trading API Section */}
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? "مفاتيح التداول الآلي (FIX 4.4 & REST Institutional API)" : "Algorithmic FIX 4.4 & REST API"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr
                          ? "ربط برامج التداول الخوارزمي، روبوتات MetaTrader، ومنصات Python لتنفيذ الصفقات بسرعة فائقة"
                          : "Connect automated algorithmic bots, MetaTrader bridges, and Python strategies"}
                      </p>
                    </div>

                    <button
                      onClick={handleRegenerateApi}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-mono font-bold transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? "إعادة توليد المفاتيح" : "Regenerate Keys"}</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    {/* API Key */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 block font-bold">API KEY (Public Client Identifier)</label>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                        <span className="text-amber-400 select-all font-bold">
                          {currentUser.apiKey || "ffx_live_9a8bc76d4e2f103984"}
                        </span>
                        <button
                          onClick={() => handleCopy(currentUser.apiKey || "ffx_live_9a8bc76d4e2f103984", "api_key")}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedKey === "api_key" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* API Secret */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 block font-bold">API SECRET (Private Signing Key)</label>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                        <span className="text-slate-300 font-bold">
                          {showApiSecret
                            ? currentUser.apiSecret || "sec_e8b74c0a1f9e8d7c6b5a4321fedcba09"
                            : "••••••••••••••••••••••••••••••••••••••••"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowApiSecret(!showApiSecret)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {showApiSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentUser.apiSecret || "sec_e8b74c0a1f9e8d7c6b5a4321fedcba09", "api_secret")}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedKey === "api_secret" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Endpoints */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                      <div>REST Gateway: <strong className="text-white">https://api.fastfx.com/v1</strong></div>
                      <div>FIX 4.4 Engine: <strong className="text-white">fix.ld4.fastfx.com:9800</strong></div>
                      <div>Rate Limit: <strong className="text-emerald-400">10,000 req/min (Sub-millisecond)</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 7: INSTITUTIONAL ACCOUNT SPECIFICATIONS                    */}
            {/* ============================================================== */}
            {activeTab === "specs" && (
              <div className="space-y-6">
                <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
                  <div className="pb-4 border-b border-slate-800/80">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? "شروط التداول والمزايا المؤسسية المعتمدة" : "Institutional Specifications & Trading Conditions"}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr
                        ? "المواصفات الفنية المعتمدة لحسابك، معايير التنفيذ، والشهادات الشرعية والتنظيمية"
                        : "Official execution parameters, regulatory certifications, and Sharia compliance"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "نوع الحساب والتنفيذ:" : "Account Execution Type:"}</span>
                      <span className="text-white font-bold text-sm">ECN Raw Direct Market Access (DMA)</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "فروق الأسعار (Spreads):" : "Spreads Model:"}</span>
                      <span className="text-emerald-400 font-bold text-sm">Raw Spreads from 0.0 Pips</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "الحساب الإسلامي الخالي من الفوائد:" : "Islamic Sharia Swap-Free:"}</span>
                      <span className="text-amber-400 font-bold text-sm">100% Certified Swap-Free</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "موقع الخوادم وسرعة الربط:" : "Infrastructure Datacenter:"}</span>
                      <span className="text-sky-400 font-bold text-sm">Equinix London LD4 Fiber (&lt;12ms)</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "حماية الرصيد السلبي:" : "Negative Balance Policy:"}</span>
                      <span className="text-white font-bold text-sm">Full Institutional Statutory Protection</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[11px]">{isAr ? "فصل أموال العملاء (Segregated):" : "Custody Segregation:"}</span>
                      <span className="text-emerald-400 font-bold text-sm">Tier-1 European & UK Custody Banks</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: DIGITAL PRINTABLE RECEIPT MODAL                             */}
      {/* ==================================================================== */}
      {(completedTransferReceipt || selectedReceiptTx) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          {(() => {
            const tx = completedTransferReceipt || selectedReceiptTx!;
            return (
              <div className="w-full max-w-md bg-[#0a0f1d] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-xs font-mono space-y-5">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setCompletedTransferReceipt(null);
                    setSelectedReceiptTx(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Receipt Header with Fast FX Logo */}
                <div className="text-center space-y-1.5 pb-4 border-b border-slate-800">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#070b14] p-1 border border-amber-500/40 shadow-md">
                    <img
                      src="/assets/brand/fast_fx_lightning_logo.jpg"
                      alt="FAST FX"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="text-amber-400 font-black text-sm tracking-wider">FAST FX INSTITUTIONAL</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest">
                    {isAr ? "سند تحويل رقمي معتمد" : "Official Transfer Voucher"}
                  </div>
                </div>

                {/* Amount Stamp */}
                <div className="text-center py-2 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">{isAr ? "المبلغ المحول" : "Total Executed Amount"}</div>
                  <div className="text-2xl font-black text-emerald-400 tabular-nums">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                  <div className="text-[10px] text-slate-500">{tx.note}</div>
                </div>

                {/* Voucher Meta Grid */}
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? "الرقم المرجعي (Ref ID):" : "Reference Hash:"}</span>
                    <span className="text-amber-400 font-bold">{tx.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? "التوقيت الزمني:" : "Timestamp:"}</span>
                    <span className="text-slate-300">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? "المرسل:" : "Origin Account:"}</span>
                    <span className="text-slate-300">#{currentUser.id.slice(-8).toUpperCase()} ({currentUser.name})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? "العمولة المحصلة:" : "Network Fee:"}</span>
                    <span className="text-emerald-400 font-bold">$0.00 (0% Free)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? "حالة المعاملة:" : "Ledger Status:"}</span>
                    <span className="text-emerald-400 font-bold">100% EXECUTED</span>
                  </div>
                </div>

                {/* Printable Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? "طباعة السند" : "Print Voucher"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCompletedTransferReceipt(null);
                      setSelectedReceiptTx(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isAr ? "إغلاق" : "Done"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: INSTANT DEPOSIT MODAL                                       */}
      {/* ==================================================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b101d] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? "إيداع فوري في المحفظة" : "Instant Deposit"}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? "اختر طريقة الدفع والمبلغ للإيداع المباشر في حسابك" : "Select payment method and amount to credit your account"}
              </p>
            </div>

            <form onSubmit={handleExecuteDeposit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">{isAr ? "طريقة الإيداع" : "Method"}</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                >
                  <option value="USDT_TRC20">USDT TRC-20 (Crypto)</option>
                  <option value="VISA_MASTERCARD">Visa / Mastercard</option>
                  <option value="BANK_WIRE">Bank Wire</option>
                  <option value="APPLE_PAY">Apple Pay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">{isAr ? "المبلغ ($ USD)" : "Amount ($ USD)"}</label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold cursor-pointer shadow-md"
                >
                  {isDepositing ? (isAr ? "جاري الإيداع..." : "Depositing...") : (isAr ? "إيداع الآن" : "Deposit Now")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: WITHDRAWAL REQUEST MODAL                                    */}
      {/* ==================================================================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b101d] border border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>{isAr ? "طلب سحب الأرباح" : "Request Withdrawal"}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? "رصيدك المتاح للسحب:" : "Available:"} <strong className="text-emerald-400">${currentUser.balance.toLocaleString()}</strong>
              </p>
            </div>

            <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">{isAr ? "المبلغ ($ USD)" : "Amount"}</label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max={currentUser.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">{isAr ? "عنوان المحفظة أو IBAN" : "Address / IBAN"}</label>
                <input
                  type="text"
                  required
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={isAr ? "اكتب عنوان المحفظة أو الحساب..." : "Enter wallet address or IBAN..."}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawal || !withdrawAmount || !withdrawAddress}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingWithdrawal ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "تأكيد السحب" : "Confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
