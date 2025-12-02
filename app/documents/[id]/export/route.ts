import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

// UTC の ISO 文字列を、日本時間 (UTC+9) の "YYYY/MM/DD HH:MM" に変換する簡易ヘルパー
function formatJstDateTime(value: string | null): string | null {
  if (!value) return null;
  const utc = new Date(value);
  if (Number.isNaN(utc.getTime())) return null;

  const jstMs = utc.getTime() + 9 * 60 * 60 * 1000;
  const jst = new Date(jstMs);

  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  const hour = String(jst.getUTCHours()).padStart(2, "0");
  const minute = String(jst.getUTCMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("export markdown fetch error:", error);
    return new Response("Not found", { status: 404 });
  }

  // 簡易的な「自分のドキュメントだけ」チェック（RLS disabled 前提）
  if (userId && data.user_id && data.user_id !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const doc = data as {
    id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
    summary: string | null;
    tags: string[] | null;
    created_at: string;
  };

  const createdAt = formatJstDateTime(doc.created_at) ?? doc.created_at;
  const tags = Array.isArray(doc.tags) ? doc.tags : [];

  const lines: string[] = [];
  lines.push(`# ${doc.title || "無題ドキュメント"}`);
  lines.push("");
  lines.push(`- 作成日時: ${createdAt ?? "不明"}`);
  if (doc.category) {
    lines.push(`- カテゴリ: ${doc.category}`);
  }
  if (tags.length > 0) {
    lines.push(`- タグ: ${tags.join(", ")}`);
  }
  lines.push("");
  if (doc.summary) {
    lines.push("## AI 要約");
    lines.push("");
    lines.push(doc.summary);
    lines.push("");
  }
  lines.push("## 本文");
  lines.push("");
  lines.push(doc.raw_content ?? "");
  lines.push("");

  const markdown = lines.join("\n");

  const safeTitle =
    (doc.title || "document").replace(
      /[\\x00-\\x1f\\x7f"*/:<>?\\\\|]+/g,
      "_",
    ) || "document";
  const fileName = `${safeTitle}.md`;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        fileName,
      )}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
