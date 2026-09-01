import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import AuthInput from "../../../components/Inputs/AuthInput";
import {
  ErrorToast,
  SuccessToast,
  WarningToast,
} from "../../../utils/ShowToast";
import CustomerSelector from "../../../components/Selector/CustomerSelector";
import InvoiceSelector from "../../../components/Selector/InvoiceSelector";
import InvoiceItemInputTable from "../../../components/InoviceAddItem/InvoiceItemInputTable";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import {
  createNewItemInvoiceApi,
  DeleteItemInvoiceApi,
  GetInvoiceDataApi,
  UpdateCustomerInvoiceHeaderApi,
  UpdateInvoiceItemApi,
} from "../../../ApiRequests";
import { fetchCustomerInvoice } from "../../../store/Slices/CustomerInvoiceSlice";
import { fetchCustomers } from "../../../store/Slices/CustomerSlice";
import { fetchItems } from "../../../store/Slices/ItemSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";
const basePath = "/admin";

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(Number(value || 0));

const toDateInput = (unixSeconds) => {
  if (!unixSeconds) return new Date().toISOString().split("T")[0];
  const d = new Date(Number(unixSeconds) * 1000);
  return d.toISOString().split("T")[0];
};

const itemChanged = (original, current) => {
  if (!original) return true;
  return (
    original.itemId !== current.itemId ||
    Number(original.qty) !== Number(current.qty) ||
    Number(original.price) !== Number(current.price) ||
    Number(original.amount) !== Number(current.amount) ||
    original.article_name !== current.article_name ||
    original.article_size !== current.article_size
  );
};

