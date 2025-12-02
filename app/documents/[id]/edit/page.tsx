import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { generateSummaryAndTags } from "@/lib/ai";
import { logActivity } from "@/lib/activityLog";

type PageProps = {
  params: {
    id: string;
  };
};

async function updateDocument(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();

  if (!id || !title || !rawContent) {
    return;
  }

  // 変更前の内容を document_versions に保存してから本体を更新する
  try {
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

    const { data: current, error: currentError } = await supabase
      .from("documents")
      .select("id, user_id, title, category, raw_content, summary, tags")
      .eq("id", id)
      .single();

    if (!currentError && current) {
      const currentDoc = current as {
        id: string;
        user_id: string | null;
        title: string;
        category: string | null;
        raw_content: string | null;
        summary: string | null;
        tags: string[] | null;
      };

      const versionUserId = cookieUserId ?? currentDoc.user_id;

      await supabase.from("document_versions").insert({
        document_id: currentDoc.id,
        user_id: versionUserId,
        title: currentDoc.title,
        category: currentDoc.category,
        raw_content: currentDoc.raw_content,
        summary: currentDoc.summary,
        tags: currentDoc.tags,
      });
    }
  } catch (e) {
    // バージョン保存に失敗しても本体更新は続行する
    console.error("Failed to insert document_versions:", e);
  }

  const { summary, tags } = await generateSummaryAndTags(rawContent);

  const { error } = await supabase
    .from("documents")
    .update({
      title,
      category: category || "未分類",
      raw_content: rawContent,
      summary,
      tags,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to update document.");
  }

  await logActivity("update_document", {
    documentId: id,
    documentTitle: title,
  });

  redirect(`/documents/${id}`);
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = params;

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(error);
    redirect("/");
  }

  const doc = data as {
    id: string;
    title: string;
    category: string | null;
    raw_content: string | null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              DocuFlow
            </h1>
            <p className="text-sm text-slate-500">ドキュメント編集</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            ドキュメント情報を編集
          </h2>
          <form action={updateDocument} className="space-y-4">
            <input type="hidden" name="id" value={doc.id} />

            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue={doc.title}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                カテゴリ
              </label>
              <input
                id="category"
                name="category"
                defaultValue={doc.category ?? ""}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div>
              <label
                htmlFor="rawContent"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                本文 <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-500">
                編集後の本文をもとに、要約とタグを再生成します。
              </p>
              <textarea
                id="rawContent"
                name="rawContent"
                required
                rows={12}
                defaultValue={doc.raw_content ?? ""}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:bg-white focus:ring"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                保存すると、AI による要約とタグも更新されます。
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
              >
                更新して再要約
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
