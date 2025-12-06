import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DeleteAccountSection } from "../app/DeleteAccountSection";
import { deleteAccount } from "../app/accountActions";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">設定</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            設定メニュー
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/settings/organizations"
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">組織・チーム</p>
              <p className="mt-1 text-[11px] text-slate-600">
                組織の作成・メンバー招待・ロール（owner / admin / member）の管理。
              </p>
            </Link>
            <Link
              href="/settings/billing"
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">課金・プラン</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Free / Pro / Team プランや、将来の Stripe 連携を前提とした課金設定。
              </p>
            </Link>
            <Link
              href="/settings/security"
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">セキュリティ</p>
              <p className="mt-1 text-[11px] text-slate-600">
                認証・2段階認証・SSO などのセキュリティ設定（設計済み / 一部 Coming
                Soon）。
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            データエクスポート
          </h2>
          <p className="text-xs text-slate-600">
            自分のドキュメント / コメント / アクティビティログ / 通知をまとめて{" "}
            JSON ファイルとしてダウンロードできます（ベータ機能）。
          </p>
          <div className="mt-3">
            <a
              href="/api/export"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
            >
              データをエクスポート（JSON）
            </a>
          </div>
        </section>

        <DeleteAccountSection deleteAccount={deleteAccount} />
      </main>
    </div>
  );
}
