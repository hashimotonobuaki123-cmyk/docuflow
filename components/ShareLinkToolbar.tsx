"use client";

import { useCallback, useMemo, useState } from "react";

type Props = {
  url: string;
  locale: "ja" | "en";
  className?: string;
};

export function ShareLinkToolbar({ url, locale, className }: Props) {
  const [copied, setCopied] = useState(false);

  const labels = useMemo(() => {
    if (locale === "en") {
      return {
        copy: "Copy",
        open: "Open",
        copied: "Copied",
        ariaCopy: "Copy share link",
      };
    }
    return {
      copy: "コピー",
      open: "開く",
      copied: "コピーしました",
      ariaCopy: "共有リンクをコピー",
    };
  }, [locale]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      } catch {
        // ignore
      }
    }
  }, [url]);

  return (
    <div className={className ?? ""}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          aria-label={labels.ariaCopy}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          {copied ? labels.copied : labels.copy}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          {labels.open}
        </a>
      </div>
    </div>
  );
}


