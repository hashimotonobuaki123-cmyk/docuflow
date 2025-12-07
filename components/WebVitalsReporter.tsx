"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/webVitals";

/**
 * Web Vitals計測を開始するコンポーネント
 * ルートレイアウトに配置して全ページで計測
 */
export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}



