"use client";

import { useState, useEffect, useCallback } from "react";

type Shortcut = {
  keys: string[];
  description: string;
  category: "navigation" | "action" | "document";
};

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["⌘", "K"], description: "コマンドパレットを開く", category: "navigation" },
  { keys: ["G", "D"], description: "ダッシュボードへ移動", category: "navigation" },
  { keys: ["G", "N"], description: "新規作成ページへ移動", category: "navigation" },
  { keys: ["G", "S"], description: "設定ページへ移動", category: "navigation" },
  // Actions
  { keys: ["/"], description: "検索にフォーカス", category: "action" },
  { keys: ["?"], description: "ショートカットヘルプを表示", category: "action" },
  { keys: ["Esc"], description: "モーダルを閉じる", category: "action" },
  // Document
  { keys: ["Shift", "D"], description: "ドキュメントを削除", category: "document" },
  { keys: ["P"], description: "ピン留めを切り替え", category: "document" },
  { keys: ["F"], description: "お気に入りを切り替え", category: "document" },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }

    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: "ナビゲーション",
    action: "アクション",
    document: "ドキュメント操作",
  };

  const groupedShortcuts = {
    navigation: shortcuts.filter((s) => s.category === "navigation"),
    action: shortcuts.filter((s) => s.category === "action"),
    document: shortcuts.filter((s) => s.category === "document"),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[10%] z-[101] mx-auto max-w-lg animate-fade-in-scale">
        <div className="overflow-hidden rounded-2xl border border-slate-200/20 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg">
                ⌨️
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">キーボードショートカット</h2>
                <p className="text-xs text-slate-500">効率的に操作できます</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {(["navigation", "action", "document"] as const).map((category) => (
              <div key={category}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5"
                    >
                      <span className="text-sm text-slate-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <span key={j}>
                            <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-slate-300 bg-white px-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                              {key}
                            </kbd>
                            {j < shortcut.keys.length - 1 && (
                              <span className="mx-0.5 text-slate-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
            <p className="text-center text-xs text-slate-500">
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px]">
                ?
              </kbd>
              <span className="ml-2">を押すといつでもこのヘルプを表示できます</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}







