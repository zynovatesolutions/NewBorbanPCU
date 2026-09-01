import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { SuccessToast, ErrorToast } from "../../utils/ShowToast";
import { Update_RM_StatsApi } from "../../ApiRequests";
import { fetchRMStats } from "../../store/Slices/RMStatsSlice";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";
import SupplierSelector from "../Selector/SupplierSelector";
import { AppButton, AppInput } from "../ui";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditRMStockModal = ({ OpenModal, setOpenModal, StockDetail }) => {
  const [rm_name, setRm_name] = useState(StockDetail.rm_name);
  const [Purchase, setPurchase] = useState(StockDetail.purchase);
  const [NewStock, setNewStock] = useState(StockDetail.qty);
  const [InvoiceNo, setInvoiceNo] = useState(StockDetail.invoice_no);
  const [SelectedSupplier, setSelectedSupplier] = useState({
    _id: StockDetail.supplierId,
    name: StockDetail.supplier_name,
  });
  const [CurrentDate, setDate] = useState(StockDetail.f_date);
  const [Desc, setDesc] = useState(StockDetail.desc);
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !SelectedSupplier ||
      !rm_name ||
      !NewStock ||
      !Purchase ||
      !InvoiceNo ||
      !CurrentDate ||
      !Desc
    ) {
      ErrorToast("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const response = await Update_RM_StatsApi(StockDetail._id, {
        supplierId: SelectedSupplier._id,
        supplier_name: SelectedSupplier.name,
        rm_name,
        purchase: Number(Purchase),
        qty: Number(NewStock),
        invoice_no: InvoiceNo,
        desc: Desc,
        date: CurrentDate,
      });
      if (response.data.success) {
        SuccessToast(response.data.data.msg);
        dispatch(fetchRMStats());
        dispatch(fetchSuppliers());
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
      title="Edit Raw Material"
      subtitle="Update raw material stock entry"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Supplier <span className="text-red-500">*</span>
              </span>
              <SupplierSelector
                setSelectedSupplier={setSelectedSupplier}
                SelectedSupplier={SelectedSupplier}
              />
            </div>
            <AppInput
              label="Raw Material Name"
              required
              placeholder="Enter Raw Material Name"
              value={rm_name}
              onChange={(e) => setRm_name(e.target.value)}
            />
            <AppInput
              label="Purchase"
              type="number"
              required
              placeholder="Enter Purchase"
              value={Purchase}
              onChange={(e) => setPurchase(e.target.value)}
            />
            <AppInput
              label="Quantity"
              type="number"
              required
              placeholder="Enter Quantity"
              value={NewStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <AppInput
              label="Invoice No"
              required
              placeholder="Enter Invoice No"
              value={InvoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
            <AppInput
              label="Date"
              type="date"
              required
              value={CurrentDate}
              onChange={(e) => setDate(e.target.value)}
            />
            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Description <span className="text-red-500">*</span>
              </span>
              <textarea
                rows={4}
                value={Desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter Description"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => setOpenModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton type="submit" variant="accent" loading={Loading}>
            Update Stock
          </AppButton>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditRMStockModal;
