"use client";

import { useState, DragEvent } from "react";

type Props = {
  uploadAction: (formData: FormData) => Promise<void>;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function DragAndDropUpload({ uploadAction }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setMessage("PDF / Word（.pdf / .doc / .docx）のみアップロードできます。");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setMessage("AI がドキュメントを読み込み中です…");
      await uploadAction(formData);
      // 成功するとサーバーアクション側で /app が再検証され、新しいカードが一覧に表示される
      setMessage("カードを作成しました。数秒後に一覧へ反映されます。");
    } catch (e) {
      console.error(e);
      setMessage("アップロードに失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-[11px] text-slate-600">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-4 py-5 text-center transition ${
          isDragging
            ? "border-emerald-400 bg-emerald-50/60 text-emerald-700"
            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
        }`}
      >
        <p className="text-[11px] font-semibold text-slate-800">
          ファイルをここにドラッグ＆ドロップしてカードを作成
        </p>
        <p className="text-[10px] text-slate-500">
          PDF / Word（.pdf / .doc / .docx）をドロップすると、AI がタイトル・概要・タグ付きのカードを自動生成します。
        </p>
        {isUploading && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            生成中…
          </p>
        )}
      </div>
      {message && (
        <p className="mt-2 text-[10px] text-slate-500">
          {message}
        </p>
      )}
    </div>
  );
}


