"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Pin,
  Star,
  Trash2,
  Archive,
  RotateCcw,
  MoreHorizontal,
  ExternalLink,
  Share2,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface DocumentCardProps {
  id: string;
  title: string;
  category?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  createdAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived?: boolean;
  isShared?: boolean;
  commentCount?: number;
  charCount?: number;
  onTogglePin?: (id: string, next: boolean) => void;
  onToggleFavorite?: (id: string, next: boolean) => void;
  onDelete?: (id: string) => void;
  onToggleArchive?: (id: string, next: boolean) => void;
}

// Category badge color mapping
function getCategoryStyle(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("仕様") || cat.includes("spec")) return "info";
  if (cat.includes("議事") || cat.includes("mtg") || cat.includes("meeting")) return "warning";
  if (cat.includes("企画") || cat.includes("計画") || cat.includes("plan")) return "primary";
  if (cat.includes("提案") || cat.includes("レポート") || cat.includes("report")) return "success";
  return "default";
}

export function DocumentCard({
  id,
  title,
  category,
  summary,
  tags,
  createdAt,
  isPinned,
  isFavorite,
  isArchived = false,
  isShared = false,
  commentCount = 0,
  charCount = 0,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onToggleArchive,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };

  return (
    <article
      data-doc-card
      className={`
        group relative flex flex-col rounded-xl border p-5 
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        ${isArchived
          ? "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
          : "bg-white border-slate-200 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-700"
        }
      `}
    >
      {/* Status Indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isPinned && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/30">
            <Pin className="h-3.5 w-3.5" />
          </span>
        )}
        {isFavorite && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-500 dark:bg-rose-900/30">
            <Star className="h-3.5 w-3.5 fill-current" />
          </span>
        )}
        {isShared && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
            <Share2 className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Header */}
      <div className="mb-3 pr-20">
        <Link
          href={`/documents/${id}`}
          className="block group/title"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors">
            {title}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {category && (
            <Badge variant={getCategoryStyle(category) as "default" | "primary" | "success" | "warning" | "danger" | "info"} size="sm">
              {category}
            </Badge>
          )}
          {isArchived && (
            <Badge variant="default" size="sm">
              <Archive className="h-3 w-3 mr-1" />
              アーカイブ
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {summary}
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <Link
              key={tag}
              href={`/app?q=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {tags.length > 4 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {charCount.toLocaleString()}
            </span>
            {commentCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {commentCount}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onTogglePin?.(id, !isPinned)}
              aria-label={isPinned ? "ピン解除" : "ピン留め"}
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? "text-amber-600" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleFavorite?.(id, !isFavorite)}
              aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
            >
              <Star className={`h-3.5 w-3.5 ${isFavorite ? "text-rose-500 fill-current" : ""}`} />
            </Button>
            
            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="その他の操作"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 bottom-full mb-1 z-50 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <Link
                      href={`/documents/${id}`}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      開く
                    </Link>
                    <button
                      onClick={() => { onToggleArchive?.(id, !isArchived); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      {isArchived ? "復元" : "アーカイブ"}
                    </button>
                    <button
                      onClick={() => { onDelete?.(id); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
