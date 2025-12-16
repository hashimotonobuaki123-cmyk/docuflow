"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

function setLangCookieEn() {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `docuflow_lang=en; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function AuthCallbackEnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "";

  useEffect(() => {
    let active = true;

    async function syncSession() {
      try {
        const { data, error } = await supabaseBrowser.auth.getUser();
        if (!active) return;

        if (error || !data.user) {
          console.error("Failed to fetch user after OAuth callback:", error);
          router.replace("/en/auth/login?error=oauth_callback");
          return;
        }

        const userId = data.user.id;

        document.cookie = "docuhub_ai_auth=1; path=/;";
        document.cookie = `docuhub_ai_user_id=${userId}; path=/;`;
        setLangCookieEn();

        const finalRedirect = redirectTo || "/app?lang=en";
        router.replace(finalRedirect);
      } catch (e) {
        console.error("Unexpected error in OAuth callback:", e);
        router.replace("/en/auth/login?error=oauth_callback");
      }
    }

    syncSession();

    return () => {
      active = false;
    };
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-violet-500 text-2xl font-bold text-white shadow-xl animate-pulse">
          DF
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Signing in with Google…
        </p>
      </div>
    </div>
  );
}


