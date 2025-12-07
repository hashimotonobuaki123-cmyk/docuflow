export default function NewDocumentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <div className="relative">
        {/* Header Skeleton */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-9 w-24 rounded-lg" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="skeleton h-8 w-48 mb-3 rounded-lg" />
            <div className="skeleton h-4 w-96 rounded-lg" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main Form */}
            <div className="card p-6 lg:p-8 space-y-6">
              <div>
                <div className="skeleton h-5 w-32 mb-2 rounded" />
                <div className="skeleton h-11 w-full rounded-lg" />
              </div>
              <div>
                <div className="skeleton h-5 w-24 mb-2 rounded" />
                <div className="skeleton h-11 w-full rounded-lg" />
              </div>
              <div>
                <div className="skeleton h-5 w-16 mb-2 rounded" />
                <div className="skeleton h-64 w-full rounded-lg" />
              </div>
              <div>
                <div className="skeleton h-5 w-40 mb-2 rounded" />
                <div className="skeleton h-32 w-full rounded-lg" />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-6 w-32 mb-3 rounded" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}



