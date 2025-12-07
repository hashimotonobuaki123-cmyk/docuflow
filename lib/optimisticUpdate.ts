/**
 * 楽観的UI更新のヘルパー
 * サーバーアクションの結果を待たずにUIを即座に更新し、体感速度を向上
 */

import { useOptimistic, useTransition } from "react";

/**
 * 楽観的更新のカスタムフック
 */
export function useOptimisticMutation<T, A>(
  initialState: T,
  updateFn: (state: T, action: A) => T
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    initialState,
    updateFn
  );

  const mutate = async (action: A, serverAction: () => Promise<void>) => {
    startTransition(async () => {
      setOptimisticState(action);
      try {
        await serverAction();
      } catch (error) {
        console.error("Optimistic update failed:", error);
        // エラー時は自動的に元の状態に戻る
      }
    });
  };

  return {
    state: optimisticState,
    isPending,
    mutate,
  };
}

/**
 * ドキュメントのお気に入り状態を楽観的に更新
 */
export type OptimisticDocument = {
  id: string;
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived?: boolean;
};

export function updateDocumentOptimistically(
  documents: OptimisticDocument[],
  action: {
    id: string;
    type: "favorite" | "pin" | "archive";
    value: boolean;
  }
): OptimisticDocument[] {
  return documents.map((doc) => {
    if (doc.id !== action.id) return doc;

    switch (action.type) {
      case "favorite":
        return { ...doc, is_favorite: action.value };
      case "pin":
        return { ...doc, is_pinned: action.value };
      case "archive":
        return { ...doc, is_archived: action.value };
      default:
        return doc;
    }
  });
}

/**
 * リストから要素を削除（楽観的）
 */
export function removeItemOptimistically<T extends { id: string }>(
  items: T[],
  id: string
): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * リストに要素を追加（楽観的）
 */
export function addItemOptimistically<T>(items: T[], newItem: T): T[] {
  return [newItem, ...items];
}



