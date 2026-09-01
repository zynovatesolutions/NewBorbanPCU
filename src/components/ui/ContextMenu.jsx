import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiDotsVertical } from "react-icons/hi";

export default function ContextMenu({
  actions = [],
  align = "right",
  triggerClassName = "",
  label = "Actions",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth || 160;
    const menuHeight = menuRef.current?.offsetHeight || 0;
    const gap = 4;

    let left =
      align === "right" ? rect.right - menuWidth : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    let top = rect.bottom + gap;
    if (top + menuHeight > window.innerHeight - 8 && rect.top > menuHeight) {
      top = rect.top - menuHeight - gap;
    }

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, align, actions.length]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onReposition = () => updatePosition();

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, align]);

  if (!actions.length) return null;

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[9999] min-w-[160px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {actions.map((action, idx) => {
            if (action.hidden) return null;
            const Icon = action.icon;
            return (
              <button
                key={action.key || action.label || idx}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors",
                  action.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50",
                  action.disabled ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              >
                {Icon && <Icon className="shrink-0 text-base" />}
                {action.label}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
          triggerClassName,
        ].join(" ")}
      >
        <HiDotsVertical className="text-base" />
      </button>
      {menu}
    </>
  );
}
