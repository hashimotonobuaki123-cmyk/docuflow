import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticateApiKey, getApiKeyFromHeaders } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

// GET /api/documents
// シンプルな一覧 API（タイトル / カテゴリ / 要約のみ）
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Service not configured" },
      { status: 500 }
    );
  }

  const apiKey = await getApiKeyFromHeaders();
  const ctx = await authenticateApiKey(apiKey);

  if (!ctx) {
    return NextResponse.json(
      { error: "Unauthorized: invalid API key" },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rateKey = `api-documents:${ip}`;

  if (!checkRateLimit(rateKey)) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
  }

  let query = supabaseAdmin
    .from("documents")
    .select("id, title, category, summary, tags, created_at")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (ctx.organizationId) {
    query = query.eq("organization_id", ctx.organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/documents] fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }

  return NextResponse.json({ documents: data ?? [] });
}



