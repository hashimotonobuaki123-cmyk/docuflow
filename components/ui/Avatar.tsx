import { forwardRef, type HTMLAttributes } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  fallback?: string;
  status?: "online" | "offline" | "busy" | "away";
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  busy: "bg-rose-500",
  away: "bg-amber-500",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "md", src, alt, fallback, status, className = "", ...props }, ref) => {
    const initials = fallback || alt?.charAt(0).toUpperCase() || "U";

    return (
      <div ref={ref} className={`relative inline-flex shrink-0 ${className}`} {...props}>
        <div
          className={`${sizeStyles[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-br from-emerald-500 to-sky-500 text-white ring-2 ring-white dark:ring-slate-900`}
        >
          {src ? (
            // NOTE: next/image は remotePatterns 設定が必要になるため、Avatarは <img> のまま許可する
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt || "Avatar"} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {status && (
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${statusColors[status]}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Avatar Group
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: React.ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 4, children, className = "", ...props }, ref) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visible = childArray.slice(0, max);
    const remaining = childArray.length - max;

    return (
      <div ref={ref} className={`flex -space-x-2 ${className}`} {...props}>
        {visible}
        {remaining > 0 && (
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium bg-slate-200 text-slate-600 ring-2 ring-white dark:ring-slate-900 dark:bg-slate-700 dark:text-slate-300">
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

