"use client";

import Link from "next/link";
import { useCallback } from "react";

type Props = {
  href: string;
  locale: "ja" | "en";
  className?: string;
  children: React.ReactNode;
};

const COOKIE_KEY = "docuflow_lang";
const STORAGE_KEY = "docuflow_lang";

function persistLocale(locale: "ja" | "en") {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function MarketingLocaleLink({
  href,
  locale,
  className,
  children,
}: Props) {
  const onClick = useCallback(() => {
    try {
      persistLocale(locale);
    } catch {
      // ignore
    }
  }, [locale]);

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}



