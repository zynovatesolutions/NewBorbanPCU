import React from "react";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-accent" />
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
