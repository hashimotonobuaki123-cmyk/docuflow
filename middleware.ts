import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/app", "/new", "/documents", "/settings"];
const AUTH_COOKIE = "docuhub_ai_auth";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/app") ||
    pathname.startsWith("/new") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/settings")
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";

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
  matcher: ["/app/:path*", "/new", "/documents/:path*", "/settings", "/auth/:path*"],
};

