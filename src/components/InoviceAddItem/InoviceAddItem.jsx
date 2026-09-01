import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WarningToast } from "../../utils/ShowToast";
// import { createNewItemInvoiceApi } from "../../ApiRequests";
// import { fetchCustomerInvoice } from "../../store/Slices/CustomerInvoiceSlice";
// import { fetchCustomerReturnInvoice } from "../../store/Slices/CustomerReturnInvoiceSlice";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { createNewItemInvoiceApi } from "../../ApiRequests";
import { fetchArticles } from "../../store/Slices/ArticleSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const InoviceAddItem = ({
  NewItems,
  setNewItems,
  bgColor,
  OnAdd,
  Loading,
  SelectedCustomerType,
  SelectedCustomer,
  InvoiceId,
  saleType,
}) => {
  const [itemId, setItemId] = useState("");
  const [ArticleId, setArticleId] = useState("");
  const [ArticleName, setArticleName] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [purchase, setPurchase] = useState("");
  const [type, setType] = useState("");
  const [AddItemLoading, setAddItemLoading] = useState(false);

  const [CurrentItemQty, setCurrentItemQty] = useState("");

  const ItemState = useSelector((state) => state.ItemState);
  const ArticleState = useSelector((state) => state.ArticleState);
  const dispatch = useDispatch();

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchItems());
      dispatch(fetchArticles());
    }
    Mounted = true;
  }, [dispatch]);

  useEffect(() => {
    setQty("");
  }, [itemId]);

  useEffect(() => {
    setQty("");
  }, []);

  const itemCodeInputRef = useRef(null); // Ref to focus Item Code input

  // Recalculate amount when qty or price changes
  useEffect(() => {
    if (qty !== "" && price !== "") {
      setAmount(Number(qty) * 12 * Number(price));
    } else {
      setAmount("");
    }
  }, [qty, price]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (
      itemId === "" ||
      name === "" ||
      qty === "" ||
      price === "" ||
      amount === ""
    ) {
      WarningToast("Please enter item name / qty / price / amount");
    } else {
      setNewItems([
        ...NewItems,
        {
          itemId: itemId,
          article_name: code,
          article_size: name,
          qty: Number(qty),
          price: Number(price),
          purchase: Number(price),
          amount: Number(amount),
        },
      ]);
      // Reset fields
      setItemId("");
      setName("");
      setCode("");
      setQty("");
      setPrice("");
      setAmount("");
      setCurrentItemQty("");
      if (itemCodeInputRef.current) {
        itemCodeInputRef.current.focus();
      }
    }
  };

  return (
    <form
      className={`flex flex-col gap-y-3 border border-slate-700 ${
        bgColor ? bgColor : "bg-slate-900"
      } rounded-xl py-3 px-3 my-2`}
    >
      <div className="text-2xl font-bold text-white px-3 py-1">
        Add New Item
      </div>
      <div className="flex gap-2 w-full flex-wrap max980:flex-col">
        <div className="grid grid-cols-5 gap-2 w-full">
          <div className="flex flex-col">
            <label className="text-sm text-white mb-1">Article Name</label>
            <input
              type="text"
              id="ArticleName"
              list="ArticleNameList"
              value={code}
              ref={itemCodeInputRef}
              onChange={async (e) => {
                setCode(e.target.value);
              }}
              onBlur={(e) => {
                const currentArticle = ArticleState.data.find(
                  (dt) => dt.name.toString() === e.target.value.toString()
                );
                console.log(ItemState.data);

                if (!currentArticle) {
                  setItemId("");
                  setPrice("");
                  setCurrentItemQty("");
                  return;
                }

                const currentItem = ItemState.data.find(
                  (dt) =>
                    dt.articleId &&
                    dt.articleId._id &&
                    dt.articleId._id.toString() ===
                      currentArticle._id.toString()
                );
                if (currentItem && currentArticle) {
                  setArticleName(currentArticle.name);
                  setArticleId(currentArticle._id);
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
              placeholder="Select Item"
              className="px-2 py-2 outline-none rounded-lg border-slate-200 col-span-2 max1000:col-span-1"
            />
            <datalist id="ArticleNameList">
              {ArticleState.data &&
                ArticleState.data.map((option) => (
                  <option key={option._id} value={option.name} />
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
                    dt.size &&
                    dt.articleId &&
                    dt.articleId._id &&
                    dt.size.toLowerCase() === e.target.value.toLowerCase() &&
                    dt.articleId._id.toString() === ArticleId.toString()
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
                  .filter(
                    (dt) => dt.articleId && dt.articleId._id === ArticleId
                  )
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
              }}
              onBlur={(e) => {
                if (
                  Number(e.target.value) > CurrentItemQty &&
                  saleType === "SALE"
                ) {
                  WarningToast(
                    `Quantity must be less than or equal to ${CurrentItemQty}`
                  );
                  setQty("");
                  setAmount("");
                }
              }}
              placeholder={
                CurrentItemQty && itemId ? CurrentItemQty : "Quantity"
              }
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
        </div>
      </div>
      {!Loading && (
        <button
          type="submit"
          className="bg-sec2 text-gray-200 px-3 py-2 border-2 border-gray-600 hover:bg-gray-200 hover:text-black hover:rounded-lg transition-all ease-in-out duration-500 font-bold"
          onClick={
            OnAdd
              ? async (e) => {
                  e.preventDefault();
                  setAddItemLoading(true);

                  if (
                    !itemId ||
                    !InvoiceId ||
                    !name ||
                    !qty ||
                    !price ||
                    !amount
                  ) {
                    setAddItemLoading(false);
                    WarningToast("Please enter item name/qty/price/amount");
                    return;
                  }

                  try {
                    const response = await createNewItemInvoiceApi({
                      customerId: SelectedCustomer._id,
                      purchase: purchase,
                      invoiceid: InvoiceId,
                      itemId,
                      article_name: code,
                      article_size: name,
                      qty,
                      unit: type,
                      price,
                      amount,
                    });

                    if (SelectedCustomer) {
                      const p = { id: SelectedCustomer._id, role: 3 };
                      dispatch(fetchCustomerInvoice(p));
                      dispatch(fetchCustomerReturnInvoice(p));
                    }

                    setItemId("");
                    setName("");
                    setCode("");
                    setAmount("");
                    setPrice("");
                    console.log(response);
                  } catch (error) {
                    console.log(error);
                  }
                  setAddItemLoading(false);
                }
              : handleAddItem
          }
        >
          Add
        </button>
      )}
    </form>
  );
};

export default InoviceAddItem;
