import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Terms of Service | DocuFlow",
  description: "DocuFlow Terms of Service (template).",
  alternates: { canonical: "/en/terms" },
  robots: { index: false, follow: false },
};

export default function TermsEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Terms of Service"
      description="Template terms for portfolio/demo use. Replace with real terms before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Portfolio template (not legal advice)</p>
        <p className="mt-2 text-sm">
          This page is a placeholder. Do not rely on it for real-world sales. Replace with your
          actual terms before launching.
        </p>
      </div>

      <h2>1. Scope</h2>
      <p>These Terms govern your use of DocuFlow (the “Service”).</p>

      <h2>2. Accounts</h2>
      <p>You are responsible for safeguarding your account and all activity under it.</p>

      <h2>3. Subscription & Billing</h2>
      <p>
        Pricing, billing cycles, and plan limits are displayed in the Service and may change from time to time.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>No unauthorized access, abuse, or security testing without permission.</li>
        <li>No infringement of third-party rights.</li>
        <li>No excessive load or automated scraping that disrupts the Service.</li>
      </ul>

      <h2>5. Content</h2>
      <p>
        You retain ownership of the content you upload. You grant the Service permission to process your content
        to provide features (e.g., indexing, search, AI summaries), subject to the Privacy Policy.
      </p>

      <h2>6. Disclaimer</h2>
      <p>The Service is provided “as is” without warranties of any kind.</p>

      <h2>7. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, the provider is not liable for indirect or consequential damages.</p>

      <h2>8. Governing Law</h2>
      <p>Replace with your governing law and jurisdiction.</p>

      <p className="text-sm text-slate-400">Last updated: 2025-12-16</p>
    </MarketingSimpleLayoutEn>
  );
}

import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Terms of Service | DocuFlow",
  description: "DocuFlow Terms of Service (template).",
  alternates: { canonical: "/en/terms" },
  // This repo is used as a portfolio; keep template legal pages out of indexing until finalized.
  robots: { index: false, follow: false },
};

export default function TermsEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Terms of Service"
      description="Template terms for portfolio/demo purposes. Replace with your real legal terms before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Template only (not legal advice)</p>
        <p className="mt-2 text-sm">
          These terms are a placeholder for a portfolio demo. Do not use as-is in production.
        </p>
      </div>

      <h2>1. Scope</h2>
      <p>
        These Terms govern your use of the DocuFlow service (the “Service”).
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
      </p>

      <h2>3. Fees</h2>
      <p>
        Paid plans, billing cycles, and payment methods are described in the Service UI and/or pricing pages and may be updated from time to time.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>Do not attempt unauthorized access, abuse, or overload the Service.</li>
        <li>Do not violate laws or third-party rights.</li>
        <li>Do not impersonate others or provide false information.</li>
      </ul>

      <h2>5. Content</h2>
      <p>
        You retain ownership of the content you upload. You grant the Service a limited license to process your content to provide the Service.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        The Service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we disclaim all implied warranties.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we will not be liable for indirect, incidental, special, consequential, or punitive damages.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate access to the Service if you violate these Terms or if required to protect the Service.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        Governing law and venue should be specified here based on your business location.
      </p>

      <p className="text-sm text-slate-400">Last updated: 2025-12-16</p>
    </MarketingSimpleLayoutEn>
  );
}


