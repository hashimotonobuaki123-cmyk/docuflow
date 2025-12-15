"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";

function LoginFormEn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthErrorCode = searchParams.get("error");
  const initialError =
    oauthErrorCode === "oauth_callback"
      ? "Google login failed. Please try again."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const { data, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Invalid email or password.");
      return;
    }

    document.cookie = "docuhub_ai_auth=1; path=/;";

    const userId = data.user?.id;
    if (userId) {
      document.cookie = `docuhub_ai_user_id=${userId}; path=/;`;
    }

    setStatus("Logged in.");

    const redirectTo = searchParams.get("redirectTo") || "/app";
    router.replace(redirectTo);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setStatus(null);
    setOauthLoading(true);

    try {
      const redirectToParam = searchParams.get("redirectTo") || "/app";
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(
              redirectToParam,
            )}`
          : undefined;

      const { error: signInError } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (signInError) {
        console.error("Google login error:", signInError);
        setError("Google login failed. Please try again in a moment.");
        setOauthLoading(false);
      }
    } catch (e) {
      console.error("Google login unexpected error:", e);
      setError("Something went wrong during Google login. Please try again.");
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: short marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 animate-gradient" />
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-xl font-bold text-white shadow-lg">
                DF
              </div>
              <span className="text-3xl font-bold text-white">DocuFlow</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Find answers
              <br />
              <span className="text-white/90">from your docs</span>
            </h1>

            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              Upload PDFs/Docs, generate summaries, and search instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 lg:border-none">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Link
                href="/en"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
              >
                Back to landing
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-10 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Log in to continue
              </p>
            </div>

            {status && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in-scale border border-emerald-200 dark:border-emerald-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">{status}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-shake border border-red-200 dark:border-red-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in-up stagger-2">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input h-12"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-12 text-base font-semibold relative overflow-hidden group"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="divider my-8">or</div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="btn btn-secondary w-full h-12 mb-2 flex items-center justify-center gap-2"
            >
              {oauthLoading ? "Signing in with Google..." : "Continue with Google"}
            </button>

            <p className="mb-4 text-center text-[11px] text-slate-400">
              We only use your email address for authentication.
            </p>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              No account yet?{" "}
              <Link
                href="/en/auth/signup"
                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors underline-offset-2 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500 dark:text-slate-500">
            © 2025 DocuFlow.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function LoginEnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-violet-500 text-2xl font-bold text-white shadow-xl animate-pulse">
              DF
            </div>
          </div>
        </div>
      }
    >
      <LoginFormEn />
    </Suspense>
  );
}


