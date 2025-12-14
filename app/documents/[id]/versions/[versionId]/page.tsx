import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

// JST 表示用フォーマット（詳細画面と同じロジック）
function formatJstDateTime(value: string | null): string | null {
  if (!value) return null;
  const utc = new Date(value);
  if (Number.isNaN(utc.getTime())) return null;

  const jstMs = utc.getTime() + 9 * 60 * 60 * 1000;
  const jst = new Date(jstMs);

  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  const hour = String(jst.getUTCHours()).padStart(2, "0");
  const minute = String(jst.getUTCMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

type PageProps = {
  params: {
    id: string;
    versionId: string;
  };
  searchParams?: {
    lang?: string;
  };
};

type DiffPart = {
  type: "same" | "added" | "removed";
  text: string;
};

// シンプルな行単位の差分（LCS ベース）
function diffLines(oldText: string, newText: string): DiffPart[] {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: DiffPart[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({ type: "same", text: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: oldLines[i] });
      i++;
    } else {
      result.push({ type: "added", text: newLines[j] });
      j++;
    }
  }

  while (i < m) {
    result.push({ type: "removed", text: oldLines[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", text: newLines[j] });
    j++;
  }

  return result;
}

export default async function VersionComparePage({ params, searchParams }: PageProps) {
  const { id, versionId } = params;
  void searchParams;

  const { data: docData, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  const { data: versionData, error: versionError } = await supabase
    .from("document_versions")
    .select("*")
    .eq("id", versionId)
    .eq("document_id", id)
    .single();

  if (docError || !docData || versionError || !versionData) {
    console.error("Version compare fetch error:", docError, versionError);
    notFound();
  }

  const doc = docData as {
    id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
    summary: string | null;
    tags: string[] | null;
    created_at: string;
  };

  const version = versionData as {
    id: string;
    document_id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
    summary: string | null;
    tags: string[] | null;
    created_at: string;
  };

  const currentCreatedAt = formatJstDateTime(doc.created_at) ?? doc.created_at;
  const versionCreatedAt =
    formatJstDateTime(version.created_at) ?? version.created_at;

  const diff = diffLines(version.raw_content ?? "", doc.raw_content ?? "");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="text-xs text-slate-600">
              <p className="font-semibold">
                バージョン比較
              </p>
              <p className="text-[11px]">
                現在の内容と、選択したバージョンの内容を左右に並べて表示します。
              </p>
            </div>
          </div>
          <Link
            href={`/documents/${doc.id}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            詳細へ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* 現在の内容 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold text-slate-800">
              現在の内容
            </h2>
            <p className="mb-1 text-[11px] text-slate-500">
              {currentCreatedAt}
            </p>
            <h3 className="text-sm font-semibold text-slate-900">
              {doc.title}
            </h3>
            {doc.category && (
              <p className="mt-1 text-[11px] text-slate-600">
                カテゴリ:{" "}
                {doc.category}
              </p>
            )}
            {doc.summary && (
              <div className="mt-3 rounded-md bg-emerald-50/70 p-2 text-[11px] text-slate-800">
                <p className="mb-1 font-semibold text-emerald-800">
                  AI 要約
                </p>
                <p className="whitespace-pre-wrap">{doc.summary}</p>
              </div>
            )}
            {doc.raw_content && (
              <div className="mt-3">
                <p className="mb-1 text-[11px] font-semibold text-slate-700">
                  本文
                </p>
                <div className="h-64 overflow-auto rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-800">
                  <pre className="whitespace-pre-wrap font-sans">
                    {doc.raw_content}
                  </pre>
                </div>
              </div>
            )}
          </section>

          {/* 選択したバージョン */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold text-slate-800">
              このバージョン
            </h2>
            <p className="mb-1 text-[11px] text-slate-500">
              {versionCreatedAt}
            </p>
            <h3 className="text-sm font-semibold text-slate-900">
              {version.title ||
                "（タイトルなし）"}
            </h3>
            {version.category && (
              <p className="mt-1 text-[11px] text-slate-600">
                カテゴリ:{" "}
                {version.category}
              </p>
            )}
            {version.summary && (
              <div className="mt-3 rounded-md bg-slate-50 p-2 text-[11px] text-slate-800">
                <p className="mb-1 font-semibold text-slate-700">
                  当時の AI 要約
                </p>
                <p className="whitespace-pre-wrap">{version.summary}</p>
              </div>
            )}
            {version.raw_content && (
              <div className="mt-3">
                <p className="mb-1 text-[11px] font-semibold text-slate-700">
                  当時の本文
                </p>
                <div className="h-64 overflow-auto rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-800">
                  <pre className="whitespace-pre-wrap font-sans">
                    {version.raw_content}
                  </pre>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 差分ハイライト */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold text-slate-800">
            本文の差分ハイライト
          </h2>
          <p className="mb-2 text-[11px] text-slate-500">
            左が「- 当時の本文」、右が「+ 現在の本文」です。行単位で追加・削除された箇所を色分けしています。
          </p>
          <div className="h-64 overflow-auto rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px] font-mono text-slate-800">
            {diff.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                本文の差分はありません。
              </p>
            ) : (
              diff.map((part, idx) => {
                const prefix =
                  part.type === "added"
                    ? "+"
                    : part.type === "removed"
                      ? "-"
                      : " ";
                const lineClass =
                  part.type === "added"
                    ? "bg-emerald-50 text-emerald-800"
                    : part.type === "removed"
                      ? "bg-rose-50 text-rose-800"
                      : "";

                return (
                  <div
                    key={idx}
                    className={`flex whitespace-pre-wrap ${lineClass}`}
                  >
                    <span className="mr-1 w-3 select-none text-center">
                      {prefix}
                    </span>
                    <span>{part.text || " "}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
