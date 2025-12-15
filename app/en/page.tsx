import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { Logo } from "@/components/Logo";
import { Check, ArrowRight, Sparkles, Shield, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "DocuFlow | AI Document Workspace",
  description:
    "AI-powered document workspace for PDFs/Docs: summarize, tag, and search instantly. Built with production-grade security (RBAC/RLS, audit logs, expiring share links).",
  alternates: { canonical: "/en" },
};

export default async function HomeEn() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  // Best-effort: keep LP pricing aligned with Stripe (fallback if unavailable)
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceIds = {
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
  } as const;

  const formatRecurringLabel = (
    interval?: string | null,
    intervalCount?: number | null,
  ) => {
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

  const lpPrices: Partial<
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
          lpPrices[k] = {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <Link href="/en" className="hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#value" className="text-sm text-slate-400 hover:text-white transition-colors">
                Value
              </a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#trust" className="text-sm text-slate-400 hover:text-white transition-colors">
                Security
              </a>
            </nav>
            <div className="flex items-center gap-3">
              {isAuthed ? (
                <Link
                  href="/app"
                  className="text-sm font-semibold bg-white text-slate-900 px-5 py-2.5 rounded-full transition-all hover:bg-white/90"
                >
                  Open app
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    Start free trial
                  </Link>
                </>
              )}
              <Link
                href="/"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-full px-2 py-0.5"
              >
                JP
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 pt-20 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Production-grade portfolio build (billing, RBAC, audit logs)</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
              Turn scattered PDFs into
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                searchable knowledge
              </span>
              <br />
              your team can use
            </h1>

            <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Upload PDFs/Docs, get AI summaries & tags, and find anything instantly — with real guardrails:
              server-side RBAC/RLS, scoped mutations, audit logs, expiring share links, and rate-limited exports.
            </p>

            <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto">
              Built with Next.js + Supabase + Stripe + Sentry. Focused on “production details”, not just UI.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                <span>Start 14-day free trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/en/pricing"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
              >
                <span>See pricing</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500">docuflow</span>
                </div>
              </div>
              <Image
                src="/screenshots/dashboard.png"
                alt="DocuFlow dashboard"
                width={1400}
                height={900}
                className="w-full"
                priority
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 mb-4">
                <span>How it works</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                From upload to answers — in 3 steps
              </h2>
              <p className="mt-3 text-slate-400">
                A simple workflow designed for teams: ingest, enrich, and search — with guardrails.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Upload & organize",
                  body: "Drop PDFs/Docs. Storage limits are enforced by actual content size to prevent silent overages.",
                },
                {
                  step: "2",
                  title: "AI summarize & tag",
                  body: "Generate summaries and metadata with quota enforcement on every AI feature — no bypass paths.",
                },
                {
                  step: "3",
                  title: "Search & share safely",
                  body: "Find docs instantly, share with expiring links, and audit critical actions (org ops, sharing, billing).",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white">
                      {s.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-slate-400">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/en/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                See pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20" id="value">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "AI features with quota enforcement",
                body: "Every AI-related feature consumes quota server-side — no client-side bypasses, consistent usage tracking.",
              },
              {
                title: "Org RBAC done right",
                body: "Owner/Admin/Member permissions enforced in server actions, aligned with database RLS for long-term safety.",
              },
              {
                title: "Security & observability",
                body: "Expiring share links (plan-based), token rotation, critical actions logged to audit trail + Sentry tags for alerts.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"
              >
                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-slate-400">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24" id="pricing">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 mb-4">
              <BarChart3 className="h-4 w-4" />
              <span>Simple pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
            <p className="mt-3 text-slate-400">
              Prices are fetched from Stripe when available (best-effort).
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-slate-300 mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Up to 50 documents", "100MB storage", "100 AI summaries / month"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Start for free
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-slate-900/50 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-xs font-semibold text-white">
                Most popular
              </div>
              <div className="text-sm font-medium text-emerald-300 mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{lpPrices.pro?.label ?? "$19"}</span>
                <span className="text-slate-500">{lpPrices.pro?.recurringLabel ?? "/month"}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["1,000 documents", "5GB storage", "5,000 AI summaries / month"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=pro"
                className="block text-center py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all"
              >
                Start free trial
              </Link>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-sky-300 mb-2">Team</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{lpPrices.team?.label ?? "$49"}</span>
                <span className="text-slate-500">{lpPrices.team?.recurringLabel ?? "/month"}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["10,000 documents", "50GB storage", "50,000 AI summaries / month", "Up to 10 seats"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=team"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Start free trial
              </Link>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-violet-300 mb-2">Enterprise</div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold">Contact us</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unlimited docs", "Unlimited storage", "Unlimited AI usage", "SSO / SLA"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@docuflow.io"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Email sales
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-slate-900/50 py-20" id="trust">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 mb-6">
              <Shield className="h-4 w-4" />
              <span>Security-first</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Built with guardrails</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Tight scopes everywhere: user_id-scoped mutations and fetches, org RBAC for management actions,
              rate-limited heavy APIs (export), and an audit log for critical operations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/en/support"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Support
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-10">
          <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} DocuFlow</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/en/pricing" className="text-slate-500 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/en/terms" className="text-slate-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/en/privacy" className="text-slate-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/en/support" className="text-slate-500 hover:text-white transition-colors">
                Support
              </Link>
              <Link href="/en/company" className="text-slate-500 hover:text-white transition-colors">
                Company
              </Link>
              <Link href="/en/legal-notice" className="text-slate-500 hover:text-white transition-colors">
                Legal
              </Link>
              <Link href="/" className="text-slate-500 hover:text-white transition-colors">
                Japanese
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
