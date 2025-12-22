"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

interface InvoicesSectionProps {
  subscriptionType: "personal" | "organization";
  locale: Locale;
}

export function InvoicesSection({
  subscriptionType,
  locale,
}: InvoicesSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `/api/billing/invoices?type=${subscriptionType}&limit=12`,
      );
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(
      "ja-JP",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      paid: {
        label: "支払済み",
        class: "bg-emerald-100 text-emerald-800",
      },
      open: {
        label: "未払い",
        class: "bg-amber-100 text-amber-800",
      },
      void: {
        label: "無効",
        class: "bg-slate-100 text-slate-800",
      },
      uncollectible: {
        label: "回収不能",
        class: "bg-red-100 text-red-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      class: "bg-slate-100 text-slate-800",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.class}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        {"請求履歴"}
      </h3>

      {invoices.length === 0 ? (
        <p className="text-sm text-slate-600">
          {"請求書はまだありません。"}
        </p>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {formatAmount(invoice.amount_paid, invoice.currency)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatDate(invoice.created)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    title={"PDFをダウンロード"}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    title={"請求書を表示"}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

