"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "docuflow_onboarding_seen_v1";

export function AppOnboardingTour() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-emerald-900">
            はじめての DocuFlow - 3ステップで試せます
          </p>
          <ol className="mt-2 space-y-1 text-[11px]">
            <li>
              1️⃣ <span className="font-medium">ダッシュボードでサンプルを開く</span>{" "}
              — 一覧から気になるドキュメントをクリック
            </li>
            <li>
              2️⃣ <span className="font-medium">AI要約・タグ・検索を触る</span>{" "}
              — 上部の検索バーで「認証」「売上」などを検索
            </li>
            <li>
              3️⃣{" "}
              <span className="font-medium">
                新規ドキュメントを1つ作ってみる
              </span>{" "}
              —{" "}
              <Link
                href="/new"
                className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                /new
              </Link>{" "}
              からファイルをアップロード
            </li>
          </ol>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 hover:bg-emerald-100"
          aria-label="オンボーディングを閉じる"
        >
          ×
        </button>
      </div>
    </div>
  );
}


