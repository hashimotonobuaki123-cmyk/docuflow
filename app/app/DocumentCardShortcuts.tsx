"use client";

import { useEffect } from "react";

/**
 * ダッシュボードのカードに対してキーボードショートカットを付与するレイヤー。
 *
 * - カード上にマウスカーソルを置いた状態で Shift + D で削除
 * - 一括削除用チェックボックス（name="ids"）と連動してカードの枠色を変更
 * - カードの空白部分をクリックすると、そのカードのチェックを ON/OFF
 */
export function DocumentCardShortcuts() {
  useEffect(() => {
    let currentCard: HTMLElement | null = null;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest<HTMLElement>("[data-doc-card]");
      if (card) {
        currentCard = card;
      }
    };

    // カードの空白部分クリックで一括削除用チェックをトグル
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // リンクやボタンなど、明示的な操作要素はそのまま動かす
      const interactive = target.closest(
        "a, button, input, textarea, select, label",
      );
      if (interactive) return;

      const card = target.closest<HTMLElement>("[data-doc-card]");
      if (!card) return;

      const checkbox =
        card.querySelector<HTMLInputElement>('input[name="ids"]');
      if (!checkbox) return;

      const next = !checkbox.checked;
      checkbox.checked = next;

      card.classList.toggle("ring-2", next);
      card.classList.toggle("ring-rose-300", next);
      card.classList.toggle("border-rose-300", next);
      card.classList.toggle("bg-rose-50/40", next);
    };

    // チェックボックスを直接クリックした場合も枠色を同期
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.name !== "ids") return;

      const card = target.closest<HTMLElement>("[data-doc-card]");
      if (!card) return;

      const checked = target.checked;
      card.classList.toggle("ring-2", checked);
      card.classList.toggle("ring-rose-300", checked);
      card.classList.toggle("border-rose-300", checked);
      card.classList.toggle("bg-rose-50/40", checked);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentCard) return;

      const key = event.key;

      // Shift + D のみ（ブラウザ標準の Cmd+D / Ctrl+D とは被らないようにする）
      const isShiftD =
        (key === "d" || key === "D") &&
        event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey;

      if (isShiftD) {
        const deleteButton = currentCard.querySelector<
          HTMLButtonElement | HTMLDivElement
        >("[data-doc-delete-button]");

        if (deleteButton instanceof HTMLButtonElement) {
          event.preventDefault();
          deleteButton.click();
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
