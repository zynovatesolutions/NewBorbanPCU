import React, { useMemo, useState, useEffect } from "react";
import SelectPopover, { SelectOption } from "./SelectPopover";

const InvoiceSelector = ({ InvoicesData, activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) setSearchQuery("");
  }, [open]);

  const selectedInvoiceNo = useMemo(() => {
    if (!activeTab || !InvoicesData?.length) return "";
    return (
      InvoicesData.find((dt) => dt._id === activeTab)?.invoice_no?.toString() ||
      ""
    );
  }, [InvoicesData, activeTab]);

  const filteredInvoices = useMemo(() => {
    if (!InvoicesData?.length) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return InvoicesData;
    return InvoicesData.filter((inv) =>
      String(inv.invoice_no ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [InvoicesData, searchQuery]);

  return (
    <SelectPopover
      label="Invoice"
      placeholder="Select invoice"
      valueLabel={selectedInvoiceNo}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="invoice-selector"
    >
      <input
        type="search"
        placeholder="Search invoice #..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        autoFocus
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No invoices match your search
          </div>
        ) : (
          filteredInvoices.map((tab) => (
            <SelectOption
              key={tab._id}
              selected={activeTab === tab._id}
              onClick={() => {
                setActiveTab(tab._id);
                setAnchorEl(null);
              }}
            >
              {tab.invoice_no}
            </SelectOption>
          ))
        )}
      </div>
    </SelectPopover>
  );
};

export default InvoiceSelector;
