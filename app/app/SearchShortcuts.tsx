"use client";

import { useEffect } from "react";

/**
 * ダッシュボードの検索 UX を高めるためのキーボードショートカット。
 *
 * - "/" キーでメイン検索ボックス（id="q"）にフォーカス
 * - Escape で検索ボックスのフォーカス解除
 *
 * フォーム入力中（input / textarea / select / contentEditable）のときは発火しない。
 */
export function SearchShortcuts() {
  useEffect(() => {
    const isTypingElement = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select")
        return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement;

      // すでに何かの入力中ならスキップ
      if (isTypingElement(active)) return;

      const key = event.key;

      // "/" で検索ボックスにフォーカス（Cmd, Ctrl などの修飾キー無し）
      if (key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const input = document.getElementById("q") as HTMLInputElement | null;
        if (input) {
          event.preventDefault();
          input.focus();
          input.select();
        }
      }

      // Escape で検索ボックスのフォーカス解除
      if (key === "Escape") {
        const input = document.getElementById("q") as HTMLInputElement | null;
        if (input && document.activeElement === input) {
          input.blur();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
