"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;

    async function syncSession() {
      try {
        const { data, error } = await supabaseBrowser.auth.getUser();
        if (!active) return;

        if (error || !data.user) {
          console.error("Failed to fetch user after OAuth callback:", error);
          router.replace("/auth/login?error=oauth_callback");
          return;
        }

        const userId = data.user.id;

        // アプリ独自の認証クッキーを設定（middleware 用）
        document.cookie = "docuhub_ai_auth=1; path=/;";
        document.cookie = `docuhub_ai_user_id=${userId}; path=/;`;

        const redirectTo = searchParams.get("redirectTo") || "/app";
        router.replace(redirectTo);
      } catch (e) {
        console.error("Unexpected error in OAuth callback:", e);
        router.replace("/auth/login?error=oauth_callback");
      }
    }

    syncSession();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-violet-500 text-2xl font-bold text-white shadow-xl animate-pulse">
          DF
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Google でログインしています…
        </p>
      </div>
    </div>
  );
}




