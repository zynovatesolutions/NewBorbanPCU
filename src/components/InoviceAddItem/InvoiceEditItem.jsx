import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import { SuccessToast, WarningToast } from "../../utils/ShowToast";
import { UpdateInvoiceItemApi } from "../../ApiRequests";
import { fetchCustomerInvoice } from "../../store/Slices/CustomerInvoiceSlice";
import { fetchCustomerReturnInvoice } from "../../store/Slices/CustomerReturnInvoiceSlice";
import { fetchItems } from "../../store/Slices/ItemSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const InvoiceEditItem = ({
  selectedItem,
  setOpen,
  setSelected,
  InvoiceId,
  SelectedCustomer,
}) => {
  console.log(selectedItem);

  const ItemState = useSelector((state) => state.ItemState);
  const dispatch = useDispatch();
  const itemCodeInputRef = useRef(null);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchItems());
      dispatch(fetchCustomers());
    }
    Mounted = true;
  }, [dispatch, role, branchId]);

  const [itemId, setItemId] = useState(selectedItem?.itemId || "");
  const [ArticleId, setArticleId] = useState(
    selectedItem?.articleId?._id || ""
  );
  const [name, setName] = useState(selectedItem?.article_size || ""); //  size
  const [code, setCode] = useState(selectedItem.article_name || ""); // article name
  const [qty, setQty] = useState(selectedItem?.qty || "");
  const [price, setPrice] = useState(selectedItem?.price || "");
  const [purchase, setPurchase] = useState(selectedItem?.purchase || "");
  const [type, setType] = useState(selectedItem?.unit || "");
  const [amount, setAmount] = useState(selectedItem?.amount || "");
  const [CurrentItemQty, setCurrentItemQty] = useState(
    selectedItem?.itemId?.qty || ""
  );

  useEffect(() => {
    if (ItemState.data && selectedItem) {
      const currentItem = ItemState.data.find(
        (dt) => dt._id === itemId || dt._id === selectedItem.itemId
      );
      const baseQty = Number(currentItem?.qty ?? 0);
      const reservedQty =
        itemId === selectedItem.itemId ? Number(selectedItem.qty ?? 0) : 0;
      setCurrentItemQty(baseQty + reservedQty);
    }
  }, [ItemState, itemId, selectedItem]);

  useEffect(() => {
    if (qty !== "" && price !== "") {
      setAmount(Number(qty) * 12 * Number(price));
    }
  }, [qty, price]);

  useEffect(() => {
    if (selectedItem) {
      setItemId(selectedItem.itemId);
      setName(selectedItem.article_size);
      setCode(selectedItem.article_name);
      setQty(selectedItem.qty);
      setType(selectedItem.unit);
      setPrice(selectedItem.price);
      setPurchase(selectedItem.purchase || "");
      setAmount(selectedItem.amount);
    }
  }, [selectedItem]);

  const [Loading, setLoading] = useState(false);

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(itemId, code, qty, price, amount);
    if (!itemId || !name || !qty || !price || !amount) {
      WarningToast("Please enter item name/qty/price/amount");
      setLoading(false);
      return;
    }

    try {
      const response = await UpdateInvoiceItemApi(selectedItem._id, {
        invoice_id: InvoiceId,
        itemId,
        article_name: code,
        article_size: name,
        name,
        qty: Number(qty),
        unit: type,
        price: Number(price),
        purchase: Number(purchase) || 0,
        amount: Number(amount),
      });
      if (response.data.success) {
        SuccessToast("Invoice item updated successfully");
        dispatch(fetchCustomerInvoice({ id: SelectedCustomer._id, role: 3 }));
        dispatch(fetchCustomerReturnInvoice({ id: SelectedCustomer._id, role: 3 }));
        dispatch(fetchCustomers());
        dispatch(fetchItems());
        setOpen(false);
      }
      setSelected("");
      setItemId("");
      setName("");
      setCode("");
      setType("");
      setQty("");
      setPrice("");
      setAmount("");
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div className="mb-3 flex flex-col gap-y-3 rounded-xl border border-slate-700 bg-slate-900 py-3 px-3">
      <div className="text-2xl font-bold text-white px-3 py-1">Edit Item</div>
      <div className="grid grid-cols-5 gap-2 w-full">
        <div className="flex flex-col">
          <label className="text-sm text-white mb-1">Article Name</label>
          <input
            type="text"
            id="ArticleName"
            list="ArticleNameList"
            value={code}
            ref={itemCodeInputRef}
            onChange={(e) => {
              setCode(e.target.value);
              const currentItem = ItemState.data.find(
                (dt) =>
                  dt.article_name.toLowerCase() === e.target.value.toLowerCase()
              );
              if (currentItem) {
                setArticleId(currentItem.articleId._id);
                setItemId(currentItem._id);
                setName(currentItem.name);
                setCode(currentItem.article_name);
                setType(currentItem.unit);
                setPrice(currentItem.sale);
                setPurchase(currentItem.purchase);
                setCurrentItemQty(currentItem.qty);
              } else {
                setItemId("");
                setPrice("");
                setCurrentItemQty("");
              }
            }}
            onBlur={(e) => {
              const currentItem = ItemState.data.find(
                (dt) =>
                  dt.article_name.toLowerCase() === e.target.value.toLowerCase()
              );
              if (!currentItem) {
                setItemId("");
                setPrice("");
                setCurrentItemQty("");
              }
            }}
            placeholder="Select Item"
            className="px-2 py-2 outline-none rounded-lg border-slate-200 col-span-2 max1000:col-span-1"
          />
          <datalist id="ArticleNameList">
            {ItemState.data &&
              ItemState.data.map((option) => (
                <option key={option._id} value={option.article_name} />
              ))}
          </datalist>
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-sm text-white mb-1">Size</label>
          <input
            type="text"
            list="ArticleSizeList"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onBlur={(e) => {
              const currentItem = ItemState.data.find(
                (dt) =>
                  dt.size.toLowerCase() === e.target.value.toLowerCase() &&
                  dt.articleId._id === ArticleId
              );
              if (!currentItem) {
                setItemId("");
                setPrice("");
                setCurrentItemQty("");
              } else {
                setItemId(currentItem._id);
                setPrice(currentItem.sale);
                setPurchase(currentItem.purchase);
                setCurrentItemQty(currentItem.qty);
              }
            }}
            placeholder="Select Size"
            className="px-2 py-2 outline-none bg-white rounded-lg border-slate-200 col-span-2 max1000:col-span-1"
          />
          <datalist id="ArticleSizeList">
            {ItemState.data &&
              ItemState.data
                .filter((dt) => dt.articleId && dt.articleId._id === ArticleId)
                .map((option) => (
                  <option key={option._id} value={option.size} />
                ))}
          </datalist>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-white mb-1">Quantity</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => {
              const newQty = e.target.value;
              setQty(newQty);
              setAmount(Number(newQty) * 12 * Number(price || 0));
            }}
            onBlur={(e) => {
              if (Number(e.target.value) > CurrentItemQty) {
                WarningToast(
                  `Quantity must be less than or equal to ${CurrentItemQty}`
                );
                setQty("");
                setAmount("");
              }
            }}
            placeholder={CurrentItemQty || "Quantity"}
            className="px-2 py-2 outline-none rounded-lg border-slate-200 max980:w-full"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-white mb-1">Unit Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setAmount(Number(qty) * 12 * Number(e.target.value));
            }}
            className="bg-white px-2 py-2 outline-none rounded-lg border-slate-200 max980:w-full"
            placeholder="Unit Price"
          />
        </div>
        <div className="flex flex-col max980:w-full">
          <label className="text-sm text-white mb-1">Total Amount</label>
          <input
            type="number"
            value={amount}
            disabled
            className="bg-white px-2 py-2 outline-none rounded-lg border-slate-200 w-full"
            placeholder="Total Amount"
          />
        </div>

        <datalist id="Item-Code" className="max-h-[50vh]">
          {ItemState.data &&
            ItemState.data.map((option) => (
              <option key={option._id + "-name"} value={option.name} />
            ))}
          {ItemState.data &&
            ItemState.data.map((option) => (
              <option key={option._id + "-code"} value={option.code} />
            ))}
        </datalist>
      </div>
      {Loading ? (
        <div className="grid grid-cols-1 gap-4"></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="submit"
            className="bg-sec2 text-gray-200 px-3 py-2 border-2 border-gray-600 hover:bg-gray-200 hover:text-black hover:rounded-lg transition-all ease-in-out duration-500 font-bold"
            onClick={handleUpdateItem}
          >
            Update
          </button>
          <button
            type="submit"
            className="bg-sec2 text-gray-200 px-3 py-2 border-2 border-gray-600 hover:bg-gray-200 hover:text-black hover:rounded-lg transition-all ease-in-out duration-500 font-bold"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceEditItem;
