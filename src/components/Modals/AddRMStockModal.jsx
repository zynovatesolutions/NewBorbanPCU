import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { SuccessToast, ErrorToast } from "../../utils/ShowToast";
import { AddRM_StatsApi, AddRM_ReturnApi } from "../../ApiRequests";
import { fetchRMStats } from "../../store/Slices/RMStatsSlice";
import moment from "moment";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";
import SupplierSelector from "../Selector/SupplierSelector";
import RawMaterialSelector from "../Selector/RawMaterialSelector";
import { AppButton, AppInput } from "../ui";

const AddRMStockModal = ({ OpenModal, setOpenModal }) => {
  const [SelectedRM, setSelectedRM] = useState("");
  const [Unit, setUnit] = useState("pcs");
  const [IsReturn, setIsReturn] = useState(false);
  const [Purchase, setPurchase] = useState("");
  const [NewStock, setNewStock] = useState("");
  const [InvoiceNo, setInvoiceNo] = useState("");
  const [TruckNo, setTruckNo] = useState("");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const [CurrentDate, setDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [Desc, setDesc] = useState("");
  const [Loading, setLoading] = useState(false);
  const [oldBalance] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !SelectedSupplier ||
      !SelectedRM ||
      !NewStock ||
      !Purchase ||
      !InvoiceNo ||
      !TruckNo ||
      !CurrentDate ||
      !Desc
    ) {
      ErrorToast("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        supplierId: SelectedSupplier._id,
        supplier_name: SelectedSupplier.name,
        rm_name: SelectedRM.name,
        unit: Unit || "pcs",
        purchase: Number(Purchase),
        qty: Number(NewStock),
        invoice_no: InvoiceNo,
        truck_no: TruckNo,
        desc: Desc,
        branchId: null,
        branch_name: "",
        branch: -1,
        date: CurrentDate,
        old: oldBalance,
      };
      const response = IsReturn
        ? await AddRM_ReturnApi(payload)
        : await AddRM_StatsApi(payload);
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
      title={IsReturn ? "Return RM Stock" : "Add RM Stock"}
      subtitle="Record raw material purchase or return quantity"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="radio"
              name="rm_mode"
              checked={!IsReturn}
              onChange={() => setIsReturn(false)}
              className="text-accent focus:ring-accent/30"
            />
            Purchase
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="radio"
              name="rm_mode"
              checked={IsReturn}
              onChange={() => setIsReturn(true)}
              className="text-accent focus:ring-accent/30"
            />
            Purchase Return
          </label>
        </div>

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
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Raw Material <span className="text-red-500">*</span>
              </span>
              <RawMaterialSelector
                SelectedRM={SelectedRM}
                setSelectedRM={setSelectedRM}
              />
            </div>
            <AppInput
              label="Unit"
              placeholder="pcs / kg / bag"
              value={Unit}
              onChange={(e) => setUnit(e.target.value)}
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
              label="Truck No"
              required
              placeholder="Enter Truck No"
              value={TruckNo}
              onChange={(e) => setTruckNo(e.target.value)}
            />
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

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => setOpenModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton type="submit" variant="accent" loading={Loading}>
            {IsReturn ? "Record Return" : "Add Stock"}
          </AppButton>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddRMStockModal;
