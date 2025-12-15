import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Company | DocuFlow",
  description: "Company information (template).",
  alternates: { canonical: "/en/company" },
  robots: { index: false, follow: false },
};

export default function CompanyEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Company"
      description="Portfolio template. Replace with your real company/operator details before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Portfolio template (placeholder details)</p>
        <p className="mt-2 text-sm">
          Do not publish fake business details. Replace these fields with real information when you launch.
        </p>
      </div>

      <h2>Business name</h2>
      <p>(Replace with your business name / legal entity)</p>

      <h2>Address</h2>
      <p>(Replace with your address or your lawful disclosure policy)</p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
      </p>
    </MarketingSimpleLayoutEn>
  );
}


