 "use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const { data, error: signInError } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    // 簡易的なログインフラグ（ミドルウェアで参照）
    document.cookie = "docuhub_ai_auth=1; path=/;";

    // user_id をクッキーに保持して、サーバー側から参照できるようにする
    const userId = data.user?.id;
    if (userId) {
      document.cookie = `docuhub_ai_user_id=${userId}; path=/;`;
    }

    setStatus("ログインしました。");

    const redirectTo = searchParams.get("redirectTo") || "/app";
    router.replace(redirectTo);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo withTagline />
          <Link
            href="/"
            className="text-[11px] font-medium text-slate-600 underline-offset-4 hover:underline"
          >
            トップへ
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              メール & パスワードでログイン
            </h2>
            <p className="text-xs text-slate-500">
              メールアドレスとパスワードでログインします。
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

          <form onSubmit={handleLogin} className="space-y-3">
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
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:bg-white focus:ring"
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
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:bg-white focus:ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-600">
            <Link
              href="/auth/forgot"
              className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              パスワードをお忘れですか？
            </Link>
            <Link
              href="/auth/signup"
              className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              アカウントをお持ちでない方はこちら（サインアップ）
            </Link>
          </div>

          <p className="pt-1 text-[10px] leading-relaxed text-slate-500">
            ※ Supabase の Authentication 設定で「Email + Password」サインインを有効にしておいてください。
          </p>
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}


