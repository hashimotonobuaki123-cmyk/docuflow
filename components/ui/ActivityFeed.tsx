"use client";

import {
  FileText,
  Pencil,
  Trash2,
  Pin,
  Star,
  Link as LinkIcon,
  Archive,
  RotateCcw,
} from "lucide-react";
import { useLocale } from "@/lib/useLocale";

interface ActivityItem {
  id: string;
  action: string;
  documentId?: string | null;
  documentTitle?: string | null;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

function getActivityIcon(action: string) {
  switch (action) {
    case "create_document":
      return <FileText className="h-4 w-4" />;
    case "update_document":
      return <Pencil className="h-4 w-4" />;
    case "delete_document":
      return <Trash2 className="h-4 w-4" />;
    case "toggle_pinned":
      return <Pin className="h-4 w-4" />;
    case "toggle_favorite":
      return <Star className="h-4 w-4" />;
    case "enable_share":
    case "disable_share":
      return <LinkIcon className="h-4 w-4" />;
    case "archive_document":
      return <Archive className="h-4 w-4" />;
    case "restore_document":
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getActivityColor(action: string) {
  switch (action) {
    case "create_document":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "update_document":
      return "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400";
    case "delete_document":
      return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
    case "toggle_pinned":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    case "toggle_favorite":
      return "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400";
    case "enable_share":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "disable_share":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    case "archive_document":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    case "restore_document":
      return "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function formatRelativeTime(dateStr: string, locale: "ja" | "en"): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === "en") {
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function ActivityFeed({ activities, className = "" }: ActivityFeedProps) {
  const locale = useLocale();
  const describeActivity = (action: string): string => {
    const ja: Record<string, string> = {
      create_document: "ドキュメントを作成",
      update_document: "ドキュメントを更新",
      delete_document: "ドキュメントを削除",
      toggle_pinned: "ピン留めを変更",
      toggle_favorite: "お気に入りを変更",
      enable_share: "共有を有効化",
      disable_share: "共有を無効化",
      archive_document: "アーカイブに移動",
      restore_document: "アーカイブから復元",
    };
    const en: Record<string, string> = {
      create_document: "Created a document",
      update_document: "Updated a document",
      delete_document: "Deleted a document",
      toggle_pinned: "Changed pin",
      toggle_favorite: "Changed favorite",
      enable_share: "Enabled sharing",
      disable_share: "Disabled sharing",
      archive_document: "Archived a document",
      restore_document: "Restored a document",
    };
    return (locale === "en" ? en[action] : ja[action]) ?? action;
  };

  if (activities.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {locale === "en"
            ? "No activity yet. Create your first document to get started."
            : "まだアクティビティがありません。最初のドキュメントを作成してみましょう。"}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${getActivityColor(activity.action)}`}>
              {getActivityIcon(activity.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {describeActivity(activity.action)}
              </p>
              {activity.documentTitle && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 truncate">
                  {activity.documentTitle}
                </p>
              )}
            </div>

            {/* Time */}
            <time className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
              {formatRelativeTime(activity.createdAt, locale)}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
