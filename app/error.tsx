"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          エラーが発生しました
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          申し訳ありません。予期しないエラーが発生しました。
          <br />
          もう一度お試しいただくか、ダッシュボードに戻ってください。
        </p>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-4 text-left">
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn btn-primary px-6"
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>もう一度試す</span>
          </button>
          <Link href="/app" className="btn btn-secondary px-6">
            <span>ダッシュボードへ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}







