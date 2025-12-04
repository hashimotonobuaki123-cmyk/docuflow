"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

type Command = {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "action" | "settings";
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: "go-dashboard",
      icon: "📄",
      label: "ダッシュボードを開く",
      shortcut: "G D",
      action: () => router.push("/app"),
      category: "navigation",
    },
    {
      id: "go-new",
      icon: "➕",
      label: "新規ドキュメントを作成",
      shortcut: "G N",
      action: () => router.push("/new"),
      category: "navigation",
    },
    {
      id: "go-settings",
      icon: "⚙️",
      label: "設定を開く",
      shortcut: "G S",
      action: () => router.push("/settings"),
      category: "navigation",
    },
    // Actions
    {
      id: "search-docs",
      icon: "🔍",
      label: "ドキュメントを検索",
      shortcut: "/",
      action: () => {
        router.push("/app");
        setTimeout(() => {
          const searchInput = document.querySelector<HTMLInputElement>("#q");
          searchInput?.focus();
        }, 100);
      },
      category: "action",
    },
    {
      id: "filter-pinned",
      icon: "📌",
      label: "ピン留めのみ表示",
      action: () => router.push("/app?onlyPinned=1"),
      category: "action",
    },
    {
      id: "filter-favorites",
      icon: "⭐",
      label: "お気に入りのみ表示",
      action: () => router.push("/app?onlyFavorites=1"),
      category: "action",
    },
    {
      id: "filter-archived",
      icon: "📦",
      label: "アーカイブを表示",
      action: () => router.push("/app?archived=1"),
      category: "action",
    },
    // Settings
    {
      id: "logout",
      icon: "🚪",
      label: "ログアウト",
      action: () => router.push("/auth/logout"),
      category: "settings",
    },
  ], [router]);

  const filteredCommands = useMemo(() => {
    return query
      ? commands.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.id.includes(query.toLowerCase())
        )
      : commands;
  }, [query, commands]);

  const groupedCommands = useMemo(() => ({
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    action: filteredCommands.filter((c) => c.category === "action"),
    settings: filteredCommands.filter((c) => c.category === "settings"),
  }), [filteredCommands]);

  const flatFilteredCommands = useMemo(() => [
    ...groupedCommands.navigation,
    ...groupedCommands.action,
    ...groupedCommands.settings,
  ], [groupedCommands]);

  const executeCommand = useCallback((index: number) => {
    const command = flatFilteredCommands[index];
    if (command) {
      command.action();
      setIsOpen(false);
      setQuery("");
    }
  }, [flatFilteredCommands]);

  // Handle query change - reset selected index
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
        return;
      }

      if (!isOpen) return;

      // Close
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }

      // Navigate
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatFilteredCommands.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatFilteredCommands.length - 1
        );
      }

      // Execute
      if (e.key === "Enter") {
        e.preventDefault();
        executeCommand(selectedIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatFilteredCommands.length, selectedIndex, executeCommand]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: "ナビゲーション",
    action: "アクション",
    settings: "設定",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-[15%] z-[101] mx-auto max-w-xl animate-fade-in-scale">
        <div className="overflow-hidden rounded-2xl border border-slate-200/20 bg-white shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="コマンドを検索..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {flatFilteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                <p>「{query}」に一致するコマンドが見つかりません</p>
              </div>
            ) : (
              <>
                {(["navigation", "action", "settings"] as const).map(
                  (category) => {
                    const categoryCommands = groupedCommands[category];
                    if (categoryCommands.length === 0) return null;

                    return (
                      <div key={category} className="mb-2">
                        <p className="mb-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {categoryLabels[category]}
                        </p>
                        {categoryCommands.map((command) => {
                          const globalIndex =
                            flatFilteredCommands.indexOf(command);
                          const isSelected = selectedIndex === globalIndex;

                          return (
                            <button
                              key={command.id}
                              onClick={() => {
                                command.action();
                                setIsOpen(false);
                                setQuery("");
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">
                                {command.icon}
                              </span>
                              <span className="flex-1 text-sm font-medium">
                                {command.label}
                              </span>
                              {command.shortcut && (
                                <kbd
                                  className={`hidden sm:inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium ${
                                    isSelected
                                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                      : "border-slate-200 bg-slate-50 text-slate-500"
                                  }`}
                                >
                                  {command.shortcut}
                                </kbd>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  }
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono">
                  ↑↓
                </kbd>
                <span>選択</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono">
                  ↵
                </kbd>
                <span>実行</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono">
                ⌘K
              </kbd>
              <span>で開く</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
