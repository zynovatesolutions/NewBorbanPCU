import React from "react";

const TableWrapper = ({ children, className = "" }) => {
  return (
    <div
      className={[
        "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card fade-in mb-8 mt-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

export default TableWrapper;
