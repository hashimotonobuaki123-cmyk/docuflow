import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEffectivePlan } from "@/lib/subscription";

export type ApiAuthContext = {
  userId: string;
  organizationId: string | null;
};

/**
 * リクエストヘッダーから API キーを取得する
 * - 優先: x-api-key
 * - 次点: Authorization: Bearer xxx
 */
export async function getApiKeyFromHeaders(): Promise<string | null> {
  const h = await headers();
  const apiKeyHeader = h.get("x-api-key");
  if (apiKeyHeader && apiKeyHeader.trim().length > 0) {
    return apiKeyHeader.trim();
  }

  const authHeader = h.get("authorization") || h.get("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

/**
 * API キーを検証し、紐づくユーザー/組織コンテキストを返す
 */
export async function authenticateApiKey(
  apiKey: string | null
): Promise<ApiAuthContext | null> {
  if (!apiKey || apiKey.length === 0) {
    return null;
  }

  if (!supabaseAdmin) {
    console.error(
      "[apiAuth] supabaseAdmin が未初期化のため API キー認証を実行できません。SUPABASE_SERVICE_ROLE_KEY の設定を確認してください。"
    );
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("user_id, organization_id, revoked_at")
    .eq("key", apiKey)
    .maybeSingle();

  if (error) {
    console.error("[apiAuth] API キー照会エラー:", error);
    return null;
  }

  if (!data || data.revoked_at) {
    return null;
  }

  // APIアクセスは Team/Enterprise に限定（商用SaaS要件）
  try {
    const { limits } = await getEffectivePlan(
      data.user_id,
      data.organization_id ?? null,
    );
    if (!limits.apiAccess) {
      return null;
    }
  } catch (e) {
    console.error("[apiAuth] plan check failed:", e);
    return null;
  }

  return {
    userId: data.user_id,
    organizationId: data.organization_id ?? null,
  };
}










