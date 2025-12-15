"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const STORAGE_KEY = "docuflow_lang";
const COOKIE_KEY = "docuflow_lang";

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365; // 1y
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

// For hydration safety
function subscribe(callback: () => void) {
  return () => {
    callback();
  };
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

function shouldShowToggle(pathname: string) {
  // Hide on English marketing site routes and on marketing home pages.
  if (pathname.startsWith("/en")) return false;

  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/new" ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/settings")
  );
}

/**
 * Global language toggle for the app UI.
 * - Switches by updating `?lang=` on the current URL
 * - Persists choice in localStorage + cookie
 */
export function GlobalLanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale: Locale = useLocale();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const visible = useMemo(() => shouldShowToggle(pathname), [pathname]);

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;

    const next: Locale = locale === "en" ? "ja" : "en";

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    try {
      setCookie(COOKIE_KEY, next);
    } catch {
      // ignore
    }

    try {
      const url = new URL(window.location.href);
      if (next === "en") {
        url.searchParams.set("lang", "en");
      } else {
        url.searchParams.delete("lang");
      }
      const nextHref = url.pathname + url.search + url.hash;
      router.replace(nextHref, { scroll: false });
    } finally {
      window.dispatchEvent(new Event("docuflow:locale-change"));
    }
  }, [locale, router]);

  if (!mounted || !visible) return null;

  const label = locale === "en" ? "日本語" : "EN";
  const title =
    locale === "en" ? "Switch to Japanese (ja)" : "Switch to English (en)";

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-label={title}
      className="fixed bottom-4 right-4 z-[120] inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
        {locale.toUpperCase()}
      </span>
      <span>{label}</span>
    </button>
  );
}
