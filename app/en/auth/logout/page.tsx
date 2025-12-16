"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutEnPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = "docuhub_ai_auth=; path=/; max-age=0";
    document.cookie = "docuhub_ai_user_id=; path=/; max-age=0";
    router.replace("/en/auth/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">Logging out…</p>
    </div>
  );
}


