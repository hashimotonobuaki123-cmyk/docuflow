import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-emerald-600 to-emerald-500 text-white
    shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.15)]
    hover:from-emerald-500 hover:to-emerald-400
    hover:shadow-[0_4px_12px_rgba(16,185,129,0.25)]
    active:from-emerald-600 active:to-emerald-600
    focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
  `,
  secondary: `
    bg-white text-slate-700 border border-slate-200
    shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    hover:bg-slate-50 hover:border-slate-300
    hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]
    active:bg-slate-100
    focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
    dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700
    dark:hover:bg-slate-700 dark:hover:border-slate-600
  `,
  ghost: `
    text-slate-600 bg-transparent
    hover:bg-slate-100 hover:text-slate-900
    active:bg-slate-200
    focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
    dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100
  `,
  danger: `
    bg-gradient-to-r from-rose-600 to-rose-500 text-white
    shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.15)]
    hover:from-rose-500 hover:to-rose-400
    hover:shadow-[0_4px_12px_rgba(244,63,94,0.25)]
    active:from-rose-600 active:to-rose-600
    focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2
  `,
  outline: `
    bg-transparent text-slate-700 border border-slate-300
    hover:bg-slate-50 hover:border-slate-400
    active:bg-slate-100
    focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
    dark:text-slate-300 dark:border-slate-600
    dark:hover:bg-slate-800 dark:hover:border-slate-500
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {size !== "icon" && children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

