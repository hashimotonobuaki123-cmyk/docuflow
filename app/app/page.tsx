import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/activityLog";
import {
  generateSummaryAndTags,
  generateTitleFromContent,
  generateCategoryFromContent,
} from "@/lib/ai";
import { Logo } from "@/components/Logo";
import { UserMenu } from "./UserMenu";
import { DocumentCardShortcuts } from "./DocumentCardShortcuts";
import { BulkDeleteConfirmButton } from "./BulkDeleteConfirmButton";
import { DragAndDropUpload } from "./DragAndDropUpload";
import { filterDocuments } from "@/lib/filterDocuments";
import {
  updateDocumentEmbedding,
  searchSimilarDocuments,
  SimilarDocument,
} from "@/lib/similarSearch";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import {
  getUserOrganizations,
  getActiveOrganizationId,
  setActiveOrganization,
} from "@/lib/organizations";
import { NotificationBell } from "@/components/NotificationBell";
import { AppOnboardingTour } from "@/components/AppOnboardingTour";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "@/lib/notifications";

// UTC の ISO 文字列を、日本時間 (UTC+9) の "YYYY/MM/DD HH:MM" に変換するヘルパー
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

// カテゴリごとのバッジカラー（SaaS っぽく）
function getCategoryBadgeClasses(category: string): string {
  const cat = category.trim();
  if (cat.includes("仕様")) return "bg-sky-50 text-sky-700 border border-sky-100";
  if (cat.includes("議事") || cat.includes("MTG"))
    return "bg-amber-50 text-amber-700 border border-amber-100";
  if (cat.includes("企画") || cat.includes("計画"))
    return "bg-violet-50 text-violet-700 border border-violet-100";
  if (cat.includes("提案") || cat.includes("レポート"))
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

// ファイルアップロードのサイズ上限（10MB）
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// PDF / Word ファイルからテキストを抽出するヘルパー
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

// 「直近30日で作成されたドキュメント数」を数えるためのヘルパー
// Date.now() の呼び出しはここ（コンポーネント外）に閉じ込めて React の純粋性ルールを守る
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
function countDocumentsCreatedLast30Days(documents: Document[]): number {
  const now = Date.now();
  return documents.filter((d) => {
    const t = new Date(d.created_at as string).getTime();
    return !Number.isNaN(t) && now - t <= THIRTY_DAYS_MS;
  }).length;
}

type Document = {
  id: string;
  title: string;
  category: string | null;
  raw_content: string | null;
  summary: string | null;
  tags: string[] | null;
  created_at: string;
  user_id: string | null;
  is_favorite: boolean;
  is_pinned: boolean;
   is_archived?: boolean | null;
  share_token?: string | null;
};

type ActivityLog = {
  id: string;
  action: string;
  document_id: string | null;
  document_title: string | null;
  created_at: string;
};

async function toggleFavorite(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;

  const { error } = await supabase
    .from("documents")
    .update({ is_favorite: next })
    .eq("id", id);

  if (error) {
    console.error("toggleFavorite error:", error);
    throw new Error(`Failed to update favorite: ${error.message}`);
  }

  await logActivity("toggle_favorite", {
    documentId: id,
    details: next ? "on" : "off",
  });

  revalidatePath("/app");
}

async function togglePinned(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;

  const { error } = await supabase
    .from("documents")
    .update({ is_pinned: next })
    .eq("id", id);

  if (error) {
    console.error("togglePinned error:", error);
    throw new Error(`Failed to update pinned: ${error.message}`);
  }

  await logActivity("toggle_pinned", {
    documentId: id,
    details: next ? "on" : "off",
  });

  revalidatePath("/app");
}

async function deleteDocumentFromList(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!id) return;

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    console.error("deleteDocumentFromList error:", error);
    throw new Error("Failed to delete document.");
  }

  await logActivity("delete_document", {
    documentId: id,
    documentTitle: title,
  });

  revalidatePath("/app");
}

