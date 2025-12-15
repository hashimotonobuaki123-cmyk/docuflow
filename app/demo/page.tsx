import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "デモ | DocuFlow",
  description: "ログイン不要の簡易デモページです。",
  alternates: { canonical: "/demo" },
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <MarketingSimpleLayout
      title="デモ"
      description="ログイン不要で雰囲気を掴める簡易デモです。"
    >
      <p className="text-slate-300">
        これはポートフォリオ用のデモページです。フル機能はアカウント作成後に利用できます。
      </p>

      <h2>できること（例）</h2>
      <ul>
        <li>PDF/Wordのアップロード → AI要約/タグ付け</li>
        <li>全文検索・類似検索</li>
        <li>期限付き共有リンクの発行</li>
        <li>組織管理（RBAC）と監査ログ</li>
      </ul>

      <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden bg-slate-950/30">
        <Image
          src="/screenshots/dashboard.png"
          alt="DocuFlow ダッシュボード"
          width={1400}
          height={900}
          className="w-full"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          無料で始める
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
        >
          LPへ戻る
        </Link>
      </div>
    </MarketingSimpleLayout>
  );
}


