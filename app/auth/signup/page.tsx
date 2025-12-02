"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email || !password) {
      setError("サインアップにはメールアドレスとパスワードが必要です。");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
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
      "サインアップしました。メールが届いている場合は、確認リンクもチェックしてください。",
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              DocuFlow
            </h1>
            <p className="text-xs text-slate-500">サインアップ</p>
          </div>
          <Link
            href="/auth/login"
            className="text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
          >
            ログインへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              アカウントを作成
            </h2>
            <p className="text-xs text-slate-500">
              メールアドレスとパスワードを入力してアカウントを作成します。
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

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                メールアドレス
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

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "処理中..." : "サインアップ"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
