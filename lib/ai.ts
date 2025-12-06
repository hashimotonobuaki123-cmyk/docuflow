import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummaryAndTags(rawContent: string) {
  if (!process.env.OPENAI_API_KEY) {
    // 環境変数がない場合でもアプリ全体が落ちないよう、簡易要約でフォールバック
    const fallbackSummary = rawContent.slice(0, 200);
    return { summary: fallbackSummary, tags: [] as string[] };
  }

  const prompt = `
あなたは日本語のドキュメントを整理するアシスタントです。
以下の本文を読み、次の形式の JSON を出力してください。

{
  "summary": "3〜5行の日本語要約",
  "tags": ["タグ1", "タグ2", "タグ3"]
}

本文:
---
${rawContent}
---
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes Japanese documents and returns strict JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content ?? "";

    const parsed = JSON.parse(content) as {
      summary?: string;
      tags?: string[];
    };

    return {
      summary: parsed.summary ?? "",
      tags: parsed.tags ?? [],
    };
  } catch {
    try {
      const fallback = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that summarizes Japanese documents in 3-5 sentences.",
          },
          {
            role: "user",
            content: rawContent,
          },
        ],
        temperature: 0.2,
      });

      const summary = fallback.choices[0]?.message?.content ?? "";
      return { summary, tags: [] as string[] };
    } catch (error) {
      console.error("[ai] generateSummaryAndTags fallback error:", error);
      const fallbackSummary = rawContent.slice(0, 200);
      return { summary: fallbackSummary, tags: [] as string[] };
    }
  }
}

export async function generateTitleFromContent(rawContent: string) {
  if (!process.env.OPENAI_API_KEY) {
    return "無題ドキュメント";
  }

  const prompt = `
あなたは日本語のドキュメントのタイトルを考えるアシスタントです。
以下の本文の内容を一言で表す、日本語のタイトルを1つだけ提案してください。

- 最大30文字程度
- 句読点や記号は必要なものだけ
- JSON ではなく、タイトル文字列だけを返してください

本文:
---
${rawContent}
---
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates concise Japanese document titles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    let title = response.choices[0]?.message?.content?.trim() ?? "";

    // もしタイトルが引用符で囲まれていたら外す
    title = title.replace(/^["「『\s]+/, "").replace(/["」』\s]+$/, "");

    return title || "無題ドキュメント";
  } catch (error) {
    console.error("[ai] generateTitleFromContent error:", error);
    return "無題ドキュメント";
  }
}

export async function generateCategoryFromContent(rawContent: string) {
  if (!process.env.OPENAI_API_KEY) {
    return "未分類";
  }

  const prompt = `
あなたは日本語のドキュメントを「カテゴリ名」に分類するアシスタントです。
以下の本文を読み、最もふさわしいカテゴリ名を1つだけ日本語で返してください。

- 例: 仕様書, 議事録, 企画書, 提案書, レポート, メモ, マニュアル など
- 最大4〜6文字程度
- JSON ではなく、カテゴリ名の文字列だけを返してください

本文:
---
${rawContent}
---
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates concise Japanese document category names.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    let category = response.choices[0]?.message?.content?.trim() ?? "";
    category = category.replace(/^["「『\s]+/, "").replace(/["」』\s]+$/, "");

    return category || "未分類";
  } catch (error) {
    console.error("[ai] generateCategoryFromContent error:", error);
    return "未分類";
  }
}

/**
 * テキストを OpenAI Embeddings API で埋め込みベクトルに変換する
 * @param text 埋め込みを生成するテキスト
 * @returns 1536次元の埋め込みベクトル
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    // Embedding が利用できない場合は空配列でフォールバック（ベクトル検索はスキップ）
    return [];
  }

  // テキストが長すぎる場合は先頭8000文字に切り詰める（トークン制限対策）
  const truncatedText = text.slice(0, 8000);

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: truncatedText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[ai] generateEmbedding error:", error);
    return [];
  }
}
