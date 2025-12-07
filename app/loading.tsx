export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        {/* Animated Logo */}
        <div className="relative mx-auto mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 flex items-center justify-center animate-pulse-soft">
            <span className="text-xl font-bold text-white">DF</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-emerald-500 animate-spin-slow" />
        </div>

        {/* Loading Text */}
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          読み込み中...
        </p>

        {/* Progress Dots */}
        <div className="mt-4 flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}







