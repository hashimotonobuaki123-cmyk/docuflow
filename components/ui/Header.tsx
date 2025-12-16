"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useLocale } from "@/lib/useLocale";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  stats?: {
    total: number;
    pinned: number;
    favorites: number;
    archived: number;
  };
  children?: ReactNode;
  rightContent?: ReactNode;
}

export function Header({
  title,
  subtitle,
  stats,
  children,
  rightContent,
}: HeaderProps) {
  const locale = useLocale();
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* Stats Pills - Desktop */}
        {stats && (
          <div className="hidden lg:flex items-center gap-2">
            <Badge variant="default" size="sm">
              {locale === "en" ? `Total ${stats.total}` : `合計 ${stats.total}`}
            </Badge>
            <Badge variant="primary" size="sm" dot>
              📌 {stats.pinned}
            </Badge>
            <Badge variant="warning" size="sm" dot>
              ⭐ {stats.favorites}
            </Badge>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={locale === "en" ? "Search" : "検索"}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* What's New */}
          <Link
            href={withLang("/app/whats-new")}
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{locale === "en" ? "What's new" : "新着情報"}</span>
          </Link>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={locale === "en" ? "Notifications" : "通知"}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          </Button>

          {/* Custom Right Content (User Menu, etc.) */}
          {rightContent}
        </div>
      </div>
    </header>
  );
}

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-slate-100 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
