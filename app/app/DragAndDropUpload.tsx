"use client";

import { useState, DragEvent } from "react";
import type { Locale } from "@/lib/i18n";

type Props = {
  uploadAction: (formData: FormData) => Promise<void>;
  lang?: Locale;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function DragAndDropUpload({ uploadAction, lang }: Props) {
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

    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    const validFiles = droppedFiles.filter(
      (file) =>
        ALLOWED_TYPES.includes(file.type) ||
        file.name.match(/\.(pdf|doc|docx)$/i),
    );

    if (validFiles.length === 0) {
      setMessage(
        lang === "en"
          ? "Only PDF / Word files (.pdf / .doc / .docx) are supported."
          : "PDF / Word（.pdf / .doc / .docx）のみアップロードできます。",
      );
      return;
    }

    const formData = new FormData();
    if (lang) formData.set("lang", lang);
    for (const file of validFiles) {
      formData.append("files", file);
    }

    try {
      setIsUploading(true);
      setMessage(
        validFiles.length === 1
          ? lang === "en"
            ? "AI is processing your document..."
            : "AI がドキュメントを読み込み中です…"
          : lang === "en"
            ? `AI is processing ${validFiles.length} documents...`
            : `AI が ${validFiles.length} 件のドキュメントを読み込み中です…`,
      );
      await uploadAction(formData);
      // 成功するとサーバーアクション側で /app が再検証され、新しいカードが一覧に表示される
      setMessage(
        validFiles.length === 1
          ? lang === "en"
            ? "Created the card. It will appear in the list in a few seconds."
            : "カードを作成しました。数秒後に一覧へ反映されます。"
          : lang === "en"
            ? `Created ${validFiles.length} cards. They will appear in the list in a few seconds.`
            : `${validFiles.length} 枚のカードを作成しました。数秒後に一覧へ反映されます。`,
      );
    } catch (e) {
      console.error(e);
      setMessage(
        lang === "en"
          ? "Upload failed. Please try again later."
          : "アップロードに失敗しました。時間をおいて再度お試しください。",
      );
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
          {lang === "en"
            ? "Drag & drop files here to create cards"
            : "ファイルをここにドラッグ＆ドロップしてカードを作成"}
        </p>
        <p className="text-[10px] text-slate-500">
          {lang === "en"
            ? "Drop a PDF / Word file (.pdf / .doc / .docx) and DocuFlow will generate a card with title, summary, and tags."
            : "PDF / Word（.pdf / .doc / .docx）をドロップすると、AI がタイトル・概要・タグ付きのカードを自動生成します。"}
        </p>
        {isUploading && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            {lang === "en" ? "Processing..." : "生成中…"}
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


