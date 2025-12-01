import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import {
  generateSummaryAndTags,
  generateTitleFromContent,
  generateCategoryFromContent,
} from "@/lib/ai";
import { logActivity } from "@/lib/activityLog";
import { Logo } from "@/components/Logo";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

async function extractTextFromFile(file: File): Promise<string> {
  const filename = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (filename.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text ?? "").trim();
  }

  if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value ?? "").trim();
  }

  throw new Error("サポートされていないファイル形式です。PDF / DOC / DOCX のみ対応しています。");
}

// AI を使わず「とりあえず保存」する高速パス
async function fastCreateDocument(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  let title = String(formData.get("title") ?? "").trim();
  let category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();
  const file = formData.get("file");

  let content = rawContent;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error("アップロードされたファイルが大きすぎます（最大 10MB まで）。");
      return;
    }

    try {
      content = await extractTextFromFile(file);
    } catch (e) {
      console.error("ファイルからテキストを抽出できませんでした:", e);
      return;
    }
  }

  if (!content) {
    return;
  }

  if (!title) {
    title = content.slice(0, 30) || "無題ドキュメント";
  }
  if (!category) {
    category = "未分類";
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title,
      category,
      raw_content: content,
      summary: null,
      tags: [],
      is_favorite: false,
      is_pinned: false,
    })
    .select("id");

  if (error) {
    console.error("Supabase insert error (fastCreateDocument):", error);
    throw new Error(`Failed to insert document: ${error.message}`);
  }

  const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (created?.id) {
    await logActivity("create_document", {
      documentId: String(created.id),
      documentTitle: title,
    });
  }

  redirect("/");
}

async function createDocument(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  let title = String(formData.get("title") ?? "").trim();
  let category = String(formData.get("category") ?? "").trim();
  const rawContent = String(formData.get("rawContent") ?? "").trim();
  const file = formData.get("file");

  let content = rawContent;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error("アップロードされたファイルが大きすぎます（最大 10MB まで）。");
      return;
    }

    try {
      content = await extractTextFromFile(file);
    } catch (e) {
      console.error("ファイルからテキストを抽出できませんでした:", e);
      return;
    }
  }

  if (!content) {
    // TODO: バリデーションメッセージを UI に返したい場合は、
    // useFormState などを使う実装に変更できます（MVP では単純に戻す）。
    return;
  }

  // AI によるタイトル / カテゴリ / 要約・タグ生成
  // 本番環境で OpenAI のキーが未設定でも「ボタンが無反応」に見えないよう、
  // すべて try/catch で囲んでフォールバックする
  let summary = "";
  let tags: string[] = [];

  try {
    const titlePromise = title
      ? Promise.resolve(title)
      : generateTitleFromContent(content);
    const categoryPromise = category
      ? Promise.resolve(category)
      : generateCategoryFromContent(content);
    const summaryPromise = generateSummaryAndTags(content);

    const [generatedTitle, generatedCategory, generated] = await Promise.all([
      titlePromise,
      categoryPromise,
      summaryPromise,
    ]);

    title = (generatedTitle || title || content.slice(0, 30)) || "無題ドキュメント";
    category = (generatedCategory || category || "未分類") || "未分類";
    summary = generated.summary;
    tags = generated.tags;
  } catch (e) {
    console.error("AI generate error in createDocument:", e);
    // フォールバック: タイトル / カテゴリが空なら素朴な値を入れておく
    if (!title) {
      title = content.slice(0, 30) || "無題ドキュメント";
    }
    if (!category) {
      category = "未分類";
    }
    // summary / tags は空のままでも保存は続行する
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title,
      // DB 側で category が NOT NULL 制約になっているため、
      // 未入力の場合は「未分類」という文字列で保存する
      category: category || "未分類",
      raw_content: content,
      summary,
      tags,
      // お気に入り / ピン留めは新規作成時は false で初期化
      is_favorite: false,
      is_pinned: false,
    })
    .select("id");

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(`Failed to insert document: ${error.message}`);
  }

  const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (created?.id) {
    await logActivity("create_document", {
      documentId: String(created.id),
      documentTitle: title,
    });
  }

  redirect("/");
}

export default function NewDocumentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo withTagline />
          <nav className="flex items-center gap-2 text-[11px] text-slate-600">
            <Link
              href="/app"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium hover:bg-slate-50"
            >
              一覧に戻る
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* 左カラム：入力フォーム */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-slate-900">
              ドキュメント情報
            </h2>
            <p className="mb-6 text-xs text-slate-500">
              テキストを直接入力するか、PDF / Word ファイルをアップロードすると、AI が要約とタグ
              （最大 3 つ）を自動生成します。
            </p>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  タイトル
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="例: プロダクト要件定義（未入力なら自動生成されます）"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:bg-white focus:ring"
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
                  placeholder="例: 仕様書 / 議事録 / 企画書 など"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:bg-white focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="rawContent"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  本文（AI 要約の元になるテキスト）
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  この本文をもとに AI が要約とタグ（3 つ）を自動生成します。PDF / Word
                  ファイルをアップロードした場合は、その中身のテキストがここに自動で保存されます。
                </p>
                <textarea
                  id="rawContent"
                  name="rawContent"
                  rows={12}
                  placeholder="ドキュメント本文を貼り付けてください。"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:bg-white focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  PDF / Word ファイルから読み込む
                </label>
                <p className="mb-2 text-xs text-slate-500">
                  .pdf / .doc / .docx に対応（10MB まで）。アップロードされたファイルはテキストに変換して保存されます。
                </p>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="block w-full text-xs text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  右のボタンで AI 要約あり・なしを選べます。AI ありは少し時間がかかります。
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="reset"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    入力内容を破棄
                  </button>
                  <button
                    type="submit"
                    formAction={fastCreateDocument}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    とりあえず保存
                  </button>
                  <button
                    type="submit"
                    formAction={createDocument}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400"
                  >
                    保存して要約生成
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 右カラム：AI の挙動と使い方ガイド */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-700 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700">
                DocuFlow について
              </p>
              <p className="mt-1 leading-relaxed">
                DocuFlow は、AI 要約で PDF や Word 資料を一瞬で整理するためのミニ
                SaaS です。営業資料・企画書・議事録など、バラバラなドキュメントを 1
                つのワークスペースに集約できます。
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-800">
                AI 要約の流れ
              </p>
              <ol className="mt-2 space-y-1.5">
                <li>1. テキスト入力 or PDF / Word をアップロード</li>
                <li>2. AI が本文を解析して要約を生成</li>
                <li>3. 本文から関連するタグ（最大 3 つ）を抽出</li>
                <li>4. Supabase に保存され、一覧画面から検索できます</li>
              </ol>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-800">
                おすすめの使い方
              </p>
              <ul className="mt-2 space-y-1.5 list-disc pl-4">
                <li>長い PDF 資料をアップロードして、要点だけを素早く把握する</li>
                <li>会議の議事録を貼り付けて、後から検索しやすいタグを自動付与する</li>
                <li>社内ナレッジやマニュアルをカテゴリごとに整理してストックする</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}


