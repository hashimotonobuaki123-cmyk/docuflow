"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import type { Locale } from "@/lib/i18n";

type ProviderLabel = "google" | "email" | "other" | null;

export function AccountInfoCard() {
  const searchParams = useSearchParams();
  const locale: Locale = searchParams.get("lang") ? "en" : "ja";
  
  const [email, setEmail] = useState<string>("");
  const [provider, setProvider] = useState<ProviderLabel>(null);

  useEffect(() => {
    let active = true;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!active) return;
      const userEmail = data.user?.email ?? "";
      const metaProvider =
        (data.user?.app_metadata?.provider as string | undefined) ??
        (data.user?.identities?.[0]?.provider as string | undefined);

      if (userEmail) {
        setEmail(userEmail);
      }

      if (metaProvider === "google") {
        setProvider("google");
      } else if (metaProvider === "email") {
        setProvider("email");
      } else if (metaProvider) {
        setProvider("other");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">
        {locale === "en" ? "Account information" : "アカウント情報"}
      </h2>
      <p className="text-xs text-slate-600">
        {locale === "en"
          ? "View your logged-in user information, including email address and login method."
          : "現在ログイン中のユーザー情報です。メールアドレスとログイン方法を確認できます。"}
      </p>
      <div className="mt-4 space-y-2 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">
            {locale === "en" ? "Email address" : "メールアドレス"}
          </span>
          <span className="font-medium truncate max-w-[220px] text-right">
            {email || (locale === "en" ? "Loading..." : "取得中...")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">
            {locale === "en" ? "Login method" : "ログイン方法"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium ring-1 ring-slate-200">
            {provider === "google" && (
              <>
                <span className="text-xs">G</span>
                <span>{locale === "en" ? "Google login" : "Google ログイン"}</span>
              </>
            )}
            {provider === "email" && (
              <span>{locale === "en" ? "Email" : "メールアドレス"}</span>
            )}
            {provider === "other" && (
              <span>{locale === "en" ? "External provider" : "外部プロバイダ"}</span>
            )}
            {!provider && (
              <span>{locale === "en" ? "Loading..." : "取得中..."}</span>
            )}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        {locale === "en"
          ? "Login method changes (e.g., password reset, 2FA setup) will be available from Security settings soon."
          : "ログイン方法の変更（例: パスワードリセット、2段階認証の追加）は「セキュリティ」設定から順次提供予定です。"}
      </p>
    </section>
  );
}




