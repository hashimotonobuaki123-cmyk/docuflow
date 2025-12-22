"use client";

import { useFormStatus } from "react-dom";
import type { AISettings } from "@/lib/userSettings";

type Props = {
  initialSettings: AISettings;
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

export function AISettingsForm({ initialSettings, saveAction }: Props) {
  return (
    <form action={saveAction} className="space-y-4">
      <div className="flex flex-col gap-3 text-xs text-slate-700">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="autoSummaryOnNew"
            value="1"
            defaultChecked={initialSettings.autoSummaryOnNew}
            className="mt-0.5 h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span>
            <span className="block font-semibold text-slate-900">
              新規ドキュメント作成時に「保存して要約生成」を既定のおすすめにする
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              オンの場合、作成画面で AI 要約付き保存ボタンがメインのボタンとして表示されます。オフの場合は「とりあえず保存」が優先されます。
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="autoSummaryOnUpload"
            value="1"
            defaultChecked={initialSettings.autoSummaryOnUpload}
            className="mt-0.5 h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span>
            <span className="block font-semibold text-slate-900">
              ダッシュボードのファイルアップロード時に AI 要約・タグを自動生成する
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              オンの場合、PDF / Word のドラッグ＆ドロップ時に AI がタイトル・要約・タグを自動生成します。オフの場合は AI を使わずにカードだけ作成します。
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





