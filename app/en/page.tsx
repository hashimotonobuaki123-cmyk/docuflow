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

export default async function HomeEn() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("docuhub_ai_auth")?.value === "1";

  if (isAuthed) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[128px]" />
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
                Features
              </a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login?lang=en"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup?lang=en"
                className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Start 14-day free trial
              </Link>
              <Link
                href="/"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-full px-2 py-0.5"
              >
                日本語
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
              <span>🎉 Launch Special — 14 days completely free</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              AI that
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                transforms your
              </span>
              <br />
              document workflow
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Upload PDFs & Word docs. AI automatically creates
              <strong className="text-white"> summaries, tags, and classifications</strong>.
              <br />
              Boost team productivity by <strong className="text-emerald-400">up to 40%</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup?lang=en"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                <span>Start 14-day free trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo/en"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 transition-all"
              >
                <span>Watch demo</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Setup in 5 minutes</span>
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
                alt="DocuFlow Dashboard"
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
              Trusted by teams worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {["TechCorp", "ConsultPro", "StartupX", "FinanceHub", "MediaFlow"].map((company) => (
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
                { value: "10,000+", label: "Documents processed" },
                { value: "500+", label: "Companies" },
                { value: "40%", label: "Productivity boost" },
                { value: "99.9%", label: "Uptime" },
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
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Take document management
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                to the next level
              </span>
            </h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              GPT-4 powered AI automates tedious tasks.
              Dramatically boost your team&apos;s productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "AI Auto-Summary",
                description: "Condense long documents into 3-5 key points. Reduce reading time by 80% and quickly grasp important information.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Tag,
                title: "Smart Tagging",
                description: "AI analyzes content and auto-generates optimal tags. No manual tagging needed, dramatically improving searchability.",
                gradient: "from-sky-500 to-blue-500",
              },
              {
                icon: Search,
                title: "Full-Text Search",
                description: "Search across titles, summaries, content, and tags. Find what you need instantly from thousands of documents.",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: Share2,
                title: "Secure Sharing",
                description: "Generate share links with one click. Set expiration dates and passwords to safely share sensitive information.",
                gradient: "from-rose-500 to-pink-500",
              },
              {
                icon: History,
                title: "Version Control",
                description: "All edits automatically saved. View and restore any previous version, making change tracking effortless.",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Organization-wide document management. Member permissions and activity logs provide full team visibility.",
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
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              The right plan for
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                your business
              </span>
            </h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              All plans include a 14-day free trial.
              Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-slate-400 mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Perfect for individuals and small teams</p>
              <ul className="space-y-3 mb-8">
                {["Up to 50 documents", "100MB storage", "100 AI summaries/month", "Basic search"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?lang=en"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Get started free
              </Link>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-slate-900/50 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-xs font-semibold text-white">
                Most Popular
              </div>
              <div className="text-sm font-medium text-emerald-400 mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">For professionals</p>
              <ul className="space-y-3 mb-8">
                {["1,000 documents", "5GB storage", "5,000 AI summaries/month", "Advanced search & filters", "Priority support", "Advanced analytics"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?lang=en&plan=pro"
                className="block text-center py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all"
              >
                Start 14-day free trial
              </Link>
            </div>

            {/* Team Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-sky-400 mb-2">Team</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">For growing teams</p>
              <ul className="space-y-3 mb-8">
                {["10,000 documents", "50GB storage", "50,000 AI summaries/month", "Up to 10 members", "Team management", "Custom branding", "API access"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?lang=en&plan=team"
                className="block text-center py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Start 14-day free trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-8">
              <div className="text-sm font-medium text-violet-400 mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-8">
                {["Unlimited documents", "Unlimited storage", "Unlimited AI summaries", "Unlimited members", "SSO / SAML", "Dedicated support", "SLA guarantee", "On-premise option"].map((feature) => (
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
                Contact sales
              </a>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-6 py-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                30-day money-back guarantee — Full refund if not satisfied
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
                <span>Customer Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Loved by teams
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  everywhere
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "DocuFlow has dramatically reduced the time we spend searching for documents. The AI summaries are a game-changer for our busy executives.",
                  author: "Sarah Chen",
                  role: "COO",
                  company: "TechStartup Inc.",
                  rating: 5,
                },
                {
                  quote: "Managing client proposals has never been easier. The auto-tagging feature helps us find past success stories instantly when we need them.",
                  author: "Michael Park",
                  role: "Senior Consultant",
                  company: "ConsultPro",
                  rating: 5,
                },
                {
                  quote: "Team collaboration improved significantly after adopting DocuFlow. The security features give us peace of mind when sharing sensitive documents.",
                  author: "Emily Johnson",
                  role: "Project Manager",
                  company: "GlobalTech",
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
                    &quot;{testimonial.quote}&quot;
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
              <span>Enterprise-Grade Security</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Security you can
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                trust
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "All data encrypted with AES-256 in transit and at rest",
              },
              {
                icon: Shield,
                title: "SOC 2 Type II",
                description: "Regular third-party security audits",
              },
              {
                icon: Globe,
                title: "GDPR Compliant",
                description: "Fully compliant with EU data protection regulations",
              },
              {
                icon: Clock,
                title: "99.9% Uptime SLA",
                description: "High-availability infrastructure with guaranteed uptime",
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
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Do I need a credit card for the free trial?",
                  a: "No, you don't. The 14-day free trial requires no credit card. You'll only need to add payment information if you decide to upgrade after the trial ends.",
                },
                {
                  q: "How is my data protected?",
                  a: "All data is encrypted with AES-256 and stored on SOC 2 Type II compliant infrastructure. We conduct regular security audits and maintain the highest security standards.",
                },
                {
                  q: "Can I change my plan anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the end of your current billing period.",
                },
                {
                  q: "Is team collaboration available?",
                  a: "Yes, team features are available on Team and Enterprise plans. You can invite members, manage permissions, and track activity across your organization.",
                },
                {
                  q: "What happens to my data if I cancel?",
                  a: "Your data is retained for 30 days after cancellation, during which you can reactivate your account. After 30 days, data is permanently deleted. You can export your data beforehand.",
                },
                {
                  q: "What file formats are supported?",
                  a: "We currently support PDF, Word (.doc, .docx), and text files (.txt). Support for Excel and PowerPoint is coming soon.",
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
                Ready to get started?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Try all features free for 14 days.
                No credit card required. Setup in 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup?lang=en"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                >
                  <span>Start 14-day free trial</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="mailto:sales@docuflow.io"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium"
                >
                  <span>Talk to sales</span>
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
                  AI-powered document management for modern teams.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-slate-500 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-sm text-slate-500 hover:text-white transition-colors">Pricing</a></li>
                  <li><Link href="/demo/en" className="text-sm text-slate-500 hover:text-white transition-colors">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="mailto:contact@docuflow.io" className="text-sm text-slate-500 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
              <p className="text-sm text-slate-600">
                © 2024 DocuFlow. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
                  日本語
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
