"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<string>("U");

  useEffect(() => {
    let active = true;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!active) return;
      const email = data.user?.email ?? "";
      if (email) {
        setInitial(email.charAt(0).toUpperCase());
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-sm hover:opacity-90"
        aria-label="ユーザーメニュー"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-2 text-sm text-slate-800 shadow-lg">
          <div className="px-3 pb-2 text-[11px] text-slate-500">アカウント</div>
          <Link
            href="/settings"
            className="block px-3 py-1.5 text-[13px] hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            設定を開く
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              window.location.href = "/auth/logout";
            }}
          >
            <span>ログアウト</span>
          </button>
        </div>
      )}
    </div>
  );
}
