export type Locale = "ja" | "en";

// Screen-scoped i18n dictionaries
const translations = {
  ja: {
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
    // Dashboard / app
    dashboard: "Dashboard",
    whatsNew: "What's New",
    allDocuments: "All",
    favorites: "Favorites",
    pinned: "Pinned",
    archived: "Archived",
    newDocument: "New Document",
    settings: "Settings",
    totalDocuments: "Total Documents",
    last30Days: "Last 30 Days",
    total: "Total",
    pins: "Pinned",
    favs: "Favorites",
    docs: "",
    searchPlaceholder: "Search by title, summary, or tags...",
    similarSearch: "Similar Search",
    filterAll: "All",
    filterRecent: "Recent",
    filterFavorites: "Favorites",
    filterPinned: "Pinned",
    filterArchived: "Archived",
    noSummary: "(No summary)",
    viewDetails: "View Details",
    noDocuments: "No documents yet",
    noDocumentsDesc:
      "Create a new document or upload a PDF / Word file to get started.",
    createFirst: "Create Your First Document",
    delete: "Delete",
    archive: "Archive",
    unarchive: "Unarchive",
    statusOk: "Operational",
    recentActive: "Recently Active Documents",
    // Common dialog labels
    confirm: "Confirm",
    cancel: "Cancel",
  },
} as const;

export type TranslationKey = keyof typeof translations.ja;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.ja[key] ?? key;
}

export function getLocaleFromParam(lang: string | undefined): Locale {
  // "en" だけでなく "en=", "en-US" など "en" で始まる値も英語として扱う
  if (!lang) return "ja";
  return lang.toLowerCase().startsWith("en") ? "en" : "ja";
}
