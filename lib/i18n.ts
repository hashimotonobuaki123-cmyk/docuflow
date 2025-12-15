export type Locale = "ja" | "en";

const translations = {
  ja: {
    // Auth
    login: "ログイン",
    signup: "アカウント作成",
    logout: "ログアウト",
    // Dashboard / app
    dashboard: "ダッシュボード",
    whatsNew: "What's New",
    allDocuments: "すべて",
    favorites: "お気に入り",
    pinned: "ピン留め",
    archived: "アーカイブ",
    newDocument: "新規作成",
    settings: "設定",
    totalDocuments: "ドキュメント総数",
    last30Days: "直近30日",
    total: "合計",
    pins: "ピン",
    favs: "お気に入り",
    docs: "件",
    searchPlaceholder: "タイトル・要約・タグで検索...",
    similarSearch: "類似検索",
    filterAll: "すべて",
    filterRecent: "最近追加",
    filterFavorites: "お気に入り",
    filterPinned: "ピン留め",
    filterArchived: "アーカイブ済み",
    noSummary: "（要約なし）",
    viewDetails: "詳細を見る",
    noDocuments: "ドキュメントがありません",
    noDocumentsDesc:
      "新しいドキュメントを作成するか、PDF / Word ファイルをアップロードしてください。",
    createFirst: "最初のドキュメントを作成",
    delete: "削除",
    archive: "アーカイブ",
    unarchive: "アーカイブ解除",
    statusOk: "稼働中",
    recentActive: "最近アクティブなドキュメント数",
    // Common dialog labels
    confirm: "確認",
    cancel: "キャンセル",
  },
  en: {
    // Auth
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    // Dashboard / app
    dashboard: "Dashboard",
    whatsNew: "What's new",
    allDocuments: "All",
    favorites: "Favorites",
    pinned: "Pinned",
    archived: "Archived",
    newDocument: "New",
    settings: "Settings",
    totalDocuments: "Total documents",
    last30Days: "Last 30 days",
    total: "Total",
    pins: "Pins",
    favs: "Favs",
    docs: "docs",
    searchPlaceholder: "Search by title, summary, tags...",
    similarSearch: "Similar search",
    filterAll: "All",
    filterRecent: "Recently added",
    filterFavorites: "Favorites",
    filterPinned: "Pinned",
    filterArchived: "Archived",
    noSummary: "(No summary)",
    viewDetails: "View details",
    noDocuments: "No documents yet",
    noDocumentsDesc:
      "Create a new document or upload a PDF / Word file to get started.",
    createFirst: "Create your first document",
    delete: "Delete",
    archive: "Archive",
    unarchive: "Unarchive",
    statusOk: "Operational",
    recentActive: "Recently active documents",
    // Common dialog labels
    confirm: "Confirm",
    cancel: "Cancel",
  },
} as const;

export type TranslationKey = keyof typeof translations.ja;

export function t(locale: Locale, key: TranslationKey): string {
  const dict = locale === "en" ? translations.en : translations.ja;
  return dict[key] ?? translations.ja[key] ?? key;
}

export function getLocaleFromParam(lang?: string | null): Locale {
  const normalized = (lang ?? "").trim().toLowerCase();
  return normalized === "en" ? "en" : "ja";
}