const EditCounterSale = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CustomerInvoices = useSelector((state) => state.CustomerInvoices);

  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [SelectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [OriginalItems, setOriginalItems] = useState([]);
  const [NewItems, setNewItems] = useState([]);
  const [Discount, setDiscount] = useState("");
  const [OriginalDiscount, setOriginalDiscount] = useState(0);
  const [CurDate, setCurDate] = useState("");
  const [OriginalDate, setOriginalDate] = useState("");
  const [InvoiceNo, setInvoiceNo] = useState("");
  const [Description, setDescription] = useState("");
  const [OriginalDescription, setOriginalDescription] = useState("");
  const [Loading, setLoading] = useState(false);
  const [LoadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (!SelectedCustomer?._id) {
      setSelectedInvoiceId("");
      setNewItems([]);
      setOriginalItems([]);
      return;
    }
    dispatch(
      fetchCustomerInvoice({ id: SelectedCustomer._id, role: 3 })
    );
    setSelectedInvoiceId("");
    setNewItems([]);
    setOriginalItems([]);
  }, [SelectedCustomer, dispatch]);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!SelectedInvoiceId) return;

      setLoadingInvoice(true);
      try {
        const { data } = await GetInvoiceDataApi({
          invoiceId: SelectedInvoiceId,
          type: 1,
        });

        if (!data?.success) {
          ErrorToast("Failed to load invoice");
          return;
        }

        const info = data.data.payload.Invoice_Info;
        const items = (data.data.payload.Data ?? []).map((row) => ({
          _id: row._id,
          itemId: row.itemId,
          article_name: row.article_name,
          article_size: row.article_size,
          qty: row.qty,
          price: row.price,
          purchase: row.purchase,
          amount: row.amount,
        }));

        setInvoiceNo(info.invoice_no ?? "");
        setDescription(info.desc ?? "");
        setOriginalDescription(info.desc ?? "");
        setDiscount(String(info.discount ?? 0));
        setOriginalDiscount(Number(info.discount ?? 0));
        const dateStr = toDateInput(info.date);
        setCurDate(dateStr);
        setOriginalDate(dateStr);
        setNewItems(items);
        setOriginalItems(items);

        if (info.customerId && !SelectedCustomer) {
          setSelectedCustomer(info.customerId);
        }
      } catch (err) {
        ErrorToast(err?.response?.data?.error?.msg || "Failed to load invoice");
      } finally {
        setLoadingInvoice(false);
      }
    };

    loadInvoice();
  }, [SelectedInvoiceId]);

  const billTotal = useMemo(
    () => NewItems.reduce((total, item) => total + Number(item?.amount || 0), 0),
    [NewItems]
  );

  const discountNumber = useMemo(() => Number(Discount) || 0, [Discount]);
  const netTotal = useMemo(
    () => Math.max(0, billTotal - discountNumber),
    [billTotal, discountNumber]
  );

  const customerRemaining = Number(SelectedCustomer?.remaining || 0);
  const originalNet =
    OriginalItems.reduce((t, i) => t + Number(i.amount || 0), 0) -
    OriginalDiscount;
  const remainingAfter = useMemo(() => {
    if (!SelectedCustomer || !SelectedInvoiceId) return customerRemaining;
    return customerRemaining - originalNet + netTotal;
  }, [
    SelectedCustomer,
    SelectedInvoiceId,
    customerRemaining,
    originalNet,
    netTotal,
  ]);

  const resetForm = () => {
    setSelectedInvoiceId("");
    setNewItems([]);
    setOriginalItems([]);
    setDiscount("");
    setOriginalDiscount(0);
    setCurDate("");
    setOriginalDate("");
    setInvoiceNo("");
    setDescription("");
    setOriginalDescription("");
  };

  const refreshData = () => {
    if (SelectedCustomer?._id) {
      dispatch(fetchCustomerInvoice({ id: SelectedCustomer._id, role: 3 }));
    }
    dispatch(fetchCustomers());
        dispatch(fetchItems());
  };

  const onSave = async (e, goPrint = false) => {
    e.preventDefault();
    if (!SelectedCustomer) return WarningToast("Select customer!");
    if (!SelectedInvoiceId) return WarningToast("Select an invoice to edit!");
    if (!NewItems.length) return WarningToast("Invoice must have at least 1 item");

    setLoading(true);
    try {
      const originalMap = new Map(OriginalItems.map((i) => [i._id, i]));
      const currentIds = new Set(
        NewItems.filter((i) => i._id).map((i) => i._id)
      );

      for (const orig of OriginalItems) {
        if (!currentIds.has(orig._id)) {
          await DeleteItemInvoiceApi(orig._id);
        }
      }

      for (const item of NewItems) {
        if (item._id) {
          const orig = originalMap.get(item._id);
          if (itemChanged(orig, item)) {
            await UpdateInvoiceItemApi(item._id, {
              invoice_id: SelectedInvoiceId,
              itemId: item.itemId,
              article_name: item.article_name,
              article_size: item.article_size,
              qty: Number(item.qty),
              price: Number(item.price),
              purchase: Number(item.purchase ?? item.price) || 0,
              amount: Number(item.amount),
            });
          }
        } else {
          await createNewItemInvoiceApi({
            invoiceid: SelectedInvoiceId,
            customerId: SelectedCustomer._id,
            itemId: item.itemId,
            article_name: item.article_name,
            article_size: item.article_size,
            qty: Number(item.qty),
            price: Number(item.price),
            purchase: Number(item.purchase ?? item.price) || 0,
            amount: Number(item.amount),
          });
        }
      }

      if (
        discountNumber !== OriginalDiscount ||
        CurDate !== OriginalDate ||
        Description !== OriginalDescription
      ) {
        await UpdateCustomerInvoiceHeaderApi(SelectedInvoiceId, {
          discount: discountNumber,
          date: CurDate,
          desc: Description,
        });
      }

      SuccessToast("Invoice updated successfully");
      refreshData();

      if (goPrint) {
        navigate(`${basePath}/customer-invoice/detail/${SelectedInvoiceId}`);
      } else {
        const { data } = await GetInvoiceDataApi({
          invoiceId: SelectedInvoiceId,
          type: 1,
        });
        const items = (data?.data?.payload?.Data ?? []).map((row) => ({
          _id: row._id,
          itemId: row.itemId,
          article_name: row.article_name,
          article_size: row.article_size,
          qty: row.qty,
          price: row.price,
          purchase: row.purchase,
          amount: row.amount,
        }));
        const info = data?.data?.payload?.Invoice_Info;
        setNewItems(items);
        setOriginalItems(items);
        setOriginalDiscount(Number(info?.discount ?? 0));
        setOriginalDate(toDateInput(info?.date));
        setOriginalDescription(info?.desc ?? "");
        setDescription(info?.desc ?? "");
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || "Failed to update invoice");
    }
    setLoading(false);
  };

  return (
    <div className="w-full pb-8">
      <div className="mx-auto w-full max-w-7xl">
        <Header
          title="Edit Counter Sale"
          desc="Select a customer invoice and update items, discount, or date"
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-7xl grid grid-cols-1 gap-6 xl:grid-cols-[1fr,320px] 2xl:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-black">Select invoice</div>
            <div className="mt-1 text-xs text-black/60">
              Choose customer and invoice to load for editing.
            </div>

            <div className="mt-4 space-y-4">
              <CustomerSelector
                SelectedCustomer={SelectedCustomer}
                setSelectedCustomer={(c) => {
                  setSelectedCustomer(c);
                  resetForm();
                }}
              />

              {SelectedCustomer && (
                <InvoiceSelector
                  InvoicesData={CustomerInvoices.data ?? []}
                  activeTab={SelectedInvoiceId}
                  setActiveTab={setSelectedInvoiceId}
                />
              )}
            </div>

            {SelectedInvoiceId && (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <AuthInput
                  label="Invoice No"
                  placeholder="Invoice #"
                  Type="number"
                  Value={InvoiceNo}
                  setValue={setInvoiceNo}
                  readonly
                />
                <AuthInput
                  label="Description"
                  placeholder="Invoice description"
                  Type="text"
                  Value={Description}
                  setValue={setDescription}
                />
                <AuthInput
                  label="Date"
                  placeholder="Select Date"
                  Type="date"
                  Value={CurDate}
                  setValue={setCurDate}
                />
                <div className="flex flex-col justify-end">
                  <span className="text-xs text-black/50 mb-1">Status</span>
                  <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-800">
                    Editing mode
                  </span>
                </div>
              </div>
            )}
          </div>

          {LoadingInvoice && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <FetchingLoading />
            </div>
          )}

          {SelectedInvoiceId && !LoadingInvoice && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-black">Edit items</div>
                  <div className="mt-1 text-xs text-black/60">
                    Add, edit, or remove line items on this invoice.
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <InvoiceItemInputTable
                  NewItems={NewItems}
                  setNewItems={setNewItems}
                  saleType="SALE"
                  editMode
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 2xl:sticky 2xl:top-6 self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-black">Summary</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-black/60">Bill total</span>
                <span className="font-bold text-black">{formatPKR(billTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-black/60">Discount</span>
                <input
                  type="number"
                  value={Discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-[140px] rounded-lg border border-gray-200 px-3 py-2 text-right text-sm font-semibold outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-black/60">Net total</span>
                <span className="font-bold text-black">{formatPKR(netTotal)}</span>
              </div>
              {SelectedCustomer && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/60">Current balance</span>
                    <span className="font-semibold text-black">
                      {formatPKR(customerRemaining)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/60">After save</span>
                    <span className="font-bold text-black">
                      {formatPKR(remainingAfter)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {Loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <FetchingLoading />
            </div>
          )}

          {!Loading && SelectedInvoiceId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-black">Actions</div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-[0.99] transition"
                  onClick={(e) => onSave(e, false)}
                  disabled={Loading}
                >
                  Save changes
                </button>
                <button
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-[0.99] transition"
                  onClick={(e) => onSave(e, true)}
                  disabled={Loading}
                >
                  Save & print
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-black/70 hover:bg-black/5 transition"
                  onClick={resetForm}
                >
                  Clear selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCounterSale;
