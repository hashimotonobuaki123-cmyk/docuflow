"use client";

import { useEffect, useState } from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const icons = {
    danger: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  const handleConfirm = () => {
    onConfirm();
    setShow(false);
  };

  const handleCancel = () => {
    onCancel();
    setShow(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 z-[151] w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-fade-in-scale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="card p-6 shadow-2xl">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl">
              {icons[variant]}
            </div>
            <div className="flex-1">
              <h2 id="dialog-title" className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={handleCancel} className="btn btn-secondary">
              {cancelLabel}
            </button>
            <button onClick={handleConfirm} className="btn btn-danger">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// カスタムフック
export function useConfirm() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);

  const confirm = (
    title: string,
    message: string,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "danger" | "warning" | "info";
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        ...options,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
      });
    });
  };

  const closeDialog = () => {
    setDialog(null);
  };

  return {
    dialog,
    confirm,
    closeDialog,
  };
}



