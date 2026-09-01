import React from "react";

export default function AppInput({
  label,
  error,
  hint,
  className = "",
  inputClassName = "",
  required,
  ...props
}) {
  return (
    <label className={["block w-full", className].join(" ")}>
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}
      <input
        className={[
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900",
          "placeholder:text-slate-400 outline-none transition-shadow",
          "focus:border-accent focus:ring-2 focus:ring-accent/20",
          error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "",
          inputClassName,
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </label>
  );
}
