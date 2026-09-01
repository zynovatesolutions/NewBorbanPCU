import React from "react";
import { FaFileExcel } from "react-icons/fa";

const ExportExcelBtn = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
    >
      <FaFileExcel className="text-base shrink-0" />
      Export
    </button>
  );
};

export default ExportExcelBtn;
