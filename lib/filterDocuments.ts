export type FilterableDocument = {
  id: string;
  title: string;
  category: string | null;
  raw_content: string | null;
  summary: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  is_pinned: boolean;
  // それ以外のフィールドはあってもよい
  [key: string]: unknown;
};

export function filterDocuments(
  documents: FilterableDocument[],
  query?: string,
  category?: string,
  onlyFavorites?: boolean,
  onlyPinned?: boolean
) {
  const q = query?.toLowerCase().trim() ?? "";
  const normalizedCategory = category?.trim() ?? "";

  return documents.filter((doc) => {
    const inCategory =
      !normalizedCategory || doc.category === normalizedCategory;

    const inText =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      (doc.summary ?? "").toLowerCase().includes(q) ||
      (doc.raw_content ?? "").toLowerCase().includes(q) ||
      (Array.isArray(doc.tags)
        ? doc.tags.some((tag) => tag.toLowerCase().includes(q))
        : false);

    const favoriteOk = !onlyFavorites || doc.is_favorite;
    const pinnedOk = !onlyPinned || doc.is_pinned;

    return inCategory && inText && favoriteOk && pinnedOk;
  });
}


