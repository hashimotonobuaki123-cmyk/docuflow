/**
 * サブスクリプション使用量の追跡とチェック
 */

import { supabase } from "./supabaseClient";
import { getEffectivePlan } from "./subscription";
import { getAICallsThisMonth } from "./aiUsage";

/**
 * ストレージ使用量を取得（MB単位）
 */
export async function getStorageUsage(
  userId: string | null,
  organizationId: string | null,
): Promise<{ usedMB: number; limitMB: number | null }> {
  // 簡易実装: ドキュメントのraw_contentのサイズを合計
  // 実際の実装では、ファイルストレージの使用量を追跡する必要がある
  const query = organizationId
    ? supabase
        .from("documents")
        .select("raw_content")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
    : supabase
        .from("documents")
        .select("raw_content")
        .eq("user_id", userId)
        .is("organization_id", null)
        .eq("is_archived", false);

  const { data, error } = await query;

  if (error || !data) {
    return { usedMB: 0, limitMB: null };
  }

  // テキストサイズをバイト数で計算（簡易版）
  const totalBytes = data.reduce((sum, doc) => {
    const content = doc.raw_content || "";
    return sum + new Blob([content]).size;
  }, 0);

  const usedMB = totalBytes / (1024 * 1024);

  const { limits } = await getEffectivePlan(userId, organizationId);
  return { usedMB, limitMB: limits.storageLimitMB };
}

/**
 * ストレージ容量チェック
 */
export async function canUseStorage(
  userId: string | null,
  organizationId: string | null,
  additionalMB: number,
  locale: "en" | "ja" = "ja",
): Promise<{ allowed: boolean; reason?: string; usedMB?: number; limitMB?: number }> {
  const { usedMB, limitMB } = await getStorageUsage(userId, organizationId);

  if (limitMB === null) {
    return { allowed: true };
  }

  if (usedMB + additionalMB > limitMB) {
    return {
      allowed: false,
      reason:
        locale === "en"
          ? `Storage limit (${limitMB}MB) will be exceeded. Current usage: ${usedMB.toFixed(2)}MB. Please upgrade your plan or delete some documents.`
          : `ストレージ容量上限（${limitMB}MB）を超えます。現在の使用量: ${usedMB.toFixed(2)}MB。プランをアップグレードするか、一部のドキュメントを削除してください。`,
      usedMB,
      limitMB,
    };
  }

  return { allowed: true, usedMB, limitMB };
}

/**
 * AI呼び出し回数を追跡（簡易実装）
 * 実際の実装では、専用テーブルで月次カウントを管理する必要がある
 */
export async function getAICallUsage(
  userId: string | null,
  organizationId: string | null,
): Promise<{ calls: number; limit: number | null }> {
  const { limits } = await getEffectivePlan(userId, organizationId);
  const calls = await getAICallsThisMonth(userId, organizationId);
  return { calls, limit: limits.monthlyAICalls };
}

/**
 * AI呼び出し可能かチェック
 */
export async function canCallAI(
  userId: string | null,
  organizationId: string | null,
  locale: "en" | "ja" = "ja",
): Promise<{ allowed: boolean; reason?: string; calls?: number; limit?: number }> {
  const { calls, limit } = await getAICallUsage(userId, organizationId);

  if (limit === null) {
    return { allowed: true };
  }

  if (calls >= limit) {
    return {
      allowed: false,
      reason:
        locale === "en"
          ? `You have reached the monthly AI call limit (${limit.toLocaleString()}). Please upgrade your plan or wait until next month.`
          : `月間AI呼び出し回数上限（${limit.toLocaleString()}回）に達しました。プランをアップグレードするか、来月までお待ちください。`,
      calls,
      limit,
    };
  }

  return { allowed: true, calls, limit };
}

