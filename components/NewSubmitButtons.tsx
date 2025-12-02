"use client";

import { useFormStatus } from "react-dom";

type Props = {
  fastAction: (formData: FormData) => void;
  aiAction: (formData: FormData) => void;
  defaultMode?: "fast" | "ai";
};

export function NewSubmitButtons({
  fastAction,
  aiAction,
  defaultMode = "ai",
}: Props) {
  const { pending } = useFormStatus();
  const fastIsPrimary = defaultMode === "fast";

  return (
    <>
      <button
        type="submit"
        formAction={fastAction}
        disabled={pending}
        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
          fastIsPrimary
            ? "border border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-400"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            <span>保存中...</span>
          </span>
        ) : (
          "とりあえず保存"
        )}
      </button>

      <button
        type="submit"
        formAction={aiAction}
        disabled={pending}
        className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
          fastIsPrimary
            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            : "border border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-400"
        }`}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-200 border-t-transparent" />
            <span>要約生成中...</span>
          </span>
        ) : (
          "保存して要約生成"
        )}
      </button>
    </>
  );
}
