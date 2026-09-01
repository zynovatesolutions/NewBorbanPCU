import { Popover } from "@mui/material";
import React from "react";
import {
  FaCaretDown,
  FaCaretSquareLeft,
  FaCaretSquareRight,
} from "react-icons/fa";

const CustomPagination = ({
  count: totalCount,
  rowsPerPage: pageSize,
  page: currentPage,
  onPageChange,
  onRowsPerPageChange,
  RowsPerPage,
}) => {
  const pageCount = Math.ceil(totalCount / pageSize) || 1;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const handlePageChange = (newPage) => {
    if (newPage === "+" && currentPage < pageCount - 1) {
      onPageChange(currentPage + 1);
    } else if (newPage === "-" && currentPage >= 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handlePageSizeChange = (val) => {
    onRowsPerPageChange(parseInt(val, 10));
  };

  const PerPage = [5, 10, 25];
  const visiblePages = 1;
  const startPage = Math.max(1, currentPage - visiblePages);
  const endPage = Math.min(pageCount, currentPage + visiblePages);

  return (
    <div className="my-3 flex flex-col items-end gap-2 pr-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Rows per page:</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {RowsPerPage}
          <FaCaretDown className="text-slate-400" />
        </button>
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
            marginTop: "6px",
            overflow: "hidden",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div className="min-w-[100px] space-y-1 p-2">
          {PerPage.map((page_) => (
            <button
              key={page_}
              type="button"
              className={[
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                page_ === RowsPerPage
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => {
                handlePageSizeChange(page_);
                handleClose();
              }}
            >
              {page_}
            </button>
          ))}
        </div>
      </Popover>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePageChange("-")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:text-slate-300"
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <FaCaretSquareLeft />
        </button>
        {pages.slice(startPage - 1, endPage).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            className={[
              "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition",
              currentPage + 1 === page
                ? "bg-slate-900 font-bold text-white"
                : "font-medium text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handlePageChange("+")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:text-slate-300"
          disabled={currentPage === pageCount - 1}
          aria-label="Next page"
        >
          <FaCaretSquareRight />
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
