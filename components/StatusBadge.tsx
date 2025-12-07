type StatusBadgeProps = {
  status: "success" | "warning" | "error" | "info" | "neutral";
  label: string;
  icon?: string;
  pulse?: boolean;
  size?: "sm" | "md";
};

const statusStyles = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    border: "border-red-200 dark:border-red-800",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    border: "border-sky-200 dark:border-sky-800",
  },
  neutral: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
    border: "border-slate-200 dark:border-slate-700",
  },
};

export function StatusBadge({
  status,
  label,
  icon,
  pulse = false,
  size = "md",
}: StatusBadgeProps) {
  const styles = statusStyles[status];
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.dot}`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${styles.dot}`}
          />
        </span>
      )}
      {icon && !pulse && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
}

// Preset status badges
export function SharedBadge() {
  return <StatusBadge status="success" label="共有中" icon="🔗" />;
}

export function ArchivedBadge() {
  return <StatusBadge status="neutral" label="アーカイブ" icon="📦" />;
}

export function PinnedBadge() {
  return <StatusBadge status="warning" label="ピン留め" icon="📌" />;
}

export function FavoriteBadge() {
  return <StatusBadge status="error" label="お気に入り" icon="⭐" />;
}

export function ProcessingBadge() {
  return <StatusBadge status="info" label="処理中" pulse />;
}

export function NewBadge() {
  return <StatusBadge status="success" label="NEW" pulse size="sm" />;
}







