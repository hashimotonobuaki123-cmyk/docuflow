"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  PLAN_NAMES,
  PLAN_DESCRIPTIONS,
  PLAN_PRICES,
  PLAN_LIMITS,
  type SubscriptionPlan,
} from "@/lib/subscription";

interface SubscriptionPlansProps {
  currentPlan: SubscriptionPlan;
  subscriptionType: "personal" | "organization";
  locale: Locale;
  stripeConfigured: boolean;
}

export function SubscriptionPlans({
  currentPlan,
  subscriptionType,
  locale,
  stripeConfigured,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan || plan === "free") {
      return;
    }

    setLoading(plan);

    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          type: subscriptionType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "チェックアウトセッションの作成に失敗しました",
        );
        setLoading(null);
      }
    } catch (error) {
      console.error("Failed to upgrade:", error);
      alert(
        "エラーが発生しました",
      );
      setLoading(null);
    }
  };

  const plans: SubscriptionPlan[] = ["free", "pro", "team", "enterprise"];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const limits = PLAN_LIMITS[plan];
        const isCurrent = plan === currentPlan;
        const isEnterprise = plan === "enterprise";

        return (
          <div
            key={plan}
            className={`rounded-xl border-2 p-5 ${
              isCurrent
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {PLAN_NAMES[plan][locale]}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {PLAN_DESCRIPTIONS[plan][locale]}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {PLAN_PRICES[plan] === 0
                    ? "無料"
                    : `$${PLAN_PRICES[plan]}`}
                </span>
                {PLAN_PRICES[plan] > 0 && (
                  <span className="text-xs text-slate-500">
                    {"/月"}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {limits.documentLimit === null
                    ? "ドキュメント数無制限"
                    : `${limits.documentLimit} ${"ドキュメント"}`}
                </span>
              </div>
              {subscriptionType === "organization" && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {limits.seatLimit === null
                      ? "メンバー数無制限"
                      : `${limits.seatLimit} ${"メンバー"}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {limits.monthlyAICalls === null
                    ? "AI呼び出し無制限"
                    : `${limits.monthlyAICalls.toLocaleString()} ${"AI呼び出し/月"}`}
                </span>
              </div>
              {limits.versionHistory && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {"バージョン履歴"}
                  </span>
                </div>
              )}
              {limits.prioritySupport && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {"優先サポート"}
                  </span>
                </div>
              )}
            </div>

            {isCurrent ? (
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
                {"現在のプラン"}
              </div>
            ) : isEnterprise ? (
              <a
                href="mailto:sales@docuflow.com"
                className="block rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white hover:bg-slate-800"
              >
                {"営業に問い合わせ"}
              </a>
            ) : (
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={!stripeConfigured || loading === plan}
                className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading === plan
                  ? "読み込み中..."
                  : "アップグレード"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

