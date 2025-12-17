"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface SubscriptionLimitWarningProps {
  type: "document" | "member" | "storage" | "ai";
  currentCount: number;
  limit: number;
  locale: Locale;
}

export function SubscriptionLimitWarning({
  type,
  currentCount,
  limit,
  locale,
}: SubscriptionLimitWarningProps) {
  const percentage = (currentCount / limit) * 100;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  const messages = {
    document: {
      en: {
        warning: `You're using ${currentCount} of ${limit} documents. Consider upgrading your plan.`,
        critical: `You've reached ${currentCount} of ${limit} documents. Upgrade to create more.`,
      },
      ja: {
        warning: `ドキュメント数が ${currentCount}/${limit} 件です。プランのアップグレードをご検討ください。`,
        critical: `ドキュメント数が上限（${limit}件）に達しました。追加で作成するにはプランをアップグレードしてください。`,
      },
    },
    member: {
      en: {
        warning: `Your organization has ${currentCount} of ${limit} members. Consider upgrading your plan.`,
        critical: `Your organization has reached the member limit (${limit}). Upgrade to add more members.`,
      },
      ja: {
        warning: `メンバー数が ${currentCount}/${limit} 人です。プランのアップグレードをご検討ください。`,
        critical: `メンバー数が上限（${limit}人）に達しました。追加でメンバーを追加するにはプランをアップグレードしてください。`,
      },
    },
    storage: {
      en: {
        warning: `You're using ${currentCount.toFixed(1)}MB of ${limit}MB storage. Consider upgrading your plan.`,
        critical: `You've reached ${currentCount.toFixed(1)}MB of ${limit}MB storage. Upgrade to use more.`,
      },
      ja: {
        warning: `ストレージ使用量が ${currentCount.toFixed(1)}MB/${limit}MB です。プランのアップグレードをご検討ください。`,
        critical: `ストレージ使用量が上限（${limit}MB）に達しました。追加で使用するにはプランをアップグレードしてください。`,
      },
    },
    ai: {
      en: {
        warning: `You've used ${currentCount.toLocaleString()} of ${limit.toLocaleString()} AI calls this month. Consider upgrading your plan.`,
        critical: `You've reached ${currentCount.toLocaleString()} of ${limit.toLocaleString()} AI calls this month. Upgrade to use more.`,
      },
      ja: {
        warning: `今月のAI呼び出し回数が ${currentCount.toLocaleString()}/${limit.toLocaleString()} 回です。プランのアップグレードをご検討ください。`,
        critical: `今月のAI呼び出し回数が上限（${limit.toLocaleString()}回）に達しました。追加で使用するにはプランをアップグレードしてください。`,
      },
    },
  };

  const message = isCritical
    ? messages[type][locale].critical
    : messages[type][locale].warning;

  if (!isWarning) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-3 ${
        isCritical
          ? "border-red-300 bg-red-50"
          : "border-amber-300 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className={`h-4 w-4 mt-0.5 ${
            isCritical ? "text-red-600" : "text-amber-600"
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-xs font-medium ${
              isCritical ? "text-red-900" : "text-amber-900"
            }`}
          >
            {message}
          </p>
          <div className="mt-2">
            <Link
              href={locale === "en" ? "/settings/billing?lang=en" : "/settings/billing"}
              className={`text-xs font-medium underline ${
                isCritical ? "text-red-700" : "text-amber-700"
              }`}
            >
              {locale === "en" ? "Upgrade plan" : "プランをアップグレード"}
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all ${
            isCritical ? "bg-red-500" : "bg-amber-500"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

