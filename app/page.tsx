import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  // ログイン済みならダッシュボードへ
  if (isAuthed) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/40 to-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/40 to-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/80 to-transparent rounded-full" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="glass border-b border-slate-200/50 sticky top-0 z-50">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Logo size="md" />
            <nav className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary"
              >
                無料で始める
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500">
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              </span>
              <span>AI搭載のドキュメント管理</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight animate-fade-in-up">
              PDF・Word を
              <span className="gradient-text"> 一瞬で要約</span>
              <br />
              スマートに整理
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed animate-fade-in-up stagger-2">
              ドキュメントをアップロードするだけで、AIが自動で
              <br className="hidden md:block" />
              <strong className="text-slate-800">要約・タグ付け・タイトル生成</strong>
              を実行します
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <Link
                href="/auth/signup"
                className="btn btn-primary px-8 py-3.5 text-base glow-hover"
              >
                <span>無料でアカウント作成</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-secondary px-8 py-3.5 text-base"
              >
                <span>ログイン</span>
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="mt-6 text-xs text-slate-500 animate-fade-in stagger-4">
              ✓ クレジットカード不要 ✓ 無料で始められます
            </p>
          </div>

          {/* Hero Image / Screenshot */}
          <div className="mt-16 relative animate-fade-in-up stagger-4">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-400">docuflow-azure.vercel.app</span>
                </div>
              </div>
              <Image
                src="/docs/screenshots/dashboard.png"
                alt="DocuFlow ダッシュボード"
                width={1200}
                height={800}
                className="w-full"
                priority={false}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-6xl px-4 py-20" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              DocuFlow の特徴
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              AIの力で、ドキュメント管理を劇的に効率化
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🤖",
                title: "AI自動要約",
                description: "GPT-4を活用し、長文ドキュメントの要点を3〜5行に凝縮。読む時間を大幅に削減。",
                color: "emerald",
              },
              {
                icon: "🏷️",
                title: "スマートタグ付け",
                description: "文書内容を解析し、最適なタグを自動生成。後から検索しやすいドキュメント管理を実現。",
                color: "sky",
              },
              {
                icon: "📄",
                title: "PDF・Word対応",
                description: "PDF / Word ファイルをドラッグ&ドロップ。テキスト抽出からAI処理まで一気通貫。",
                color: "violet",
              },
              {
                icon: "🔍",
                title: "全文検索",
                description: "タイトル・要約・本文・タグを横断検索。必要なドキュメントを瞬時に発見。",
                color: "amber",
              },
              {
                icon: "🔗",
                title: "共有リンク",
                description: "ワンクリックで共有リンクを発行。認証不要で外部に公開でき、いつでも停止可能。",
                color: "rose",
              },
              {
                icon: "📊",
                title: "バージョン管理",
                description: "編集履歴を自動保存。過去バージョンをいつでも確認でき、変更の追跡が容易。",
                color: "indigo",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card p-6 hover-lift"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}-50 text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-slate-50/50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                使い方は簡単
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                3ステップでドキュメント管理を効率化
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "アップロード",
                  description: "PDF / Word ファイルをドラッグ＆ドロップ、またはテキストを直接入力",
                },
                {
                  step: "02",
                  title: "AI処理",
                  description: "AIが自動でタイトル生成・要約作成・タグ付けを実行",
                },
                {
                  step: "03",
                  title: "整理・検索",
                  description: "タグやカテゴリで整理し、全文検索で必要な情報をすぐに発見",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-bold text-emerald-100 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">
                    {item.description}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 -right-4 text-emerald-300">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">
              最新技術で構築
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Next.js 16", "React 19", "TypeScript", "Supabase", "OpenAI", "Tailwind CSS"].map((tech) => (
              <div key={tech} className="text-sm font-medium text-slate-600">
                {tech}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 p-12 text-center text-white">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                今すぐ始めましょう
              </h2>
              <p className="text-lg text-white/90 mb-8">
                無料でアカウントを作成して、AIドキュメント管理を体験
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <span>無料で始める</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Logo size="sm" />
              <p className="text-sm text-slate-500">
                © 2024 DocuFlow. AI 要約で、PDF / Word 資料を一瞬で整理
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <Link href="/auth/login" className="hover:text-slate-900 transition-colors">
                  ログイン
                </Link>
                <Link href="/auth/signup" className="hover:text-slate-900 transition-colors">
                  新規登録
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
