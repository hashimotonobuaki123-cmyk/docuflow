import { describe, it, expect, vi, beforeEach } from "vitest";
import * as OpenAIModule from "openai";

import {
  generateSummaryAndTags,
  generateTitleFromContent,
  generateCategoryFromContent,
} from "../lib/ai";

// OpenAI クライアントをモックする
vi.mock("openai", () => {
  const queue: any[] = [];

  const create = vi.fn(() => {
    const next = queue.shift();
    if (!next) {
      return Promise.resolve({ choices: [] });
    }
    return Promise.resolve(next);
  });

  const chat = {
    completions: {
      create,
    },
  };

  const OpenAI = vi.fn(() => ({
    chat,
  }));

  function enqueueResponse(response: any) {
    queue.push(response);
  }

  return { default: OpenAI, __esModule: true, enqueueResponse };
});

// モックにレスポンスを積むヘルパー
function enqueueResponse(response: any) {
  (OpenAIModule as any).enqueueResponse(response);
}

describe("lib/ai", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.clearAllMocks();
  });

  describe("generateSummaryAndTags", () => {
    it("JSON を正しくパースして summary / tags を返す", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "要約テキスト",
                tags: ["タグ1", "タグ2"],
              }),
            },
          },
        ],
      });

      const result = await generateSummaryAndTags("本文テキスト");

      expect(result.summary).toBe("要約テキスト");
      expect(result.tags).toEqual(["タグ1", "タグ2"]);
    });

    it("JSON 解析に失敗した場合、フォールバック要約を返す", async () => {
      // 1 回目: 壊れた JSON
      enqueueResponse({
        choices: [
          {
            message: {
              content: "これは JSON ではありません",
            },
          },
        ],
      });
      // 2 回目: フォールバック要約
      enqueueResponse({
        choices: [
          {
            message: {
              content: "フォールバック要約",
            },
          },
        ],
      });

      const result = await generateSummaryAndTags("本文テキスト");

      expect(result.summary).toBe("フォールバック要約");
      expect(result.tags).toEqual([]);
    });
  });

  describe("generateTitleFromContent", () => {
    it("タイトル文字列をそのまま返す", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: "テストタイトル",
            },
          },
        ],
      });

      const title = await generateTitleFromContent("本文テキスト");
      expect(title).toBe("テストタイトル");
    });

    it("タイトルの前後に付いた引用符を削除する", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: "「テストタイトル」",
            },
          },
        ],
      });

      const title = await generateTitleFromContent("本文テキスト");
      expect(title).toBe("テストタイトル");
    });

    it("空レスポンスの場合はデフォルトタイトルを返す", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: "   ",
            },
          },
        ],
      });

      const title = await generateTitleFromContent("本文テキスト");
      expect(title).toBe("無題ドキュメント");
    });
  });

  describe("generateCategoryFromContent", () => {
    it("カテゴリ文字列をそのまま返す（引用符は除去）", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: "「議事録」",
            },
          },
        ],
      });

      const category = await generateCategoryFromContent("本文テキスト");
      expect(category).toBe("議事録");
    });

    it("空レスポンスの場合は『未分類』を返す", async () => {
      enqueueResponse({
        choices: [
          {
            message: {
              content: "  ",
            },
          },
        ],
      });

      const category = await generateCategoryFromContent("本文テキスト");
      expect(category).toBe("未分類");
    });
  });
});

