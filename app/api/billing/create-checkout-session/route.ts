import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: missing user session" },
      { status: 401 },
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceProMonth = process.env.STRIPE_PRICE_PRO_MONTH;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeSecretKey || !priceProMonth || !siteUrl) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

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

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceProMonth,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/settings/billing?status=success`,
      cancel_url: `${siteUrl}/settings/billing?status=cancel`,
      metadata: {
        organization_id: org.id,
        organization_name: org.name,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Failed to create Stripe Checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}


