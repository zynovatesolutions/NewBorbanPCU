import React from "react";
import { FiInbox } from "react-icons/fi";

export default function EmptyState({
  title = "No data found",
  description = "There’s nothing to show here yet.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FiInbox className="text-2xl" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
