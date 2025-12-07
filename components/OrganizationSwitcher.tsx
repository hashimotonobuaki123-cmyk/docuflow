"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Organization,
  OrganizationRole,
  getRoleDisplayName,
  getRoleBadgeClass,
} from "@/lib/organizationTypes";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type OrganizationWithRole = {
  organization: Organization;
  role: OrganizationRole;
};

type Props = {
  organizations: OrganizationWithRole[];
  activeOrganizationId: string | null;
  switchAction: (formData: FormData) => Promise<void>;
};

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
  switchAction,
}: Props) {
  const locale: Locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOrg = organizations.find(
    (o) => o.organization.id === activeOrganizationId
  );

  // 組織が1つもない場合
  if (organizations.length === 0) {
    return (
      <Link
        href={
          locale === "en"
            ? "/settings/organizations?lang=en"
            : "/settings/organizations"
        }
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
      >
        <span className="text-base">🏢</span>
        <span>
          {locale === "en" ? "Create organization" : "組織を作成"}
        </span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <span className="text-base">🏢</span>
        <span className="max-w-[120px] truncate">
          {activeOrg?.organization.name ||
            (locale === "en" ? "Select organization" : "組織を選択")}
        </span>
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-in">
          <div className="p-2">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {locale === "en" ? "Organizations" : "所属組織"}
            </p>
            <div className="mt-1 space-y-0.5">
              {organizations.map(({ organization, role }) => (
                <form key={organization.id} action={switchAction}>
                  <input
                    type="hidden"
                    name="organizationId"
                    value={organization.id}
                  />
                  <button
                    type="submit"
                    onClick={() => setIsOpen(false)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                      organization.id === activeOrganizationId
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm">
                        {organization.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate font-medium">
                        {organization.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${getRoleBadgeClass(
                          role
                        )}`}
                      >
                        {getRoleDisplayName(role)}
                      </span>
                      {organization.id === activeOrganizationId && (
                        <svg
                          className="h-4 w-4 text-emerald-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </form>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 p-2">
            <Link
              href={
                locale === "en"
                  ? "/settings/organizations?lang=en"
                  : "/settings/organizations"
              }
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {locale === "en" ? "Organization settings" : "組織設定"}
              </span>
            </Link>
            <Link
              href={
                locale === "en"
                  ? "/settings/organizations?action=new&lang=en"
                  : "/settings/organizations?action=new"
              }
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>
                {locale === "en"
                  ? "Create new organization"
                  : "新しい組織を作成"}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}




