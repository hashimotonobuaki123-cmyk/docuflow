import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/subscription";

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

  // プランごとの価格IDを環境変数から取得
  const priceIds: Record<SubscriptionPlan, string | undefined> = {
    free: undefined,
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTH,
  };

  const priceId = priceIds[plan];

  if (!stripeSecretKey || !priceId || !siteUrl) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server" },
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
      const { data: orgs, error: orgError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("owner_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (orgError) {
        console.error("Failed to fetch organization for billing:", orgError);
        return NextResponse.json(
          { error: "Failed to load organization" },
          { status: 500 },
        );
      }

      const org = orgs?.[0];

      if (!org) {
        return NextResponse.json(
          { error: "No organization found. Please create one first." },
          { status: 400 },
        );
      }

      metadata.organization_id = org.id;
      metadata.organization_name = org.name;
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









