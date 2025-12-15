import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSimpleLayoutEn } from "@/components/MarketingSimpleLayoutEn";

export const metadata: Metadata = {
  title: "Support | DocuFlow",
  description: "DocuFlow support and contact.",
  alternates: { canonical: "/en/support" },
  robots: { index: false, follow: false },
};

export default function SupportEnPage() {
  return (
    <MarketingSimpleLayoutEn
      title="Support"
      description="Need help? Contact us or check common questions."
    >
      <h2>Contact</h2>
      <ul>
        <li>
          Support: <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
        </li>
        <li>
          Sales: <a href="mailto:sales@docuflow.io">sales@docuflow.io</a>
        </li>
      </ul>

      <h2>Common questions</h2>
      <h3>Do I need a credit card for the free trial?</h3>
      <p>No. You can start the trial without a credit card.</p>

      <h3>How do I cancel?</h3>
      <p>
        Go to Settings → Billing in the app. You’ll need to{" "}
        <Link href="/en/auth/login">log in</Link>.
      </p>

      <h2>Legal</h2>
      <ul>
        <li>
          <Link href="/en/terms">Terms of Service</Link>
        </li>
        <li>
          <Link href="/en/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/en/legal-notice">Legal notice</Link>
        </li>
      </ul>
    </MarketingSimpleLayoutEn>
  );
}


