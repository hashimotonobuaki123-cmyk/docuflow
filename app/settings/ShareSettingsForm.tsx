"use client";

import { useFormStatus } from "react-dom";
import type { ShareSettings } from "@/lib/userSettings";

type Props = {
  initialSettings: ShareSettings;
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

export function ShareSettingsForm({
  initialSettings,
  saveAction,
}: Props) {
  return (
    <form action={saveAction} className="space-y-4">
      <div className="flex flex-col gap-3 text-xs text-slate-700">
        <label className="flex flex-col gap-2">
          <span className="block font-semibold text-slate-900">
            新しく共有リンクを作るときのデフォルト有効期限
          </span>
          <span className="block text-[11px] text-slate-500">
            共有リンクを作成する際に、この設定がデフォルトで選択されます。個別の共有リンク作成時にも変更可能です。
          </span>
          <select
            name="defaultExpiresIn"
            defaultValue={initialSettings.defaultExpiresIn}
            className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
          >
            <option value="7">7日間</option>
            <option value="30">30日間</option>
            <option value="none">無期限</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end">
        <SaveButton />
      </div>
    </form>
  );
}




