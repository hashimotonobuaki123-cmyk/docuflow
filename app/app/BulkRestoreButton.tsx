"use client";

import { useState } from "react";

type Props = {
  formId: string;
};

export function BulkRestoreButton({ formId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleToggleSelectAll = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const next = !selectAll;
    const checkboxes =
      form.querySelectorAll<HTMLInputElement>('input[name="ids"]');
    checkboxes.forEach((cb) => {
      cb.checked = next;

      const card = cb.closest<HTMLElement>("[data-doc-card]");
      if (!card) return;

      card.classList.toggle("ring-2", next);
      card.classList.toggle("ring-emerald-300", next);
      card.classList.toggle("border-emerald-300", next);
      card.classList.toggle("bg-emerald-50/40", next);
    });
    setSelectAll(next);
  };

  const handleConfirm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) {
      setOpen(false);
      return;
    }

    form.requestSubmit();
    setOpen(false);
  };

  return (
    <>
      <label className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-50">
        <input
          type="checkbox"
          className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          checked={selectAll}
          onChange={handleToggleSelectAll}
        />
        <span>すべて選択</span>
      </label>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-50"
      >
        ♻ 一括復元
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-lg">
            <p className="text-xs font-semibold text-slate-900">
              アーカイブされたドキュメント（選択中のものを含む）を一括で復元しますか？
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              復元すると、通常の一覧（アクティブなドキュメント）に戻ります。
            </p>
            <div className="mt-4 flex justify-end gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-600 hover:bg-slate-50"
              >
                やめる
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-emerald-500 px-3 py-1 font-semibold text-white hover:bg-emerald-600"
              >
                はい、復元する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
