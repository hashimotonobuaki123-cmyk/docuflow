import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/activityLog";
import { generateSummaryAndTags } from "@/lib/ai";
import { Logo } from "@/components/Logo";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Comment = {
  id: string;
  document_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
};

async function deleteDocument(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!id) return;

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to delete document.");
  }

  await logActivity("delete_document", {
    documentId: id,
    documentTitle: title,
  });

  redirect("/");
}

async function enableShare(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!id) return;

  const token = randomUUID();

  const { error } = await supabase
    .from("documents")
    .update({
      share_token: token,
      share_expires_at: null,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to enable share link.");
  }

  await logActivity("enable_share", {
    documentId: id,
    documentTitle: title,
  });

  revalidatePath(`/documents/${id}`);
}

async function disableShare(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!id) return;

  const { error } = await supabase
    .from("documents")
    .update({
      share_token: null,
      share_expires_at: null,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to disable share link.");
  }

  await logActivity("disable_share", {
    documentId: id,
    documentTitle: title,
  });

  revalidatePath(`/documents/${id}`);
}

async function addComment(formData: FormData) {
  "use server";

  const documentId = String(formData.get("documentId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!documentId || !content) return;

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  const { error } = await supabase.from("document_comments").insert({
    document_id: documentId,
    user_id: userId,
    content,
  });

  if (error) {
    console.error("addComment error:", error);
    throw new Error("Failed to add comment.");
  }

  await logActivity("add_comment", {
    documentId,
    details: "created",
  });

  revalidatePath(`/documents/${documentId}`);
}

async function regenerateSummary(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const { data, error } = await supabase
    .from("documents")
    .select("raw_content,title")
    .eq("id", id)
    .single();

  if (error || !data || !data.raw_content) {
    console.error("regenerateSummary fetch error:", error);
    return;
  }

  const { summary, tags } = await generateSummaryAndTags(data.raw_content);

  const { error: updateError } = await supabase
    .from("documents")
    .update({ summary, tags })
    .eq("id", id);

  if (updateError) {
    console.error("regenerateSummary update error:", updateError);
    throw new Error("Failed to regenerate summary.");
  }

  await logActivity("update_document", {
    documentId: id,
    documentTitle: (data as any).title ?? null,
    details: "regenerate_summary",
  });

  revalidatePath(`/documents/${id}`);
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  if (!data) {
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
    share_token?: string | null;
  };

  const tags = Array.isArray(doc.tags) ? doc.tags : [];

  // 作成日時は activity_logs の create_document があればそちらを優先
  let createdAtDisplay: string | null = null;
  const { data: createdLog } = await supabase
    .from("activity_logs")
    .select("created_at")
    .eq("document_id", id)
    .eq("action", "create_document")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const createdAtSource =
    createdLog?.created_at ?? (doc.created_at as string | null) ?? null;
  if (createdAtSource) {
    createdAtDisplay = new Date(createdAtSource).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const rawContent = doc.raw_content ?? "";
  const charCount = rawContent.length;
  const lineCount = rawContent ? rawContent.split(/\r?\n/).length : 0;
  const approxMinutes =
    charCount > 0 ? Math.max(1, Math.round(charCount / 600)) : null;

  const { data: commentsData, error: commentsError } = await supabase
    .from("document_comments")
    .select("*")
    .eq("document_id", id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Failed to fetch comments:", commentsError);
  }

  const comments = (commentsData ?? []) as Comment[];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-500">ドキュメント詳細</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={`/documents/${doc.id}/edit`}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              編集
            </Link>
            <Link
              href="/app"
              className="font-medium text-slate-600 underline-offset-4 hover:underline"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
          <header className="space-y-3">
            <div className="flex items-start justify-between gap-3">
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
                  <time
                    dateTime={createdAtDisplay ?? undefined}
                    className="text-[11px]"
                  >
                    {createdAtDisplay ?? "作成日時なし"}
                  </time>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <form
                  action={deleteDocument}
                  className="flex flex-col items-end gap-1"
                >
                  <input type="hidden" name="id" value={doc.id} />
                  <input type="hidden" name="title" value={doc.title} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    ドキュメントを削除
                  </button>
                  <p className="text-[10px] text-slate-400">
                    削除すると元に戻せません
                  </p>
                </form>

                <div className="flex flex-col items-end gap-1 text-[11px] text-slate-600">
                  <p className="text-[10px] font-semibold text-slate-500">
                    共有リンク
                  </p>
                  {doc.share_token ? (
                    <>
                      <p className="max-w-[220px] truncate font-mono text-[10px] text-slate-700">
                        /share/{doc.share_token}
                      </p>
                      <form action={disableShare}>
                        <input type="hidden" name="id" value={doc.id} />
                        <input type="hidden" name="title" value={doc.title} />
                        <button
                          type="submit"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          共有を停止
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={enableShare}>
                      <input type="hidden" name="id" value={doc.id} />
                      <input type="hidden" name="title" value={doc.title} />
                      <button
                        type="submit"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        共有リンクを発行
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* メタ情報カード */}
            <div className="grid gap-3 text-[11px] text-slate-600 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-semibold text-slate-700">ドキュメント情報</p>
                <p className="mt-1 text-[11px]">
                  作成日時:{" "}
                  <span className="font-medium">
                    {createdAtDisplay ?? "作成日時なし"}
                  </span>
                </p>
                {doc.category && (
                  <p className="mt-1">
                    カテゴリ: <span className="font-medium">{doc.category}</span>
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-semibold text-slate-700">ボリューム</p>
                <p className="mt-1">
                  文字数:{" "}
                  <span className="font-medium">
                    {charCount.toLocaleString("ja-JP")} 文字
                  </span>
                </p>
                <p className="mt-1">
                  行数: <span className="font-medium">{lineCount} 行</span>
                </p>
                {approxMinutes && (
                  <p className="mt-1">
                    読了目安:{" "}
                    <span className="font-medium">{approxMinutes} 分程度</span>
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-semibold text-slate-700">タグ / 共有</p>
                <p className="mt-1">
                  タグ数:{" "}
                  <span className="font-medium">
                    {tags.length.toLocaleString("ja-JP")} 個
                  </span>
                </p>
                <p className="mt-1">
                  共有リンク:{" "}
                  <span className="font-medium">
                    {doc.share_token ? "有効" : "未発行"}
                  </span>
                </p>
              </div>
            </div>

            {/* タグ */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/app?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {doc.summary && (
            <section className="space-y-2 rounded-md border-l-4 border-emerald-400/70 bg-emerald-50/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                      AI
                    </span>
                    AI 要約
                  </h3>
                </div>
                <form action={regenerateSummary}>
                  <input type="hidden" name="id" value={doc.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    要約を再生成
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                {doc.summary}
              </p>
            </section>
          )}

          {doc.raw_content && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-700">本文</h3>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                  {doc.raw_content}
                </p>
              </div>
            </section>
          )}

          {/* コメント */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700">コメント</h3>
            {comments.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                まだコメントはありません。気づきや TODO をメモしておくのに使えます。
              </p>
            ) : (
              <ul className="space-y-2">
                {comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-md border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                      {comment.content}
                    </p>
                    <time
                      dateTime={comment.created_at}
                      className="mt-1 block text-[10px] text-slate-400"
                    >
                      {new Date(comment.created_at).toLocaleString("ja-JP")}
                    </time>
                  </li>
                ))}
              </ul>
            )}

            <form action={addComment} className="space-y-2">
              <input type="hidden" name="documentId" value={doc.id} />
              <textarea
                name="content"
                rows={3}
                placeholder="このドキュメントに関するメモや TODO を自由に書いてください。"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500/20 focus:bg-white focus:ring"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  コメントを追加
                </button>
              </div>
            </form>
          </section>
        </article>
      </main>
    </div>
  );
}


