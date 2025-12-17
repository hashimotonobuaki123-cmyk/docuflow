import { supabase } from "./supabaseClient";

/**
 * サブスクリプションプラン定義
 * 世界展開を前提とした多段階プラン設計
 */
export type SubscriptionPlan = "free" | "pro" | "team" | "enterprise";

export type SubscriptionType = "personal" | "organization";

/**
 * プラン制限定義
 */
export interface PlanLimits {
  /** ドキュメント数上限（null = 無制限） */
  documentLimit: number | null;
  /** ストレージ容量上限（MB、null = 無制限） */
  storageLimitMB: number | null;
  /** 月間AI呼び出し回数上限（null = 無制限） */
  monthlyAICalls: number | null;
  /** 組織メンバー数上限（組織プランのみ、null = 無制限） */
  seatLimit: number | null;
  /** ベクトル検索機能 */
  vectorSearch: boolean;
  /** 共有リンク機能 */
  shareLinks: boolean;
  /** コメント機能 */
  comments: boolean;
  /** バージョン履歴機能 */
  versionHistory: boolean;
  /** 優先サポート */
  prioritySupport: boolean;
  /** カスタムブランディング */
  customBranding: boolean;
  /** API アクセス */
  apiAccess: boolean;
}

/**
 * プラン制限マップ
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    documentLimit: 50,
    storageLimitMB: 100,
    monthlyAICalls: 100,
    seatLimit: 1,
    vectorSearch: true,
    shareLinks: true,
    comments: true,
    versionHistory: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
  },
  pro: {
    documentLimit: 1000,
    storageLimitMB: 5000,
    monthlyAICalls: 5000,
    seatLimit: 10,
    vectorSearch: true,
    shareLinks: true,
    comments: true,
    versionHistory: true,
    prioritySupport: true,
    customBranding: false,
    apiAccess: false,
  },
  team: {
    documentLimit: 10000,
    storageLimitMB: 50000,
    monthlyAICalls: 50000,
    seatLimit: 50,
    vectorSearch: true,
    shareLinks: true,
    comments: true,
    versionHistory: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
  },
  enterprise: {
    documentLimit: null,
    storageLimitMB: null,
    monthlyAICalls: null,
    seatLimit: null,
    vectorSearch: true,
    shareLinks: true,
    comments: true,
    versionHistory: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
  },
};

/**
 * プラン価格（月額、USD）
 */
export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 9.99,
  team: 49.99,
  enterprise: 0, // カスタム価格
};

/**
 * プラン表示名（多言語対応）
 */
export const PLAN_NAMES: Record<
  SubscriptionPlan,
  { en: string; ja: string }
> = {
  free: { en: "Free", ja: "無料" },
  pro: { en: "Pro", ja: "プロ" },
  team: { en: "Team", ja: "チーム" },
  enterprise: { en: "Enterprise", ja: "エンタープライズ" },
};

/**
 * プラン説明（多言語対応）
 */
export const PLAN_DESCRIPTIONS: Record<
  SubscriptionPlan,
  { en: string; ja: string }
> = {
  free: {
    en: "Perfect for individuals getting started",
    ja: "個人利用に最適なスタートプラン",
  },
  pro: {
    en: "For small teams and power users",
    ja: "小規模チームやパワーユーザー向け",
  },
  team: {
    en: "For growing teams and organizations",
    ja: "成長中のチームや組織向け",
  },
  enterprise: {
    en: "Custom solutions for large organizations",
    ja: "大規模組織向けカスタムソリューション",
  },
};

/**
 * 個人ユーザーのプラン情報
 */
export interface PersonalSubscription {
  plan: SubscriptionPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  billingEmail: string | null;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: string | null;
}

/**
 * 組織のプラン情報（既存のorganizationsテーブルから取得）
 */
export interface OrganizationSubscription {
  plan: SubscriptionPlan;
  seatLimit: number | null;
  documentLimit: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  billingEmail: string | null;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: string | null;
}

type OrganizationSubscriptionRow = {
  plan: SubscriptionPlan;
  seat_limit: number | null;
  document_limit: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_email: string | null;
  subscription_status: OrganizationSubscription["subscriptionStatus"];
  current_period_end: string | null;
};

/**
 * 個人ユーザーのプラン情報を取得
 */
