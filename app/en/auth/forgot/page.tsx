"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";
import { getSiteUrl } from "@/lib/getSiteUrl";

export default function ForgotPasswordEnPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Email is required to reset your password.");
      return;
    }

    setLoading(true);

    const siteUrl = getSiteUrl();
    const redirectUrl = `${siteUrl}/en/auth/reset`;

    const { error: resetError } =
      await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStatus(
      "We sent a password reset email. Open the link in the email to set a new password.",
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-[11px] text-slate-500">Forgot your password?</p>
          </div>
          <Link
            href="/en/auth/login"
            className="text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Send password reset email
            </h2>
            <p className="text-xs text-slate-500">
              Enter the email address associated with your account.
            </p>
          </div>

          {status && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {status}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSendReset} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send reset email"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}


