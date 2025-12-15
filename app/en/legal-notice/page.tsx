import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Legal Notice | DocuFlow",
  description: "Legal disclosures (template).",
  alternates: { canonical: "/en/legal-notice" },
  robots: { index: false, follow: false },
};

export default function LegalNoticeEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Legal Notice"
      description="Portfolio template. This is not a substitute for legally required disclosures in your jurisdiction."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Portfolio template (placeholder)</p>
        <p className="mt-2 text-sm">
          If you sell subscriptions, you may need jurisdiction-specific disclosures (e.g., consumer protection, VAT/GST, refunds).
          Replace with the appropriate legal notice for your business.
        </p>
      </div>

      <h2>Operator</h2>
      <p>(Replace with your operator/legal entity)</p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
      </p>

      <h2>Pricing</h2>
      <p>Prices are displayed on the pricing page and in-app at checkout.</p>

      <h2>Refunds / Cancellations</h2>
      <p>(Replace with your real policy.)</p>
    </MarketingSimpleLayoutEn>
  );
}


