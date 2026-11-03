import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Crown
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
  const isAdminInput = identifier.trim().toLowerCase() === "admin" || identifier.trim().toLowerCase() === "h07806480810@gmail.com";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(
        isAr
          ? "يرجى إدخال اسم المستخدم (admin) أو البريد الإلكتروني"
          : "Please enter username (admin) or email address"
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
      <div
        className="relative w-full max-w-md bg-[#0d0e14] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: isAdminInput
            ? "0 0 50px -10px rgba(245, 158, 11, 0.25)"
            : "0 0 50px -10px rgba(249, 115, 22, 0.2)"
        }}
      >
        {/* Top gradient line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
            isAdminInput
              ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"
              : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
          }`}
        />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isAdminInput
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              }`}
            >
              {isAdminInput ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isAdminInput ? "FAST FX ADMIN GATEWAY" : "FAST FX SECURE ACCESS"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {activeAuthTab === "login"
              ? isAdminInput
                ? isAr
                  ? "تسجيل دخول لوحة تحكم الإدارة"
                  : "Admin Control Panel Sign In"
                : isAr
                ? "تسجيل الدخول إلى المنصة"
                : "Sign In to Fast Fx"
              : isAr
              ? "فتح حساب تداول جديد"
              : "Open New Trading Account"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-5">
            {isAr
              ? "بيانات الحساب والصفقات تخزن وتدار بأمان في قاعدة بيانات SQL"
              : "Account credentials and transactions secured with SQL ledger"}
          </p>

          {/* Admin Control Panel Gateway Notice inside Login Screen */}
          <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center justify-between">
                  <span>{isAr ? "بوابة لوحة تحكم الإدارة" : "Admin Control Panel Access"}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  {isAr
                    ? "يستطيع الأدمن الدخول إلى لوحة التحكم بكتابة اسم المستخدم الخاص به وكلمة المرور:"
                    : "Admin enters the control panel by entering username and password:"}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-800">
                    {isAr ? "اسم المستخدم:" : "User:"} <strong className="text-amber-400 font-bold">admin</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-800">
                    {isAr ? "كلمة المرور:" : "Pass:"} <strong className="text-amber-400 font-bold">123456789</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier("admin");
                      setPassword("123456789");
                      setError("");
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-sans font-semibold border border-amber-500/40 cursor-pointer transition-colors"
                  >
                    {isAr ? "تعبئة بيانات الأدمن تلقائياً" : "Autofill Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-zinc-800 mb-5">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                activeAuthTab === "login"
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                activeAuthTab === "register"
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isAr ? "حساب جديد" : "Register"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Custom form */}
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
                    className="w-full bg-[#14151f] border border-zinc-800 focus:border-orange-500 text-white rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none transition-colors"
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
                      ? "اكتب admin للدخول كمدير أو بريدك الإلكتروني"
                      : "Enter admin for Admin panel, or email"
                  }
                  className={`w-full bg-[#14151f] border rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none transition-colors ${
                    isAdminInput
                      ? "border-amber-500/60 focus:border-amber-400 text-amber-200"
                      : "border-zinc-800 focus:border-orange-500 text-white"
                  }`}
                />
                {isAdminInput ? (
                  <Crown className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                )}
              </div>
              {isAdminInput && (
                <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
                  <span>✓</span>
                  <span>
                    {isAr
                      ? "تم التعرف على حساب المدير (admin) - أدخل كلمة المرور 123456789"
                      : "Admin account recognized - enter password 123456789"}
                  </span>
                </div>
              )}
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
                  className="w-full bg-[#14151f] border border-zinc-800 focus:border-orange-500 text-white rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm focus:outline-none transition-colors font-mono"
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

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                isAdminInput
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-amber-500/25 hover:opacity-95"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-orange-500/20 hover:opacity-95"
              }`}
            >
              <span>
                {activeAuthTab === "login"
                  ? isAdminInput
                    ? isAr
                      ? "الدخول إلى لوحة تحكم الإدارة"
                      : "Enter Admin Control Panel"
                    : isAr
                    ? "تسجيل الدخول وبدء التداول"
                    : "Sign In & Start Trading"
                  : isAr
                  ? "إنشاء الحساب وبدء التداول"
                  : "Create Account & Start Trading"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
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
