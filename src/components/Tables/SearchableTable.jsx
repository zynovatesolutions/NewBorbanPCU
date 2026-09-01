import React, { useMemo } from "react";
import { BsSearch } from "react-icons/bs";
import TableComp from "./TableComp";
import TableWrapper from "./TableWrapper";
import EmptyState from "../ui/EmptyState";

const SearchableTable = ({
  setOpenDeleteModal,
  setOpenEditModal,
  setSelected,
  CurrentData,
  setRows,
  Columns,
  SearchPlaceholder = "Search records...",
  SearchText,
  setSearchText,
  CurrentInvoice,
  SelectedCustomer,
  isLedger,
  title,
  subtitle,
}) => {
  const resultsCount = useMemo(() => CurrentData?.length ?? 0, [CurrentData]);

  return (
    <TableWrapper>
      <div className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
          <div className="min-w-0">
            {(title || subtitle) && (
              <div className="mb-3">
                {title && (
                  <div className="text-base font-bold text-slate-900">{title}</div>
                )}
                {subtitle && (
                  <div className="text-sm text-slate-500">{subtitle}</div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <BsSearch className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder={SearchPlaceholder}
                  value={SearchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              {SearchText?.length > 0 && (
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                  onClick={() => setSearchText("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="text-sm font-medium text-slate-500">
            {resultsCount} {resultsCount === 1 ? "result" : "results"}
          </div>
        </div>
      </div>

      {resultsCount > 0 ? (
        <TableComp
          isLedger={isLedger}
          SelectedCustomer={SelectedCustomer}
          setOpenEditModal={setOpenEditModal}
          setOpenDeleteModal={setOpenDeleteModal}
          setSelected={setSelected}
          AllRows={CurrentData}
          Columns={Columns}
          setRows={setRows}
          CurrentInvoice={CurrentInvoice}
        />
      ) : (
        <EmptyState
          title="No data found"
          description={
            SearchText
              ? "Try clearing the search or using different keywords."
              : "There’s nothing to show here yet."
          }
        />
      )}
    </TableWrapper>
  );
};

export default SearchableTable;
