"use client";

import { useFormStatus } from "react-dom";

type Props = {
  fastAction: (formData: FormData) => void;
  aiAction: (formData: FormData) => void;
};

export function NewSubmitButtons({ fastAction, aiAction }: Props) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        formAction={fastAction}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
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
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
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
