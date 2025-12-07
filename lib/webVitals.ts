/**
 * Web Vitals計測とレポート
 * パフォーマンスを監視し、ユーザー体験を可視化
 */

import type { Metric } from "web-vitals";

// パフォーマンスメトリクスの閾値（Good / Needs Improvement / Poor）
const THRESHOLDS = {
  CLS: [0.1, 0.25], // Cumulative Layout Shift
  FID: [100, 300], // First Input Delay (ms)
  FCP: [1800, 3000], // First Contentful Paint (ms)
  LCP: [2500, 4000], // Largest Contentful Paint (ms)
  TTFB: [800, 1800], // Time to First Byte (ms)
};

type MetricRating = "good" | "needs-improvement" | "poor";

function getMetricRating(metric: Metric): MetricRating {
  const thresholds = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
  if (!thresholds) return "good";

  const [good, needsImprovement] = thresholds;
  if (metric.value <= good) return "good";
  if (metric.value <= needsImprovement) return "needs-improvement";
  return "poor";
}

/**
 * メトリクスをバックエンドに送信
 */
async function sendToAnalytics(metric: Metric) {
  const rating = getMetricRating(metric);
  
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });

  // 本番環境でのみ送信（開発中はコンソールログ）
  if (process.env.NODE_ENV === "production") {
    // ビーコンAPIを使用（ページ離脱時も確実に送信）
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    } else {
      // フォールバック
      fetch("/api/vitals", {
        method: "POST",
        body,
        keepalive: true,
      }).catch(console.error);
    }
  } else {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating,
    });
  }
}

/**
 * Web Vitalsの計測を開始
 */
export function initWebVitals() {
  // web-vitals v4 以降では onCLS/onFID 形式のAPIが推奨
  // 動的インポートにして型エラーを避けつつ、ブラウザ側だけで実行
  import("web-vitals")
    .then((mod: any) => {
      const onCLS = mod.onCLS ?? mod.getCLS;
      const onFID = mod.onFID ?? mod.getFID;
      const onFCP = mod.onFCP ?? mod.getFCP;
      const onLCP = mod.onLCP ?? mod.getLCP;
      const onTTFB = mod.onTTFB ?? mod.getTTFB;

      onCLS && onCLS(sendToAnalytics);
      onFID && onFID(sendToAnalytics);
      onFCP && onFCP(sendToAnalytics);
      onLCP && onLCP(sendToAnalytics);
      onTTFB && onTTFB(sendToAnalytics);
    })
    .catch((error) => {
      console.error("Failed to init Web Vitals:", error);
    });
}

/**
 * パフォーマンススコアを計算（0-100）
 */
export function calculatePerformanceScore(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}): number {
  const weights = {
    lcp: 0.25,
    fid: 0.25,
    cls: 0.25,
    fcp: 0.15,
    ttfb: 0.1,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(metrics).forEach(([name, value]) => {
    if (value === undefined) return;

    const thresholds = THRESHOLDS[name.toUpperCase() as keyof typeof THRESHOLDS];
    if (!thresholds) return;

    const [good, needsImprovement] = thresholds;
    let score: number;

    if (value <= good) {
      score = 100;
    } else if (value <= needsImprovement) {
      // 線形補間
      score = 50 + ((needsImprovement - value) / (needsImprovement - good)) * 50;
    } else {
      // 0-50の範囲
      score = Math.max(0, 50 - ((value - needsImprovement) / needsImprovement) * 50);
    }

    const weight = weights[name as keyof typeof weights] || 0;
    totalScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * メトリクス名を日本語に変換
 */
export function getMetricLabel(name: string): string {
  const labels: Record<string, string> = {
    CLS: "累積レイアウトシフト",
    FID: "初回入力遅延",
    FCP: "初回コンテンツ描画",
    LCP: "最大コンテンツ描画",
    TTFB: "最初のバイトまでの時間",
  };
  return labels[name] || name;
}

/**
 * メトリクス値をフォーマット
 */
export function formatMetricValue(name: string, value: number): string {
  if (name === "CLS") {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

