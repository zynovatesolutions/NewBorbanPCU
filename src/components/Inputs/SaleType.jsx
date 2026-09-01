import React from "react";

const SaleType = ({ saleType, setSaleType }) => {
  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 sm:p-1"
      role="group"
      aria-label="Sale type"
    >
      <button
        type="button"
        onClick={() => setSaleType("SALE")}
        className={[
          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm",
          saleType === "SALE"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-900",
        ].join(" ")}
      >
        Sale
      </button>
      <button
        type="button"
        onClick={() => setSaleType("RETURN")}
        className={[
          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm",
          saleType === "RETURN"
            ? "bg-red-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-900",
        ].join(" ")}
      >
        Return
      </button>
    </div>
  );
};

export default SaleType;
