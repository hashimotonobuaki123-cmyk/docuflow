import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/subscription";

function truncate(text: string, max = 1000) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

async function markWebhookEvent(
  eventId: string,
  patch: {
    status?: "processing" | "processed" | "failed" | "ignored";
    processed_at?: string | null;
    error_message?: string | null;
  },
) {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin
      .from("stripe_webhook_events")
      .update(patch)
      .eq("id", eventId);
  } catch {
    // Webhook の本処理を邪魔しない（観測はベストエフォート）
  }
}

async function logBillingActivity(params: {
  userId?: string | null;
  organizationId?: string | null;
  action: string;
  documentId?: string | null;
  documentTitle?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!supabaseAdmin) return;

  let userId = params.userId ?? null;
  const organizationId = params.organizationId ?? null;

  // 組織課金の場合、userId が未指定でも owner_id を辿って監査ログに紐づける
  if (!userId && organizationId) {
    const { data } = await supabaseAdmin
      .from("organizations")
      .select("owner_id")
      .eq("id", organizationId)
      .maybeSingle();
    userId = (data as { owner_id?: string | null } | null)?.owner_id ?? null;
  }

  if (!userId) return;

  try {
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      organization_id: organizationId,
      document_id: params.documentId ?? null,
      document_title: params.documentTitle ?? null,
      action: params.action,
      metadata: params.metadata ?? null,
    });
  } catch {
    // 監査ログはベストエフォート（Webhookの本処理を止めない）
  }
}

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    console.warn(
      "[stripe/webhook] STRIPE_SECRET_KEY または STRIPE_WEBHOOK_SECRET が未設定です",
    );
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 },
    );
  }

  if (!supabaseAdmin) {
    console.warn(
      "[stripe/webhook] supabaseAdmin が未初期化のため、Webhook を処理できません",
    );
    return NextResponse.json(
      { error: "Supabase admin client is not available" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // 冪等性（重複イベント対策）
  //  - Stripe は同一 event.id を複数回配送する可能性がある
  //  - 最初の1回だけ処理し、それ以外は即 200 を返す
  // ---------------------------------------------------------------------------
  try {
    const minimalPayload = {
      id: event.id,
      type: event.type,
      created: event.created,
    };

    const { error: insertErr } = await supabaseAdmin
      .from("stripe_webhook_events")
      .insert({
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        status: "processing",
        payload: minimalPayload,
      });

    if (insertErr) {
      // Duplicate key: already processed/processing → 冪等に 200
      if ((insertErr as any).code === "23505") {
        return NextResponse.json({ received: true }, { status: 200 });
      }
      console.error("[stripe/webhook] Failed to record webhook event:", insertErr);
      return NextResponse.json(
        { error: "Failed to record webhook event" },
        { status: 500 },
      );
    }
  } catch (e) {
    console.error("[stripe/webhook] Failed to enforce idempotency:", e);
    return NextResponse.json(
      { error: "Failed to enforce idempotency" },
      { status: 500 },
    );
  }

  try {
    // Checkout完了時（新規サブスクリプション）
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organization_id;
      const userId = session.metadata?.user_id;
      const plan = (session.metadata?.plan as SubscriptionPlan) || "pro";

      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      const billingEmail = session.customer_details?.email ?? null;

      // サブスクリプション情報を取得
      let subscription: Stripe.Subscription | null = null;
      if (subscriptionId) {
        try {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        } catch (err) {
          console.error(
            "[stripe/webhook] Failed to retrieve subscription:",
            err,
          );
        }
      }

      const subscriptionStatus = (subscription?.status || "active") as
        | "active"
        | "canceled"
        | "past_due"
        | "trialing";
      const currentPeriodEnd = subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      const limits = PLAN_LIMITS[plan];

      // 組織プランの場合
      if (orgId) {
        const { error } = await supabaseAdmin
          .from("organizations")
          .update({
            plan,
            seat_limit: limits.seatLimit,
            document_limit: limits.documentLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            billing_email: billingEmail,
            subscription_status: subscriptionStatus,
            current_period_end: currentPeriodEnd,
          })
          .eq("id", orgId);

        if (error) {
          console.error(
            "[stripe/webhook] Failed to update organization billing info:",
            error,
          );
          throw new Error("Failed to update organization billing info");
        }
      }

      // 個人ユーザープランの場合
      if (userId) {
        const { error } = await supabaseAdmin
          .from("user_settings")
          .upsert(
            {
              user_id: userId,
              subscription_plan: plan,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              billing_email: billingEmail,
              subscription_status: subscriptionStatus,
              current_period_end: currentPeriodEnd,
            },
            { onConflict: "user_id" },
          );

        if (error) {
          console.error(
            "[stripe/webhook] Failed to update user subscription info:",
            error,
          );
          throw new Error("Failed to update user subscription info");
        }
      }

      await logBillingActivity({
        userId: userId ?? null,
        organizationId: orgId ?? null,
        action: "billing_subscription_created",
        metadata: {
          stripeEventId: event.id,
          plan,
          status: subscriptionStatus,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          type: orgId ? "organization" : "personal",
        },
      });
    }

    // サブスクリプション更新時（プラン変更、更新など）
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // サブスクリプションのプラン情報を取得
      const priceId = subscription.items.data[0]?.price.id;
      // プランはmetadataから取得、なければpriceIdから推測
      let plan = (subscription.metadata?.plan as SubscriptionPlan) || "pro";

      // priceIdからプランを推測（環境変数と照合）
      if (!subscription.metadata?.plan && priceId) {
        if (priceId === process.env.STRIPE_PRICE_PRO_MONTH) {
          plan = "pro";
        } else if (priceId === process.env.STRIPE_PRICE_TEAM_MONTH) {
          plan = "team";
        } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTH) {
          plan = "enterprise";
        }
      }

      const limits = PLAN_LIMITS[plan];
      const subscriptionStatus = subscription.status as
        | "active"
        | "canceled"
        | "past_due"
        | "trialing";
      const currentPeriodEnd = new Date(
        subscription.current_period_end * 1000,
      ).toISOString();

      const orgIdFromMeta = subscription.metadata?.organization_id;
      const userIdFromMeta = subscription.metadata?.user_id;

      // 組織プランを更新（metadata優先、なければcustomerIdから探索）
      const orgId =
        orgIdFromMeta ||
        (
          await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
        ).data?.[0]?.id;

      if (orgId) {
        const { error: updateError } = await supabaseAdmin
          .from("organizations")
          .update({
            plan,
            seat_limit: limits.seatLimit,
            document_limit: limits.documentLimit,
            stripe_subscription_id: subscription.id,
            subscription_status: subscriptionStatus,
            current_period_end: currentPeriodEnd,
            billing_email: subscription.metadata?.billing_email || null,
          })
          .eq("id", orgId);

        if (updateError) {
          console.error(
            "[stripe/webhook] Failed to update organization:",
            updateError,
          );
          // Stripe が再試行できるように 500 へ
          throw new Error("Failed to update organization subscription");
        }
      }

      // 個人ユーザープランを更新（metadata優先、なければcustomerIdから探索）
      const userId =
        userIdFromMeta ||
        (
          await supabaseAdmin
            .from("user_settings")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
        ).data?.[0]?.user_id;

      if (userId) {
        const { error: updateError } = await supabaseAdmin
          .from("user_settings")
          .update({
            subscription_plan: plan,
            stripe_subscription_id: subscription.id,
            subscription_status: subscriptionStatus,
            current_period_end: currentPeriodEnd,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "[stripe/webhook] Failed to update user subscription:",
            updateError,
          );
          throw new Error("Failed to update user subscription");
        }
      }

      await logBillingActivity({
        userId: userIdFromMeta ?? null,
        organizationId: orgIdFromMeta ?? orgId ?? null,
        action: "billing_subscription_updated",
        metadata: {
          stripeEventId: event.id,
          plan,
          status: subscriptionStatus,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          priceId,
        },
      });
    }

    // サブスクリプションキャンセル時
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const orgIdFromMeta = subscription.metadata?.organization_id;
      const userIdFromMeta = subscription.metadata?.user_id;

      // 組織プランを無料プランにダウングレード
      const orgId =
        orgIdFromMeta ||
        (
          await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
        ).data?.[0]?.id;

      if (orgId) {
        const limits = PLAN_LIMITS.free;

        const { error: downgradeError } = await supabaseAdmin
          .from("organizations")
          .update({
            plan: "free",
            seat_limit: limits.seatLimit,
            document_limit: limits.documentLimit,
            stripe_subscription_id: null,
            subscription_status: "canceled",
            current_period_end: null,
          })
          .eq("id", orgId);

        if (downgradeError) {
          console.error(
            "[stripe/webhook] Failed to downgrade organization:",
            downgradeError,
          );
          throw new Error("Failed to downgrade organization");
        }
      }

      // 個人ユーザープランを無料プランにダウングレード
      const userId =
        userIdFromMeta ||
        (
          await supabaseAdmin
            .from("user_settings")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
        ).data?.[0]?.user_id;

      if (userId) {
        const { error: downgradeError } = await supabaseAdmin
          .from("user_settings")
          .update({
            subscription_plan: "free",
            stripe_subscription_id: null,
            subscription_status: "canceled",
            current_period_end: null,
          })
          .eq("user_id", userId);

        if (downgradeError) {
          console.error(
            "[stripe/webhook] Failed to downgrade user:",
            downgradeError,
          );
          throw new Error("Failed to downgrade user");
        }
      }

      await logBillingActivity({
        userId: userIdFromMeta ?? null,
        organizationId: orgIdFromMeta ?? orgId ?? null,
        action: "billing_subscription_canceled",
        metadata: {
          stripeEventId: event.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
        },
      });
    }

    // 請求書支払い成功 → past_due 等から active への復帰を同期
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabaseAdmin
        .from("organizations")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", customerId);

      await supabaseAdmin
        .from("user_settings")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", customerId);

      await logBillingActivity({
        userId: null,
        organizationId: null,
        action: "billing_payment_succeeded",
        metadata: {
          stripeEventId: event.id,
          stripeCustomerId: customerId,
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
        },
      });
    }

    // 請求書支払い失敗 → past_due を同期（Stripe側のリトライで復帰する可能性あり）
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      console.warn(
        `[stripe/webhook] Invoice payment failed for customer: ${customerId}`,
      );

      await supabaseAdmin
        .from("organizations")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", customerId);

      await supabaseAdmin
        .from("user_settings")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", customerId);

      await logBillingActivity({
        userId: null,
        organizationId: null,
        action: "billing_payment_failed",
        metadata: {
          stripeEventId: event.id,
          stripeCustomerId: customerId,
          invoiceId: invoice.id,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
        },
      });
    }

    // サブスクリプション試用期間終了時（通知用途：ここではログのみ）
    if (event.type === "customer.subscription.trial_will_end") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      console.log(
        `[stripe/webhook] Trial will end for customer: ${customerId}`,
      );
    }

    await markWebhookEvent(event.id, {
      status: "processed",
      processed_at: new Date().toISOString(),
      error_message: null,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[stripe/webhook] Handler failed:", err);
    await markWebhookEvent(event.id, {
      status: "failed",
      processed_at: new Date().toISOString(),
      error_message: truncate(String(err)),
    });
    // 500 を返すことで Stripe が自動リトライできる
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}









