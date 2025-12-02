import Link from "next/link";

type LogoProps = {
  withTagline?: boolean;
  className?: string;
};

export function Logo({ withTagline = false, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 text-slate-900 ${className}`}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 text-[11px] font-bold text-white shadow-sm">
        <span className="tracking-tight">DF</span>
        <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white/80 shadow-sm" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">DocuFlow</p>
        {withTagline && (
          <p className="text-[11px] text-slate-500">
            AI 要約で、PDF / Word 資料を一瞬で整理
          </p>
        )}
      </div>
    </Link>
  );
}
