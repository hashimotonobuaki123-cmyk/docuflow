import OpenAI from "openai";
import { getOpenAIKey } from "./config";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = getOpenAIKey();
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function generateSummaryAndTags(rawContent: string) {
  const client = getOpenAIClient();

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

  const response = await client.chat.completions.create({
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

  try {
    const parsed = JSON.parse(content) as {
      summary?: string;
      tags?: string[];
    };

    return {
      summary: parsed.summary ?? "",
      tags: parsed.tags ?? [],
    };
  } catch {
    const fallback = await client.chat.completions.create({
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
    return { summary, tags: [] };
  }
}

export async function generateTitleFromContent(rawContent: string) {
  const client = getOpenAIClient();

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

  const response = await client.chat.completions.create({
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
}

export async function generateCategoryFromContent(rawContent: string) {
  const client = getOpenAIClient();

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

  const response = await client.chat.completions.create({
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
}
