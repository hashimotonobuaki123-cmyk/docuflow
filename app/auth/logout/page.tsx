 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 認証用クッキーを削除
    document.cookie = "docuhub_ai_auth=; path=/; max-age=0";
    document.cookie = "docuhub_ai_user_id=; path=/; max-age=0";
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">DocuFlow からログアウトしています...</p>
    </div>
  );
}


