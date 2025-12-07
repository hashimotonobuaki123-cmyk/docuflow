import { Logo } from "@/components/Logo";

// Screenshot-only demo page for English landing
// This page is not linked from the main app, only used for capturing screenshots

export default function EnglishDemoPage() {
  // Sample data for demo
  const sampleDocuments = [
    {
      id: "1",
      title: "Q4 Product Roadmap 2024",
      category: "Planning",
      summary: "Strategic product roadmap covering feature releases, timeline, and key milestones for Q4.",
      tags: ["roadmap", "strategy", "Q4"],
      date: "2024/12/05",
      isPinned: true,
    },
    {
      id: "2",
      title: "API Design Guidelines v2.0",
      category: "Technical",
      summary: "Comprehensive API design standards including REST conventions, authentication patterns, and versioning strategy.",
      tags: ["API", "design", "guidelines"],
      date: "2024/12/04",
      isPinned: false,
    },
    {
      id: "3",
      title: "Team Standup Notes - Week 49",
      category: "Meeting",
      summary: "Weekly standup summary covering sprint progress, blockers, and action items.",
      tags: ["standup", "meeting", "notes"],
      date: "2024/12/03",
      isPinned: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden border-r border-slate-200 bg-white md:flex md:w-60 md:flex-col">
        <div className="px-4 py-4">
          <Logo withTagline />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-2 text-sm text-slate-700">
          <a
            href="#"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 font-medium text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[13px]">
              📄
            </span>
            <span>Documents</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[14px]">
              📦
            </span>
            <span>Archived</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[16px] text-white">
              ＋
            </span>
            <span>New Document</span>
          </a>
          <a
            href="#"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[14px]">
              ⚙
            </span>
            <span>Settings</span>
          </a>
        </nav>
        <div className="border-t border-slate-200 px-3 py-3 text-[11px] text-slate-500">
          <a
            href="#"
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-slate-50"
          >
            <span>Log out</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-semibold text-slate-900">
                Document Workspace
              </h1>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">
                25 total · 3 pinned · 5 favorites · 2 archived
              </span>
              <span className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700">
                🆕 What's New
              </span>
              <button className="relative p-1.5 text-slate-500 hover:text-slate-700">
                🔔
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                J
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
          {/* Stats Cards */}
          <section className="grid gap-4 md:grid-cols-4">
            {/* Total Documents */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Documents</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">25</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-lg text-white shadow-lg">
                  📄
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Last activity: 2024/12/07 14:30
              </p>
            </div>

            {/* Pinned */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Pinned</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">3</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                  📌
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Shown at top of list
              </p>
            </div>

            {/* Favorites */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Favorites</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">5</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg">
                  ⭐
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Quick access to frequently used
              </p>
            </div>

            {/* Insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Insights</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    Last 30 Days
                    <span className="ml-1 text-emerald-600">12</span>
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
                  📊
                </div>
              </div>
              <dl className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <dt className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    Categories
                  </dt>
                  <dd className="font-semibold text-slate-700">6 types</dd>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <dt className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Shared
                  </dt>
                  <dd className="font-semibold text-slate-700">4</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Search Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Search (title, content, tags)
                </label>
                <input
                  type="text"
                  placeholder="e.g. API design, meeting notes..."
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </div>
              <div className="min-w-[140px]">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Category
                </label>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none">
                  <option>All</option>
                  <option>Technical</option>
                  <option>Planning</option>
                  <option>Meeting</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400">
                  Search
                </button>
                <button className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  New Document
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-500">Quick filters:</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-200">
                All
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                Pinned
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                Favorites
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                Archived
              </span>
            </div>
          </section>

          {/* Document List */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Recent Documents
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleDocuments.map((doc) => (
                <article
                  key={doc.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {doc.isPinned && (
                          <span className="text-amber-500">📌</span>
                        )}
                        <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-600">
                          {doc.title}
                        </h3>
                      </div>
                      <span className="mt-1 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                        {doc.category}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                    {doc.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{doc.date}</span>
                    <button className="text-emerald-600 hover:underline">
                      View Details →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

