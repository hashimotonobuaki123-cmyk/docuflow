"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./i18n";
import { getLocaleFromParam } from "./i18n";

const STORAGE_KEY = "docuflow_lang";
const COOKIE_KEY = "docuflow_lang";

function readCookie(name: string): string | null {
  try {
    const m = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );
    return m ? decodeURIComponent(m[1] ?? "") : null;
  } catch {
    return null;
  }
}

function getLocaleFromWindow(defaultLang?: string): Locale {
  if (typeof window === "undefined") return getLocaleFromParam(defaultLang);

  // URL > persisted preference > default
  try {
    const sp = new URLSearchParams(window.location.search);
    const lang = sp.get("lang");
    if (lang != null) return getLocaleFromParam(lang);
  } catch {
    // ignore
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return getLocaleFromParam(stored);
  } catch {
    // ignore
  }

  const cookie = readCookie(COOKIE_KEY);
  if (cookie) return getLocaleFromParam(cookie);

  return getLocaleFromParam(defaultLang);
}

/**
 * Client-side locale hook based on `?lang=` + persisted preference.
 * - URL param (`?lang=`) is the source of truth when present
 * - Otherwise falls back to localStorage/cookie
 */
export function useLocale(defaultLang?: string): Locale {
  const [locale, setLocale] = useState<Locale>(() =>
    getLocaleFromWindow(defaultLang),
  );

  useEffect(() => {
    const update = () => setLocale(getLocaleFromWindow(defaultLang));

    window.addEventListener("popstate", update);
    window.addEventListener(
      "docuflow:locale-change",
      update as EventListener,
    );
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) update();
    });

    // In case the initial render happened before URL settled
    update();

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener(
        "docuflow:locale-change",
        update as EventListener,
      );
    };
  }, [defaultLang]);

  return locale;
}
