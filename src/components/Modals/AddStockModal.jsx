import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { SuccessToast, ErrorToast } from "../../utils/ShowToast";
import {
  AddItemQtyBulkApi,
  AddPurchaseReturnApi,
  GetNextStockInvoiceNoApi,
} from "../../ApiRequests";
import StockTypeSelector from "../Selector/StockTypeSelector";
import SupplierSelector from "../Selector/SupplierSelector";
import StockItemInputTable from "../InoviceAddItem/StockItemInputTable";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { fetchStockStats } from "../../store/Slices/StockStatsSlice";
import moment from "moment";
import { AppButton, AppInput } from "../ui";

const AddStockModal = ({ OpenModal, setOpenModal }) => {
  const [stockItems, setStockItems] = useState([]);
  const [InvoiceNo, setInvoiceNo] = useState("");
  const [OriginalInvoiceNo, setOriginalInvoiceNo] = useState("");
  const [CurrentDate, setDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [Desc, setDesc] = useState("");
  const [Loading, setLoading] = useState(false);
  const [AccountType, setAccountType] = useState("");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const dispatch = useDispatch();

  const needsSupplier =
    AccountType === "Supplier" || AccountType === "Purchase Return";

  const loadNextInvoiceNo = async () => {
    try {
      const res = await GetNextStockInvoiceNoApi();
      const next = res?.data?.data?.payload?.invoice_no;
      setInvoiceNo(next != null ? String(next) : "");
    } catch {
      setInvoiceNo("");
    }
  };

  const resetForm = () => {
    setStockItems([]);
    setOriginalInvoiceNo("");
    setDate(moment(new Date()).format("YYYY-MM-DD"));
    setDesc("");
    setAccountType("");
    setSelectedSupplier("");
    loadNextInvoiceNo();
  };

  useEffect(() => {
    if (OpenModal) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OpenModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!AccountType) {
      ErrorToast("Please select stock type (Self, Supplier or Purchase Return)");
      setLoading(false);
      return;
    }

    if (needsSupplier && !SelectedSupplier) {
      ErrorToast("Please select a supplier");
      setLoading(false);
      return;
    }

    if (!CurrentDate || !Desc || stockItems.length === 0) {
      ErrorToast(
        "Date, Description and at least one stock item are required"
      );
      setLoading(false);
      return;
    }

    try {
      const isReturn = AccountType === "Purchase Return";
      const payload = {
        // Backend auto-assigns if empty; omit so server generates final #
        desc: Desc,
        branchId: null,
        branch_name: "",
        branch: -1,
        date: CurrentDate,
        type: isReturn ? 3 : AccountType === "Self" ? 1 : 2,
        items: stockItems.map((item) => ({
          articleId: item.articleId,
          article_name: item.article_name,
          sizeId: item.sizeId,
          size: item.size,
          qty: item.qty,
          purchase: item.purchase ?? 0,
        })),
      };

      if (needsSupplier && SelectedSupplier) {
        payload.supplierId = SelectedSupplier._id;
        payload.original_invoice_no = OriginalInvoiceNo
          ? String(OriginalInvoiceNo).trim()
          : null;
      }

      const response = isReturn
        ? await AddPurchaseReturnApi(payload)
        : await AddItemQtyBulkApi(payload);
      if (response.data.success) {
        SuccessToast(response.data.data.msg);
        dispatch(fetchItems());
        dispatch(fetchStockStats());
        resetForm();
        setOpenModal(false);
      }
    } catch (err) {
      ErrorToast(err.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={OpenModal}
      setOpen={setOpenModal}
      title="Add Stock"
      subtitle="Record purchase, self stock, or purchase return"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Stock Type <span className="text-red-500">*</span>
              </span>
              <StockTypeSelector
                activeTab={AccountType}
                setActiveTab={setAccountType}
              />
            </div>
            {needsSupplier && (
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Supplier <span className="text-red-500">*</span>
                </span>
                <SupplierSelector
                  setSelectedSupplier={setSelectedSupplier}
                  SelectedSupplier={SelectedSupplier}
                />
              </div>
            )}
            <AppInput
              label="Invoice No"
              value={InvoiceNo || "Auto"}
              readOnly
              title="Auto-generated by server on save"
            />
            {needsSupplier && (
              <AppInput
                label="Original Invoice No"
                placeholder="Optional — supplier invoice #"
                value={OriginalInvoiceNo}
                onChange={(e) => setOriginalInvoiceNo(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-4">
            <AppInput
              label="Date"
              type="date"
              required
              value={CurrentDate}
              onChange={(e) => setDate(e.target.value)}
            />
            <AppInput
              label="Description"
              required
              placeholder="Enter Description"
              value={Desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <StockItemInputTable
          stockItems={stockItems}
          setStockItems={setStockItems}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => setOpenModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton type="submit" variant="accent" loading={Loading}>
            {AccountType === "Purchase Return" ? "Record Return" : "Add Stock"}{" "}
            ({stockItems.length} {stockItems.length === 1 ? "item" : "items"})
          </AppButton>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddStockModal;
