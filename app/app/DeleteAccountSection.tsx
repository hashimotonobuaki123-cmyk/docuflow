"use client";

import { useTransition } from "react";
import { useLocale } from "@/lib/useLocale";

type Props = {
  deleteAccount: (formData: FormData) => Promise<void>;
};

export function DeleteAccountSection({ deleteAccount }: Props) {
  const [pending, startTransition] = useTransition();
  const locale = useLocale();

  return (
    <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
      <h3 className="mb-2 text-sm font-semibold text-red-700">
        {locale === "en" ? "Delete account" : "アカウントの削除"}
      </h3>
      <p className="mb-3 text-xs text-red-600">
        {locale === "en"
          ? "This will permanently delete your DocuFlow account, documents, and version history in this workspace. This action cannot be undone."
          : "このワークスペースで作成したドキュメントと変更履歴、および DocuFlow のアカウントをすべて削除します。復元はできません。"}
      </p>
      <form
        action={(formData) => {
          const ok = window.confirm(
            locale === "en"
              ? "Are you sure you want to delete your account?\nAll documents and history will be permanently deleted and cannot be restored."
              : "本当にアカウントを削除しますか？\nドキュメントと履歴はすべて削除され、元に戻せません。",
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
          {pending
            ? locale === "en"
              ? "Deleting..."
              : "削除中..."
            : locale === "en"
              ? "Delete account permanently"
              : "アカウントを完全に削除する"}
        </button>
      </form>
    </section>
  );
}
