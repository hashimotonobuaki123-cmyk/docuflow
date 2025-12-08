import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
};

export default async function PublicSharePage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const locale: Locale = getLocaleFromParam(resolvedSearchParams?.lang);

  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, title, category, raw_content, summary, tags, created_at, share_expires_at",
    )
    .eq("share_token", token)
    .single();

  if (error) {
    console.error(error);
  }

  if (!data) {
    notFound();
  }

  const now = new Date();
  const expiresAt = data.share_expires_at
    ? new Date(data.share_expires_at as string)
    : null;

  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    // 期限切れ
    notFound();
  }

  const doc = data as {
    id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
    summary: string | null;
    tags: string[] | null;
    created_at: string;
  };

  const tags = Array.isArray(doc.tags) ? doc.tags : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-emerald-600">
                {locale === "en" ? "Public view" : "公開ビュー"}
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                {locale === "en"
                  ? "Shared document"
                  : "共有されたドキュメント"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={
                locale === "en"
                  ? "/auth/login?lang=en"
                  : "/auth/login"
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {locale === "en"
                ? "Log in to your workspace"
                : "ログインして自分のワークスペースへ"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
          <header className="space-y-3">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {doc.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {doc.category && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {doc.category}
                  </span>
                )}
                <time dateTime={doc.created_at}>
                  {new Date(doc.created_at).toLocaleString(
                    locale === "en" ? "en-US" : "ja-JP",
                  )}
                </time>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {doc.summary && (
            <section className="space-y-2 rounded-md bg-slate-50 p-4">
              <h3 className="text-xs font-semibold text-slate-700">
                {locale === "en" ? "Summary" : "要約"}
              </h3>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                {doc.summary}
              </p>
            </section>
          )}

          {doc.raw_content && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-700">
                {locale === "en" ? "Body" : "本文"}
              </h3>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                  {doc.raw_content}
                </p>
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
