import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/subscription";
import { BillingScopeError, getBillingScopeOrThrow } from "@/lib/billingScope";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * サブスクリプション情報を取得
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") as "personal" | "organization" | null;

  try {
    const scope = await getBillingScopeOrThrow(userId, type);
    const customerId = scope.customerId;

    if (!customerId) {
      return NextResponse.json({
        subscription: null,
        customer: null,
      });
    }

    // Stripeからサブスクリプション情報を取得
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );

    if (!activeSubscription) {
      return NextResponse.json({
        subscription: null,
        customer: await stripe.customers.retrieve(customerId),
      });
    }

    // 請求履歴を取得
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 12,
    });

    // 支払い方法を取得
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return NextResponse.json({
      subscription: activeSubscription,
      customer: await stripe.customers.retrieve(customerId),
      invoices: invoices.data,
      paymentMethods: paymentMethods.data,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

/**
 * サブスクリプションを更新（プラン変更、キャンセル、再開など）
 */
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { action, subscriptionId, newPlanId, type } = body as {
    action: "cancel" | "resume" | "change_plan" | "update_payment_method";
    subscriptionId?: string;
    newPlanId?: string;
    type?: "personal" | "organization";
    paymentMethodId?: string;
  };

  try {
    const scope = await getBillingScopeOrThrow(userId, type ?? null);
    const subId = scope.subscriptionId;

    if (!subId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 },
      );
    }

    // クライアントから渡された subscriptionId は信用しない（改ざん対策）
    if (subscriptionId && subscriptionId !== subId) {
      return NextResponse.json(
        { error: "Subscription mismatch" },
        { status: 403 },
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subId);

    switch (action) {
      case "cancel":
        // 即座にキャンセル（返金なし）
        await stripe.subscriptions.cancel(subId);
        break;

      case "resume":
        // キャンセルされたサブスクリプションを再開
        await stripe.subscriptions.update(subId, {
          cancel_at_period_end: false,
        });
        break;

      case "change_plan":
        if (!newPlanId) {
          return NextResponse.json(
            { error: "newPlanId is required" },
            { status: 400 },
          );
        }

        // プランを変更（即座に反映）
        await stripe.subscriptions.update(subId, {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPlanId,
            },
          ],
          proration_behavior: "always_invoice",
        });
        break;

      case "update_payment_method":
        if (!body.paymentMethodId) {
          return NextResponse.json(
            { error: "paymentMethodId is required" },
            { status: 400 },
          );
        }

        // デフォルトの支払い方法を更新
        await stripe.subscriptions.update(subId, {
          default_payment_method: body.paymentMethodId,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BillingScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