async function toggleArchivedFromList(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;

  const { error } = await supabase
    .from("documents")
    .update({ is_archived: next })
    .eq("id", id);

  if (error) {
    console.error("toggleArchivedFromList error:", error);
    throw new Error("Failed to toggle archived.");
  }

  await logActivity(next ? "archive_document" : "restore_document", {
    documentId: id,
    documentTitle: title,
  });

  revalidatePath("/app");
}

async function deleteDocumentsBulk(formData: FormData) {
  "use server";

  const selectedIds = formData
    .getAll("ids")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  const allIds = formData
    .getAll("allIds")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  const ids = (selectedIds.length > 0 ? selectedIds : allIds).filter(
    (v, idx, arr) => v.length > 0 && arr.indexOf(v) === idx
  );

  if (ids.length === 0) return;

  // 削除前にタイトルを取得しておき、アクティビティログ用に使う
  const { data: docs, error: fetchError } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", ids);

  if (fetchError) {
    console.error("deleteDocumentsBulk fetch error:", fetchError);
    throw new Error("Failed to fetch documents for bulk delete.");
  }

  const { error } = await supabase.from("documents").delete().in("id", ids);

  if (error) {
    console.error("deleteDocumentsBulk error:", error);
    throw new Error("Failed to delete documents.");
  }

  // それぞれのドキュメントについてアクティビティを記録
  if (docs && Array.isArray(docs)) {
    for (const doc of docs as { id: string; title: string | null }[]) {
      await logActivity("delete_document", {
        documentId: doc.id,
        documentTitle: doc.title ?? null,
      });
    }
  }

  revalidatePath("/app");
}

// ダッシュボード上のドラッグ＆ドロップ / アップロードからドキュメントを作成するアクション
async function createDocumentFromFileOnDashboard(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;

  // 複数ファイル対応: "files" に複数入っていればそれを優先し、なければ従来の "file" 1件のみ扱う
  const filesFromForm = formData.getAll("files").filter(
    (f): f is File => f instanceof File && f.size > 0
  );

  const fallbackFile = formData.get("file");
  if (filesFromForm.length === 0 && fallbackFile instanceof File && fallbackFile.size > 0) {
    filesFromForm.push(fallbackFile);
  }

  if (filesFromForm.length === 0) {
    return;
  }

  for (const file of filesFromForm) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error("アップロードされたファイルが大きすぎます（最大 10MB まで）。");
      continue;
    }

    let content: string;
    try {
      content = await extractTextFromFile(file);
    } catch (e) {
      console.error("ファイルからテキストを抽出できませんでした:", e);
      continue;
    }

    if (!content) {
      continue;
    }

    let title = "";
    let category = "";
    let summary = "";
    let tags: string[] = [];

    try {
      const [generatedTitle, generatedCategory, generated] = await Promise.all([
        generateTitleFromContent(content),
        generateCategoryFromContent(content),
        generateSummaryAndTags(content),
      ]);

      title = (generatedTitle || content.slice(0, 30)) || "無題ドキュメント";
      category = (generatedCategory || "未分類") || "未分類";
      summary = generated.summary;
      tags = generated.tags;
    } catch (e) {
      console.error("AI generate error in createDocumentFromFileOnDashboard:", e);
      title = content.slice(0, 30) || "無題ドキュメント";
      category = "未分類";
      summary = "";
      tags = [];
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        organization_id: activeOrgId,
        title,
        category,
        raw_content: content,
        summary,
        tags,
        is_favorite: false,
        is_pinned: false,
      })
      .select("id");

    if (error) {
      console.error("Supabase insert error (createDocumentFromFileOnDashboard):", error);
      continue;
    }

    const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (created?.id) {
      await logActivity("create_document", {
        documentId: String(created.id),
        documentTitle: title,
      });

      // 埋め込みベクトルを生成・保存
      updateDocumentEmbedding(String(created.id), content).catch(console.error);
    }
  }

  revalidatePath("/app");
}

export async function deleteAccount() {
  "use server";
  console.warn(
    "[deleteAccount] この関数は app/app/accountActions.ts に移動しました。新しい設定ページから使用してください。"
  );
}

