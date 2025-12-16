"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// iOS Safari の standalone 判定用に Navigator を拡張
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function PWAInstallPrompt() {
  const locale: Locale = useLocale();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // すでにインストール済みかチェック
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      ((window.navigator as NavigatorWithStandalone).standalone ?? false)
    ) {
      setIsInstalled(true);
      return;
    }

    // beforeinstallprompt イベントをリッスン
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 3秒後に自動表示（ユーザー体験を考慮）
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS Safari の場合
      addToast({
        type: "info",
        title:
          locale === "en" ? "How to install" : "インストール方法",
        message:
          locale === "en"
            ? "On iOS: Tap the Share button and choose “Add to Home Screen”."
            : "iOS の場合: 共有ボタン → 「ホーム画面に追加」をタップしてください",
        duration: 5000,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        addToast({
          type: "success",
          title: locale === "en" ? "Installed" : "インストール完了",
          message:
            locale === "en"
              ? "DocuFlow has been installed."
              : "DocuFlow をインストールしました！",
        });
        setIsInstalled(true);
      } else {
        addToast({
          type: "info",
          title: locale === "en" ? "Canceled" : "キャンセル",
          message:
            locale === "en"
              ? "Installation was canceled."
              : "インストールをキャンセルしました",
        });
      }
    } catch (error) {
      console.error(locale === "en" ? "Install error:" : "インストールエラー:", error);
      addToast({
        type: "error",
        title: locale === "en" ? "Error" : "エラー",
        message:
          locale === "en"
            ? "Failed to install the app."
            : "インストールに失敗しました",
      });
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24時間後に再度表示可能にする（localStorageで管理）
    localStorage.setItem(
      "pwa-install-dismissed",
      Date.now().toString()
    );
  };

  // インストール済みまたは非表示の場合は何も表示しない
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  // 24時間以内に非表示にした場合は表示しない
  const dismissedTime = localStorage.getItem("pwa-install-dismissed");
  if (dismissedTime) {
    const timeDiff = Date.now() - parseInt(dismissedTime, 10);
    if (timeDiff < 24 * 60 * 60 * 1000) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up md:left-auto md:right-4 md:w-96">
      <div className="card border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-xl dark:border-emerald-800 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === "en"
                ? "Install DocuFlow"
                : "DocuFlow をインストール"}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {locale === "en"
                ? "Add DocuFlow to your home screen for a smoother experience."
                : "ホーム画面に追加して、より快適にご利用いただけます"}
            </p>

            {/* Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleInstall}
                className="btn btn-primary flex-1 py-2 text-sm"
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
                {locale === "en" ? "Install" : "インストール"}
              </button>
              <button
                onClick={handleDismiss}
                className="btn btn-secondary px-4 py-2 text-sm"
                aria-label={locale === "en" ? "Close" : "閉じる"}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

