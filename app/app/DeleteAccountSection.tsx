"use client";

import { useTransition } from "react";

type Props = {
  deleteAccount: (formData: FormData) => Promise<void>;
};

export function DeleteAccountSection({ deleteAccount }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
      <h3 className="mb-2 text-sm font-semibold text-red-700">
        アカウントの削除
      </h3>
      <p className="mb-3 text-xs text-red-600">
        このワークスペースで作成したドキュメントと変更履歴、および DocuFlow
        のアカウントをすべて削除します。復元はできません。
      </p>
      <form
        action={(formData) => {
          const ok = window.confirm(
            "本当にアカウントを削除しますか？\nドキュメントと履歴はすべて削除され、元に戻せません。",
          );
          if (!ok) return;

          startTransition(async () => {
            await deleteAccount(formData);
          });
        }}
      >
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md border border-red-400 bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "削除中..." : "アカウントを完全に削除する"}
        </button>
      </form>
    </section>
  );
}
