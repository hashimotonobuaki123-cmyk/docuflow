import { describe, expect, it } from "vitest";
import {
  filterDocuments,
  type FilterableDocument as Document,
} from "../lib/filterDocuments";

const baseDoc = (overrides: Partial<Document>): Document => ({
  id: "1",
  title: "サンプル",
  category: "メモ",
  raw_content: "本文",
  summary: "要約",
  tags: ["タグ"],
  created_at: new Date().toISOString(),
  user_id: "user-1",
  is_favorite: false,
  is_pinned: false,
  ...overrides,
});

describe("filterDocuments", () => {
  it("空のクエリとカテゴリのときは全件返す", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", title: "A" }),
      baseDoc({ id: "2", title: "B" }),
    ];

    const result = filterDocuments(docs, "", "");
    expect(result).toHaveLength(2);
  });

  it("タイトルでフィルタできる", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", title: "Next.js 入門" }),
      baseDoc({ id: "2", title: "React メモ" }),
    ];

    const result = filterDocuments(docs, "next.js", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("タグでフィルタできる", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", tags: ["設計", "API"] }),
      baseDoc({ id: "2", tags: ["デザイン"] }),
    ];

    const result = filterDocuments(docs, "api", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("カテゴリでフィルタできる", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", category: "議事録" }),
      baseDoc({ id: "2", category: "仕様書" }),
    ];

    const result = filterDocuments(docs, "", "議事録");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("全文検索とカテゴリを組み合わせてフィルタできる", () => {
    const docs: Document[] = [
      baseDoc({
        id: "1",
        title: "API 設計",
        category: "仕様書",
        raw_content: "ユーザー登録のAPI仕様です。",
      }),
      baseDoc({
        id: "2",
        title: "議事録",
        category: "議事録",
        raw_content: "MTGのメモです。",
      }),
    ];

    const result = filterDocuments(docs, "api", "仕様書");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("onlyFavorites=true のときお気に入りだけ返す", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", title: "A", is_favorite: true }),
      baseDoc({ id: "2", title: "B", is_favorite: false }),
    ];

    const result = filterDocuments(docs, "", "", true, false);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("onlyPinned=true のときピン留めだけ返す", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", title: "A", is_pinned: true }),
      baseDoc({ id: "2", title: "B", is_pinned: false }),
    ];

    const result = filterDocuments(docs, "", "", false, true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("クエリは大文字小文字を区別せずにマッチする", () => {
    const docs: Document[] = [
      baseDoc({ id: "1", title: "Next.js 入門" }),
      baseDoc({ id: "2", title: "React メモ" }),
    ];

    const result = filterDocuments(docs, "NEXT.JS", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
