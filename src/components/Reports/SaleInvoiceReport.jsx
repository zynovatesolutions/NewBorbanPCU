import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import ReceiptTable from "../Tables/ReceiptTable";
import { GetInvoiceDataApi } from "../../ApiRequests";
import { AppButton, LoadingState } from "../ui";
import {
  getThermalPageStyle,
  loadAppConfig,
} from "../../utils/appConfig";

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(Number(value || 0));

const A4_PAGE_STYLE = `
  @page { margin: 0; size: A4; }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }
  }
`;

const SaleInvoiceReport = () => {
  const [CurrentInvoiceData, setCurrentInvoiceData] = useState("");
  const [FetchingLoading, setFetchingLoading] = useState(false);
  const [appConfig] = useState(() => loadAppConfig());
  const { id: CurrentBillNo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isThermal = searchParams.get("format") === "thermal";
  const thermalW = appConfig.thermalWidthMm || 80;
  const thermalFont = appConfig.thermalFontSizePx || 11;

  const GetInvoiceData = async () => {
    setFetchingLoading(true);
    try {
      const response = await GetInvoiceDataApi({
        invoiceId: CurrentBillNo,
        type: 1,
      });
      setCurrentInvoiceData(response.data.data.payload);
    } catch (err) {
      console.log(err);
    }
    setFetchingLoading(false);
  };

  useEffect(() => {
    if (CurrentBillNo !== "") {
      GetInvoiceData();
    }
  }, [CurrentBillNo]);

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: "Sale Invoice",
    removeAfterPrint: true,
    pageStyle: isThermal ? getThermalPageStyle(thermalW) : A4_PAGE_STYLE,
  });

  const invoiceInfo = CurrentInvoiceData?.Invoice_Info;
  const lineItems = CurrentInvoiceData?.Data || [];

  const grandTotal = useMemo(() => {
    if (invoiceInfo?.total_amount != null) return Number(invoiceInfo.total_amount);
    return lineItems.reduce((sum, row) => sum + Number(row?.amount || 0), 0);
  }, [invoiceInfo, lineItems]);

  if (FetchingLoading) {
    return (
      <div className="py-20">
        <LoadingState label="Loading invoice..." />
      </div>
    );
  }

  if (isThermal) {
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
            Print Thermal
          </AppButton>
        </div>

        <div
          ref={contentToPrint}
          className="mt-6 max-w-full bg-white p-3 text-black shadow-sm print:mt-0 print:shadow-none"
          style={{
            width: `${thermalW}mm`,
            fontSize: `${thermalFont}px`,
          }}
        >
          <div className="border-b border-dashed border-black pb-2 text-center">
            {appConfig.logoUrl ? (
              <img
                src={appConfig.logoUrl}
                alt=""
                className="mx-auto mb-1 h-12 object-contain"
              />
            ) : null}
            <div className="text-sm font-bold">
              {appConfig.appName || "Golden Plus PCU"}
            </div>
            {(appConfig.companyAddress || appConfig.companyContact) && (
              <div className="mt-0.5 text-[10px] leading-snug">
                {appConfig.companyAddress ? (
                  <div>{appConfig.companyAddress}</div>
                ) : null}
                {appConfig.companyContact ? (
                  <div>Tel: {appConfig.companyContact}</div>
                ) : null}
              </div>
            )}
            <div className="mt-0.5 text-[10px] uppercase tracking-wide">
              Sale Invoice
            </div>
          </div>

          <div className="space-y-0.5 border-b border-dashed border-black py-2">
            <div className="flex justify-between gap-2">
              <span>Invoice #</span>
              <span className="font-semibold">
                {invoiceInfo?.invoice_no ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Date</span>
              <span>
                {invoiceInfo?.date
                  ? moment(new Date(invoiceInfo.date * 1000)).format(
                      "DD/MM/YYYY"
                    )
                  : "—"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Customer: </span>
              {invoiceInfo?.customerId?.name || "—"}
            </div>
            {invoiceInfo?.desc ? (
              <div>
                <span className="font-semibold">Note: </span>
                {invoiceInfo.desc}
              </div>
            ) : null}
          </div>

          <div className="border-b border-dashed border-black py-2">
            <table
              className="w-full border-collapse"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col />
                <col style={{ width: "2.25rem" }} />
                <col style={{ width: "4.75rem" }} />
              </colgroup>
              <thead>
                <tr className="text-[10px] font-bold uppercase">
                  <th className="pb-1 text-left font-bold">Item</th>
                  <th className="pb-1 text-right font-bold">Qty</th>
                  <th className="pb-1 text-right font-bold">Amt</th>
                </tr>
              </thead>
              <tbody>
                {(lineItems.length ? lineItems : [{}]).map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-dotted border-slate-300 align-top"
                  >
                    <td className="min-w-0 py-1 pr-1">
                      <div className="font-semibold leading-tight">
                        {row?.article_name || row?.name || "—"}
                      </div>
                      <div className="text-[10px] leading-tight text-slate-600">
                        {row?.article_size || row?.size || ""}
                        {row?.price != null ? ` · ${formatPKR(row.price)}` : ""}
                      </div>
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {row?.qty ?? "—"}
                    </td>
                    <td className="py-1 text-right font-semibold tabular-nums">
                      {row?.amount != null ? formatPKR(row.amount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-2 text-sm font-bold">
            <span>Total</span>
            <span>{formatPKR(grandTotal)}</span>
          </div>
          <div className="mt-3 text-center text-[10px] text-slate-500">
            Thank you
          </div>
        </div>
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
          Print Invoice
        </AppButton>
      </div>

      <div
        className="mt-6 flex w-full max-w-[1200px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:mt-0 print:w-[210mm] print:rounded-none print:border-[3px] print:border-black print:p-4 print:shadow-none"
        ref={contentToPrint}
      >
        <div className="border-b-2 border-slate-900 py-5 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
          Sale Invoice
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-7">
          <img
            src={appConfig.logoUrl || "/GoldenPCU.svg"}
            alt="Branch logo"
            className="h-20 w-auto object-contain sm:h-[150px] sm:w-[150px]"
          />
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900 sm:text-xl">
              Invoice No {invoiceInfo?.invoice_no ?? "—"}
            </div>
            <div className="text-sm text-slate-500 sm:text-lg">
              {invoiceInfo?.date
                ? moment(new Date(invoiceInfo.date * 1000)).format("DD/MM/YYYY")
                : "—"}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col items-start justify-start gap-1 px-4 sm:px-5">
          <div className="flex gap-x-1 text-slate-600">
            <div className="font-bold">Customer Name:</div>
            <div>{invoiceInfo?.customerId?.name || "—"}</div>
          </div>
          <div className="flex gap-x-1 text-slate-600">
            <div className="font-bold">Address:</div>
            <div>{invoiceInfo?.customerId?.address || "—"}</div>
          </div>
          {invoiceInfo?.desc && (
            <div className="flex gap-x-1 text-slate-600">
              <div className="font-bold">Description:</div>
              <div>{invoiceInfo.desc}</div>
            </div>
          )}
        </div>

        <div className="mx-2 overflow-hidden rounded-lg border border-slate-200 sm:mx-5">
          <ReceiptTable Data={lineItems.length ? lineItems : [{}]} />
        </div>

        <div className="flex justify-end p-3 px-5 text-slate-900">
          <div className="flex gap-x-2 text-base font-bold sm:text-lg">
            <span>Grand Total:</span>
            <span>{formatPKR(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceReport;
