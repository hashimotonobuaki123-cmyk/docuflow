import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticateApiKey, getApiKeyFromHeaders } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

// GET /api/documents/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
  const rateKey = `api-documents-detail:${ip}`;

  if (!checkRateLimit(rateKey)) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
  }

  const id = params.id;

  let query = supabaseAdmin
    .from("documents")
    .select("id, title, category, summary, tags, raw_content, created_at")
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .limit(1);

  if (ctx.organizationId) {
    query = query.eq("organization_id", ctx.organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/documents/[id]] fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ document: data[0] });
}