// 組織切り替えアクション
async function switchOrganization(formData: FormData) {
  "use server";

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) return;

  await setActiveOrganization(organizationId);
  revalidatePath("/app");
}

// 通知を既読にするアクション
async function markNotificationReadAction(formData: FormData) {
  "use server";

  const notificationId = String(formData.get("notificationId") ?? "").trim();
  if (!notificationId) return;

  await markNotificationRead(notificationId);
  revalidatePath("/app");
}

// すべての通知を既読にするアクション
async function markAllNotificationsReadAction() {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) return;

  await markAllNotificationsRead(userId);
  revalidatePath("/app");
}

type DashboardProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    onlyFavorites?: string;
    onlyPinned?: string;
    archived?: string;
  }>;
};

function describeActivity(log: ActivityLog): string {
  switch (log.action) {
    case "create_document":
      return "ドキュメントを作成しました";
    case "update_document":
      return "ドキュメントを更新しました";
    case "delete_document":
      return "ドキュメントを削除しました";
    case "toggle_favorite":
      return "お気に入り状態を変更しました";
    case "toggle_pinned":
      return "ピン留め状態を変更しました";
    case "enable_share":
      return "共有リンクを有効にしました";
    case "disable_share":
      return "共有リンクを無効にしました";
    case "archive_document":
      return "ドキュメントをアーカイブしました";
    case "restore_document":
      return "ドキュメントをアーカイブから復元しました";
    default:
      return log.action;
  }
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const category = params?.category ?? "";
  const sort = params?.sort === "asc" ? "asc" : "desc";
  const onlyFavorites = params?.onlyFavorites === "1";
  const onlyPinned = params?.onlyPinned === "1";
  const showArchived = params?.archived === "1";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  // 組織情報を取得
  const memberships = userId ? await getUserOrganizations(userId) : [];
  const organizations = memberships.map((m) => ({
    organization: m.organization,
    role: m.role,
  }));
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;

  // 通知情報を取得
  let notifications: Notification[] = [];
  let unreadCount = 0;
  if (userId) {
    notifications = await getUserNotifications(userId, 10, false);
    unreadCount = await getUnreadNotificationCount(userId);
  }

  let documentsQuery = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: sort === "asc" });

  if (userId) {
    documentsQuery = documentsQuery.eq("user_id", userId);
  }

  // アクティブな組織でフィルタ（組織がある場合）
  if (activeOrgId) {
    documentsQuery = documentsQuery.eq("organization_id", activeOrgId);
  }

  documentsQuery = documentsQuery.eq("is_archived", showArchived);

  const { data, error } = await documentsQuery;

  if (error) {
    console.error(error);
  }

  const allDocuments = ((data as Document[]) ?? []).filter((doc) =>
    userId ? doc.user_id === userId : true
  );
  const categories = Array.from(
    new Set(
      allDocuments
        .map((doc) => doc.category)
        .filter((c): c is string => !!c && c.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const documents = filterDocuments(
    allDocuments,
    query,
    category,
    onlyFavorites,
    onlyPinned
  );

  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    const aTime = new Date(a.created_at as string).getTime();
    const bTime = new Date(b.created_at as string).getTime();

    return sort === "asc" ? aTime - bTime : bTime - aTime;
  });

  let recentActivities: ActivityLog[] = [];
  if (userId) {
    const { data: activityData, error: activityError } = await supabase
      .from("activity_logs")
      .select("id, action, document_id, document_title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (activityError) {
      console.error(activityError);
    } else if (activityData) {
      recentActivities = activityData as ActivityLog[];
    }
  }

  const totalCount = allDocuments.length;
  const pinnedCount = allDocuments.filter((d) => d.is_pinned).length;
  const favoriteCount = allDocuments.filter((d) => d.is_favorite).length;
  const sharedCount = allDocuments.filter((d) => !!d.share_token).length;
  const avgContentLength =
    allDocuments.length > 0
      ? Math.round(
          allDocuments.reduce(
            (sum, d) => sum + (d.raw_content?.length ?? 0),
            0
          ) / allDocuments.length
        )
      : 0;
  const lastActivityAt =
    recentActivities.length > 0
      ? formatJstDateTime(recentActivities[0].created_at as string)
      : null;

  // テスト環境やビルド時にも安定するよう、現在時刻はモジュール外で一度だけ評価して渡す
  const createdLast30Days = countDocumentsCreatedLast30Days(allDocuments);
  const categoryCount = Array.from(
    new Set(
      allDocuments
        .map((d) => d.category)
        .filter((c): c is string => !!c && c.length > 0)
    )
  ).length;

  // 類似検索（検索クエリがある場合のみ実行）
  let similarDocuments: SimilarDocument[] = [];
  if (query && query.length >= 2) {
    try {
      similarDocuments = await searchSimilarDocuments(query, userId, 0.5, 5);
    } catch (error) {
      console.error("Similar search error:", error);
    }
  }

  // カテゴリ別件数のトップ3を集計（ミニグラフ風カード用）
  const categoryStats: [string, number][] = (() => {
    const counter = new Map<string, number>();
    for (const doc of allDocuments) {
      const cat = (doc.category ?? "").trim();
      if (!cat) continue;
      counter.set(cat, (counter.get(cat) ?? 0) + 1);
    }
    return Array.from(counter.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  })();
  const maxCategoryCount = categoryStats.length > 0 ? categoryStats[0][1] : 0;

  // ドキュメントごとのコメント件数（カードのミニ情報用）
  const commentCountMap = new Map<string, number>();
  if (allDocuments.length > 0) {
    const documentIds = allDocuments.map((d) => d.id);
    const { data: comments, error: commentsError } = await supabase
      .from("document_comments")
      .select("document_id")
      .in("document_id", documentIds);

    if (commentsError) {
      console.error(commentsError);
    } else if (comments) {
      for (const row of comments as { document_id: string | null }[]) {
        if (!row.document_id) continue;
        commentCountMap.set(
          row.document_id,
          (commentCountMap.get(row.document_id) ?? 0) + 1
        );
      }
    }
  }

  // document_id ごとの「作成日時」（create_document アクションの最初の時刻）をマップ化
  const documentCreatedAtMap = new Map<string, string>();
  if (userId && allDocuments.length > 0) {
    const documentIds = allDocuments.map((d) => d.id);
    const { data: createdLogs, error: createdLogsError } = await supabase
      .from("activity_logs")
      .select("document_id, created_at")
      .eq("user_id", userId)
      .eq("action", "create_document")
      .in("document_id", documentIds);

    if (createdLogsError) {
      console.error(createdLogsError);
    } else if (createdLogs) {
      for (const log of createdLogs as {
        document_id: string | null;
        created_at: string;
      }[]) {
        if (!log.document_id) continue;
        const prev = documentCreatedAtMap.get(log.document_id);
        if (!prev || new Date(log.created_at) < new Date(prev)) {
          documentCreatedAtMap.set(log.document_id, log.created_at);
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* サイドバー */}
      <aside className="hidden border-r border-slate-200 bg-white md:flex md:w-60 md:flex-col">
        <div className="px-4 py-4">
          <Logo withTagline />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-2 text-sm text-slate-700">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 font-medium text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[13px]">
              📄
            </span>
            <span>ドキュメント</span>
          </Link>
          <Link
            href="/new"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[16px] text-white">
              ＋
            </span>
            <span>新規作成</span>
          </Link>
          <Link
            href="/settings"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[14px]">
              ⚙
            </span>
            <span>設定</span>
          </Link>
        </nav>
        <div className="border-t border-slate-200 px-3 py-3 text-[11px] text-slate-500">
          <Link
            href="/auth/logout"
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-slate-50"
          >
            <span>ログアウト</span>
          </Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* カード用ショートカットレイヤー（クライアントサイド） */}
        <DocumentCardShortcuts />
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-semibold text-slate-900">
                ドキュメントワークスペース
              </h1>
              {/* 組織スイッチャー */}
              <OrganizationSwitcher
                organizations={organizations}
                activeOrganizationId={activeOrgId}
                switchAction={switchOrganization}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">
                合計 {totalCount} 件・ピン {pinnedCount} 件・お気に入り{" "}
                {favoriteCount} 件
              </span>
              {userId && (
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markReadAction={markNotificationReadAction}
                  markAllReadAction={markAllNotificationsReadAction}
                />
              )}
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
        <AppOnboardingTour />
        {/* 概要カード */}
        <section className="grid gap-4 md:grid-cols-4 animate-fade-in">
          {/* Total Documents - Highlight Card */}
          <div className="stat-card stat-card-highlight group hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">ドキュメント総数</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCount}
                  <span className="ml-1 text-sm font-normal text-slate-400">件</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-lg text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                📄
              </div>
            </div>
            {lastActivityAt && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                最近の操作: {lastActivityAt}
              </p>
            )}
          </div>

          {/* Pinned */}
          <div className="stat-card group hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">ピン留め</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pinnedCount}
                  <span className="ml-1 text-sm font-normal text-slate-400">件</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg group-hover:scale-110 transition-transform">
                📌
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              一覧の先頭に表示されます
            </p>
          </div>

          {/* Favorites */}
          <div className="stat-card group hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">お気に入り</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {favoriteCount}
                  <span className="ml-1 text-sm font-normal text-slate-400">件</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg group-hover:scale-110 transition-transform">
                ⭐
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              よく使うドキュメントを素早く発見
            </p>
          </div>

          {/* Insights */}
          <div className="stat-card group hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">インサイト</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  直近30日
                  <span className="ml-1 text-emerald-600">{createdLast30Days}</span>
                  <span className="text-sm font-normal text-slate-400">件</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg group-hover:scale-110 transition-transform">
                📊
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-500">
                <dt className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  カテゴリ
                </dt>
                <dd className="font-semibold text-slate-700">{categoryCount} 種類</dd>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <dt className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  共有中
                </dt>
                <dd className="font-semibold text-slate-700">{sharedCount} 件</dd>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <dt className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  平均文字数
                </dt>
                <dd className="font-semibold text-slate-700">
                  {avgContentLength.toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* カテゴリ別トップ3（ミニグラフ風） */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-900">
              カテゴリ別ドキュメント数（トップ3）
            </h2>
            <p className="text-[11px] text-slate-500">
              カテゴリの偏りや使われ方の傾向をざっくり確認できます
            </p>
          </div>
          {categoryStats.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              まだカテゴリが付いたドキュメントがありません。
            </p>
          ) : (
            <ul className="space-y-2">
              {categoryStats.map(([cat, count]) => {
                const ratio =
                  maxCategoryCount > 0 ? Math.max(0, (count / maxCategoryCount) * 100) : 0;
                return (
                  <li key={cat} className="flex items-center gap-2">
                    <span className="w-20 truncate text-[11px] font-medium text-slate-700">
                      {cat}
                    </span>
                    <div className="relative h-2 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${ratio}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] text-slate-600">{count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ダッシュボード上からのドラッグ＆ドロップアップロード */}
        <section>
          <DragAndDropUpload uploadAction={createDocumentFromFileOnDashboard} />
        </section>

        {/* 検索フォーム */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1">
              <label
                htmlFor="q"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                検索（タイトル・本文・タグ）
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="例: プロジェクト計画, API 設計..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
              />
            </div>

            <div className="min-w-[140px]">
              <label
                htmlFor="category"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                カテゴリ
              </label>
              <select
                id="category"
                name="category"
                defaultValue={category}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
              >
                <option value="">すべて</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[120px]">
              <label
                htmlFor="sort"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                並び順
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
              >
                <option value="desc">新しい順</option>
                <option value="asc">古い順</option>
              </select>
            </div>

            <div className="flex flex-col items-start gap-2">
              <div className="flex gap-3 text-[11px] text-slate-700">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="onlyPinned"
                    value="1"
                    defaultChecked={onlyPinned}
                    className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>ピンのみ</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="onlyFavorites"
                    value="1"
                    defaultChecked={onlyFavorites}
                    className="h-3 w-3 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>お気に入りのみ</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400"
                >
                  検索
                </button>
                <Link
                  href="/new"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  新規作成
                </Link>
              </div>
            </div>
          </form>

          {/* クイックフィルタ */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-500">クイックフィルタ:</span>
            <Link
              href="/app"
              className={`inline-flex items-center rounded-full px-2 py-1 ${
                !query && !category && !onlyFavorites && !onlyPinned && !showArchived
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              すべて
            </Link>
            <Link
              href="/app?onlyPinned=1"
              className={`inline-flex items-center rounded-full px-2 py-1 ${
                onlyPinned
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              ピンだけ
            </Link>
            <Link
              href="/app?onlyFavorites=1"
              className={`inline-flex items-center rounded-full px-2 py-1 ${
                onlyFavorites
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              お気に入りだけ
            </Link>
            <Link
              href="/app?archived=1"
              className={`inline-flex items-center rounded-full px-2 py-1 ${
                showArchived
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              アーカイブ
            </Link>
          </div>
        </section>

        {/* 🔍 AI類似検索結果（検索クエリがあり、結果がある場合のみ表示） */}
        {query && similarDocuments.length > 0 && (
          <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/50 to-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-sm text-white">
                🧠
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  AI類似検索結果
                </h3>
                <p className="text-[11px] text-slate-500">
                  「{query}」に意味的に近いドキュメント（ベクトル検索）
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {similarDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition hover:border-violet-300 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="block truncate text-sm font-medium text-slate-900 hover:text-violet-600 hover:underline"
                    >
                      {doc.title}
                    </Link>
                    {doc.summary && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {doc.summary}
                      </p>
                    )}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                      類似度 {Math.round(doc.similarity * 100)}%
                    </span>
                    {doc.category && (
                      <span className="text-[10px] text-slate-400">
                        {doc.category}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {showArchived ? "アーカイブされたドキュメント" : "あなたのドキュメント"}
            </h2>
            <div className="text-right text-xs text-slate-500">
              <p>
                {sortedDocuments.length} 件
                {query ? `（検索ワード: "${query}"）` : ""}
              </p>
              {category && <p>カテゴリフィルタ: {category}</p>}
              <p>並び順: {sort === "asc" ? "古い順" : "新しい順"}</p>
              <form
                id="bulk-delete-form"
                action={deleteDocumentsBulk}
                className="mt-1 inline-flex items-center justify-end gap-2"
              >
                <BulkDeleteConfirmButton formId="bulk-delete-form" />
                <span className="text-[10px] text-slate-400">
                  「すべて選択」で表示中のカードを一括選択して
                  <span className="font-semibold"> すべて削除 </span>
                  / カード上で <span className="font-semibold">Shift + D</span> でも削除できます
                </span>
              </form>
            </div>
          </div>

          {sortedDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              ドキュメントがまだありません。
              <Link
                href="/new"
                className="ml-1 font-medium text-emerald-600 underline-offset-2 hover:underline"
              >
                最初のドキュメントを作成しましょう。
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedDocuments.map((doc) => (
                <article
                  key={doc.id}
                  data-doc-card
                  className={`flex flex-col rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    (doc as Document).is_archived
                      ? "border-slate-200 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-emerald-500/60"
                  }`}
                >
                  {/* すべて削除用に、表示中ドキュメントの ID を hidden で送る */}
                  <input
                    type="hidden"
                    name="allIds"
                    value={doc.id}
                    form="bulk-delete-form"
                  />
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        name="ids"
                        value={doc.id}
                        form="bulk-delete-form"
                        className="mt-1 h-3 w-3 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        aria-label={`${doc.title} を一括削除対象にする`}
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="line-clamp-2 text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {doc.title}
                        </Link>
                        {doc.category && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadgeClasses(
                              doc.category
                            )}`}
                          >
                            {doc.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(() => {
                        const createdAt =
                          documentCreatedAtMap.get(doc.id) ?? doc.created_at;
                        return (
                          <time
                            dateTime={(createdAt as string | null) ?? undefined}
                            className="shrink-0 text-[10px] text-slate-400"
                          >
                            {createdAt
                              ? formatJstDateTime(createdAt as string)
                              : "作成日時なし"}
                          </time>
                        );
                      })()}
                      {(doc as Document).is_archived && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          📦 アーカイブ
                        </span>
                      )}
                      {doc.share_token ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          🔗 共有中
                        </span>
                      ) : null}
                      <div className="flex gap-1">
                        <form action={togglePinned}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input
                            type="hidden"
                            name="next"
                            value={doc.is_pinned ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={`rounded-full border px-2 text-[10px] ${
                              doc.is_pinned
                                ? "border-amber-400 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-white text-slate-400"
                            }`}
                            aria-label={
                              doc.is_pinned
                                ? "ピン留めを解除"
                                : "ピン留めする"
                            }
                          >
                            📌
                          </button>
                        </form>
                        <form action={toggleFavorite}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input
                            type="hidden"
                            name="next"
                            value={doc.is_favorite ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={`rounded-full border px-2 text-[10px] ${
                              doc.is_favorite
                                ? "border-rose-400 bg-rose-50 text-rose-700"
                                : "border-slate-200 bg-white text-slate-400"
                            }`}
                            aria-label={
                              doc.is_favorite
                                ? "お気に入りを解除"
                                : "お気に入りに追加"
                            }
                          >
                            ★
                          </button>
                        </form>
                        <form action={deleteDocumentFromList}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input type="hidden" name="title" value={doc.title} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 bg-white px-2 text-[10px] text-red-400 hover:bg-red-50"
                            data-doc-delete-button
                            aria-label="ドキュメントを削除"
                          >
                            🗑
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {doc.summary && (
                    <p className="mb-3 line-clamp-4 text-xs leading-relaxed text-slate-700">
                      {doc.summary}
                    </p>
                  )}

                  {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1">
                      {doc.tags.map((tag) => {
                        const isActive =
                          query &&
                          tag.toLowerCase() === query.toLowerCase().trim();
                        return (
                          <Link
                            key={tag}
                            href={`/app?q=${encodeURIComponent(tag)}`}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-300"
                                : "bg-slate-50 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {tag}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-slate-400">🏷</span>
                          <span>{doc.tags.length} 個のタグ</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-slate-400">✍️</span>
                          <span>
                            {doc.raw_content
                              ? `${doc.raw_content.length.toLocaleString("ja-JP")} 文字`
                              : "0 文字"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-slate-400">💬</span>
                          <span>
                            {(commentCountMap.get(doc.id) ?? 0).toLocaleString(
                              "ja-JP"
                            )}{" "}
                            件
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <form action={toggleArchivedFromList}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input type="hidden" name="title" value={doc.title} />
                          <input
                            type="hidden"
                            name="next"
                            value={(doc as Document).is_archived ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                              (doc as Document).is_archived
                                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                : "border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            📦{" "}
                            <span>
                              {(doc as Document).is_archived ? "復元" : "アーカイブ"}
                            </span>
                          </button>
                        </form>
                        <form action={deleteDocumentFromList}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input type="hidden" name="title" value={doc.title} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-medium text-red-500 hover:bg-red-50"
                            data-doc-delete-button
                          >
                            🗑 <span>削除</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {userId && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                最近のアクティビティ
              </h2>
              <p className="text-[11px] text-slate-500">
                直近 10 件の操作を表示します
              </p>
            </div>

            {recentActivities.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                まだアクティビティがありません。ドキュメントの作成・編集・共有などを行うとここに履歴が表示されます。
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {recentActivities.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between px-4 py-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="text-slate-800">
                        {describeActivity(log)}
                      </p>
                      {log.document_title && (
                        <p className="text-[11px] text-slate-500">
                          {log.document_title}
                        </p>
                      )}
                    </div>
                    <time
                      dateTime={log.created_at}
                      className="shrink-0 text-[10px] text-slate-400"
                    >
                      {new Date(log.created_at).toLocaleString("ja-JP")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        </main>
      </div>
    </div>
  );
}