export async function getPersonalSubscription(
  userId: string | null,
): Promise<PersonalSubscription> {
  if (!userId) {
    return {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      billingEmail: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
    };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "subscription_plan, stripe_customer_id, stripe_subscription_id, billing_email, subscription_status, current_period_end",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getPersonalSubscription] 取得エラー:", error);
    return {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      billingEmail: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
    };
  }

  if (!data) {
    return {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      billingEmail: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
    };
  }

  const plan = (data.subscription_plan as SubscriptionPlan) || "free";
  const validPlan: SubscriptionPlan =
    plan === "free" || plan === "pro" || plan === "team" || plan === "enterprise"
      ? plan
      : "free";

  return {
    plan: validPlan,
    stripeCustomerId: (data.stripe_customer_id as string | null) || null,
    stripeSubscriptionId:
      (data.stripe_subscription_id as string | null) || null,
    billingEmail: (data.billing_email as string | null) || null,
    subscriptionStatus:
      (data.subscription_status as PersonalSubscription["subscriptionStatus"]) ||
      null,
    currentPeriodEnd: (data.current_period_end as string | null) || null,
  };
}

/**
 * 組織のプラン情報を取得
 */
export async function getOrganizationSubscription(
  organizationId: string | null,
  options?: { requesterUserId?: string | null },
): Promise<OrganizationSubscription | null> {
  if (!organizationId) {
    return null;
  }

  // Safety-by-default:
  // - userId が分かる文脈では、必ず membership 起点で organizations をスコープする（漏洩防止）
  const requesterUserId = options?.requesterUserId ?? null;
  let data: OrganizationSubscriptionRow | null = null;
  let error: unknown = null;

  if (requesterUserId) {
    const res = await supabase
      .from("organization_members")
      .select(
        `
        organization:organizations (
          plan,
          seat_limit,
          document_limit,
          stripe_customer_id,
          stripe_subscription_id,
          billing_email,
          subscription_status,
          current_period_end
        )
      `,
      )
      .eq("organization_id", organizationId)
      .eq("user_id", requesterUserId)
      .maybeSingle();

    error = res.error;
    const org = (res.data as { organization?: OrganizationSubscriptionRow | OrganizationSubscriptionRow[] | null } | null)
      ?.organization;
    data = (Array.isArray(org) ? org[0] : org) ?? null;
  } else {
    const res = await supabase
      .from("organizations")
      .select(
        "plan, seat_limit, document_limit, stripe_customer_id, stripe_subscription_id, billing_email, subscription_status, current_period_end",
      )
      .eq("id", organizationId)
      .maybeSingle();
    data = res.data as OrganizationSubscriptionRow | null;
    error = res.error;
  }

  if (error) {
    console.error("[getOrganizationSubscription] 取得エラー:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const plan = (data.plan as SubscriptionPlan) || "free";
  const validPlan: SubscriptionPlan =
    plan === "free" || plan === "pro" || plan === "team" || plan === "enterprise"
      ? plan
      : "free";

  return {
    plan: validPlan,
    seatLimit: (data.seat_limit as number | null) || null,
    documentLimit: (data.document_limit as number | null) || null,
    stripeCustomerId: (data.stripe_customer_id as string | null) || null,
    stripeSubscriptionId:
      (data.stripe_subscription_id as string | null) || null,
    billingEmail: (data.billing_email as string | null) || null,
    subscriptionStatus:
      (data.subscription_status as OrganizationSubscription["subscriptionStatus"]) ||
      null,
    currentPeriodEnd: (data.current_period_end as string | null) || null,
  };
}

/**
 * ユーザーまたは組織の有効なプランを取得
 * 個人ドキュメントの場合は個人プラン、組織ドキュメントの場合は組織プランを返す
 */
export async function getEffectivePlan(
  userId: string | null,
  organizationId: string | null,
): Promise<{
  plan: SubscriptionPlan;
  limits: PlanLimits;
  type: SubscriptionType;
}> {
  // 組織が指定されている場合は組織プランを優先
  if (organizationId) {
    const orgSub = await getOrganizationSubscription(organizationId, {
      requesterUserId: userId,
    });
    if (orgSub) {
      return {
        plan: orgSub.plan,
        limits: PLAN_LIMITS[orgSub.plan],
        type: "organization",
      };
    }
  }

  // 個人プランを取得
  const personalSub = await getPersonalSubscription(userId);
  return {
    plan: personalSub.plan,
    limits: PLAN_LIMITS[personalSub.plan],
    type: "personal",
  };
}

/**
 * ドキュメント作成可能かチェック（多言語対応）
 */
export async function canCreateDocument(
  userId: string | null,
  organizationId: string | null,
  locale: "en" | "ja" = "ja",
): Promise<{ allowed: boolean; reason?: string; currentCount?: number; limit?: number }> {
  if (!userId) {
    return {
      allowed: false,
      reason: locale === "en" ? "Please sign in to create documents." : "ドキュメントを作成するにはログインしてください。",
    };
  }

  const { plan, limits, type } = await getEffectivePlan(userId, organizationId);

  // 無制限プランの場合
  if (limits.documentLimit === null) {
    return { allowed: true };
  }

  // 現在のドキュメント数を取得
  const query = organizationId
    ? supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
    : supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("organization_id", null)
        .eq("is_archived", false);

  const { count, error } = await query;

  if (error) {
    console.error("[canCreateDocument] ドキュメント数取得エラー:", error);
    return {
      allowed: false,
      reason: locale === "en"
        ? "Failed to check document limit. Please try again."
        : "ドキュメント数の確認に失敗しました。もう一度お試しください。",
    };
  }

  const currentCount = count || 0;

  if (currentCount >= limits.documentLimit) {
    const planName = PLAN_NAMES[plan][locale];
    return {
      allowed: false,
      reason:
        type === "personal"
          ? locale === "en"
            ? `You have reached the document limit (${limits.documentLimit}) for the ${planName} plan. Please upgrade to create more documents.`
            : `${planName}プランのドキュメント数上限（${limits.documentLimit}件）に達しました。追加で作成するにはプランをアップグレードしてください。`
          : locale === "en"
          ? `Your organization has reached the document limit (${limits.documentLimit}) for the ${planName} plan. Please upgrade to create more documents.`
          : `組織の${planName}プランのドキュメント数上限（${limits.documentLimit}件）に達しました。追加で作成するにはプランをアップグレードしてください。`,
      currentCount,
      limit: limits.documentLimit,
    };
  }

  return { allowed: true, currentCount, limit: limits.documentLimit };
}

/**
 * メンバー追加可能かチェック（組織プランのみ、多言語対応）
 */
export async function canAddMember(
  organizationId: string,
  locale: "en" | "ja" = "ja",
  requesterUserId?: string | null,
): Promise<{ allowed: boolean; reason?: string; currentCount?: number; limit?: number }> {
  const orgSub = await getOrganizationSubscription(organizationId, {
    requesterUserId: requesterUserId ?? null,
  });
  if (!orgSub) {
    return {
      allowed: false,
      reason: locale === "en" ? "Organization not found." : "組織が見つかりません。",
    };
  }

  const limits = PLAN_LIMITS[orgSub.plan];

  // 無制限プランの場合
  if (limits.seatLimit === null) {
    return { allowed: true };
  }

  // 現在のメンバー数を取得
  const { count, error } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    console.error("[canAddMember] メンバー数取得エラー:", error);
    return {
      allowed: false,
      reason: locale === "en"
        ? "Failed to check member limit. Please try again."
        : "メンバー数の確認に失敗しました。もう一度お試しください。",
    };
  }

  const currentCount = count || 0;

  if (currentCount >= limits.seatLimit) {
    const planName = PLAN_NAMES[orgSub.plan][locale];
    return {
      allowed: false,
      reason:
        locale === "en"
          ? `Your organization has reached the member limit (${limits.seatLimit}) for the ${planName} plan. Please upgrade to add more members.`
          : `組織の${planName}プランのメンバー数上限（${limits.seatLimit}人）に達しました。追加でメンバーを追加するにはプランをアップグレードしてください。`,
      currentCount,
      limit: limits.seatLimit,
    };
  }

  return { allowed: true, currentCount, limit: limits.seatLimit };
}

/**
 * プランアップグレードが必要かチェック
 */
export function needsUpgrade(
  currentPlan: SubscriptionPlan,
  requiredFeature: keyof PlanLimits,
): boolean {
  const currentLimits = PLAN_LIMITS[currentPlan];
  const featureValue = currentLimits[requiredFeature];

  // boolean型の機能の場合
  if (typeof featureValue === "boolean") {
    return !featureValue;
  }

  // 数値型の制限の場合（null = 無制限なので、nullでない場合は制限あり）
  if (typeof featureValue === "number") {
    return false; // 数値制限は動的にチェックするため、ここではfalse
  }

  return false;
}

