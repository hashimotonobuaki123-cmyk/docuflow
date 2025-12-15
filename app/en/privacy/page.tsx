import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Privacy Policy | DocuFlow",
  description: "DocuFlow Privacy Policy (template).",
  alternates: { canonical: "/en/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Privacy Policy"
      description="Template policy for portfolio/demo use. Replace with your real policy before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Portfolio template (not legal advice)</p>
        <p className="mt-2 text-sm">
          This page is a placeholder. Replace with your actual policy (data categories, processors, transfers, contact).
        </p>
      </div>

      <h2>1. Data We Collect</h2>
      <ul>
        <li>Account information (e.g., email)</li>
        <li>Usage data (logs, device info, analytics)</li>
        <li>User content you upload or create in the Service</li>
      </ul>

      <h2>2. How We Use Data</h2>
      <ul>
        <li>Provide and secure the Service</li>
        <li>Prevent abuse and enforce limits</li>
        <li>Improve features and support</li>
        <li>Billing and payments</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>We do not sell personal data. We may share with service providers as needed to run the Service.</p>

      <h2>4. Security</h2>
      <p>We use access controls, logging, and other safeguards appropriate to the Service.</p>

      <h2>5. Contact</h2>
      <p>
        Contact: <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
      </p>

      <p className="text-sm text-slate-400">Last updated: 2025-12-16</p>
    </MarketingSimpleLayoutEn>
  );
}

import type { Metadata } from "next";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Privacy Policy | DocuFlow",
  description: "DocuFlow Privacy Policy (template).",
  alternates: { canonical: "/en/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Privacy Policy"
      description="Template privacy policy for portfolio/demo purposes. Replace with your real policy before production use."
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-slate-200">
        <p className="text-sm font-semibold">Template only (not legal advice)</p>
        <p className="mt-2 text-sm">
          This is a placeholder policy for a portfolio demo. Do not use as-is in production.
        </p>
      </div>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account information (e.g., email address)</li>
        <li>Usage data (logs, device/browser info)</li>
        <li>Content you upload or input (documents, comments)</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To provide and operate the Service</li>
        <li>To secure the Service and prevent abuse</li>
        <li>To improve features and provide support</li>
        <li>To process billing and payments (when applicable)</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We do not sell personal information. We may share information with service providers as needed to operate the Service, subject to appropriate safeguards.
      </p>

      <h2>4. Security</h2>
      <p>
        We use reasonable security measures such as access controls and encryption where appropriate.
      </p>

      <h2>5. Contact</h2>
      <p>
        For inquiries, email <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>.
      </p>

      <p className="text-sm text-slate-400">Last updated: 2025-12-16</p>
    </MarketingSimpleLayoutEn>
  );
}


