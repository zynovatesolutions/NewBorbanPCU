import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import ReportTable from "../Tables/ReportTable";
import CityFilter from "../Selector/CityFilter";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = userData ? Number(userData.role) : "";
const branchId = "";

const OgraiColumns = [
  { id: "name", title: "Name" },
  { id: "address", title: "Address" },
  {
    id: "remaining",
    title: "Remaining",
    format: (value) => (value != null ? Number(value).toLocaleString("en-US") : ""),
  },
  { id: "ded_less", title: "Ded/Less" },
  { id: "received", title: "Received" },
  { id: "copy_balance", title: "Copy Balance" },
];

const CustomersOgraiReport = () => {
  const [SelectedCities, setSelectedCities] = useState([]);
  const [HideZeroRemaining, setHideZeroRemaining] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CustomerState = useSelector((state) => state.CustomerState);

  useEffect(() => {
    let mounted = false;
    if (!mounted) {
      dispatch(fetchCustomers());
    }
    mounted = true;
  }, [dispatch]);

  const rows = useMemo(() => {
    const data = CustomerState.data || [];
    let filtered =
      SelectedCities.length === 0
        ? data
        : data.filter((c) => SelectedCities.includes(c.address || ""));
    if (HideZeroRemaining) {
      filtered = filtered.filter((c) => (c.remaining ?? 0) !== 0);
    }
    return filtered.map((c) => ({
      name: c.name || "",
      address: c.address || "",
      remaining: c.remaining ?? 0,
      ded_less: "",
      received: "",
      copy_balance: "",
    }));
  }, [CustomerState.data, SelectedCities, HideZeroRemaining]);

  const summary = useMemo(() => {
    const totalRemaining = rows.reduce((s, r) => s + (Number(r.remaining) || 0), 0);
    return { count: rows.length, totalRemaining };
  }, [rows]);

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: "Customers Ograi Report",
    removeAfterPrint: true,
    pageStyle: `
      @page { margin: 0; size: A4; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        html { margin: 0; padding: 0; }
      }
    `,
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Toolbar — compact, with report identity */}
      <header className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-200/80 shadow-sm print:hidden shrink-0">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
          >
            <FaArrowLeft className="text-xs" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 ml-12 sm:ml-14 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">Report</span>
              <span className="font-semibold text-slate-800">Ograi</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="max-w-[220px] w-full">
                <CityFilter
                  selectedCities={SelectedCities}
                  onSelectionChange={setSelectedCities}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={HideZeroRemaining}
                  onChange={(e) => setHideZeroRemaining(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                />
                <span className="text-xs font-medium text-slate-600">Hide zero remaining</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaPrint className="text-xs opacity-90" />
              Print report
            </button>
          </div>
        </div>
      </header>

      {/* Live summary — only in screen view */}
      <div className="print:hidden max-w-[1200px] mx-auto w-full px-4 sm:px-6 pt-4">
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm">
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{summary.count}</span> customer{summary.count !== 1 ? "s" : ""}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-600">
            Total remaining <span className="font-semibold text-slate-800">Rs {summary.totalRemaining.toLocaleString("en-PK")}</span>
          </span>
          {SelectedCities.length > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                {SelectedCities.length === 1 ? SelectedCities[0] : `${SelectedCities.length} cities`}
              </span>
            </>
          )}
          {HideZeroRemaining && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Non-zero only</span>
            </>
          )}
        </div>
      </div>

      {/* Report content — print boundary */}
      <main
        className="flex flex-col w-full flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 pb-10 print:pt-0 print:pb-0 print:px-0 scroll-mt-20 print:border-[3px] print:border-black print:max-w-none rounded-xl print:rounded-none mt-2 print:mt-0"
        ref={contentToPrint}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 bg-white py-5 print:py-4 rounded-t-xl px-4 sm:px-6">
          <img
            src={
              "/GoldenPCU.svg"
            }
            alt="Logo"
            className="h-9 w-auto self-center sm:self-auto"
          />
          <div className="text-center sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Ograi Report</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {SelectedCities.length === 0 ? "All cities" : SelectedCities.length === 1 ? SelectedCities[0] : `${SelectedCities.length} cities`}
              {HideZeroRemaining ? " · Non-zero remaining" : ""}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl overflow-hidden shadow-sm">
          <ReportTable
            rows={rows}
            columns={OgraiColumns}
            stickyOffset={0}
            headerBg="#000"
            borderColor="#000"
          />
        </div>
      </main>
    </div>
  );
};

export default CustomersOgraiReport;
