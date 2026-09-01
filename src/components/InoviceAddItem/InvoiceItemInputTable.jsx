import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WarningToast } from "../../utils/ShowToast";
import { fetchArticles } from "../../store/Slices/ArticleSlice";
import { fetchItems } from "../../store/Slices/ItemSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(Number(value || 0));

export default function InvoiceItemInputTable({
  NewItems,
  setNewItems,
  saleType,
  editMode = false,
}) {
  const dispatch = useDispatch();
  const ItemState = useSelector((state) => state.ItemState);
  const ArticleState = useSelector((state) => state.ArticleState);

  const articleNameRef = useRef(null);

  const [articleInput, setArticleInput] = useState("");
  const [articleId, setArticleId] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [itemId, setItemId] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState("");
  const [articleError, setArticleError] = useState("");
  const [sizeError, setSizeError] = useState("");

  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const stockNumber = useMemo(() => {
    if (currentItemQty === "" || currentItemQty === null || currentItemQty === undefined)
      return null;
    const n = Number(currentItemQty);
    return Number.isNaN(n) ? null : n;
  }, [currentItemQty]);

  const stockByItemId = useMemo(() => {
    const map = new Map();
    for (const it of ItemState?.data ?? []) {
      if (it?._id) map.set(it._id, Number(it?.qty ?? 0));
    }
    return map;
  }, [ItemState?.data]);

  const itemById = useMemo(() => {
    const map = new Map();
    for (const it of ItemState?.data ?? []) {
      if (it?._id) map.set(it._id, it);
    }
    return map;
  }, [ItemState?.data]);

  const getAvailableStock = (targetItemId, forEditingIndex = editingIndex) => {
    const base = stockByItemId.get(targetItemId) ?? 0;
    if (!editMode) return base;
    let reserved = 0;
    (NewItems ?? []).forEach((row, idx) => {
      if (row.itemId === targetItemId && idx !== forEditingIndex) {
        reserved += Number(row.qty || 0);
      }
    });
    if (forEditingIndex !== null) {
      const editingRow = NewItems?.[forEditingIndex];
      if (editingRow?.itemId === targetItemId) {
        reserved += Number(editingRow.qty || 0);
      }
    }
    return base + reserved;
  };

  const availableStock = useMemo(() => {
    if (!itemId) return null;
    if (editMode) return getAvailableStock(itemId, editingIndex);
    return stockNumber;
  }, [itemId, editMode, editingIndex, stockNumber, NewItems, stockByItemId]);

  const isOutOfStock = useMemo(() => {
    if (saleType !== "SALE") return false;
    if (!itemId) return false;
    if (availableStock === null) return false;
    return availableStock <= 0;
  }, [itemId, saleType, availableStock]);

  useEffect(() => {
    dispatch(fetchItems());
    dispatch(fetchArticles());
  }, [dispatch]);

  const sizeOptions = useMemo(() => {
    if (!articleId) return [];
    return (ItemState?.data ?? []).filter(
      (dt) => dt.articleId && dt.articleId._id === articleId
    );
  }, [ItemState?.data, articleId]);

  const selectedArticleNameLower = useMemo(() => {
    if (!articleId) return "";
    const a = (ArticleState?.data ?? []).find((x) => x?._id === articleId);
    return (a?.name ?? "").toString().trim().toLowerCase();
  }, [ArticleState?.data, articleId]);

  const resolveArticleByName = (value) => {
    const v = (value ?? "").toString().trim().toLowerCase();
    if (!v) return null;
    return (ArticleState?.data ?? []).find(
      (dt) => (dt?.name ?? "").toString().trim().toLowerCase() === v
    );
  };

  const resolveItemBySize = (value) => {
    const v = (value ?? "").toString().trim().toLowerCase();
    if (!articleId || !v) return null;
    return (ItemState?.data ?? []).find(
      (dt) =>
        dt.size &&
        dt.articleId &&
        dt.articleId._id &&
        dt.articleId._id.toString() === articleId.toString() &&
        dt.size.toString().trim().toLowerCase() === v
    );
  };

  // Recalculate amount when qty or price changes
  useEffect(() => {
    if (qty !== "" && price !== "") {
      // Keep same behavior as existing flow (qty * 12 * price)
      setAmount(Number(qty) * 12 * Number(price));
    } else {
      setAmount("");
    }
  }, [qty, price]);

  const resetInputs = () => {
    setArticleInput("");
    setArticleId("");
    setSizeInput("");
    setItemId("");
    setCurrentItemQty("");
    setQty("");
    setPrice("");
    setAmount("");
    setEditingIndex(null);
    setArticleError("");
    setSizeError("");
    requestAnimationFrame(() => {
      articleNameRef.current?.focus?.();
    });
  };

  const startEdit = (row, idx) => {
    if (!row) return;

    setEditingIndex(idx);

    setArticleError("");
    setSizeError("");

    const rowItemId = row.itemId ?? "";
    const currentItem = rowItemId ? itemById.get(rowItemId) : null;

    // IMPORTANT:
    // Some older rows store article_name as "code" (not matching ArticleState.name),
    // so in edit mode we prefer resolving from itemId -> articleId -> article name.
    if (currentItem?.articleId?._id) {
      setArticleId(currentItem.articleId._id);
      setArticleInput(currentItem.articleId.name ?? row.article_name ?? "");
    } else {
      // fallback to row value
      setArticleInput(row.article_name ?? "");
      const currentArticle = resolveArticleByName(row.article_name ?? "");
      setArticleId(currentArticle?._id ?? "");
    }

    setSizeInput(row.article_size ?? currentItem?.size ?? "");
    setItemId(rowItemId);
    setQty(row.qty?.toString?.() ?? "");
    setPrice(row.price?.toString?.() ?? "");
    setAmount(row.amount?.toString?.() ?? "");

    // stock for SALE validation (from current store)
    const stock = stockByItemId.get(rowItemId) ?? "";
    setCurrentItemQty(
      editMode
        ? getAvailableStock(rowItemId, idx)
        : stock === ""
          ? ""
          : stock.toString()
    );

    requestAnimationFrame(() => {
      articleNameRef.current?.focus?.();
    });
  };

  // If we have an itemId but articleId isn't resolved yet (e.g. data still loading),
  // resolve it once ItemState becomes available to avoid false "invalid article" errors.
  useEffect(() => {
    if (!itemId || articleId) return;
    const currentItem = itemById.get(itemId);
    if (currentItem?.articleId?._id) {
      setArticleId(currentItem.articleId._id);
      if (!articleInput?.trim()) {
        setArticleInput(currentItem.articleId.name ?? "");
      }
      setArticleError("");
    }
  }, [articleId, articleInput, itemById, itemId]);

  const handleResolveArticle = (value) => {
    const raw = (value ?? "").toString();
    const trimmed = raw.trim();
    if (!trimmed) return;

    // If an item is already selected, article is implicitly valid
    if (itemId) {
      setArticleError("");
      return;
    }

    // If reference data isn't loaded yet, don't show an error.
    if (ArticleState?.loading || !(ArticleState?.data ?? []).length) {
      return;
    }

    const currentArticle = resolveArticleByName(trimmed);
    if (!currentArticle?._id) {
      // Don't wipe price/amount just because user clicked into Qty.
      // Show a hint instead.
      setArticleError("Select a valid article from the list");
      return;
    }

    setArticleError("");

    const nextArticleId = currentArticle._id;
    if (nextArticleId !== articleId) {
      setArticleId(nextArticleId);
      // changing article resets size/item
      setSizeInput("");
      setItemId("");
      setCurrentItemQty("");
      setQty("");
      setPrice("");
      setAmount("");
      setSizeError("");
    }
  };

  const handleResolveSize = (value) => {
    const raw = (value ?? "").toString();
    const trimmed = raw.trim();
    if (!articleId || !trimmed) return;

    // If an item is already selected, size is implicitly valid (common in edit mode)
    if (itemId) {
      setSizeError("");
      return;
    }

    // If reference data isn't loaded yet, don't show an error.
    if (ItemState?.loading || !(ItemState?.data ?? []).length) {
      return;
    }

    const currentItem = resolveItemBySize(trimmed);
    if (!currentItem?._id) {
      // Don't wipe price/amount just because focus moved to Qty.
      setSizeError("Select a valid size from the list");
      return;
    }

    setSizeError("");

    const previousItemId = itemId;
    const nextItemId = currentItem._id;
    setItemId(nextItemId);

    // IMPORTANT: Don't clobber price during edit if item didn't actually change.
    if (nextItemId !== previousItemId) {
      setPrice(currentItem.sale ?? "");
    } else if (price === "") {
      setPrice(currentItem.sale ?? "");
    }

    setCurrentItemQty(currentItem.qty ?? "");

    if (saleType === "SALE" && Number(currentItem.qty ?? 0) <= 0) {
      setQty("");
      setAmount("");
    }
  };

  const handleAdd = () => {
    if (!articleId || !itemId || !articleInput || !sizeInput) {
      WarningToast("Please select article name and size");
      return;
    }
    if (!qty || Number.isNaN(Number(qty)) || Number(qty) <= 0) {
      WarningToast("Please enter a valid quantity");
      return;
    }
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
      WarningToast("Please enter a valid unit price");
      return;
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      WarningToast("Please enter valid amount");
      return;
    }

    if (saleType === "SALE" && availableStock !== null && Number(qty) > Number(availableStock)) {
      WarningToast(`Quantity must be less than or equal to ${availableStock}`);
      return;
    }

    if (editingIndex !== null) {
      const next = [...(NewItems ?? [])];
      next[editingIndex] = {
        ...next[editingIndex],
        itemId: itemId,
        article_name: articleInput,
        article_size: sizeInput,
        qty: Number(qty),
        price: Number(price),
        purchase: Number(price),
        amount: Number(amount),
      };
      setNewItems(next);
    } else {
      setNewItems([
        ...(NewItems ?? []),
        {
          itemId: itemId,
          article_name: articleInput,
          article_size: sizeInput,
          qty: Number(qty),
          price: Number(price),
          purchase: Number(price),
          amount: Number(amount),
        },
      ]);
    }

    resetInputs();
  };

  const handleRemove = (idx) => {
    const next = (NewItems ?? []).filter((_, i) => i !== idx);
    setNewItems(next);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-900">Invoice items</div>
        <div className="flex items-center gap-2">
          {saleType === "SALE" ? (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
              SALE
            </span>
          ) : (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
              RETURN
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            Items: {(NewItems ?? []).length}
          </span>
        </div>
      </div>

      {/* Mobile add form */}
      <div className="space-y-3 p-4 md:hidden">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Article
          </label>
          <input
            ref={articleNameRef}
            type="text"
            list="InvoiceArticleNameList"
            value={articleInput}
            onChange={(e) => {
              const v = e.target.value;
              setArticleInput(v);
              setArticleError("");
              if (!v.trim()) {
                setArticleId("");
                setSizeInput("");
                setItemId("");
                setCurrentItemQty("");
                setQty("");
                setPrice("");
                setAmount("");
                setSizeError("");
                return;
              }
              if (
                articleId &&
                selectedArticleNameLower &&
                v.trim().toLowerCase() !== selectedArticleNameLower
              ) {
                setArticleId("");
                setSizeInput("");
                setItemId("");
                setCurrentItemQty("");
                setQty("");
                setPrice("");
                setAmount("");
                setSizeError("");
              }
              const a = resolveArticleByName(v);
              if (a?._id && a._id !== articleId) {
                setArticleId(a._id);
                setSizeInput("");
                setItemId("");
                setCurrentItemQty("");
                setQty("");
                setPrice("");
                setAmount("");
                setSizeError("");
              }
            }}
            onBlur={(e) => handleResolveArticle(e.target.value)}
            placeholder="Select article"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          {!!articleError && (
            <div className="mt-1 text-[11px] font-semibold text-red-600">
              {articleError}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Size
          </label>
          <input
            type="text"
            list="InvoiceArticleSizeList"
            value={sizeInput}
            onChange={(e) => {
              const v = e.target.value;
              setSizeInput(v);
              setSizeError("");
              if (!v.trim()) {
                setItemId("");
                setCurrentItemQty("");
                setQty("");
                setPrice("");
                setAmount("");
                return;
              }
              const found = resolveItemBySize(v);
              if (found?._id) {
                const previousItemId = itemId;
                const nextItemId = found._id;
                setItemId(nextItemId);
                if (nextItemId !== previousItemId) {
                  setPrice(found.sale ?? "");
                } else if (price === "") {
                  setPrice(found.sale ?? "");
                }
                setCurrentItemQty(found.qty ?? "");
              }
            }}
            onBlur={(e) => handleResolveSize(e.target.value)}
            placeholder={articleId ? "Select size" : "Select article first"}
            disabled={!articleId}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
          />
          {!!sizeError && (
            <div className="mt-1 text-[11px] font-semibold text-red-600">
              {sizeError}
            </div>
          )}
          {saleType === "SALE" && itemId && (
            <div
              className={[
                "mt-1 text-[11px]",
                isOutOfStock ? "text-red-600 font-bold" : "text-slate-500",
              ].join(" ")}
            >
              {isOutOfStock ? "Out of stock" : `Stock: ${currentItemQty}`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Qty
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              disabled={isOutOfStock}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Unit price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700"
          />
        </div>

        <div className="flex gap-2">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={resetInputs}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {editingIndex !== null ? "Save" : "Add item"}
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {(NewItems ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No items added yet.
            </div>
          ) : (
            (NewItems ?? []).map((it, idx) => (
              <div
                key={`${it?.itemId ?? "item"}-${idx}`}
                className={[
                  "rounded-xl border border-slate-200 p-4",
                  editingIndex === idx ? "ring-2 ring-accent/40" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-900">
                      {it?.article_name ?? "-"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Size: {it?.article_size ?? "-"} · Qty: {it?.qty ?? 0}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">
                      {formatPKR(it?.amount ?? 0)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatPKR(it?.price ?? 0)} / unit
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(it, idx)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-bold text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 w-[60px]">#</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3 w-[140px]">Qty</th>
              <th className="px-4 py-3 w-[160px]">Unit price</th>
              <th className="px-4 py-3 w-[180px]">Amount</th>
              <th className="px-4 py-3 w-[140px] text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Input row */}
            <tr className="bg-white">
              <td className="px-4 py-3 text-slate-400 font-semibold">—</td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  list="InvoiceArticleNameList"
                  value={articleInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setArticleInput(v);
                    setArticleError("");
                    if (!v.trim()) {
                      setArticleId("");
                      setSizeInput("");
                      setItemId("");
                      setCurrentItemQty("");
                      setQty("");
                      setPrice("");
                      setAmount("");
                      setSizeError("");
                      return;
                    }

                    if (
                      articleId &&
                      selectedArticleNameLower &&
                      v.trim().toLowerCase() !== selectedArticleNameLower
                    ) {
                      setArticleId("");
                      setSizeInput("");
                      setItemId("");
                      setCurrentItemQty("");
                      setQty("");
                      setPrice("");
                      setAmount("");
                      setSizeError("");
                    }

                    const a = resolveArticleByName(v);
                    if (a?._id && a._id !== articleId) {
                      setArticleId(a._id);
                      setSizeInput("");
                      setItemId("");
                      setCurrentItemQty("");
                      setQty("");
                      setPrice("");
                      setAmount("");
                      setSizeError("");
                    }
                  }}
                  onBlur={(e) => handleResolveArticle(e.target.value)}
                  placeholder="Select article"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                {!!articleError && (
                  <div className="mt-1 text-[11px] font-semibold text-red-600">
                    {articleError}
                  </div>
                )}
                <datalist id="InvoiceArticleNameList">
                  {(ArticleState?.data ?? []).map((a) => (
                    <option key={a._id} value={a.name} />
                  ))}
                </datalist>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  list="InvoiceArticleSizeList"
                  value={sizeInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSizeInput(v);
                    setSizeError("");
                    if (!v.trim()) {
                      setItemId("");
                      setCurrentItemQty("");
                      setQty("");
                      setPrice("");
                      setAmount("");
                      return;
                    }
                    const found = resolveItemBySize(v);
                    if (found?._id) {
                      const previousItemId = itemId;
                      const nextItemId = found._id;
                      setItemId(nextItemId);
                      if (nextItemId !== previousItemId) {
                        setPrice(found.sale ?? "");
                      } else if (price === "") {
                        setPrice(found.sale ?? "");
                      }
                      setCurrentItemQty(found.qty ?? "");
                    }
                  }}
                  onBlur={(e) => handleResolveSize(e.target.value)}
                  placeholder={articleId ? "Select size" : "Select article first"}
                  disabled={!articleId}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-400"
                />
                <datalist id="InvoiceArticleSizeList">
                  {sizeOptions.map((it) => (
                    <option key={it._id} value={it.size} />
                  ))}
                </datalist>
                {!!sizeError && (
                  <div className="mt-1 text-[11px] font-semibold text-red-600">
                    {sizeError}
                  </div>
                )}
                {saleType === "SALE" && itemId && (
                  <div
                    className={[
                      "mt-1 text-[11px]",
                      isOutOfStock ? "text-red-600" : "text-slate-500",
                    ].join(" ")}
                  >
                    {isOutOfStock ? (
                      <span className="font-bold">Out of stock</span>
                    ) : (
                      <>
                        Stock:{" "}
                        <span className="font-semibold">{currentItemQty}</span>
                      </>
                    )}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder={isOutOfStock ? "No stock" : "Qty"}
                  disabled={isOutOfStock}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Unit price"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={amount}
                  disabled
                  placeholder="Amount"
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 outline-none"
                />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={resetInputs}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.99] transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingIndex !== null ? "Save" : "Add"}
                  </button>
                </div>
              </td>
            </tr>

            {(NewItems ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No items added yet.
                </td>
              </tr>
            ) : (
              (NewItems ?? []).map((it, idx) => (
                <tr
                  key={`${it?.itemId ?? "item"}-${idx}`}
                  className={[
                    "bg-white",
                    editingIndex === idx ? "ring-1 ring-slate-200" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 font-semibold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {it?.article_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {it?.article_size ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{it?.qty ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatPKR(it?.price ?? 0)}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatPKR(it?.amount ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(it, idx)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.99] transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 active:scale-[0.99] transition"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shared datalists for mobile form */}
      <datalist id="InvoiceArticleNameList">
        {(ArticleState?.data ?? []).map((a) => (
          <option key={a._id} value={a.name} />
        ))}
      </datalist>
      <datalist id="InvoiceArticleSizeList">
        {sizeOptions.map((it) => (
          <option key={it._id} value={it.size} />
        ))}
      </datalist>
    </div>
  );
}

