import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.organization_id;

    if (!orgId) {
      console.warn(
        "[stripe/webhook] checkout.session.completed without organization_id metadata",
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;
    const billingEmail = session.customer_details?.email ?? null;

    const { error } = await supabaseAdmin
      .from("organizations")
      .update({
        plan: "pro",
        seat_limit: 10,
        document_limit: 1000,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        billing_email: billingEmail,
      })
      .eq("id", orgId);

    if (error) {
      console.error(
        "[stripe/webhook] Failed to update organization billing info:",
        error,
      );
      return NextResponse.json(
        { error: "Failed to update organization billing info" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}






