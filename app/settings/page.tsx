import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Logo } from "@/components/Logo";
import { DeleteAccountSection } from "../app/DeleteAccountSection";
import { deleteAccount } from "../app/accountActions";
import {
  DEFAULT_AI_SETTINGS,
  getAISettingsForUser,
  upsertAISettingsForUser,
  DEFAULT_SHARE_SETTINGS,
  getShareSettingsForUser,
  upsertShareSettingsForUser,
  DEFAULT_DASHBOARD_SETTINGS,
  getDashboardSettingsForUser,
  upsertDashboardSettingsForUser,
} from "@/lib/userSettings";
import { AISettingsForm } from "./AISettingsForm";
import { ShareSettingsForm } from "./ShareSettingsForm";
import { DashboardSettingsForm } from "./DashboardSettingsForm";

async function saveAISettings(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    throw new Error("ログイン情報が見つかりませんでした。もう一度ログインしてください。");
  }

  const autoSummaryOnNew = formData.get("autoSummaryOnNew") === "1";
  const autoSummaryOnUpload = formData.get("autoSummaryOnUpload") === "1";

  await upsertAISettingsForUser(userId, {
    autoSummaryOnNew,
    autoSummaryOnUpload,
  });

  revalidatePath("/settings");
}

async function saveShareSettings(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    throw new Error("ログイン情報が見つかりませんでした。もう一度ログインしてください。");
  }

  const defaultExpiresIn = String(formData.get("defaultExpiresIn") ?? "7");
  if (defaultExpiresIn !== "7" && defaultExpiresIn !== "30" && defaultExpiresIn !== "none") {
    throw new Error("無効な有効期限設定です。");
  }

  await upsertShareSettingsForUser(userId, {
    defaultExpiresIn: defaultExpiresIn as "7" | "30" | "none",
  });

  revalidatePath("/settings");
}

async function saveDashboardSettings(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    throw new Error("ログイン情報が見つかりませんでした。もう一度ログインしてください。");
  }

  const defaultSort = String(formData.get("defaultSort") ?? "desc");
  if (defaultSort !== "desc" && defaultSort !== "asc" && defaultSort !== "pinned") {
    throw new Error("無効な並び順設定です。");
  }

  const defaultShowArchived = formData.get("defaultShowArchived") === "1";
  const defaultSharedOnly = formData.get("defaultSharedOnly") === "1";

  await upsertDashboardSettingsForUser(userId, {
    defaultSort: defaultSort as "desc" | "asc" | "pinned",
    defaultShowArchived,
    defaultSharedOnly,
  });

  revalidatePath("/settings");
  revalidatePath("/app");
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  const aiSettings = await getAISettingsForUser(userId);
  const shareSettings = await getShareSettingsForUser(userId);
  const dashboardSettings = await getDashboardSettingsForUser(userId);

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
          <h2 className="mb-2 text-sm font-semibold text-slate-900">AI 設定</h2>
          <p className="mb-4 text-xs text-slate-600">
            DocuFlow で新しいドキュメントを作成したり、ダッシュボードでファイルをアップロードしたりする際の
            AI の挙動をカスタマイズできます。
          </p>
          <AISettingsForm initialSettings={aiSettings ?? DEFAULT_AI_SETTINGS} saveAction={saveAISettings} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">共有リンク設定</h2>
          <p className="mb-4 text-xs text-slate-600">
            新しく共有リンクを作成する際のデフォルト有効期限を設定できます。
          </p>
          <ShareSettingsForm initialSettings={shareSettings ?? DEFAULT_SHARE_SETTINGS} saveAction={saveShareSettings} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">ダッシュボード設定</h2>
          <p className="mb-4 text-xs text-slate-600">
            ダッシュボードを開いたときの、ドキュメントの表示方法をカスタマイズできます。
          </p>
          <DashboardSettingsForm initialSettings={dashboardSettings ?? DEFAULT_DASHBOARD_SETTINGS} saveAction={saveDashboardSettings} />
        </section>

        <DeleteAccountSection deleteAccount={deleteAccount} />
      </main>
    </div>
  );
}
