import Link from "next/link";
import { Logo } from "@/components/Logo";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function MarketingSimpleLayoutEn({ title, description, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/en" className="hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/en/auth/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link
                href="/en/auth/signup"
                className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Start free trial
              </Link>
              <Link
                href="/"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-full px-2 py-0.5"
              >
                JP
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
              <Link href="/en/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/en/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/en/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/en/support" className="hover:text-white transition-colors">
                Support
              </Link>
              <Link href="/en/company" className="hover:text-white transition-colors">
                Company
              </Link>
              <Link href="/en/legal-notice" className="hover:text-white transition-colors">
                Legal notice
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
