import { NextRequest, NextResponse } from "next/server";

export const PROTECTED_PATHS = ["/app", "/new", "/documents", "/settings"];
export const AUTH_COOKIE = "docuhub_ai_auth";
export const LOCALE_COOKIE = "docuflow_lang";

export function inferPreferredLocale(
  localeCookie: string | null,
  acceptLanguage: string | null,
): "ja" | "en" {
  const c = (localeCookie ?? "").toLowerCase();
  if (c === "ja" || c === "en") return c;

  const acceptLang = (acceptLanguage ?? "").toLowerCase();
  const firstLang = acceptLang.split(",")[0]?.trim() ?? "";
  return firstLang.startsWith("ja") ? "ja" : "en";
}

function setLocaleCookie(res: NextResponse, locale: "ja" | "en") {
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function withLangParam(url: URL, locale: "ja" | "en"): URL {
  const u = new URL(url.toString());
  if (!u.searchParams.has("lang")) u.searchParams.set("lang", locale);
  return u;
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";
  const localeCookie = req.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const preferredLocale = inferPreferredLocale(
    localeCookie,
    req.headers.get("accept-language"),
  );

  // Marketing locale routing:
  // - Cookie wins (explicit user choice)
  // - Otherwise, default to EN unless the browser prefers Japanese
  if (pathname === "/" || pathname === "/en") {
    const prefersJapanese = preferredLocale === "ja";

    // Cookie override
    if (pathname === "/" && localeCookie === "en") {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      setLocaleCookie(res, "en");
      return res;
    }
    if (pathname === "/en" && localeCookie === "ja") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      setLocaleCookie(res, "ja");
      return res;
    }

    // Default routing (no cookie)
    if (pathname === "/" && !localeCookie && !prefersJapanese) {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      setLocaleCookie(res, "en");
      return res;
    }
  }

  // Auth pages: prefer /en/auth/* for EN users, and keep cookie choice consistent.
  if (pathname === "/auth/login" && preferredLocale === "en") {
    const url = req.nextUrl.clone();
    url.pathname = "/en/auth/login";
    const res = NextResponse.redirect(url);
    if (localeCookie !== "en") setLocaleCookie(res, "en");
    return res;
  }
  if (pathname === "/auth/signup" && preferredLocale === "en") {
    const url = req.nextUrl.clone();
    url.pathname = "/en/auth/signup";
    const res = NextResponse.redirect(url);
    if (localeCookie !== "en") setLocaleCookie(res, "en");
    return res;
  }
  if (pathname === "/en/auth/login" && localeCookie === "ja") {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    const res = NextResponse.redirect(url);
    setLocaleCookie(res, "ja");
    return res;
  }
  if (pathname === "/en/auth/signup" && localeCookie === "ja") {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signup";
    const res = NextResponse.redirect(url);
    setLocaleCookie(res, "ja");
    return res;
  }

  // App pages: if EN is preferred and ?lang is missing, attach ?lang=en so SSR matches.
  if (
    isAuthed &&
    preferredLocale === "en" &&
    isProtectedPath(pathname) &&
    !req.nextUrl.searchParams.has("lang")
  ) {
    const u = withLangParam(new URL(req.url), "en");
    const res = NextResponse.redirect(u);
    if (localeCookie !== "en") setLocaleCookie(res, "en");
    return res;
  }

  // 未ログインユーザーを保護ページからログイン画面へ
  if (!isAuthed && isProtectedPath(pathname)) {
    const loginPath = preferredLocale === "en" ? "/en/auth/login" : "/auth/login";
    const redirectUrl = new URL(loginPath, req.url);
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      const target =
        preferredLocale === "en" && !req.nextUrl.searchParams.has("lang")
          ? withLangParam(new URL(req.url), "en").pathname +
            withLangParam(new URL(req.url), "en").search
          : pathname + search;
      redirectUrl.searchParams.set("redirectTo", target);
    }
    const res = NextResponse.redirect(redirectUrl);
    if (preferredLocale === "en" && localeCookie !== "en") setLocaleCookie(res, "en");
    return res;
  }

  // ログイン済みなら、ログイン以外の認証系ページからトップへ戻す
  // ただし /auth/logout だけはログアウト用に許可する
  if (
    isAuthed &&
    pathname.startsWith("/auth") &&
    pathname !== "/auth/login" &&
    pathname !== "/auth/logout"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/en",
    "/app/:path*",
    "/new",
    "/documents/:path*",
    "/settings",
    "/auth/:path*",
  ],
};
