"use client";

import { useState } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useLocale } from "@/lib/useLocale";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchFilterProps {
  query?: string;
  categories: FilterOption[];
  selectedCategory?: string;
  sortOrder?: "asc" | "desc";
  onlyPinned?: boolean;
  onlyFavorites?: boolean;
  showArchived?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchFilter({
  query = "",
  categories,
  selectedCategory = "",
  sortOrder = "desc",
  onlyPinned = false,
  onlyFavorites = false,
  showArchived = false,
  className = "",
}: SearchFilterProps) {
  const locale = useLocale();
  const [showFilters, setShowFilters] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);

  const activeFiltersCount = [
    selectedCategory,
    onlyPinned,
    onlyFavorites,
    showArchived,
  ].filter(Boolean).length;

  const quickFilters = [
    {
      key: "all",
      label: locale === "en" ? "All" : "すべて",
      active: !selectedCategory && !onlyPinned && !onlyFavorites && !showArchived,
    },
    {
      key: "pinned",
      label: locale === "en" ? "Pinned" : "ピン留め",
      active: onlyPinned,
    },
    {
      key: "favorites",
      label: locale === "en" ? "Favorites" : "お気に入り",
      active: onlyFavorites,
    },
    {
      key: "archived",
      label: locale === "en" ? "Archived" : "アーカイブ",
      active: showArchived,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={locale === "en" ? "Search documents..." : "ドキュメントを検索..."}
            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => setLocalQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">
            {locale === "en" ? "Filters" : "フィルター"}
          </span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Search Button */}
        <Button type="submit" variant="primary" className="shrink-0">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{locale === "en" ? "Search" : "検索"}</span>
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5 inline mr-1" />
          {locale === "en" ? "Quick:" : "クイック:"}
        </span>
        {quickFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant={filter.active ? "primary" : "default"}
            size="md"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "en" ? "Category" : "カテゴリ"}
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">{locale === "en" ? "All" : "すべて"}</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} {cat.count !== undefined && `(${cat.count})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "en" ? "Sort" : "並び順"}
              </label>
              <select
                name="sort"
                defaultValue={sortOrder}
                className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="desc">{locale === "en" ? "Newest first" : "新しい順"}</option>
                <option value="asc">{locale === "en" ? "Oldest first" : "古い順"}</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "en" ? "Refine" : "絞り込み"}
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="onlyPinned"
                    value="1"
                    defaultChecked={onlyPinned}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  {locale === "en" ? "Pinned" : "ピン"}
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="onlyFavorites"
                    value="1"
                    defaultChecked={onlyFavorites}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  {locale === "en" ? "Favorites" : "お気に入り"}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
