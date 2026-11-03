import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
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
              ? "فتح حساب تداول مؤسسي جديد"
              : "Open Institutional Account"}
          </h2>
          <p className="text-xs text-slate-400 mb-5 font-sans">
            {isAr
              ? "بيانات الحساب والصفقات محمية بسجلات التدقيق في قاعدة بيانات SQL"
              : "Credentials and positions secured with audited SQL relational ledger"}
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
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isAr ? "الاسم الكامل للمتداول" : "Full Name"}
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
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20"
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
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
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
