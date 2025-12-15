import type { Metadata } from "next";
import PricingPage from "@/app/pricing/page";

export const metadata: Metadata = {
  title: "Pricing | DocuFlow",
  description: "DocuFlow pricing plans.",
  alternates: { canonical: "/en/pricing" },
};

// For now, reuse pricing implementation (Stripe best-effort).
// Copy can be refined later; this keeps English navigation consistent.
export default PricingPage;


