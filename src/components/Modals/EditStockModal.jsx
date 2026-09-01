import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { SuccessToast, ErrorToast } from "../../utils/ShowToast";
import { UpdateItemQtyApi } from "../../ApiRequests";
import SupplierSelector from "../Selector/SupplierSelector";
import ArticleSelector from "../Selector/ArticleSelector";
import SizeSelector from "../Selector/SizeSelector";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { AppButton, AppInput } from "../ui";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditStockModal = ({ OpenModal, setOpenModal, StockDetail }) => {
  const [SelectedArticle, setSelectedArticle] = useState("");
  const [SelectedSize, setSelectedSize] = useState("");
  const [NewStock, setNewStock] = useState("");
  const [Purchase, setPurchase] = useState("");
  const [InvoiceNo, setInvoiceNo] = useState("");
  const [CurrentDate, setDate] = useState("");
  const [Desc, setDesc] = useState("");
  const [AccountType, setAccountType] = useState("");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const [DataLoaded, setDataLoaded] = useState(false);
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (StockDetail) {
      setSelectedArticle(StockDetail.articleId);
      setSelectedSize(StockDetail.sizeId);
      setNewStock(StockDetail.qty);
      setPurchase(StockDetail.purchase);
      setInvoiceNo(StockDetail.invoice_no);
      setDate(StockDetail.f_date);
      setDesc(StockDetail.desc);
      setAccountType(StockDetail.type === 2 ? "Supplier" : "Self");
      setDataLoaded(true);
    }
  }, [StockDetail]);

  useEffect(() => {
    if (DataLoaded && SelectedArticle !== StockDetail.articleId) {
      setSelectedSize("");
    }
  }, [SelectedArticle, StockDetail, DataLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !SelectedSize ||
      !SelectedArticle ||
      !NewStock ||
      Purchase === undefined ||
      !InvoiceNo ||
      !CurrentDate
    ) {
      ErrorToast("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const basePayload = {
        articleId: SelectedArticle._id,
        article_name: SelectedArticle.name,
        size: SelectedSize.size,
        sizeId: SelectedSize._id,
        qty: Number(NewStock),
        purchase: Number(Purchase),
        invoice_no: InvoiceNo,
        desc: Desc,
        date: CurrentDate,
      };
      const response = await UpdateItemQtyApi(
        StockDetail._id,
        SelectedSupplier
          ? { ...basePayload, supplierId: SelectedSupplier._id }
          : basePayload
      );
      if (response.data.success) {
        SuccessToast(response.data.data.msg);
        dispatch(fetchItems());
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
      title="Edit Stock"
      subtitle="Update stock quantity and purchase details"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            {AccountType === "Supplier" && (
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Supplier
                </span>
                <SupplierSelector
                  setSelectedSupplier={setSelectedSupplier}
                  SelectedSupplier={SelectedSupplier}
                />
              </div>
            )}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Article <span className="text-red-500">*</span>
              </span>
              <ArticleSelector
                setSelectedArticle={setSelectedArticle}
                SelectedArticle={SelectedArticle}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Size <span className="text-red-500">*</span>
              </span>
              <SizeSelector
                SelectedSize={SelectedSize}
                setSelectedSize={setSelectedSize}
                SelectedArticle={SelectedArticle}
              />
            </div>
            <AppInput
              label="Quantity"
              type="number"
              required
              placeholder="Enter Quantity"
              value={NewStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
            <AppInput
              label="Date"
              type="date"
              required
              value={CurrentDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <AppInput
              label="Purchase"
              type="number"
              required
              placeholder="Enter Purchase"
              value={Purchase}
              onChange={(e) => setPurchase(e.target.value)}
            />
            <AppInput
              label="Invoice No"
              required
              placeholder="Enter Invoice No"
              value={InvoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
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
            Save Changes
          </AppButton>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditStockModal;
