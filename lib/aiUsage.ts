import { supabaseAdmin } from "./supabaseAdmin";
import { getEffectivePlan } from "./subscription";

type Locale = "ja" | "en";

function scopeForUsage(userId: string | null, organizationId: string | null): {
  scopeType: "personal" | "organization";
  scopeId: string | null;
} {
  if (organizationId) {
    return { scopeType: "organization", scopeId: organizationId };
  }
  return { scopeType: "personal", scopeId: userId };
}

export async function getAICallsThisMonth(
  userId: string | null,
  organizationId: string | null,
): Promise<number> {
  if (!supabaseAdmin) return 0;

  const scope = scopeForUsage(userId, organizationId);
  if (!scope.scopeId) return 0;
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthStartDate = monthStart.toISOString().slice(0, 10); // YYYY-MM-01

  const { data, error } = await supabaseAdmin
    .from("ai_usage_monthly")
    .select("calls")
    .eq("month_start", monthStartDate)
    .eq("scope_type", scope.scopeType)
    .eq("scope_id", scope.scopeId)
    .maybeSingle();
  if (error) return 0;
  return (data?.calls as number | undefined) ?? 0;
}

/**
 * AI呼び出し回数を「原子的に」消費する（上限超過時は allowed=false）
 * - 組織IDがある場合: organization スコープ
 * - ない場合: personal スコープ（user_id）
 */
export async function consumeAICallsWithLimit(
  userId: string | null,
  organizationId: string | null,
  limit: number | null,
  count: number,
): Promise<{ allowed: boolean; calls: number }> {
  if (!supabaseAdmin) {
    // ローカル/テストで service_role が無い場合でもアプリを落とさない
    return { allowed: true, calls: 0 };
  }

  const scope = scopeForUsage(userId, organizationId);

  const { data, error } = await supabaseAdmin.rpc("consume_ai_usage", {
    p_user_id: scope.scopeType === "personal" ? scope.scopeId : null,
    p_organization_id: scope.scopeType === "organization" ? scope.scopeId : null,
    p_limit: limit ?? -1,
    p_count: count,
  });

  if (error) {
    console.error("[aiUsage] consume_ai_usage error:", error);
    // Supabase 側の migration 未適用などで関数が存在しないケースでも、
    // アプリを止めずに継続できるようベストエフォートで許可する。
    // ※商用運用では必ず migrations を適用すること。
    return { allowed: true, calls: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    calls: Number(row?.calls ?? 0),
  };
}

/**
 * 現在の有効プランの月間AI上限に対して、count回分を消費できるかチェックして消費する
 */
export async function ensureAndConsumeAICalls(
  userId: string | null,
  organizationId: string | null,
  count: number,
  locale: Locale = "ja",
): Promise<void> {
  if (!userId) {
    throw new Error(locale === "en" ? "Please sign in." : "ログインしてください。");
  }

  const { limits } = await getEffectivePlan(userId, organizationId);
  const limit = limits.monthlyAICalls;

  const res = await consumeAICallsWithLimit(userId, organizationId, limit, count);
  if (!res.allowed) {
    const limitText = limit === null ? "" : limit.toLocaleString();
    throw new Error(
      locale === "en"
        ? `You have reached the monthly AI call limit (${limitText}). Please upgrade your plan or wait until next month.`
        : `月間AI呼び出し回数上限（${limitText}回）に達しました。プランをアップグレードするか、来月までお待ちください。`,
    );
  }
}


