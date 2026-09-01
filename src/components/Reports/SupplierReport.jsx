import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import PrintSimpleTable from "../Tables/PrintSimpleTable";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { ItemColumns } from "../../assets/Columns";
import { AppButton, LoadingState } from "../ui";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const branchLogo =
  "/GoldenPCU.svg";

const SupplierReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ItemState = useSelector((state) => state.ItemState);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: "Supplier Report",
    removeAfterPrint: true,
    pageStyle: `
      @page { margin: 0; size: A4; }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
      }
    `,
  });

  const columns = ItemColumns.filter(
    (col) =>
      col.id !== "actions" &&
      col.id !== "branch_name" &&
      col.id !== "sale" &&
      col.id !== "purchase" &&
      col.id !== "branch"
  );

  if (ItemState.loading) {
    return (
      <div className="py-20">
        <LoadingState label="Loading report..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pb-10">
      <div className="sticky top-0 z-20 flex w-full items-center justify-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur print:hidden">
        <button
          type="button"
          className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
        <AppButton variant="accent" onClick={() => handlePrint()}>
          Print Report
        </AppButton>
      </div>

      <div
        className="mt-6 flex w-full max-w-[1200px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:mt-0 print:w-[210mm] print:rounded-none print:border-[3px] print:border-black print:p-4 print:shadow-none"
        ref={contentToPrint}
      >
        <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900 px-2 py-5 sm:px-4">
          <img
            src={branchLogo}
            alt="Branch logo"
            className="h-16 w-auto object-contain sm:h-24"
          />
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Companies
            </p>
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">
              Supplier Report
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <PrintSimpleTable rows={ItemState.data} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default SupplierReport;
