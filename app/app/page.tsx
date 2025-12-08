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
import { UserMenu } from "./UserMenu";
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
import { EmptyState } from "@/components/EmptyState";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "@/lib/notifications";
import { t, getLocaleFromParam, Locale } from "@/lib/i18n";

// New UI Components
import { Sidebar } from "@/components/ui/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  FileText,
  Pin,
  Star,
  Archive,
  TrendingUp,
  Search,
  Plus,
  Globe,
  Sparkles,
  FolderOpen,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Trash2,
  RotateCcw,
  Brain,
} from "lucide-react";

// Force dynamic rendering for locale changes
export const dynamic = "force-dynamic";

// Helper: UTC ISO string to JST "YYYY/MM/DD HH:MM"
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

// Category badge styles
function getCategoryBadgeVariant(category: string): "default" | "primary" | "success" | "warning" | "info" {
  const cat = category.toLowerCase();
  if (cat.includes("仕様") || cat.includes("spec")) return "info";
  if (cat.includes("議事") || cat.includes("mtg")) return "warning";
  if (cat.includes("企画") || cat.includes("計画")) return "primary";
  if (cat.includes("提案") || cat.includes("レポート")) return "success";
  return "default";
}

// File upload size limit (10MB)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// PDF / Word text extraction helper
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
  throw new Error("Unsupported file format. Only PDF / DOC / DOCX are supported.");
}

// Count documents created in last 30 days
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

// Server Actions
async function toggleFavorite(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;
  const { error } = await supabase.from("documents").update({ is_favorite: next }).eq("id", id);
  if (error) throw new Error(`Failed to update favorite: ${error.message}`);
  await logActivity("toggle_favorite", { documentId: id, details: next ? "on" : "off" });
  revalidatePath("/app");
}

async function togglePinned(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;
  const { error } = await supabase.from("documents").update({ is_pinned: next }).eq("id", id);
  if (error) throw new Error(`Failed to update pinned: ${error.message}`);
  await logActivity("toggle_pinned", { documentId: id, details: next ? "on" : "off" });
  revalidatePath("/app");
}

async function deleteDocumentFromList(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!id) return;
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error("Failed to delete document.");
  await logActivity("delete_document", { documentId: id, documentTitle: title });
  revalidatePath("/app");
}

async function toggleArchivedFromList(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;
  const { error } = await supabase.from("documents").update({ is_archived: next }).eq("id", id);
  if (error) throw new Error("Failed to toggle archived.");
  await logActivity(next ? "archive_document" : "restore_document", { documentId: id, documentTitle: title });
  revalidatePath("/app");
}

async function deleteDocumentsBulk(formData: FormData) {
  "use server";
  const selectedIds = formData.getAll("ids").map((v) => String(v).trim()).filter((v) => v.length > 0);
  const allIds = formData.getAll("allIds").map((v) => String(v).trim()).filter((v) => v.length > 0);
  const ids = (selectedIds.length > 0 ? selectedIds : allIds).filter((v, idx, arr) => v.length > 0 && arr.indexOf(v) === idx);
  if (ids.length === 0) return;
  const { data: docs } = await supabase.from("documents").select("id, title").in("id", ids);
  const { error } = await supabase.from("documents").delete().in("id", ids);
  if (error) throw new Error("Failed to delete documents.");
  if (docs && Array.isArray(docs)) {
    for (const doc of docs as { id: string; title: string | null }[]) {
      await logActivity("delete_document", { documentId: doc.id, documentTitle: doc.title ?? null });
    }
  }
  revalidatePath("/app");
}

