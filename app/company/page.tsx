import type { Metadata } from "next";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "会社概要 | DocuFlow",
  description: "DocuFlowの運営情報（会社概要）です。",
  alternates: { canonical: "/company" },
  robots: { index: false, follow: false },
};

export default function CompanyPage() {
  return (
    <MarketingSimpleLayout
      title="会社概要"
      description="運営情報のページです。実運用前に必ず貴社情報へ置き換えてください。"
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">これはポートフォリオ用の雛形です（未確定情報）</p>
        <p className="mt-2 text-sm">
          実運用で公開する場合は、法人名・所在地・代表者・連絡先などを実情報へ差し替えてください。
        </p>
      </div>

      <h2>会社名</h2>
      <p>（ここに会社名/屋号を記載）</p>

      <h2>所在地</h2>
      <p>（ここに所在地を記載）</p>

      <h2>代表者</h2>
      <p>（ここに代表者名を記載）</p>

      <h2>事業内容</h2>
      <ul>
        <li>AI要約ドキュメントワークスペースの提供</li>
        <li>関連するソフトウェア開発・運用</li>
      </ul>

      <h2>お問い合わせ</h2>
      <p>
        <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
      </p>
    </MarketingSimpleLayout>
  );
}


