import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, BarChart3 } from "lucide-react";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Pricing | DocuFlow",
  description: "DocuFlow pricing plans.",
  alternates: { canonical: "/en/pricing" },
  robots: { index: false, follow: false },
};

export default async function PricingEnPage() {
  // Best-effort: fetch Stripe prices, fallback to defaults
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceIds = {
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
  } as const;

  const formatRecurringLabel = (interval?: string | null, intervalCount?: number | null) => {
    if (!interval) return "";
    const count = intervalCount && intervalCount > 1 ? intervalCount : 1;
    const unit =
      interval === "day"
        ? "day"
        : interval === "week"
          ? "week"
          : interval === "month"
            ? "month"
            : interval === "year"
              ? "year"
              : "";
    if (!unit) return "";
    return count === 1 ? `/${unit}` : `/${count} ${unit}s`;
  };

  const formatCurrency = (currency: string, amount: number) => {
    try {
      const exp = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2;
      const major = amount / Math.pow(10, exp);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(major);
    } catch {
      return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
    }
  };

  const prices: Partial<
    Record<"pro" | "team", { label: string; recurringLabel: string }>
  > = {};

  if (stripeSecret && (priceIds.pro || priceIds.team)) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
      await Promise.all(
        (Object.keys(priceIds) as Array<keyof typeof priceIds>).map(async (k) => {
          const priceId = priceIds[k];
          if (!priceId) return;
          const price = await stripe.prices.retrieve(priceId);
          if (typeof price.unit_amount !== "number" || !price.currency) return;
          prices[k] = {
            label: formatCurrency(price.currency, price.unit_amount),
            recurringLabel: formatRecurringLabel(
              price.recurring?.interval,
              price.recurring?.interval_count,
            ),
          };
        }),
      );
    } catch {
      // best-effort
    }
  }

  return (
    <MarketingSimpleLayoutEn
      title="Pricing"
      description="Simple plans with a free trial. Prices are fetched from Stripe when available (best-effort)."
    >
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-xs font-medium text-violet-300">
        <BarChart3 className="h-4 w-4" />
        <span>Plans</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-slate-300">Free</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-slate-500">/month</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["Up to 50 documents", "100MB storage", "100 AI summaries / month"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Start for free
          </Link>
        </div>

        <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-slate-950/30 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-white">
            Popular
          </div>
          <div className="text-sm font-medium text-emerald-300">Pro</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{prices.pro?.label ?? "$19"}</span>
            <span className="text-slate-500">{prices.pro?.recurringLabel ?? "/month"}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {["1,000 documents", "5GB storage", "5,000 AI summaries / month", "Priority support"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup?plan=pro"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            <span>Start free trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-sky-300">Team</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{prices.team?.label ?? "$49"}</span>
            <span className="text-slate-500">{prices.team?.recurringLabel ?? "/month"}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["10,000 documents", "50GB storage", "50,000 AI summaries / month", "Up to 10 seats"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup?plan=team"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Start free trial
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-sm font-medium text-violet-300">Enterprise</div>
          <div className="mt-2 text-2xl font-bold">Contact</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["Unlimited docs", "Unlimited storage", "Unlimited AI usage", "SSO / SLA"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:sales@docuflow.io"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Email sales
          </a>
        </div>
      </div>
    </MarketingSimpleLayoutEn>
  );
}


