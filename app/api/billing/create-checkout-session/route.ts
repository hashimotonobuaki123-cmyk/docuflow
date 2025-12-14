import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import type { SubscriptionPlan } from "@/lib/subscription";
import { getActiveOrganizationId } from "@/lib/organizations";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: missing user session" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { plan, type, couponCode, trialDays } = body as {
    plan: SubscriptionPlan;
    type: "personal" | "organization";
    couponCode?: string;
    trialDays?: number;
  };

  if (!plan || !type) {
    return NextResponse.json(
      { error: "Missing plan or type" },
      { status: 400 },
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const requiredPriceEnvKey: Record<SubscriptionPlan, string | null> = {
    free: null,
    pro: "STRIPE_PRICE_PRO_MONTH",
    team: "STRIPE_PRICE_TEAM_MONTH",
    enterprise: "STRIPE_PRICE_ENTERPRISE_MONTH",
  };

  // プランごとの価格IDを環境変数から取得
  const priceIds: Record<SubscriptionPlan, string | undefined> = {
    free: undefined,
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTH,
  };

  const priceId = priceIds[plan];

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が未設定です。" },
      { status: 500 },
    );
  }
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL が未設定です。" },
      { status: 500 },
    );
  }
  if (plan !== "free" && !priceId) {
    return NextResponse.json(
      {
        error: `${requiredPriceEnvKey[plan]} が未設定です（price_...）。`,
        requiredEnvKey: requiredPriceEnvKey[plan],
      },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  try {
    const metadata: Record<string, string> = {
      plan,
      type,
    };

    // 組織プランの場合
    if (type === "organization") {
      const activeOrgId = await getActiveOrganizationId(userId);
      if (!activeOrgId) {
        return NextResponse.json(
          { error: "No active organization found. Please create or select one." },
          { status: 400 },
        );
      }

      // 課金は owner/admin のみ（member は不可）
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", activeOrgId)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        console.error("Failed to check organization role for billing:", membershipError);
        return NextResponse.json(
          { error: "Failed to verify organization role" },
          { status: 500 },
        );
      }

      const role = (membership as { role?: string } | null)?.role;
      if (!role || role === "member") {
        return NextResponse.json(
          { error: "You don't have permission to manage billing for this organization." },
          { status: 403 },
        );
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("id", activeOrgId)
        .maybeSingle();

      if (orgError || !org) {
        console.error("Failed to fetch organization for billing:", orgError);
        return NextResponse.json(
          { error: "Failed to load organization" },
          { status: 500 },
        );
      }

      metadata.organization_id = org.id;
      metadata.organization_name = (org as { name?: string | null }).name ?? "";
    } else {
      // 個人プランの場合
      metadata.user_id = userId;
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/settings/billing?status=success`,
      cancel_url: `${siteUrl}/settings/billing?status=cancel`,
      metadata,
      allow_promotion_codes: true,
    };

    // subscription.updated / deleted の同期で確実にターゲット（user/org）を特定できるよう、
    // subscription_data.metadata にも同じメタ情報を入れておく（商用運用の基本）
    sessionConfig.subscription_data = {
      metadata,
      ...(trialDays && trialDays > 0 ? { trial_period_days: trialDays } : {}),
    };

    // クーポンコードの設定
    if (couponCode) {
      sessionConfig.discounts = [
        {
          coupon: couponCode,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Failed to create Stripe Checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}









