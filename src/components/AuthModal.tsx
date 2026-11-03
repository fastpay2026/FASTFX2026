import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
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
  const [error, setError] = useState("");

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

    const result = login(identifier.trim(), password.trim(), name.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0b0e11] border border-[#1e2329] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top subtle border highlight */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00c087] to-transparent" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#161a22] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#161a22] text-zinc-300 border border-[#222832]">
              <Sparkles className="w-3.5 h-3.5 text-[#00c087]" />
              FAST FX SECURE ACCESS
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-mono">
            {activeAuthTab === "login"
              ? isAr
                ? "تسجيل الدخول إلى المنصة"
                : "Sign In to Exchange"
              : isAr
              ? "فتح حساب تداول جديد"
              : "Open Trading Account"}
          </h2>
          <p className="text-xs text-zinc-400 mb-5">
            {isAr
              ? "بيانات الحساب والصفقات تخزن وتدار بأمان في قاعدة بيانات SQL"
              : "Account credentials and transactions secured with SQL ledger"}
          </p>

          {/* Tab selector (OKX Style) */}
          <div className="flex border-b border-[#1e2329] mb-5">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeAuthTab === "login"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeAuthTab === "register"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {isAr ? "حساب جديد" : "Sign Up"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] text-xs rounded-lg flex items-start gap-2 font-mono">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeAuthTab === "register" && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {isAr ? "الاسم الكامل للمتداول" : "Full Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? "مثال: طارق المنصوري" : "e.g. Alex Mercer"}
                    className="w-full bg-[#12161c] border border-[#1e2329] focus:border-zinc-400 text-white rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm focus:outline-none transition-colors"
                  />
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
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
                  className="w-full bg-[#12161c] border border-[#1e2329] focus:border-zinc-400 text-white rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm focus:outline-none transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
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
                  className="w-full bg-[#12161c] border border-[#1e2329] focus:border-zinc-400 text-white rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 absolute right-3 top-3 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OKX Solid White Action Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 bg-white text-black hover:bg-zinc-200 shadow-sm"
            >
              <span>
                {activeAuthTab === "login"
                  ? isAr
                    ? "تسجيل الدخول"
                    : "Sign In"
                  : isAr
                  ? "إنشاء الحساب وبدء التداول"
                  : "Create Account & Start Trading"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-5 pt-4 border-t border-[#1e2329] text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              {isAr
                ? "تشفير بيانات الحساب متوافق مع معايير SQL Relational Security"
                : "Encrypted institutional security with SQL relational audit compliance"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
