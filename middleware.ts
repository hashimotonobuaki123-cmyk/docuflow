import { NextRequest, NextResponse } from "next/server";

export const PROTECTED_PATHS = ["/app", "/new", "/documents", "/settings"];
export const AUTH_COOKIE = "docuhub_ai_auth";
export const LOCALE_COOKIE = "docuflow_lang";

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";
  const localeCookie = req.cookies.get(LOCALE_COOKIE)?.value ?? null;

  // Marketing locale routing:
  // - Cookie wins (explicit user choice)
  // - Otherwise, default to EN unless the browser prefers Japanese
  if (pathname === "/" || pathname === "/en") {
    const acceptLang = req.headers.get("accept-language") ?? "";
    const firstLang = acceptLang.split(",")[0]?.trim().toLowerCase() ?? "";
    const prefersJapanese = firstLang.startsWith("ja");

    // Cookie override
    if (pathname === "/" && localeCookie === "en") {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, "en", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
    if (pathname === "/en" && localeCookie === "ja") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, "ja", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }

    // Default routing (no cookie)
    if (pathname === "/" && !localeCookie && !prefersJapanese) {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, "en", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
  }

  // 未ログインユーザーを保護ページからログイン画面へ
  if (!isAuthed && isProtectedPath(pathname)) {
    const redirectUrl = new URL("/auth/login", req.url);
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      redirectUrl.searchParams.set("redirectTo", pathname + search);
    }
    return NextResponse.redirect(redirectUrl);
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
