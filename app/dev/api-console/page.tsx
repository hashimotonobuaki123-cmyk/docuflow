"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

type HttpMethod = "LIST" | "GET";

export default function ApiConsolePage() {
  const [baseUrl, setBaseUrl] = useState("https://docuflow-azure.vercel.app");
  const [apiKey, setApiKey] = useState("");
  const [method, setMethod] = useState<HttpMethod>("LIST");
  const [documentId, setDocumentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);

  const handleSend = async () => {
    setIsLoading(true);
    setResponseText(null);
    try {
      const url =
        method === "LIST"
          ? `${baseUrl}/api/documents`
          : `${baseUrl}/api/documents/${documentId.trim()}`;

      const res = await fetch(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const text = await res.text();
      setResponseText(
        `Status: ${res.status}\n\n${(() => {
          try {
            return JSON.stringify(JSON.parse(text), null, 2);
          } catch {
            return text;
          }
        })()}`,
      );
    } catch (error) {
      setResponseText(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">API Console (Developer Preview)</p>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← トップに戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="mb-2 text-sm font-semibold text-slate-900">
            DocuFlow API Playground
          </h1>
          <p className="text-xs text-slate-600">
            `X-API-Key` を使って、ブラウザから直接 `/api/documents` エンドポイントを試せる簡易
            コンソールです。
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-700">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Base URL
              </label>
              <input
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                X-API-Key
              </label>
              <input
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="your-api-key-here"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Operation
              </label>
              <select
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
              >
                <option value="LIST">GET /api/documents</option>
                <option value="GET">GET /api/documents/:id</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Document ID (for GET)
              </label>
              <input
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="optional (LIST の場合は不要)"
                disabled={method === "LIST"}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !apiKey}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Sending..." : "Send Request"}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
          <p className="mb-2 text-[11px] font-semibold text-emerald-300">
            Response
          </p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-[11px]">
            {responseText ?? "// ここにレスポンスが表示されます"}
          </pre>
        </section>
      </main>
    </div>
  );
}


