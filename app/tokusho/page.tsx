import type { Metadata } from "next";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | DocuFlow",
  description: "特定商取引法に基づく表記です。",
  alternates: { canonical: "/tokusho" },
  robots: { index: false, follow: false },
};

export default function TokushoPage() {
  return (
    <MarketingSimpleLayout
      title="特定商取引法に基づく表記"
      description="（オンラインサービス向け）特定商取引法に基づく表記です。実運用前に必ず貴社情報へ置き換えてください。"
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">これはポートフォリオ用の雛形です（未確定情報）</p>
        <p className="mt-2 text-sm">
          ここに書かれている内容は、実際の販売者情報としては使えません。実運用で公開する場合は、実情報に差し替えてください。
        </p>
      </div>

      <h2>販売事業者</h2>
      <p>（ここに販売事業者名を記載）</p>

      <h2>運営責任者</h2>
      <p>（ここに運営責任者名を記載）</p>

      <h2>所在地</h2>
      <p>（ここに所在地を記載）</p>

      <h2>お問い合わせ</h2>
      <p>
        メール: <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
        <br />
        電話番号: （ここに電話番号を記載。公開したくない場合は、適法な範囲での代替手段を検討してください）
      </p>

      <h2>販売価格</h2>
      <p>各プランの料金は、サービス内または料金ページに表示します。</p>

      <h2>商品代金以外の必要料金</h2>
      <p>インターネット接続料金、通信料金等はお客様のご負担となります。</p>

      <h2>支払方法・支払時期</h2>
      <p>クレジットカード等（決済事業者を記載）。支払時期は各決済手段の規約に従います。</p>

      <h2>提供時期</h2>
      <p>決済完了後、直ちに利用可能です。</p>

      <h2>返品・キャンセル</h2>
      <p>
        デジタルサービスの性質上、原則として返品/返金には応じません。詳細な返金条件がある場合はここに記載してください。
      </p>

      <h2>動作環境</h2>
      <p>最新のGoogle Chrome / Safari 等のモダンブラウザでの利用を推奨します。</p>

      <p className="text-sm text-slate-400">最終更新日: 2025-12-16</p>
    </MarketingSimpleLayout>
  );
}


