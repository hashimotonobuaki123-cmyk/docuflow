"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Notification,
  getNotificationIcon,
  getNotificationBadgeClass,
  getNotificationLink,
  formatRelativeTime,
} from "@/lib/notifications";

type Props = {
  notifications: Notification[];
  unreadCount: number;
  markReadAction: (formData: FormData) => Promise<void>;
  markAllReadAction: () => Promise<void>;
};

export function NotificationBell({
  notifications,
  unreadCount,
  markReadAction,
  markAllReadAction,
}: Props) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="通知を開く"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">通知</h3>
            {unreadCount > 0 && (
              <form action={markAllReadAction}>
                <button
                  type="submit"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  すべて既読にする
                </button>
              </form>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl">
                  🔔
                </div>
                <p className="text-sm text-slate-500">通知はありません</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <form action={markReadAction}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => {
                          setIsOpen(false);
                          // フォームを送信して既読にする
                          const form = document.querySelector(
                            `form input[value="${notification.id}"]`
                          )?.closest("form");
                          if (form && !notification.read_at) {
                            form.requestSubmit();
                          }
                        }}
                        className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                          notification.read_at ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">
                              {notification.title}
                            </p>
                            {!notification.read_at && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${getNotificationBadgeClass(
                                notification.type
                              )}`}
                            >
                              {notification.type.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs text-slate-600 hover:text-emerald-600"
            >
              すべての通知を見る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}






