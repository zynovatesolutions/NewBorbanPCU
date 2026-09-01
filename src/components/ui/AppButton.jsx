import React from "react";

const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-sm",
  accent:
    "bg-accent text-white hover:bg-accent-hover border border-accent shadow-sm",
  secondary:
    "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-sm",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export default function AppButton({
  children,
  title,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  loading = false,
  disabled,
  type = "button",
  ...props
}) {
  const label = title || children;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {Icon && <Icon className="text-base shrink-0" />}
      {label}
    </button>
  );
}
