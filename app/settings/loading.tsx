export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Settings Menu */}
        <div className="card p-6">
          <div className="skeleton h-5 w-32 mb-4 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="skeleton h-5 w-32 mb-2 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Data Export */}
        <div className="card p-6">
          <div className="skeleton h-5 w-40 mb-3 rounded" />
          <div className="skeleton h-4 w-full mb-4 rounded" />
          <div className="skeleton h-9 w-48 rounded-full" />
        </div>

        {/* Delete Account */}
        <div className="card p-6 border-red-200">
          <div className="skeleton h-5 w-32 mb-3 rounded" />
          <div className="skeleton h-4 w-full mb-4 rounded" />
          <div className="skeleton h-9 w-32 rounded-full" />
        </div>
      </main>
    </div>
  );
}



