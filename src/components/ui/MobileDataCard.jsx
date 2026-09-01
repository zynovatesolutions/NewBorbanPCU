import React from "react";
import ContextMenu from "./ContextMenu";
import StatusBadge from "./StatusBadge";
import {
  formatCellValue,
  getDisplayColumns,
  getPrimaryColumn,
} from "../../utils/tableFormatters";

export default function MobileDataCard({
  data,
  columns,
  actions = [],
  highlightRemaining = false,
}) {
  const displayColumns = getDisplayColumns(columns);
  const primaryColumn = getPrimaryColumn(columns);
  const primaryValue = primaryColumn
    ? formatCellValue(data, primaryColumn)
    : "Record";

  const secondaryColumns = displayColumns.filter(
    (col) => col.id !== primaryColumn?.id
  );

  const remainingCol = secondaryColumns.find((c) => c.id === "remaining");
  const amountCols = secondaryColumns.filter((c) =>
    ["total", "amount", "paid", "total_amount", "expense", "payable"].includes(
      c.id
    )
  );
  const metaCols = secondaryColumns.filter(
    (c) =>
      c !== remainingCol &&
      !amountCols.includes(c) &&
      !["status", "type"].includes(c.id)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-slate-900">
            {primaryValue || "-"}
          </div>
          {data.invoice_no != null && (
            <div className="mt-0.5 text-xs text-slate-500">
              #{data.invoice_no}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {remainingCol && Number(data.remaining) > 0 && (
            <StatusBadge tone="warning">Due</StatusBadge>
          )}
          {actions.length > 0 && <ContextMenu actions={actions} />}
        </div>
      </div>

      {amountCols.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {amountCols.slice(0, 4).map((col) => (
            <div key={col.id}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {col.title}
              </div>
              <div
                className={[
                  "mt-0.5 text-sm font-bold",
                  col.id === "remaining" && highlightRemaining
                    ? "text-amber-700"
                    : "text-slate-900",
                ].join(" ")}
              >
                {formatCellValue(data, col) || "-"}
              </div>
            </div>
          ))}
        </div>
      )}

      {metaCols.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {metaCols.slice(0, 5).map((col) => (
            <div key={col.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-slate-500 shrink-0">{col.title}</span>
              <span className="text-right font-medium text-slate-800 break-words">
                {formatCellValue(data, col) || "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
