import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className = "", id, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? `input-${reactId}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 px-3 text-sm text-slate-900 dark:text-slate-100
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700 rounded-lg
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              transition-all duration-200
              hover:border-slate-300 dark:hover:border-slate-600
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800
              ${icon ? "pl-10" : ""}
              ${iconRight ? "pr-10" : ""}
              ${error ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}
              ${className}
            `}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

// Select Component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const reactId = useId();
    const selectId = id ?? `select-${reactId}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-10 px-3 text-sm text-slate-900 dark:text-slate-100
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700 rounded-lg
            transition-all duration-200
            hover:border-slate-300 dark:hover:border-slate-600
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-rose-500" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

