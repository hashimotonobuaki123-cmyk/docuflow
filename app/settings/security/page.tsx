import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SecuritySettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">セキュリティ設定</p>
          </div>
          <Link
            href="/settings"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← 設定トップへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* セキュリティチェックリスト */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            セキュリティチェックリスト
          </h2>
          <p className="mb-4 text-xs text-slate-600">
            DocuFlow で現在有効になっている、主なセキュリティ機能の一覧です。
            詳細な設計や RLS ポリシーは{" "}
            <Link
              href="/docs/#/security"
              className="font-medium text-emerald-600 underline-offset-2 hover:underline"
            >
              Security Design
            </Link>
            を参照してください。
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">認証</p>
                <p className="text-[11px] text-slate-500">
                  Supabase Auth によるメール &amp; パスワード / Google OAuth ログイン。
                  Cookie ベースのセッション管理。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">RLS + RBAC</p>
                <p className="text-[11px] text-slate-500">
                  `documents` / `organizations` などの主要テーブルで Row Level Security を有効化。
                  組織（owner / admin / member）ロールに基づいたアクセス制御。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">共有リンク</p>
                <p className="text-[11px] text-slate-500">
                  UUID ベースの `share_token` により閲覧専用リンクを発行。いつでも無効化可能で、
                  編集は常に認証済みユーザーのみ。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">監査ログ &amp; 通知</p>
                <p className="text-[11px] text-slate-500">
                  主要な操作は `activity_logs` に記録され、コメントやメンションは通知ベルから参照可能。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">レートリミット &amp; Web Vitals</p>
                <p className="text-[11px] text-slate-500">
                  API には簡易レートリミットを実装し、`/app/vitals` ページでパフォーマンス指標を可視化。
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            2段階認証（2FA）
          </h2>
          <p className="text-xs text-slate-600">
            TOTP アプリ（Google Authenticator など）による 2FA
            対応を想定しています。現在は UI の設計のみを行い、実装は今後の拡張として位置付けています。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🔒
            </span>
            Coming soon: TOTP ベースの 2段階認証
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            SSO（Single Sign-On）
          </h2>
          <p className="text-xs text-slate-600">
            Google Workspace / Microsoft Entra ID などの IdP と連携した SSO
            対応を想定しています。組織 (`organizations`) 単位で SSO
            を有効化する設計です。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🌐
            </span>
            Coming soon: Google Workspace / Entra ID SSO
          </div>
        </section>
      </main>
    </div>
  );
}