async function createDocumentFromFileOnDashboard(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;
  const filesFromForm = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const fallbackFile = formData.get("file");
  if (filesFromForm.length === 0 && fallbackFile instanceof File && fallbackFile.size > 0) {
    filesFromForm.push(fallbackFile);
  }
  if (filesFromForm.length === 0) return;

  for (const file of filesFromForm) {
    if (file.size > MAX_FILE_SIZE_BYTES) continue;
    let content: string;
    try {
      content = await extractTextFromFile(file);
    } catch {
      continue;
    }
    if (!content) continue;

    let title = "", category = "", summary = "";
    let tags: string[] = [];
    try {
      const [generatedTitle, generatedCategory, generated] = await Promise.all([
        generateTitleFromContent(content),
        generateCategoryFromContent(content),
        generateSummaryAndTags(content),
      ]);
      title = generatedTitle || content.slice(0, 30) || "Untitled";
      category = generatedCategory || "Uncategorized";
      summary = generated.summary;
      tags = generated.tags;
    } catch {
      title = content.slice(0, 30) || "Untitled";
      category = "Uncategorized";
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({ user_id: userId, organization_id: activeOrgId, title, category, raw_content: content, summary, tags, is_favorite: false, is_pinned: false })
      .select("id");
    if (error) continue;

    const created = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (created?.id) {
      await logActivity("create_document", { documentId: String(created.id), documentTitle: title });
      updateDocumentEmbedding(String(created.id), content).catch(console.error);
    }
  }
  revalidatePath("/app");
}

async function switchOrganization(formData: FormData) {
  "use server";
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) return;
  await setActiveOrganization(organizationId);
  revalidatePath("/app");
}

async function markNotificationReadAction(formData: FormData) {
  "use server";
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  if (!notificationId) return;
  await markNotificationRead(notificationId);
  revalidatePath("/app");
}

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
    lang?: string;
  }>;
};

