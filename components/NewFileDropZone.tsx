"use client";

import { useState, DragEvent } from "react";

type Props = {
  inputId: string;
};

export function NewFileDropZone({ inputId }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const applyFileToInput = (file: File) => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    setFileName(file.name);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      setFileName(
        "PDF / Word（.pdf / .doc / .docx）のみアップロードできます。",
      );
      return;
    }

    applyFileToInput(file);
  };

  const handleClick = () => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  // file input の change を横取りして fileName を更新するために、ここでイベントリスナーを張る
  // （input 自体は親コンポーネントにあり、id 経由で参照する）

  if (typeof window !== "undefined") {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input && !input.dataset._newFileDropZoneBound) {
      input.addEventListener("change", (e) =>
        handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>),
      );
      input.dataset._newFileDropZoneBound = "true";
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 text-center text-[11px] transition ${
        isDragging
          ? "border-emerald-400 bg-emerald-50/70 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40"
      }`}
    >
      <p className="font-medium">
        クリックしてファイルを選択 / ここにドラッグ＆ドロップ
      </p>
      <p className="text-[10px] text-slate-500">
        PDF / Word（.pdf / .doc / .docx / 10MB まで）をアップロードできます。
      </p>
      {fileName && (
        <p className="mt-1 truncate text-[10px] text-slate-500">
          選択中: <span className="font-medium">{fileName}</span>
        </p>
      )}
    </div>
  );
}
