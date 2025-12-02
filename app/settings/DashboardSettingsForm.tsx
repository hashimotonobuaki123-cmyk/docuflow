"use client";

import { useFormStatus } from "react-dom";
import type { DashboardSettings } from "@/lib/userSettings";

type Props = {
  initialSettings: DashboardSettings;
  saveAction: (formData: FormData) => void;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-200 border-t-transparent" />
          <span>保存中...</span>
        </span>
      ) : (
        "変更を保存"
      )}
    </button>
  );
}

export function DashboardSettingsForm({
  initialSettings,
  saveAction,
}: Props) {
  return (
    <form action={saveAction} className="space-y-4">
      <div className="flex flex-col gap-4 text-xs text-slate-700">
        <label className="flex flex-col gap-2">
          <span className="block font-semibold text-slate-900">
            デフォルトの並び順
          </span>
          <span className="block text-[11px] text-slate-500">
            ダッシュボードを開いたときの、ドキュメントの並び順を設定します。
          </span>
          <select
            name="defaultSort"
            defaultValue={initialSettings.defaultSort}
            className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
            <option value="pinned">ピン留め優先</option>
          </select>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="defaultShowArchived"
            value="1"
            defaultChecked={initialSettings.defaultShowArchived}
            className="mt-0.5 h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span>
            <span className="block font-semibold text-slate-900">
              アーカイブされたドキュメントをデフォルトで表示する
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              オンの場合、ダッシュボードを開いたときにアーカイブされたドキュメントも表示されます。オフの場合は通常のドキュメントのみ表示されます。
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="defaultSharedOnly"
            value="1"
            defaultChecked={initialSettings.defaultSharedOnly}
            className="mt-0.5 h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span>
            <span className="block font-semibold text-slate-900">
              共有中のドキュメントのみをデフォルトで表示する
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              オンの場合、ダッシュボードを開いたときに共有リンクが発行されているドキュメントのみが表示されます。
            </span>
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end">
        <SaveButton />
      </div>
    </form>
  );
}

