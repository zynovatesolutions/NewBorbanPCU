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

export default function StockItemInputTable({ stockItems, setStockItems }) {
  const dispatch = useDispatch();
  const ItemState = useSelector((state) => state.ItemState);
  const ArticleState = useSelector((state) => state.ArticleState);

  const articleNameRef = useRef(null);

  const [articleInput, setArticleInput] = useState("");
  const [articleId, setArticleId] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [articleError, setArticleError] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [qty, setQty] = useState("");
  const [purchase, setPurchase] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

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

  const resetInputs = () => {
    setArticleInput("");
    setArticleId("");
    setSizeInput("");
    setSizeId("");
    setQty("");
    setPurchase("");
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
    setArticleId(row.articleId ?? "");
    setArticleInput(row.article_name ?? "");
    setSizeId(row.sizeId ?? "");
    setSizeInput(row.size ?? "");
    setQty(row.qty?.toString?.() ?? "");
    setPurchase(row.purchase?.toString?.() ?? "");
    requestAnimationFrame(() => {
      articleNameRef.current?.focus?.();
    });
  };

  const handleResolveArticle = (value) => {
    const trimmed = (value ?? "").toString().trim();
    if (!trimmed) return;
    if (ArticleState?.loading || !(ArticleState?.data ?? []).length) return;

    const currentArticle = resolveArticleByName(trimmed);
    if (!currentArticle?._id) {
      setArticleError("Select a valid article from the list");
      return;
    }

    setArticleError("");
    const nextArticleId = currentArticle._id;
    if (nextArticleId !== articleId) {
      setArticleId(nextArticleId);
      setSizeInput("");
      setSizeId("");
      setQty("");
      setPurchase("");
      setSizeError("");
    }
  };

  const handleResolveSize = (value) => {
    const trimmed = (value ?? "").toString().trim();
    if (!articleId || !trimmed) return;
    if (ItemState?.loading || !(ItemState?.data ?? []).length) return;

    const currentItem = resolveItemBySize(trimmed);
    if (!currentItem?._id) {
      setSizeError("Select a valid size from the list");
      return;
    }

    setSizeError("");
    const previousSizeId = sizeId;
    const nextSizeId = currentItem._id;
    setSizeId(nextSizeId);
    if (nextSizeId !== previousSizeId && purchase === "") {
      setPurchase(currentItem.purchase ?? currentItem.sale ?? "");
    }
  };

  const handleAdd = () => {
    if (!articleId || !sizeId || !articleInput || !sizeInput) {
      WarningToast("Please select article name and size");
      return;
    }
    if (!qty || Number.isNaN(Number(qty)) || Number(qty) <= 0) {
      WarningToast("Please enter a valid quantity");
      return;
    }

    const purchaseValue =
      purchase === "" || purchase === null || purchase === undefined
        ? 0
        : Number(purchase);

    if (Number.isNaN(purchaseValue) || purchaseValue < 0) {
      WarningToast("Please enter a valid purchase price");
      return;
    }

    const row = {
      articleId,
      article_name: articleInput,
      sizeId,
      size: sizeInput,
      qty: Number(qty),
      purchase: purchaseValue,
      total_amount: Number(qty) * purchaseValue,
    };

    if (editingIndex !== null) {
      const next = [...(stockItems ?? [])];
      next[editingIndex] = row;
      setStockItems(next);
    } else {
      setStockItems([...(stockItems ?? []), row]);
    }

    resetInputs();
  };

  const handleRemove = (idx) => {
    setStockItems((stockItems ?? []).filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-900">Stock items</div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          Items: {(stockItems ?? []).length}
        </span>
      </div>

      {/* Mobile */}
      <div className="space-y-3 p-4 md:hidden">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Article
          </label>
          <input
            ref={articleNameRef}
            type="text"
            list="StockArticleNameList"
            value={articleInput}
            onChange={(e) => {
              const v = e.target.value;
              setArticleInput(v);
              setArticleError("");
              if (!v.trim()) {
                setArticleId("");
                setSizeInput("");
                setSizeId("");
                setQty("");
                setPurchase("");
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
                setSizeId("");
                setQty("");
                setPurchase("");
                setSizeError("");
              }
              const a = resolveArticleByName(v);
              if (a?._id && a._id !== articleId) {
                setArticleId(a._id);
                setSizeInput("");
                setSizeId("");
                setQty("");
                setPurchase("");
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
            list="StockArticleSizeList"
            value={sizeInput}
            onChange={(e) => {
              const v = e.target.value;
              setSizeInput(v);
              setSizeError("");
              if (!v.trim()) {
                setSizeId("");
                setQty("");
                setPurchase("");
                return;
              }
              const found = resolveItemBySize(v);
              if (found?._id) {
                const previousSizeId = sizeId;
                setSizeId(found._id);
                if (previousSizeId !== found._id && purchase === "") {
                  setPurchase(found.purchase ?? found.sale ?? "");
                }
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Purchase
            </label>
            <input
              type="number"
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
        <div className="text-sm font-semibold text-slate-700">
          Total:{" "}
          {qty
            ? formatPKR(
                Number(qty) * (purchase === "" ? 0 : Number(purchase) || 0)
              )
            : "—"}
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
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white"
          >
            {editingIndex !== null ? "Save" : "Add item"}
          </button>
        </div>
        <div className="space-y-3 pt-1">
          {(stockItems ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              No stock items added yet.
            </div>
          ) : (
            (stockItems ?? []).map((it, idx) => (
              <div
                key={`${it?.sizeId ?? "item"}-${idx}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {it?.article_name ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Size: {it?.size ?? "-"} · Qty: {it?.qty ?? 0}
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-slate-900">
                    {formatPKR(it?.total_amount ?? 0)}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(it, idx)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold"
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

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 w-[60px]">#</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3 w-[120px]">Qty</th>
              <th className="px-4 py-3 w-[140px]">Purchase</th>
              <th className="px-4 py-3 w-[140px]">Total</th>
              <th className="px-4 py-3 w-[140px] text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            <tr className="bg-white">
              <td className="px-4 py-3 text-slate-400 font-semibold">—</td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  list="StockArticleNameList"
                  value={articleInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setArticleInput(v);
                    setArticleError("");
                    if (!v.trim()) {
                      setArticleId("");
                      setSizeInput("");
                      setSizeId("");
                      setQty("");
                      setPurchase("");
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
                      setSizeId("");
                      setQty("");
                      setPurchase("");
                      setSizeError("");
                    }
                    const a = resolveArticleByName(v);
                    if (a?._id && a._id !== articleId) {
                      setArticleId(a._id);
                      setSizeInput("");
                      setSizeId("");
                      setQty("");
                      setPurchase("");
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
                <datalist id="StockArticleNameList">
                  {(ArticleState?.data ?? []).map((a) => (
                    <option key={a._id} value={a.name} />
                  ))}
                </datalist>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  list="StockArticleSizeList"
                  value={sizeInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSizeInput(v);
                    setSizeError("");
                    if (!v.trim()) {
                      setSizeId("");
                      setQty("");
                      setPurchase("");
                      return;
                    }
                    const found = resolveItemBySize(v);
                    if (found?._id) {
                      const previousSizeId = sizeId;
                      setSizeId(found._id);
                      if (previousSizeId !== found._id && purchase === "") {
                        setPurchase(found.purchase ?? found.sale ?? "");
                      }
                    }
                  }}
                  onBlur={(e) => handleResolveSize(e.target.value)}
                  placeholder={articleId ? "Select size" : "Select article first"}
                  disabled={!articleId}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-400"
                />
                <datalist id="StockArticleSizeList">
                  {sizeOptions.map((it) => (
                    <option key={it._id} value={it.size} />
                  ))}
                </datalist>
                {!!sizeError && (
                  <div className="mt-1 text-[11px] font-semibold text-red-600">
                    {sizeError}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Qty"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value)}
                  placeholder="Purchase (optional)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </td>
              <td className="px-4 py-3 text-slate-600 font-semibold">
                {qty
                  ? formatPKR(
                      Number(qty) *
                        (purchase === "" ? 0 : Number(purchase) || 0)
                    )
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={resetInputs}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    {editingIndex !== null ? "Save" : "Add"}
                  </button>
                </div>
              </td>
            </tr>

            {(stockItems ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No stock items added yet. Add article, size, qty and purchase
                  above.
                </td>
              </tr>
            ) : (
              (stockItems ?? []).map((it, idx) => (
                <tr
                  key={`${it?.sizeId ?? "item"}-${idx}`}
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
                    {it?.size ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{it?.qty ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatPKR(it?.purchase ?? 0)}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatPKR(it?.total_amount ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(it, idx)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
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

      <datalist id="StockArticleNameList">
        {(ArticleState?.data ?? []).map((a) => (
          <option key={a._id} value={a.name} />
        ))}
      </datalist>
      <datalist id="StockArticleSizeList">
        {sizeOptions.map((it) => (
          <option key={it._id} value={it.size} />
        ))}
      </datalist>
    </div>
  );
}
