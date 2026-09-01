import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";
import CreateCustomerModal from "../Modals/CreateCustomer";
import EditCustomerModal from "../Modals/EditCustomerModal";
import { WarningToast } from "../../utils/ShowToast";

const CustomerSelector = ({ SelectedCustomer, setSelectedCustomer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const [OpenCreate, setOpenCreate] = useState(false);
  const [OpenEdit, setOpenEdit] = useState(false);
  const dispatch = useDispatch();
  const CustomerState = useSelector((state) => state.CustomerState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const selectedCustomerName =
    SelectedCustomer && typeof SelectedCustomer === "object" && SelectedCustomer?.name
      ? SelectedCustomer.name
      : "";
  const selectedCustomerAddress =
    SelectedCustomer &&
    typeof SelectedCustomer === "object" &&
    (SelectedCustomer?.address ?? SelectedCustomer?.Address)
      ? SelectedCustomer?.address ?? SelectedCustomer?.Address
      : "";
  const selectedCustomerId =
    SelectedCustomer && typeof SelectedCustomer === "object"
      ? SelectedCustomer?._id
      : "";

  // Keep selected customer label in sync after Edit saves
  useEffect(() => {
    if (!selectedCustomerId) return;
    const fresh = (CustomerState?.data ?? []).find(
      (c) => c?._id === selectedCustomerId
    );
    if (!fresh) return;
    const same =
      fresh.name === SelectedCustomer?.name &&
      (fresh.address ?? fresh.Address) ===
        (SelectedCustomer?.address ?? SelectedCustomer?.Address) &&
      fresh.contact === SelectedCustomer?.contact;
    if (!same) setSelectedCustomer(fresh);
  }, [CustomerState?.data, selectedCustomerId]);

  const filteredCustomers = useMemo(() => {
    const list = CustomerState?.data ?? [];
    const q = SearchText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = (c?.name ?? "").toLowerCase();
      const address = (c?.address ?? c?.Address ?? "").toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [CustomerState?.data, SearchText]);

  const totalCustomers = CustomerState?.data?.length ?? 0;

  const openAdd = (e) => {
    e?.stopPropagation?.();
    setAnchorEl(null);
    setOpenCreate(true);
  };

  const openEdit = (e) => {
    e?.stopPropagation?.();
    if (!selectedCustomerId || !SelectedCustomer) {
      WarningToast("Please select a customer first");
      return;
    }
    setAnchorEl(null);
    setOpenEdit(true);
  };

  return (
    <>
      <div className="flex w-full items-stretch gap-2">
        <div className="min-w-0 flex-1">
          <SelectPopover
            label="Customer"
            placeholder="Select customer"
            valueLabel={selectedCustomerName}
            valueHint={selectedCustomerName ? selectedCustomerAddress : ""}
            open={open}
            anchorEl={anchorEl}
            onOpen={(e) => setAnchorEl(e.currentTarget)}
            onClose={() => setAnchorEl(null)}
            popoverId="customer-selector"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Select customer
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  Total: {totalCustomers}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Showing: {filteredCustomers.length}
                </span>
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                >
                  <FiPlus className="text-[10px]" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={openEdit}
                  disabled={!selectedCustomerId}
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    selectedCustomerId
                      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300",
                  ].join(" ")}
                >
                  <FiEdit2 className="text-[10px]" />
                  Edit
                </button>
                {!!selectedCustomerId && (
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedCustomer("");
                      setSearchText("");
                      setAnchorEl(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={SearchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              autoFocus
            />
            <div className="max-h-[40vh] space-y-1 overflow-y-auto">
              {CustomerState?.loading ? (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  Loading customers...
                </div>
              ) : CustomerState?.isError ? (
                <div className="px-3 py-4 text-center text-sm text-red-600">
                  Failed to load customers.
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const address = customer?.address ?? customer?.Address ?? "";
                  return (
                    <SelectOption
                      key={customer?._id ?? customer?.name}
                      selected={selectedCustomerId === customer?._id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setAnchorEl(null);
                      }}
                    >
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className="truncate">{customer?.name ?? ""}</span>
                        <span
                          className={[
                            "shrink-0 truncate text-xs font-normal",
                            selectedCustomerId === customer?._id
                              ? "text-white/70"
                              : "text-slate-500",
                          ].join(" ")}
                        >
                          {address || "—"}
                        </span>
                      </span>
                    </SelectOption>
                  );
                })
              )}
            </div>
          </SelectPopover>
        </div>

        <button
          type="button"
          title="Edit customer"
          onClick={openEdit}
          disabled={!selectedCustomerId}
          className={[
            "inline-flex h-auto w-10 shrink-0 items-center justify-center self-stretch rounded-xl border shadow-sm",
            selectedCustomerId
              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
          ].join(" ")}
        >
          <FiEdit2 className="text-base" />
        </button>
        <button
          type="button"
          title="Add customer"
          onClick={openAdd}
          className="inline-flex h-auto w-10 shrink-0 items-center justify-center self-stretch rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700"
        >
          <FiPlus className="text-lg" />
        </button>
      </div>

      <CreateCustomerModal OpenModal={OpenCreate} setOpenModal={setOpenCreate} />
      {SelectedCustomer?._id ? (
        <EditCustomerModal
          OpenModal={OpenEdit}
          setOpenModal={setOpenEdit}
          customer={SelectedCustomer}
        />
      ) : null}
    </>
  );
};

export default CustomerSelector;
