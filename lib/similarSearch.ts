import { supabase } from "./supabaseClient";
import { generateEmbedding } from "./ai";

export type SimilarDocument = {
  id: string;
  title: string;
  category: string | null;
  summary: string | null;
  tags: string[] | null;
  similarity: number;
};

/**
 * テキストクエリに類似したドキュメントを検索する
 * @param query 検索クエリテキスト
 * @param userId ユーザーID（オプション、指定するとそのユーザーのドキュメントのみ検索）
 * @param matchThreshold 類似度の閾値（0-1、デフォルト0.7）
 * @param matchCount 返す最大件数（デフォルト5）
 * @returns 類似ドキュメントの配列
 */
export async function searchSimilarDocuments(
  query: string,
  userId?: string | null,
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<SimilarDocument[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // クエリテキストを埋め込みベクトルに変換
    const queryEmbedding = await generateEmbedding(query);

    // Supabase の RPC 関数を呼び出して類似検索
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: userId || null,
    });

    if (error) {
      console.error("Similar search error:", error);
      return [];
    }

    return (data as SimilarDocument[]) || [];
  } catch (error) {
    console.error("Failed to search similar documents:", error);
    return [];
  }
}

/**
 * ドキュメントの埋め込みベクトルを生成して保存する
 * @param documentId ドキュメントID
 * @param content ドキュメントの本文
 */
export async function updateDocumentEmbedding(
  documentId: string,
  content: string
): Promise<void> {
  if (!content.trim()) {
    return;
  }

  try {
    const embedding = await generateEmbedding(content);

    const { error } = await supabase
      .from("documents")
      .update({ embedding })
      .eq("id", documentId);

    if (error) {
      console.error("Failed to update document embedding:", error);
    }
  } catch (error) {
    console.error("Failed to generate/save embedding:", error);
  }
}

/**
 * 指定ドキュメントに類似したドキュメントを取得する
 * @param documentId 基準となるドキュメントのID
 * @param userId ユーザーID
 * @param matchCount 返す最大件数
 * @returns 類似ドキュメントの配列（基準ドキュメント自身は除外）
 */
export async function findRelatedDocuments(
  documentId: string,
  userId: string | null,
  matchCount: number = 5
): Promise<SimilarDocument[]> {
  try {
    // 基準ドキュメントの本文を取得
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("raw_content")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc?.raw_content) {
      return [];
    }

    // 類似検索を実行
    const similar = await searchSimilarDocuments(
      doc.raw_content,
      userId,
      0.5, // 関連ドキュメントは閾値を低めに
      matchCount + 1 // 自身を含む可能性があるので+1
    );

    // 自身を除外して返す
    return similar.filter((d) => d.id !== documentId).slice(0, matchCount);
  } catch (error) {
    console.error("Failed to find related documents:", error);
    return [];
  }
}






