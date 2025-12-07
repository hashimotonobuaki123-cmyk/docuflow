export default function DocumentDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="skeleton h-8 w-32 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-24 rounded-lg" />
            <div className="skeleton h-9 w-24 rounded-lg" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Document Header */}
            <div className="card p-6">
              <div className="skeleton h-8 w-3/4 mb-4 rounded-lg" />
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-6 w-32 rounded-full" />
              </div>
              <div className="skeleton h-4 w-48 rounded" />
            </div>

            {/* Summary */}
            <div className="card p-6">
              <div className="skeleton h-6 w-32 mb-3 rounded" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            </div>

            {/* Content */}
            <div className="card p-6">
              <div className="skeleton h-6 w-24 mb-3 rounded" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton h-4 w-full rounded" />
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="card p-6">
              <div className="skeleton h-6 w-32 mb-4 rounded" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-4">
                    <div className="skeleton h-4 w-32 mb-2 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-6 w-24 mb-3 rounded" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}



