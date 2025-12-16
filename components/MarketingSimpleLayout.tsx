import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getPreferredLocale } from "@/lib/serverLocale";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export async function MarketingSimpleLayout({ title, description, children }: Props) {
  const locale = await getPreferredLocale();
  const loginHref = locale === "en" ? "/en/auth/login" : "/auth/login";
  const signupHref = locale === "en" ? "/en/auth/signup" : "/auth/signup";
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={loginHref}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                ログイン
              </Link>
              <Link
                href={signupHref}
                className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                14日間無料で試す
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-sm text-slate-400">{description}</p>
            )}
          </div>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 md:p-8">
            <div className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-emerald-300">
              {children}
            </div>
          </section>

          <footer className="mt-10 border-t border-white/5 pt-8 text-sm text-slate-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} DocuFlow. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/tokusho" className="hover:text-white transition-colors">
                特定商取引法に基づく表記
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                サポート
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}


