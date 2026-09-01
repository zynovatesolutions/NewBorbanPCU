import React from "react";
import { BiSolidChevronDown } from "react-icons/bi";
import { Popover } from "@mui/material";

/**
 * Shared selector trigger + popover shell.
 * Preserves parent-driven selection logic; only standardizes UI.
 */
export default function SelectPopover({
  label,
  valueLabel,
  valueHint,
  placeholder = "Select",
  open,
  anchorEl,
  onOpen,
  onClose,
  children,
  popoverId,
}) {
  const id = open ? popoverId || "select-popover" : undefined;

  return (
    <div className="relative w-full">
      <button
        type="button"
        aria-describedby={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onOpen}
        className={[
          "w-full flex items-center justify-between gap-3",
          "rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm",
          "transition hover:border-slate-300 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
        ].join(" ")}
      >
        <div className="min-w-0 flex-1">
          {label && (
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {label}
            </div>
          )}
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {valueLabel || placeholder}
          </div>
          {valueHint ? (
            <div className="mt-0.5 truncate text-xs text-slate-500">{valueHint}</div>
          ) : null}
        </div>
        <BiSolidChevronDown
          className={[
            "shrink-0 text-xl text-slate-500 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
            width: anchorEl ? anchorEl.offsetWidth : "auto",
            maxHeight: "60vh",
            marginTop: "6px",
            overflow: "hidden",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className="bg-white p-2">{children}</div>
      </Popover>
    </div>
  );
}

export function SelectOption({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition",
        selected
          ? "bg-slate-900 text-white font-semibold"
          : "text-slate-700 hover:bg-slate-50 font-medium",
      ].join(" ")}
    >
      <span
        className={[
          "h-4 w-4 shrink-0 rounded-full border-2",
          selected ? "border-white bg-accent" : "border-slate-300",
        ].join(" ")}
      />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