export default async function Dashboard({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const category = params?.category ?? "";
  const sort = params?.sort === "asc" ? "asc" : "desc";
  const onlyFavorites = params?.onlyFavorites === "1";
  const onlyPinned = params?.onlyPinned === "1";
  const showArchived = params?.archived === "1";
  const locale: Locale = getLocaleFromParam(params?.lang);

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  // Organization data
  const memberships = userId ? await getUserOrganizations(userId) : [];
  const organizations = memberships.map((m) => ({ organization: m.organization, role: m.role }));
  const activeOrgId = userId ? await getActiveOrganizationId(userId) : null;

  // Notifications
  let notifications: Notification[] = [];
  let unreadCount = 0;
  if (userId) {
    notifications = await getUserNotifications(userId, 10, false);
    unreadCount = await getUnreadNotificationCount(userId);
  }

  // Documents query
  let documentsQuery = supabase.from("documents").select("*").order("created_at", { ascending: sort === "asc" });
  if (userId) documentsQuery = documentsQuery.eq("user_id", userId);
  if (activeOrgId) documentsQuery = documentsQuery.eq("organization_id", activeOrgId);
  documentsQuery = documentsQuery.eq("is_archived", showArchived);
  const { data, error } = await documentsQuery;
  if (error) console.error(error);

  const allDocuments = ((data as Document[]) ?? []).filter((doc) => (userId ? doc.user_id === userId : true));
  const categories = Array.from(new Set(allDocuments.map((doc) => doc.category).filter((c): c is string => !!c && c.length > 0))).sort((a, b) => a.localeCompare(b, "ja"));
  const documents = filterDocuments(allDocuments, query, category, onlyFavorites, onlyPinned);
  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    const aTime = new Date(a.created_at as string).getTime();
    const bTime = new Date(b.created_at as string).getTime();
    return sort === "asc" ? aTime - bTime : bTime - aTime;
  });

  // Activity logs
  let recentActivities: ActivityLog[] = [];
  if (userId) {
    const { data: activityData, error: activityError } = await supabase
      .from("activity_logs")
      .select("id, action, document_id, document_title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);
    if (!activityError && activityData) recentActivities = activityData as ActivityLog[];
  }

  // Stats
  const totalCount = allDocuments.length;
  const pinnedCount = allDocuments.filter((d) => d.is_pinned).length;
  const favoriteCount = allDocuments.filter((d) => d.is_favorite).length;
  const archivedCount = allDocuments.filter((d) => d.is_archived).length;
  const sharedCount = allDocuments.filter((d) => !!d.share_token).length;
  const createdLast30Days = countDocumentsCreatedLast30Days(allDocuments);
  const lastActivityAt = recentActivities.length > 0 ? formatJstDateTime(recentActivities[0].created_at as string) : null;

  // Similar search
  let similarDocuments: SimilarDocument[] = [];
  if (query && query.length >= 2) {
    try {
      similarDocuments = await searchSimilarDocuments(query, userId, 0.5, 5);
    } catch {
      // Silently fail
    }
  }

  // Comment counts
  const commentCountMap = new Map<string, number>();
  if (allDocuments.length > 0) {
    const documentIds = allDocuments.map((d) => d.id);
    const { data: comments } = await supabase.from("document_comments").select("document_id").in("document_id", documentIds);
    if (comments) {
      for (const row of comments as { document_id: string | null }[]) {
        if (!row.document_id) continue;
        commentCountMap.set(row.document_id, (commentCountMap.get(row.document_id) ?? 0) + 1);
      }
    }
  }

  const langSuffix = locale === "en" ? "?lang=en" : "";
  const langParam = locale === "en" ? "&lang=en" : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar - Linear Style */}
      <Sidebar locale={locale} stats={{ total: totalCount, archived: archivedCount }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Vercel Style */}
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {showArchived
                ? locale === "en" ? "Archived Documents" : "アーカイブ"
                : locale === "en" ? "Documents" : "ドキュメント"}
            </h1>
            <OrganizationSwitcher organizations={organizations} activeOrganizationId={activeOrgId} switchAction={switchOrganization} />
            <Badge variant="success" size="sm" dot>
              {locale === "en" ? "System OK" : "正常稼働中"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats Pills */}
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="default" size="sm">{totalCount} {locale === "en" ? "docs" : "件"}</Badge>
              <Badge variant="primary" size="sm">{pinnedCount} <Pin className="h-3 w-3 ml-0.5" /></Badge>
              <Badge variant="warning" size="sm">{favoriteCount} <Star className="h-3 w-3 ml-0.5" /></Badge>
            </div>

            <Link
              href={locale === "en" ? "/app" : "/app?lang=en"}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{locale === "en" ? "日本語" : "EN"}</span>
            </Link>

            <Link
              href="/app/whats-new"
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New</span>
            </Link>

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
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <AppOnboardingTour />

            {/* Stats Grid - Stripe Style */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={locale === "en" ? "Total Documents" : "ドキュメント総数"}
                value={totalCount}
                subtitle={lastActivityAt ? `${locale === "en" ? "Last activity" : "最終操作"}: ${lastActivityAt}` : undefined}
                icon={<FileText className="h-5 w-5" />}
                variant="highlight"
                trend={createdLast30Days > 0 ? { value: Math.round((createdLast30Days / Math.max(totalCount, 1)) * 100) } : undefined}
              />
              <StatCard
                title={locale === "en" ? "Pinned" : "ピン留め"}
                value={pinnedCount}
                subtitle={locale === "en" ? "Quick access items" : "素早くアクセス"}
                icon={<Pin className="h-5 w-5" />}
              />
              <StatCard
                title={locale === "en" ? "Favorites" : "お気に入り"}
                value={favoriteCount}
                subtitle={locale === "en" ? "Starred documents" : "重要なドキュメント"}
                icon={<Star className="h-5 w-5" />}
              />
              <StatCard
                title={locale === "en" ? "30-Day Activity" : "30日間の活動"}
                value={createdLast30Days}
                subtitle={`${sharedCount} ${locale === "en" ? "shared" : "件を共有中"}`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend={{ value: 12 }}
              />
            </section>

            {/* Upload Area */}
            <DragAndDropUpload uploadAction={createDocumentFromFileOnDashboard} />

            {/* Search & Filter */}
            <Card padding="md">
              <form className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="q"
                      defaultValue={query}
                      placeholder={locale === "en" ? "Search by title, content, tags..." : "タイトル、本文、タグで検索..."}
                      className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[140px]"
                  >
                    <option value="">{locale === "en" ? "All categories" : "すべてのカテゴリ"}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="h-11 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[120px]"
                  >
                    <option value="desc">{locale === "en" ? "Newest" : "新しい順"}</option>
                    <option value="asc">{locale === "en" ? "Oldest" : "古い順"}</option>
                  </select>
                  <Button type="submit" variant="primary">
                    <Search className="h-4 w-4" />
                    {locale === "en" ? "Search" : "検索"}
                  </Button>
                  <Link href={`/new${langSuffix}`}>
                    <Button variant="secondary" type="button">
                      <Plus className="h-4 w-4" />
                      {locale === "en" ? "New" : "新規"}
                    </Button>
                  </Link>
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">{locale === "en" ? "Quick:" : "クイック:"}</span>
                  <Link href={`/app${langSuffix}`}>
                    <Badge variant={!query && !category && !onlyFavorites && !onlyPinned && !showArchived ? "primary" : "default"} className="cursor-pointer">
                      {locale === "en" ? "All" : "すべて"}
                    </Badge>
                  </Link>
                  <Link href={`/app?onlyPinned=1${langParam}`}>
                    <Badge variant={onlyPinned ? "primary" : "default"} className="cursor-pointer">
                      <Pin className="h-3 w-3 mr-1" /> {locale === "en" ? "Pinned" : "ピン"}
                    </Badge>
                  </Link>
                  <Link href={`/app?onlyFavorites=1${langParam}`}>
                    <Badge variant={onlyFavorites ? "primary" : "default"} className="cursor-pointer">
                      <Star className="h-3 w-3 mr-1" /> {locale === "en" ? "Favorites" : "お気に入り"}
                    </Badge>
                  </Link>
                  <Link href={`/app?archived=1${langParam}`}>
                    <Badge variant={showArchived ? "warning" : "default"} className="cursor-pointer">
                      <Archive className="h-3 w-3 mr-1" /> {locale === "en" ? "Archived" : "アーカイブ"}
                    </Badge>
                  </Link>
                </div>
              </form>
            </Card>

            {/* AI Similar Search Results */}
            {query && similarDocuments.length > 0 && (
              <Card variant="bordered" padding="md" className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-900/10 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{locale === "en" ? "AI Semantic Search" : "AI類似検索結果"}</CardTitle>
                      <p className="text-xs text-slate-500">
                        {locale === "en" ? `Documents similar to "${query}"` : `「${query}」に意味的に近いドキュメント`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 space-y-2">
                  {similarDocuments.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}${langSuffix}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                        {doc.summary && <p className="text-xs text-slate-500 truncate mt-0.5">{doc.summary}</p>}
                      </div>
                      <Badge variant="info" size="sm">{Math.round(doc.similarity * 100)}%</Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Document List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {showArchived
                    ? locale === "en" ? "Archived Documents" : "アーカイブされたドキュメント"
                    : locale === "en" ? "Your Documents" : "あなたのドキュメント"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {sortedDocuments.length} {locale === "en" ? "documents" : "件"}
                    {query && ` (${locale === "en" ? "search" : "検索"}: "${query}")`}
                  </span>
                  <form id="bulk-delete-form" action={deleteDocumentsBulk}>
                    <BulkDeleteConfirmButton formId="bulk-delete-form" />
                  </form>
                </div>
              </div>

              {sortedDocuments.length === 0 ? (
                <EmptyState
                  icon={showArchived ? "📦" : "📄"}
                  title={
                    showArchived
                      ? locale === "en" ? "No archived documents" : "アーカイブされたドキュメントはありません"
                      : locale === "en" ? "No documents yet" : "ドキュメントがまだありません"
                  }
                  description={
                    showArchived
                      ? locale === "en" ? "Documents you archive will appear here." : "アーカイブに移動したドキュメントがここに表示されます。"
                      : query
                      ? locale === "en" ? `No documents match "${query}".` : `「${query}」に一致するドキュメントが見つかりません。`
                      : locale === "en" ? "Create your first document and experience AI-powered auto-summary." : "最初のドキュメントを作成して、AIによる自動要約を体験しましょう。"
                  }
                  actionLabel={showArchived ? (locale === "en" ? "View all" : "すべて表示") : (locale === "en" ? "Create new" : "新規作成")}
                  actionHref={showArchived ? `/app${langSuffix}` : `/new${langSuffix}`}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sortedDocuments.map((doc) => (
                    <article
                      key={doc.id}
                      data-doc-card
                      className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Hidden inputs for bulk delete */}
                      <input type="hidden" name="allIds" value={doc.id} form="bulk-delete-form" />
                      
                      {/* Status Icons */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        {Boolean(doc.is_pinned) && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                            <Pin className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {Boolean(doc.is_favorite) && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-500 dark:bg-rose-900/30">
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </span>
                        )}
                        {Boolean(doc.share_token) && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                            <Share2 className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <input
                          type="checkbox"
                          name="ids"
                          value={doc.id}
                          form="bulk-delete-form"
                          className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={locale === "en" ? `Select ${doc.title}` : `${doc.title} を選択`}
                        />
                      </div>

                      {/* Header */}
                      <div className="mb-3 pr-24">
                        <Link href={`/documents/${doc.id}${langSuffix}`} className="block group/title">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors">
                            {doc.title}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {doc.category && <Badge variant={getCategoryBadgeVariant(doc.category)} size="sm">{doc.category}</Badge>}
                          {Boolean(doc.is_archived) && (
                            <Badge variant="default" size="sm">
                              <Archive className="h-3 w-3 mr-1" />
                              {locale === "en" ? "Archived" : "アーカイブ"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      {Boolean(doc.summary) && (
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{doc.summary}</p>
                      )}

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {doc.tags.slice(0, 4).map((tag) => (
                            <Link
                              key={tag}
                              href={`/app?q=${encodeURIComponent(tag)}${langParam}`}
                              className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                          {doc.tags.length > 4 && <span className="text-[11px] text-slate-400">+{doc.tags.length - 4}</span>}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatJstDateTime(doc.created_at as string | null)?.split(" ")[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {(doc.raw_content?.length ?? 0).toLocaleString()}
                            </span>
                            {(commentCountMap.get(doc.id) ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {commentCountMap.get(doc.id)}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <form action={togglePinned}>
                              <input type="hidden" name="id" value={doc.id} />
                              <input type="hidden" name="next" value={doc.is_pinned ? "false" : "true"} />
                              <button type="submit" className={`h-7 w-7 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${doc.is_pinned ? "text-amber-600" : "text-slate-400"}`}>
                                <Pin className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            <form action={toggleFavorite}>
                              <input type="hidden" name="id" value={doc.id} />
                              <input type="hidden" name="next" value={doc.is_favorite ? "false" : "true"} />
                              <button type="submit" className={`h-7 w-7 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${doc.is_favorite ? "text-rose-500" : "text-slate-400"}`}>
                                <Star className={`h-3.5 w-3.5 ${doc.is_favorite ? "fill-current" : ""}`} />
                              </button>
                            </form>
                            <form action={toggleArchivedFromList}>
                              <input type="hidden" name="id" value={doc.id} />
                              <input type="hidden" name="title" value={doc.title} />
                              <input type="hidden" name="next" value={doc.is_archived ? "false" : "true"} />
                              <button type="submit" className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                {doc.is_archived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                              </button>
                            </form>
                            <form action={deleteDocumentFromList}>
                              <input type="hidden" name="id" value={doc.id} />
                              <input type="hidden" name="title" value={doc.title} />
                              <button type="submit" data-doc-delete-button className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
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

            {/* Activity Feed */}
            {userId && recentActivities.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {locale === "en" ? "Recent Activity" : "最近のアクティビティ"}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {locale === "en" ? "Last 8 actions" : "直近8件"}
                  </span>
                </div>
                <ActivityFeed
                  activities={recentActivities.map((a) => ({
                    id: a.id,
                    action: a.action,
                    documentId: a.document_id,
                    documentTitle: a.document_title,
                    createdAt: a.created_at,
                  }))}
                  locale={locale}
                />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
