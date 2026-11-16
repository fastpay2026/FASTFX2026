import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { sqlDb } from "../db/sqlEngine";
import { SubscriptionTierId, SubscriptionPlan } from "../types";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Zap,
  Award,
  Sparkles,
  Shield
} from "lucide-react";

interface AuthModalProps {
  lang: "ar" | "en";
  onLoginSuccess?: (isAdmin: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ lang, onLoginSuccess }) => {
  const { isAuthModalOpen, closeAuthModal, activeAuthTab, openAuthModal, login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTierId>("silver");
  const [error, setError] = useState("");

  // Live plans from SQL database (updated dynamically by Admin)
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => sqlDb.getSubscriptionPlans());

  useEffect(() => {
    const unsubscribe = sqlDb.subscribe(() => {
      setPlans(sqlDb.getSubscriptionPlans());
    });
    return unsubscribe;
  }, []);

  if (!isAuthModalOpen) return null;

  const isAr = lang === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(
        isAr
          ? "يرجى إدخال اسم المستخدم أو البريد الإلكتروني"
          : "Please enter username or email address"
      );
      return;
    }

    if (!password) {
      setError(isAr ? "يرجى إدخال كلمة المرور" : "Please enter your password");
      return;
    }

    if (activeAuthTab === "register" && !name.trim()) {
      setError(isAr ? "يرجى إدخال الاسم الكامل للمتداول" : "Please enter your full name");
      return;
    }

    const result = login(
      identifier.trim(),
      password.trim(),
      name.trim(),
      activeAuthTab === "register" ? selectedTier : undefined
    );

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess(result.isAdmin);
      }
    } else {
      setError(
        result.error ||
          (isAr
            ? "فشل تسجيل الدخول. يرجى التحقق من البيانات المدخلة"
            : "Login failed. Please verify credentials")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          activeAuthTab === "register" ? "max-w-2xl" : "max-w-md"
        } bg-[#0c1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col`}
      >
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-indigo-600 z-10" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto">
          {/* Brand Logo in Modal Header */}
          <div className="mb-4">
            <BrandLogo size="md" showSubtitle={false} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-sans">
            {activeAuthTab === "login"
              ? isAr
                ? "تسجيل الدخول إلى حساب التداول"
                : "Sign In to Account"
              : isAr
              ? "فتح حساب تداول جديد واختيار الباقة"
              : "Open Trading Account & Select Tier"}
          </h2>
          <p className="text-xs text-slate-400 mb-5 font-sans">
            {activeAuthTab === "login"
              ? isAr
                ? "بيانات الحساب والصفقات محمية بسجلات التدقيق في قاعدة بيانات SQL"
                : "Credentials and positions secured with audited SQL relational ledger"
              : isAr
              ? "اختر باقة الاشتراك المناسبة لأسلوب تداولك (برونزي، فضي، ذهبي VIP)"
              : "Choose the subscription tier suited to your trading strategy (Bronze, Silver, Gold VIP)"}
          </p>

          {/* Segmented Tab selector */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer text-center ${
                activeAuthTab === "login"
                  ? "bg-slate-800 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer text-center ${
                activeAuthTab === "register"
                  ? "bg-slate-800 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "فتح حساب جديد" : "Sign Up"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg flex items-start gap-2 font-mono">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {activeAuthTab === "register" && (
              /* Subscription Tier Selector (Bronze, Silver, Gold) */
              <div className="space-y-2 pb-2">
                <label className="block text-xs font-bold text-amber-400">
                  {isAr ? "1. اختر باقة الاشتراك الخاصة بحسابك:" : "1. Select Your Subscription Plan:"}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plans.map((plan) => {
                    const isSelected = selectedTier === plan.id;
                    const isGold = plan.id === "gold";
                    const isSilver = plan.id === "silver";
                    const isBronze = plan.id === "bronze";

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedTier(plan.id)}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs ${
                          isSelected
                            ? isGold
                              ? "bg-gradient-to-b from-amber-500/15 to-yellow-500/5 border-amber-400 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400"
                              : isSilver
                              ? "bg-gradient-to-b from-slate-400/15 to-slate-800/20 border-slate-300 shadow-lg shadow-slate-400/10 ring-1 ring-slate-300"
                              : "bg-gradient-to-b from-amber-700/15 to-slate-900 border-amber-600 shadow-lg shadow-amber-700/15 ring-1 ring-amber-600"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        {/* Recommended / VIP Marker */}
                        {plan.recommended && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider shadow-sm">
                            {isAr ? "الأكثر طلباً" : "POPULAR"}
                          </div>
                        )}
                        {isGold && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider shadow-sm">
                            VIP
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-black text-xs ${
                                isGold
                                  ? "text-amber-400"
                                  : isSilver
                                  ? "text-slate-200"
                                  : "text-amber-500"
                              }`}
                            >
                              {isAr ? plan.nameAr : plan.nameEn}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? isGold
                                    ? "border-amber-400 bg-amber-400 text-slate-950"
                                    : isSilver
                                    ? "border-slate-200 bg-slate-200 text-slate-950"
                                    : "border-amber-500 bg-amber-500 text-slate-950"
                                  : "border-slate-700 bg-transparent"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Price / Minimum deposit */}
                          <div className="pt-1 font-mono">
                            <span className="text-white text-base font-black tabular-nums">
                              ${plan.minDeposit.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 mr-1 ml-1 font-sans">
                              {isAr ? "حد أدنى للإيداع" : "min deposit"}
                            </span>
                          </div>

                          {/* Key Specs */}
                          <div className="space-y-1 text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{isAr ? "الفارق:" : "Spread:"}</span>
                              <span className={plan.spreadFromPips === 0 ? "text-emerald-400 font-bold" : "text-white font-bold"}>
                                {plan.spreadFromPips === 0 ? "0.0 RAW" : `${plan.spreadFromPips} Pips`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{isAr ? "الرافعة:" : "Leverage:"}</span>
                              <span className="text-white font-bold">1:{plan.maxLeverage}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{isAr ? "السرعة:" : "Latency:"}</span>
                              <span className="text-emerald-400 font-bold">&lt;{plan.executionSpeedMs}ms</span>
                            </div>
                          </div>

                          {/* First Custom Perk if present */}
                          {plan.customPerks && plan.customPerks.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-sans flex items-start gap-1">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-tight">{plan.customPerks[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeAuthTab === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  2. {isAr ? "الاسم الكامل للمتداول" : "Full Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? "مثال: طارق المنصوري" : "e.g. Alex Mercer"}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 text-white rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm focus:outline-none transition-colors"
                  />
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeAuthTab === "register" ? "3. " : ""}
                {isAr ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email Address"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    isAr
                      ? "اسم المستخدم أو البريد الإلكتروني"
                      : "Username or email address"
                  }
                  className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 text-white rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm focus:outline-none transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeAuthTab === "register" ? "4. " : ""}
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 text-white rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white absolute right-3 top-3 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/25"
            >
              <span>
                {activeAuthTab === "login"
                  ? isAr
                    ? "تسجيل الدخول"
                    : "Sign In"
                  : isAr
                  ? `إنشاء الحساب مع ${selectedTier === "gold" ? "الاشتراك الذهبي" : selectedTier === "silver" ? "الاشتراك الفضي" : "الاشتراك البرونزي"}`
                  : `Create Account with ${selectedTier.toUpperCase()} Tier`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              {isAr
                ? "تشفير بيانات الحساب متوافق مع معايير SQL Relational Security · تنفيذ LD4"
                : "Encrypted institutional security with SQL relational audit compliance · LD4 Exec"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
