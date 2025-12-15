import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams?:
    | {
        lang?: string;
      }
    | Promise<{
        lang?: string;
      }>;
};

export default async function WebVitalsPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const locale: Locale = getLocaleFromParam(sp?.lang);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">
              {locale === "en" ? "Performance" : "パフォーマンス監視"}
            </p>
          </div>
          <Link
            href={withLang("/app")}
            className="btn btn-secondary btn-sm"
          >
            {locale === "en" ? "← Back to dashboard" : "← ダッシュボードに戻る"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {locale === "en" ? "Web Vitals dashboard" : "Web Vitals ダッシュボード"}
          </h1>
          <p className="text-sm text-slate-600">
            {locale === "en"
              ? "Measure user experience and improve performance continuously."
              : "ユーザー体験を定量的に測定し、パフォーマンスを継続的に改善します"}
          </p>
        </div>

        {/* Core Web Vitals */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Core Web Vitals
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "LCP",
                label: "Largest Contentful Paint",
                description:
                  (locale === "en" ? "Load performance" : "最大コンテンツ描画時間"),
                value: locale === "en" ? "Coming soon" : "準備中",
                target:
                  (locale === "en" ? "≤ 2.5s" : "2.5秒以内"),
                icon: "⚡",
              },
              {
                name: "FID",
                label: "First Input Delay",
                description:
                  (locale === "en" ? "Interactivity" : "初回入力遅延"),
                value: locale === "en" ? "Coming soon" : "準備中",
                target:
                  (locale === "en" ? "≤ 100ms" : "100ms以内"),
                icon: "👆",
              },
              {
                name: "CLS",
                label: "Cumulative Layout Shift",
                description:
                  (locale === "en" ? "Visual stability" : "累積レイアウトシフト"),
                value: locale === "en" ? "Coming soon" : "準備中",
                target:
                  (locale === "en" ? "≤ 0.1" : "0.1以下"),
                icon: "📐",
              },
            ].map((metric) => (
              <div key={metric.name} className="card p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {metric.name}
                      </h3>
                      <p className="text-xs text-slate-500">{metric.label}</p>
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-2xl font-bold text-slate-900">
                  {metric.value}
                </p>
                <p className="text-xs text-slate-600">{metric.description}</p>
                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {locale === "en" ? "Target: " : "目標: "}
                  {metric.target}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {locale === "en" ? "Other metrics" : "その他の指標"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: "FCP",
                label: "First Contentful Paint",
                description:
                  (locale === "en" ? "First render" : "初回コンテンツ描画"),
                value: locale === "en" ? "Coming soon" : "準備中",
                target:
                  (locale === "en" ? "≤ 1.8s" : "1.8秒以内"),
              },
              {
                name: "TTFB",
                label: "Time to First Byte",
                description:
                  (locale === "en" ? "Server responsiveness" : "最初のバイトまでの時間"),
                value: locale === "en" ? "Coming soon" : "準備中",
                target:
                  (locale === "en" ? "≤ 800ms" : "800ms以内"),
              },
            ].map((metric) => (
              <div key={metric.name} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {metric.name} - {metric.label}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {metric.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">
                      {metric.value}
                    </p>
                    <p className="text-xs text-slate-500">{metric.target}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Error & Availability Sample */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            {locale === "en"
              ? "Errors & availability (sample)"
              : "エラーと稼働率（サンプル指標）"}
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            {locale === "en"
              ? "In production, this would integrate with Sentry/Supabase metrics (errors in last 24h, 30-day availability). This page currently shows sample values."
              : "本番環境では Sentry や Supabase のメトリクスと連携し、「過去24時間のエラー件数」や「直近30日稼働率」をここに表示する想定です。現状は運用設計を示すためのサンプル値を表示しています。"}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">
                {locale === "en"
                  ? "App errors (last 24h)"
                  : "過去24時間のアプリケーションエラー"}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {locale === "en" ? "0" : "0 件"}
              </p>
              <p className="mt-1 text-[11px] text-emerald-600">
                {locale === "en"
                  ? "Target: < 10 / day"
                  : "目標: 10 件 / 日 未満（エラーバジェット内）"}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">
                {locale === "en" ? "Availability (last 30d)" : "直近30日の稼働率"}
              </p>
              <p className="text-2xl font-bold text-slate-900">99.9%</p>
              <p className="mt-1 text-[11px] text-slate-600">
                {locale === "en"
                  ? "SLO target: ≥ 99.5%"
                  : "SLO: 99.5% 以上を目標とした設計"}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">
                {locale === "en" ? "Critical incidents" : "重大インシデント"}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {locale === "en" ? "0" : "0 件"}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {locale === "en"
                  ? "Handled via the incident playbook (docs/operations.md)."
                  : "発生時は docs/operations.md のインシデントプレイブックに従って対応"}
              </p>
            </div>
          </div>
        </section>

        {/* Info Card */}
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-sky-50">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
              ℹ️
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {locale === "en" ? "About Web Vitals" : "Web Vitalsについて"}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {locale === "en"
                  ? "Web Vitals are user experience metrics proposed by Google. Improving them can help SEO and user satisfaction."
                  : "Web Vitalsは、Googleが提唱するウェブページのユーザー体験を測定する指標です。これらの指標を最適化することで、SEO評価の向上やユーザー満足度の改善が期待できます。"}
              </p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>
                    <strong>LCP</strong>:{" "}
                    {locale === "en"
                      ? "Loading performance"
                      : "ページの読み込みパフォーマンス"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>
                    <strong>FID</strong>:{" "}
                    {locale === "en" ? "Interactivity" : "ページの応答性"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>
                    <strong>CLS</strong>:{" "}
                    {locale === "en" ? "Visual stability" : "ページの視覚的安定性"}
                  </span>
                </li>
              </ul>
              <div className="mt-4">
                <a
                  href="https://web.dev/vitals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {locale === "en" ? "Learn more" : "詳細を見る"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

