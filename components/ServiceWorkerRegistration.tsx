"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Service Worker を登録
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered:",
            registration.scope
          );

          // 更新チェック（1時間ごと）
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // 更新が利用可能になったときの処理
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // 新しいバージョンが利用可能
                  console.log(
                    "New service worker available"
                  );
                  // ここでユーザーに通知することも可能
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error(
            "Service Worker registration failed:",
            error
          );
        });

      // ページがコントロールされているかチェック
      let refreshing = false;
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        }
      );
    }
  }, []);

  return null;
}






