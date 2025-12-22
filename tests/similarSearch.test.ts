import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock OpenAI
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: Array(1536).fill(0.1) }],
      }),
    },
  })),
}));

// Mock Supabase
vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { raw_content: "test content" },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({
      data: [
        {
          id: "doc-1",
          title: "Test Document 1",
          category: "テスト",
          summary: "Test summary",
          tags: ["tag1", "tag2"],
          similarity: 0.85,
        },
        {
          id: "doc-2",
          title: "Test Document 2",
          category: "テスト",
          summary: "Another summary",
          tags: ["tag3"],
          similarity: 0.75,
        },
      ],
      error: null,
    }),
  },
}));

describe("similarSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をモック
    vi.stubEnv("OPENAI_API_KEY", "test-api-key");
  });

  describe("searchSimilarDocuments", () => {
    it("空のクエリでは空配列を返す", async () => {
      const { searchSimilarDocuments } = await import("../lib/similarSearch");

      const result = await searchSimilarDocuments("");
      expect(result).toEqual([]);
    });

    it("空白のみのクエリでは空配列を返す", async () => {
      const { searchSimilarDocuments } = await import("../lib/similarSearch");

      const result = await searchSimilarDocuments("   ");
      expect(result).toEqual([]);
    });

    it("有効なクエリで類似ドキュメントを返す", async () => {
      const { searchSimilarDocuments } = await import("../lib/similarSearch");

      const result = await searchSimilarDocuments("テストクエリ");

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Test Document 1");
      expect(result[0].similarity).toBe(0.85);
      expect(result[1].title).toBe("Test Document 2");
    });

    it("userIdが指定された場合でも動作する", async () => {
      const { searchSimilarDocuments } = await import("../lib/similarSearch");

      const result = await searchSimilarDocuments(
        "テストクエリ",
        "user-123",
        0.7,
        5
      );

      expect(result).toHaveLength(2);
    });
  });

  describe("updateDocumentEmbedding", () => {
    it("空のコンテンツでは何もしない", async () => {
      const { updateDocumentEmbedding } = await import("../lib/similarSearch");
      const { supabase } = await import("../lib/supabaseClient");

      await updateDocumentEmbedding("doc-123", "", "user-123");

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("空白のみのコンテンツでは何もしない", async () => {
      const { updateDocumentEmbedding } = await import("../lib/similarSearch");
      const { supabase } = await import("../lib/supabaseClient");

      await updateDocumentEmbedding("doc-123", "   ", "user-123");

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("有効なコンテンツで埋め込みを更新する", async () => {
      const { updateDocumentEmbedding } = await import("../lib/similarSearch");
      const { supabase } = await import("../lib/supabaseClient");

      await updateDocumentEmbedding("doc-123", "有効なコンテンツです", "user-123");

      expect(supabase.from).toHaveBeenCalledWith("documents");
    });

    it("userId が null の場合は安全側で更新しない", async () => {
      const { updateDocumentEmbedding } = await import("../lib/similarSearch");
      const { supabase } = await import("../lib/supabaseClient");

      await updateDocumentEmbedding("doc-123", "有効なコンテンツです", null);

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe("findRelatedDocuments", () => {
    it("関連ドキュメントを取得できる", async () => {
      const { findRelatedDocuments } = await import("../lib/similarSearch");

      const result = await findRelatedDocuments("doc-123", "user-123", 5);

      // 自身を除外するため、doc-123以外が返される
      expect(result.every((d) => d.id !== "doc-123")).toBe(true);
    });

    it("nullのuserIdでも動作する", async () => {
      const { findRelatedDocuments } = await import("../lib/similarSearch");

      const result = await findRelatedDocuments("doc-123", null, 3);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("SimilarDocument type", () => {
  it("正しい型構造を持つ", async () => {
    const { searchSimilarDocuments } = await import("../lib/similarSearch");

    const result = await searchSimilarDocuments("test");

    if (result.length > 0) {
      const doc = result[0];
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("category");
      expect(doc).toHaveProperty("summary");
      expect(doc).toHaveProperty("tags");
      expect(doc).toHaveProperty("similarity");
      expect(typeof doc.similarity).toBe("number");
    }
  });
});









