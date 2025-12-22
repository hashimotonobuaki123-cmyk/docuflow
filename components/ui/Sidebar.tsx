"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FileText,
  FolderArchive,
  Plus,
  Settings,
  BarChart3,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
}

function NavItem({ href, icon, label, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-150 ease-out
        ${active
          ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        }
      `}
    >
      <span className={`shrink-0 ${active ? "text-white dark:text-slate-900" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className={`
          text-[10px] font-semibold px-1.5 py-0.5 rounded-md
          ${active 
            ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" 
            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          }
        `}>
          {badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  stats?: {
    total: number;
    archived: number;
  };
}

export function Sidebar({ stats }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isArchived = searchParams.get("archived") === "1";

  const navItems = [
    {
      href: "/app",
      icon: <FileText className="h-4 w-4" />,
      label: "ドキュメント",
      active: pathname === "/app" && !isArchived,
      badge: stats?.total,
    },
    {
      href: "/app?archived=1",
      icon: <FolderArchive className="h-4 w-4" />,
      label: "アーカイブ",
      active: isArchived,
      badge: stats?.archived,
    },
    {
      href: "/new",
      icon: <Plus className="h-4 w-4" />,
      label: "新規作成",
      active: pathname === "/new",
    },
  ];

  const bottomNavItems = [
    {
      href: "/app/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      label: "分析",
      active: pathname === "/app/analytics",
    },
    {
      href: "/app/vitals",
      icon: <Activity className="h-4 w-4" />,
      label: "Web Vitals",
      active: pathname === "/app/vitals",
    },
    {
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "設定",
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800">
        <Logo size="sm" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="mb-2">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ワークスペース
          </p>
        </div>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* AI Features Section */}
        <div className="mt-6 mb-2">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            AI機能
          </p>
        </div>
        <div className="px-3 py-3 mx-1 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-violet-900 dark:text-violet-300">
              AI要約
            </span>
          </div>
          <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
            GPT-4で要約・タイトル・タグを自動生成
          </p>
          <Link 
            href="/new"
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-violet-700 dark:text-violet-400 hover:text-violet-900 dark:hover:text-violet-300"
          >
            試してみる
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      {/* Footer Tip */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          ヒント: ⌘K でコマンドパレットを開く
        </p>
      </div>
    </aside>
  );
}
