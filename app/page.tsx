import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import {
  Check,
  Zap,
  Shield,
  Users,
  BarChart3,
  Globe,
  Clock,
  Lock,
  Star,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Share2,
  Tag,
  History,
} from "lucide-react";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  if (isAuthed) {
    redirect("/app");
  }

  // LPの価格表示も Stripe の Price を正とする（表示と請求のズレを防ぐ）
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceIds = {
    pro: process.env.STRIPE_PRICE_PRO_MONTH,
    team: process.env.STRIPE_PRICE_TEAM_MONTH,
  } as const;

  const formatRecurringLabel = (interval?: string | null, intervalCount?: number | null) => {
    if (!interval) return "";
    const count = intervalCount && intervalCount > 1 ? intervalCount : 1;
    const unit =
      interval === "day"
        ? "日"
        : interval === "week"
          ? "週"
          : interval === "month"
            ? "月"
            : interval === "year"
              ? "年"
              : "";
    if (!unit) return "";
    return count === 1 ? `/${unit}` : `/${count}${unit}`;
  };

  const formatCurrency = (currency: string, amount: number) => {
    try {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
    }
  };

  const lpPrices: Partial<
    Record<
      "pro" | "team",
      { label: string; recurringLabel: string }
    >
  > = {};

  if (stripeSecret && (priceIds.pro || priceIds.team)) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
      await Promise.all(
        (Object.keys(priceIds) as Array<keyof typeof priceIds>).map(async (k) => {
          const priceId = priceIds[k];
          if (!priceId) return;
          const price = await stripe.prices.retrieve(priceId);
          if (typeof price.unit_amount !== "number" || !price.currency) return;
          lpPrices[k] = {
            label: formatCurrency(price.currency, price.unit_amount),
            recurringLabel: formatRecurringLabel(
              price.recurring?.interval,
              price.recurring?.interval_count,
            ),
          };
        }),
      );
    } catch {
      // LPはベストエフォート（価格表示が取れない場合は固定表示へフォールバック）
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[128px]" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <Logo size="md" />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                機能
              </a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                料金
              </a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">
                お客様の声
              </a>
              <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                14日間無料で試す
              </Link>
              <Link
                href="/en"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-full px-2 py-0.5"
              >
                EN
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 mb-8">
              <Sparkles className="h-4 w-4" />
              <span>🎉 リリース記念 — 今なら14日間完全無料</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              AIが、あなたの
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                ドキュメント業務を
              </span>
              <br />
              革新する
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              PDF・Word をアップロードするだけで、AIが自動で
              <strong className="text-white">要約・タグ付け・分類</strong>。
              <br />
              チーム全体の生産性を<strong className="text-emerald-400">最大40%向上</strong>。
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                <span>14日間無料トライアル</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo/en"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
              >
                <span>デモを見る</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>クレジットカード不要</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>いつでもキャンセル可能</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>5分で導入完了</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500">app.docuflow.io</span>
                </div>
              </div>
              <Image
                src="/screenshots/dashboard.png"
                alt="DocuFlow ダッシュボード"
                width={1400}
                height={900}
                className="w-full"
                priority
              />
            </div>
          </div>

          {/* Social Proof - Logos */}
          <div className="mt-20 text-center">
            <p className="text-sm text-slate-500 mb-8">
              日本全国の企業・チームに選ばれています
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {["スタートアップ A社", "コンサル B社", "IT企業 C社", "製造業 D社", "金融 E社"].map((company) => (
                <div key={company} className="text-sm font-semibold text-slate-400 tracking-wide">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-white/5 bg-slate-900/50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10,000+", label: "処理ドキュメント数" },
                { value: "500+", label: "導入企業" },
                { value: "40%", label: "業務効率の向上" },
                { value: "99.9%", label: "稼働率" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-24" id="features">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-2 text-sm font-medium text-sky-400 mb-6">
              <Zap className="h-4 w-4" />
              <span>強力な機能</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              ドキュメント管理を
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                次のレベルへ
              </span>
            </h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              GPT-4搭載のAIが、面倒な作業を自動化。
              チームの生産性を劇的に向上させます。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "AI自動要約",
                description: "長文ドキュメントをAIが3〜5行に凝縮。読む時間を80%削減し、重要な情報だけを素早くキャッチ。",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Tag,
                title: "スマートタグ付け",
                description: "文書内容を解析し、最適なタグを自動生成。手動でのタグ付け作業が不要になり、検索性が大幅に向上。",
                gradient: "from-sky-500 to-blue-500",
              },
              {
                icon: Search,
                title: "全文検索",
                description: "タイトル・要約・本文・タグを横断検索。数万件のドキュメントから目的の情報を瞬時に発見。",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: Share2,
                title: "セキュアな共有",
                description: "ワンクリックで共有リンクを発行。有効期限設定やパスワード保護で、機密情報も安全に共有。",
                gradient: "from-rose-500 to-pink-500",
              },
              {
                icon: History,
                title: "バージョン管理",
                description: "すべての編集履歴を自動保存。いつでも過去バージョンを確認・復元でき、変更の追跡が容易。",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Users,
                title: "チームコラボレーション",
                description: "組織単位でのドキュメント管理。メンバーの権限設定やアクティビティログで、チーム全体を可視化。",
                gradient: "from-indigo-500 to-blue-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/50 p-8 hover:border-white/10 transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mx-auto max-w-7xl px-4 py-24" id="pricing">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-sm font-medium text-violet-400 mb-6">
              <BarChart3 className="h-4 w-4" />
              <span>シンプルな料金体系</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              あなたのビジネスに
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                最適なプラン
              </span>
            </h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              すべてのプランで14日間の無料トライアル付き。
              いつでもアップグレード・ダウングレード可能。
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-slate-400 mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-slate-500">/月</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">個人利用や小規模チームに最適</p>
              <ul className="space-y-3 mb-8">
                {["50ドキュメントまで", "100MB ストレージ", "AI要約 100回/月", "基本的な検索機能"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                無料で始める
              </Link>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-slate-900/50 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-xs font-semibold text-white">
                人気No.1
              </div>
              <div className="text-sm font-medium text-emerald-400 mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">
                  {lpPrices.pro?.label ?? "$19"}
                </span>
                <span className="text-slate-500">
                  {lpPrices.pro?.recurringLabel ?? "/月"}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">プロフェッショナル向け</p>
              <ul className="space-y-3 mb-8">
                {["1,000ドキュメント", "5GB ストレージ", "AI要約 5,000回/月", "高度な検索・フィルター", "優先サポート", "高度な分析機能"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=pro"
                className="block text-center py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all"
              >
                14日間無料で試す
              </Link>
            </div>

            {/* Team Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-sky-400 mb-2">Team</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">
                  {lpPrices.team?.label ?? "$49"}
                </span>
                <span className="text-slate-500">
                  {lpPrices.team?.recurringLabel ?? "/月"}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">成長中のチーム向け</p>
              <ul className="space-y-3 mb-8">
                {["10,000ドキュメント", "50GB ストレージ", "AI要約 50,000回/月", "10メンバーまで", "チーム管理機能", "カスタムブランディング", "API アクセス"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=team"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                14日間無料で試す
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-violet-400 mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">お問合せ</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">大規模組織向け</p>
              <ul className="space-y-3 mb-8">
                {["無制限ドキュメント", "無制限ストレージ", "無制限AI要約", "無制限メンバー", "SSO / SAML連携", "専用サポート", "SLA保証", "オンプレミス対応"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@docuflow.io"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                お問い合わせ
              </a>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-6 py-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                30日間返金保証 — ご満足いただけなければ全額返金
              </span>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="border-y border-white/5 bg-slate-900/50 py-24" id="testimonials">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 mb-6">
                <Star className="h-4 w-4" />
                <span>お客様の声</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                導入企業からの
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  高い評価
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "DocuFlowを導入してから、社内資料の検索時間が劇的に短縮されました。AIによる自動要約機能は、忙しい経営層にとって特に重宝しています。",
                  author: "田中 健太",
                  role: "COO",
                  company: "テックスタートアップ A社",
                  rating: 5,
                },
                {
                  quote: "クライアントへの提案資料の整理が格段に楽になりました。タグ付けの自動化により、過去の成功事例をすぐに見つけられるようになりました。",
                  author: "佐藤 美咲",
                  role: "シニアコンサルタント",
                  company: "コンサルティング B社",
                  rating: 5,
                },
                {
                  quote: "チーム全体でのドキュメント共有が効率化され、プロジェクトの進行がスムーズになりました。セキュリティ面も安心して利用できます。",
                  author: "山田 太郎",
                  role: "プロジェクトマネージャー",
                  company: "IT企業 C社",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-slate-900/50 p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role} — {testimonial.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Trust Section */}
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 mb-6">
              <Shield className="h-4 w-4" />
              <span>エンタープライズグレードのセキュリティ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              安心して使える
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                セキュリティ
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "エンドツーエンド暗号化",
                description: "すべてのデータは転送時・保存時ともにAES-256で暗号化",
              },
              {
                icon: Shield,
                title: "SOC 2 Type II 準拠",
                description: "第三者機関によるセキュリティ監査を定期的に実施",
              },
              {
                icon: Globe,
                title: "GDPR 対応",
                description: "EUのデータ保護規則に完全準拠した運用体制",
              },
              {
                icon: Clock,
                title: "99.9% 稼働率保証",
                description: "SLA付きの高可用性インフラストラクチャ",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                  <item.icon className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-white/5 bg-slate-900/50 py-24" id="faq">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                よくある質問
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "無料トライアル期間中にクレジットカードは必要ですか？",
                  a: "いいえ、不要です。14日間の無料トライアルは、クレジットカード登録なしでお試しいただけます。トライアル終了後、有料プランに移行する場合にのみ支払い情報の登録をお願いしています。",
                },
                {
                  q: "データのセキュリティはどのように保護されていますか？",
                  a: "すべてのデータはAES-256で暗号化され、SOC 2 Type II準拠のインフラストラクチャで保管されています。また、定期的なセキュリティ監査を実施し、最新のセキュリティ対策を講じています。",
                },
                {
                  q: "いつでもプランを変更できますか？",
                  a: "はい、いつでもプランのアップグレード・ダウングレードが可能です。アップグレードの場合は即座に反映され、ダウングレードの場合は現在の請求期間終了後に適用されます。",
                },
                {
                  q: "チームでの利用は可能ですか？",
                  a: "はい、Teamプラン以上でチーム機能をご利用いただけます。メンバーの招待、権限管理、アクティビティログなど、チームでの効率的なドキュメント管理が可能です。",
                },
                {
                  q: "解約した場合、データはどうなりますか？",
                  a: "解約後30日間はデータを保持しており、その間であればいつでも再開可能です。30日経過後、データは完全に削除されます。エクスポート機能を使って事前にデータをバックアップすることもできます。",
                },
                {
                  q: "どのようなファイル形式に対応していますか？",
                  a: "PDF、Word（.doc、.docx）、テキストファイル（.txt）に対応しています。今後、Excel、PowerPointなどへの対応も予定しています。",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                今すぐ始めましょう
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                14日間の無料トライアルで、DocuFlowの全機能をお試しください。
                クレジットカード不要、5分で導入完了。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                >
                  <span>14日間無料で始める</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="mailto:sales@docuflow.io"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium"
                >
                  <span>営業チームに相談する</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <Logo size="md" />
                <p className="mt-4 text-sm text-slate-500">
                  AIの力で、ドキュメント管理を革新する。
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">製品</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-slate-500 hover:text-white transition-colors">機能</a></li>
                  <li><a href="#pricing" className="text-sm text-slate-500 hover:text-white transition-colors">料金</a></li>
                  <li><Link href="/demo/en" className="text-sm text-slate-500 hover:text-white transition-colors">デモ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">会社情報</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">会社概要</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">採用情報</a></li>
                  <li><a href="mailto:contact@docuflow.io" className="text-sm text-slate-500 hover:text-white transition-colors">お問い合わせ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">法的情報</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">利用規約</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">プライバシーポリシー</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">特定商取引法に基づく表記</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
              <p className="text-sm text-slate-600">
                © 2024 DocuFlow. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/en" className="text-sm text-slate-500 hover:text-white transition-colors">
                  English
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
