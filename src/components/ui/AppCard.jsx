import React from "react";

export default function AppCard({
  children,
  className = "",
  padding = "p-5",
  hover = false,
}) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        hover ? "transition-shadow hover:shadow-md" : "",
        padding,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
