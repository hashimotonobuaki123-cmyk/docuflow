"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";
import { getSiteUrl } from "@/lib/getSiteUrl";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email || !password) {
      setError(
        "メールアドレスとパスワードを入力してください。",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "パスワードが一致しません。",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "パスワードは6文字以上で設定してください。",
      );
      return;
    }

    if (!agreedToTerms) {
      setError(
        "利用規約への同意が必要です。",
      );
      return;
    }

    setLoading(true);

    // 実行時に正しいURLを取得（本番環境では常に本番URLを使用）
    const siteUrl = getSiteUrl();

    const { error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/login`,
      },
    });

    setLoading(false);

    if (signUpError) {
      const msg = signUpError.message ?? "";
      if (
        msg.includes("For security purposes") ||
        msg.includes("User already registered")
      ) {
        setStatus(
          "このメールアドレスは既に登録済みか、短時間にリクエストしすぎています。ログインを試してください。",
        );
      } else {
        setError(msg);
      }
      return;
    }

    setStatus(
      "アカウントを作成しました！メールに届いた確認リンクをクリックして登録を完了してください。",
    );
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        score,
        label: "弱い",
        color: "bg-red-500",
      };
    if (score <= 3)
      return {
        score,
        label: "普通",
        color: "bg-amber-500",
      };
    return {
      score,
      label: "強い",
      color: "bg-emerald-500",
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 lg:border-none">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
              >
                ログインへ戻る
              </Link>
            </div>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {/* Welcome */}
            <div className="text-center mb-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                アカウントを作成
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                無料でDocuFlowを始めましょう
              </p>
            </div>

            {/* Alerts */}
            {status && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in-scale border border-emerald-200 dark:border-emerald-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium pt-1">{status}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-shake border border-red-200 dark:border-red-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-medium pt-1">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5 animate-fade-in-up stagger-2">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  メールアドレス
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-12 h-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  パスワード
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      "6文字以上"
                    }
                    className="input pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1 animate-fade-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength.score >= level ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs ${
                        passwordStrength.score <= 2
                          ? "text-red-500"
                          : passwordStrength.score <= 3
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      パスワード強度:{" "}
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  パスワード（確認）
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      "パスワードを再入力"
                    }
                    className={`input pl-12 h-12 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : confirmPassword && password === confirmPassword
                        ? "border-emerald-300 focus:border-emerald-500"
                        : ""
                    }`}
                  />
                  {confirmPassword && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      {password === confirmPassword ? (
                        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <>
                    <Link
                      href="#"
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      利用規約
                    </Link>
                    <span className="text-slate-400 dark:text-slate-500">
                      と
                    </span>
                    <Link
                      href="#"
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      プライバシーポリシー
                    </Link>
                    <span className="text-slate-400 dark:text-slate-500">
                      に同意します
                    </span>
                  </>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-12 text-base font-semibold group"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>
                      アカウント作成中...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      アカウントを作成
                    </span>
                    <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-6">または</div>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              すでにアカウントをお持ちですか？{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors underline-offset-2 hover:underline"
              >
                ログイン
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500">
            © 2024 DocuFlow. AI 要約で、PDF / Word 資料を一瞬で整理
          </p>
        </footer>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 animate-gradient" />
        
        {/* Mesh Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 75% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 25% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/20 rounded-full animate-spin-slow" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              スマートな<br />
              <span className="text-white/90">ドキュメント管理</span>
            </h1>
            
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              もう文書の山に埋もれる必要はありません。
              DocuFlow があなたの代わりに整理します。
            </p>
            
            {/* Feature List */}
            <div className="space-y-4">
              {[
                { icon: "🤖", title: "AI 自動要約", desc: "GPT-4 が内容を理解し、要点を抽出" },
                { icon: "🏷️", title: "スマートタグ", desc: "文書に最適なタグを自動生成" },
                { icon: "🔍", title: "全文検索", desc: "一瞬で目的のドキュメントを発見" },
                { icon: "🔗", title: "共有リンク", desc: "ワンクリックで安全に共有" },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
