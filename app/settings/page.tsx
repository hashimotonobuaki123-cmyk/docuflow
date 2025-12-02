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
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            アカウント
          </h2>
          <p className="text-xs text-slate-600">
            現在はアカウント削除のみをサポートしています。今後、通知設定やテーマ設定などをここに追加していく想定です。
          </p>
        </section>

        <DeleteAccountSection deleteAccount={deleteAccount} />
      </main>
    </div>
  );
}
