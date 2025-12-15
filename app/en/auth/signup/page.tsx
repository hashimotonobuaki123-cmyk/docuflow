"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";
import { getSiteUrl } from "@/lib/getSiteUrl";

export default function SignupEnPage() {
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
      setError("Please enter an email and password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    const siteUrl = getSiteUrl();
    const { error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/en/auth/login`,
      },
    });

    setLoading(false);

    if (signUpError) {
      const msg = signUpError.message ?? "";
      if (
        msg.includes("For security purposes") ||
        msg.includes("User already registered")
      ) {
        setStatus("This email may already be registered. Try logging in instead.");
      } else {
        setError(msg);
      }
      return;
    }

    setStatus("Account created! Check your email to confirm your address.");
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "OK", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 lg:border-none">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Link
                href="/en/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
              >
                Back to login
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Start using DocuFlow in minutes
              </p>
            </div>

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

            <form onSubmit={handleSignup} className="space-y-5 animate-fade-in-up stagger-2">
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
                    placeholder="At least 6 characters"
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

                {password && (
                  <div className="mt-2 space-y-1 animate-fade-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength.score >= level
                              ? passwordStrength.color
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input h-12"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  I agree to the{" "}
                  <Link
                    href="/en/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/en/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-12 text-base font-semibold group"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              Already have an account?{" "}
              <Link
                href="/en/auth/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500">
            © 2025 DocuFlow.
          </p>
        </footer>
      </div>

      {/* Right Side (optional) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 animate-gradient" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Start with a free trial
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              Built for teams who care about security: RBAC, audit logs, and expiring share links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


