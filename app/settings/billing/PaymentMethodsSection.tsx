"use client";

import { useState, useEffect } from "react";
import { CreditCard, Trash2, Plus } from "lucide-react";
import { StripeProvider } from "@/components/StripeProvider";
import { StripeCardElement } from "@/components/StripeCardElement";
import type { Locale } from "@/lib/i18n";

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface PaymentMethodsSectionProps {
  subscriptionType: "personal" | "organization";
  locale: Locale;
}

export function PaymentMethodsSection({
  subscriptionType,
  locale,
}: PaymentMethodsSectionProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `/api/billing/payment-methods?type=${subscriptionType}`,
      );
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const response = await fetch("/api/billing/setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: subscriptionType }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
      setShowAddForm(true);
    } catch (err) {
      console.error("Failed to create setup intent:", err);
      setError(
        "支払いフォームの初期化に失敗しました",
      );
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (
      !confirm(
        "この支払い方法を削除してもよろしいですか？",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/billing/payment-methods?paymentMethodId=${paymentMethodId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await fetchPaymentMethods();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete payment method");
      }
    } catch (err) {
      console.error("Failed to delete payment method:", err);
      setError(
        "支払い方法の削除に失敗しました",
      );
    }
  };

  const handleSuccess = async () => {
    setShowAddForm(false);
    setClientSecret(null);
    await fetchPaymentMethods();
  };

  const getCardBrandName = (brand: string) => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      jcb: "JCB",
      diners: "Diners Club",
      unionpay: "UnionPay",
    };
    return brands[brand.toLowerCase()] || brand;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-20 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {"支払い方法"}
        </h3>
        {!showAddForm && (
          <button
            onClick={handleAddPaymentMethod}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-3 w-3" />
            {"追加"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showAddForm && clientSecret ? (
        <div className="mb-4">
          <StripeProvider clientSecret={clientSecret}>
            <StripeCardElement
              clientSecret={clientSecret}
              onSuccess={handleSuccess}
              onError={setError}
              locale={locale}
            />
          </StripeProvider>
          <button
            onClick={() => {
              setShowAddForm(false);
              setClientSecret(null);
            }}
            className="mt-2 text-xs text-slate-600 hover:text-slate-900"
          >
            {"キャンセル"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-slate-600">
              {"支払い方法がまだ追加されていません。"}
            </p>
          ) : (
            paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {getCardBrandName(pm.card.brand)} •••• {pm.card.last4}
                    </p>
                    <p className="text-xs text-slate-600">
                      {"有効期限"}:{" "}
                      {String(pm.card.exp_month).padStart(2, "0")}/
                      {pm.card.exp_year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePaymentMethod(pm.id)}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                  title={"削除"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

