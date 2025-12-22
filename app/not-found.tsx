import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8">
          <div className="text-[120px] font-bold leading-none gradient-text opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 animate-float">
              <svg
                className="h-10 w-10 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          ページが見つかりません
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
          <br />
          URLをご確認ください。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary px-6">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>トップへ戻る</span>
          </Link>
          <Link href="/app" className="btn btn-secondary px-6">
            <span>ダッシュボードへ</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
            よく使われるページ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { href: "/app", label: "ダッシュボード", icon: "📄" },
              { href: "/new", label: "新規作成", icon: "➕" },
              { href: "/settings", label: "設定", icon: "⚙️" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
