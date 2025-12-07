import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <p className="text-sm text-slate-600">What's New</p>
          </div>
          <Link
            href="/app"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← ダッシュボードへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-base font-semibold text-slate-900">
            最新のアップデート
          </h1>
          <p className="text-xs text-slate-600">
            DocuFlow に最近追加された機能や改善点のハイライトです。
            面接官やレビュアーの方が「どこを見ればよいか」が分かるように整理しています。
          </p>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-emerald-900">
                Google ログイン対応 & アカウント情報カード
              </h2>
              <span className="text-[10px] text-emerald-700">2025-12-07</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                `/auth/login` に
                <strong>「Google でログイン」</strong>
                ボタンを追加し、Supabase Auth 経由で Google OAuth をサポート。
              </li>
              <li>
                `/auth/callback` で OAuth
                コールバックを処理し、アプリ独自の Cookie を設定して `/app`
                に遷移。
              </li>
              <li>
                `/settings` に
                <strong>「アカウント情報」カード</strong>
                を追加し、メールアドレスとログイン方法（Google / Email）を表示。
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                組織・RBAC / 通知・アナリティクス
              </h2>
              <span className="text-[10px] text-slate-500">2025-12-06</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                `organizations` / `organization_members` を追加し、Owner /
                Admin / Member
                のロールベースアクセス制御（RLS）を実装。組織スイッチャーからチームを切り替え可能。
              </li>
              <li>
                `notifications` テーブルとヘッダーの通知ベルを追加し、コメントなどのイベントをアプリ内通知として表示。
              </li>
              <li>
                `/app/analytics` で
                <strong>チーム利用の簡易アナリティクス</strong>
                （直近30日のドキュメント作成数・ユーザーアクティビティ）を可視化。
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                品質ゲート & パフォーマンス監視
              </h2>
              <span className="text-[10px] text-slate-500">2025-12-05</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Lighthouse CI を GitHub Actions に組み込み、
                Performance/A11y/Best Practices/SEO 80+ を目標値として設定。
              </li>
              <li>
                `lib/webVitals.ts` と `/app/vitals`
                による Web Vitals ダッシュボードを追加し、LCP/FID/CLS などを可視化。
              </li>
              <li>
                E2E テスト（Playwright）と Supabase Migrations CI
                による、壊さないための仕組みを導入。
              </li>
            </ul>
          </article>

          {/* Coming Soon */}
          <article className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-5 text-xs text-slate-800 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Coming Soon（今後追加したいもの）
              </h2>
              <span className="text-[10px] text-sky-700">Roadmap</span>
            </div>
            <p className="mb-2 text-[11px] text-slate-600">
              実装までは至っていないものの、「次に取り組む候補」として検討しているアイデアです。
              設計ドキュメントや ADR に沿って、段階的に追加していく想定です。
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Security ADR に沿った
                <strong> 2FA（TOTP）実装 </strong>
                と、組織単位で有効化できる
                <strong> SSO (Google Workspace / Entra ID) </strong>
              </li>
              <li>
                ドキュメント間をつなぐ
                <strong> 双方向リンク / 関連ドキュメント表示 </strong>
                によるナレッジグラフ的な閲覧体験
              </li>
              <li>
                Slack など外部ツールへの
                <strong> 通知連携（コメント/メンション/共有リンク発行）</strong>
                と Webhook ベースの拡張
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}




