import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import {
  ErrorToast,
  SuccessToast,
  WarningToast,
} from "../../../utils/ShowToast";
import CustomerSelector from "../../../components/Selector/CustomerSelector";
import SaleType from "../../../components/Inputs/SaleType";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import {
  CreateReturnApi,
  CreateTransactionApi,
  GetNextInvoiceNoApi,
} from "../../../ApiRequests";
import { fetchItems } from "../../../store/Slices/ItemSlice";
import {
  getThermalPageStyle,
  loadAppConfig,
  syncAppConfigFromServer,
} from "../../../utils/appConfig";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSearch,
  FiArrowRight,
  FiPause,
  FiUser,
} from "react-icons/fi";

const branchId = "";

/** Existing counter-sale amount formula — do not change */
const lineAmount = (qty, price) => Number(qty) * 12 * Number(price);

/** Local `YYYY-MM-DDTHH:mm` for datetime-local inputs */
const toDateTimeLocal = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return toDateTimeLocal(new Date());
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const normalizeDateTimeValue = (value) => {
  if (!value) return toDateTimeLocal();
  if (String(value).includes("T")) return String(value).slice(0, 16);
  return `${String(value).slice(0, 10)}T00:00`;
};

const formatDateTimeDisplay = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value || "—";
  return dt.toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const A4_PAGE_STYLE = `
  @page { margin: 0; size: A4; }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }
  }
`;

const PILL_STYLES = [
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-orange-100 text-orange-800",
  "bg-cyan-100 text-cyan-800",
  "bg-indigo-100 text-indigo-800",
  "bg-lime-100 text-lime-800",
];

const pillStyleFor = (name) => {
  if (!name || name === "All") return "bg-blue-600 text-white";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % PILL_STYLES.length;
  return PILL_STYLES[hash];
};

const userData = (() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
})();

const LAYOUT_KEY = "gp-pos-counter-layout-v1";
const HOLD_KEY = "gp-pos-held-sales-v1";
const DEFAULT_LAYOUT = { cartWidth: 460, metaHeight: 112, footerHeight: 200 };
const DESKTOP_MQ = "(min-width: 768px)";

const loadLayout = () => {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return { ...DEFAULT_LAYOUT };
    return { ...DEFAULT_LAYOUT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_LAYOUT };
  }
};

const loadHeldSales = () => {
  try {
    const raw = localStorage.getItem(HOLD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const CounterSale = () => {
  const dispatch = useDispatch();
  const ItemState = useSelector((state) => state.ItemState);

  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [NewItems, setNewItems] = useState([]);
  const [Discount, setDiscount] = useState("");
  const [CurDate, setCurDate] = useState(() => toDateTimeLocal());
  const [InvoiceNo, setInvoiceNo] = useState("");
  const [Description, setDescription] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [saleType, setSaleType] = useState("SALE");
  const [SaleInvoiceNo, setSaleInvoiceNo] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [articleFilter, setArticleFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : false
  );
  const [layout, setLayout] = useState(loadLayout);
  const [draggingKind, setDraggingKind] = useState(null);
  const [heldSales, setHeldSales] = useState(loadHeldSales);
  const [showHeldPanel, setShowHeldPanel] = useState(false);
  const [appConfig, setAppConfig] = useState(() => loadAppConfig());
  const [printFormat, setPrintFormat] = useState(() => {
    try {
      const v = localStorage.getItem("gp-pos-print-format");
      if (v === "thermal" || v === "a4") return v;
      return loadAppConfig().defaultPrintFormat === "thermal" ? "thermal" : "a4";
    } catch {
      return "a4";
    }
  });
  const [printPayload, setPrintPayload] = useState(null);
  const rowsPerPage = 10;
  const searchInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const splitRef = useRef(null);
  const asideRef = useRef(null);
  const dragRef = useRef(null);
  const printRef = useRef(null);

  const cashierName =
    userData?.name || userData?.username || userData?.email || "Cashier";
  const cashierInitial = String(cashierName).charAt(0).toUpperCase();

  const loadNextInvoiceNo = async () => {
    try {
      const res = await GetNextInvoiceNoApi();
      const next = res?.data?.data?.payload?.invoice_no;
      setInvoiceNo(next != null ? String(next) : "");
    } catch {
      setInvoiceNo("");
    }
  };

  useEffect(() => {
    dispatch(fetchItems());
    loadNextInvoiceNo();
    syncAppConfigFromServer()
      .then((cfg) => {
        setAppConfig(cfg);
        setPrintFormat((prev) => {
          try {
            const v = localStorage.getItem("gp-pos-print-format");
            if (v === "thermal" || v === "a4") return v;
          } catch {
            /* ignore */
          }
          return cfg.defaultPrintFormat === "thermal" ? "thermal" : "a4";
        });
      })
      .catch(() => setAppConfig(loadAppConfig()));
  }, [dispatch]);

  useEffect(() => {
    const onFocus = () => {
      syncAppConfigFromServer()
        .then(setAppConfig)
        .catch(() => setAppConfig(loadAppConfig()));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(HOLD_KEY, JSON.stringify(heldSales));
  }, [heldSales]);

  useEffect(() => {
    localStorage.setItem("gp-pos-print-format", printFormat);
  }, [printFormat]);

  useEffect(() => {
    if (!draggingKind) return;

    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (e.cancelable && e.touches) e.preventDefault();
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const clientY = e.touches?.[0]?.clientY ?? e.clientY;

      if (drag.kind === "width") {
        const rect = splitRef.current?.getBoundingClientRect();
        if (!rect) return;
        const next = Math.round(clientX - rect.left);
        const min = 280;
        const max = Math.max(min, Math.round(rect.width * 0.62));
        setLayout((prev) => ({
          ...prev,
          cartWidth: Math.min(max, Math.max(min, next)),
        }));
        return;
      }

      if (drag.kind === "meta") {
        const delta = clientY - drag.startY;
        const next = Math.round(drag.startMeta + delta);
        setLayout((prev) => ({
          ...prev,
          metaHeight: Math.min(260, Math.max(56, next)),
        }));
        return;
      }

      if (drag.kind === "footer") {
        const delta = drag.startY - clientY;
        const next = Math.round(drag.startFooter + delta);
        const asideH = asideRef.current?.clientHeight ?? 600;
        const maxFooter = Math.max(140, asideH - 180);
        setLayout((prev) => ({
          ...prev,
          footerHeight: Math.min(maxFooter, Math.max(140, next)),
        }));
      }
    };

    const onUp = () => {
      dragRef.current = null;
      setDraggingKind(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [draggingKind]);

  const startDrag = (kind) => (e) => {
    if (!isDesktop) return;
    e.preventDefault();
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    dragRef.current = {
      kind,
      startY: clientY,
      startMeta: layout.metaHeight,
      startFooter: layout.footerHeight,
    };
    setDraggingKind(kind);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable;

      if ((e.key === "/" || e.key === "F3") && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select?.();
        return;
      }
      if (e.key === "F5") {
        e.preventDefault();
        document.getElementById("pos-create-print")?.click();
        return;
      }
      if (e.key === "F6" && !isTyping) {
        e.preventDefault();
        discountInputRef.current?.focus();
        discountInputRef.current?.select?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const billTotal = useMemo(
    () => NewItems.reduce((total, item) => total + Number(item?.amount || 0), 0),
    [NewItems]
  );
  const discountNumber = useMemo(() => Number(Discount) || 0, [Discount]);
  const netTotal = useMemo(
    () => Math.max(0, billTotal - discountNumber),
    [billTotal, discountNumber]
  );

  const hasCustomer = Boolean(SelectedCustomer?._id);
  const hasItems = NewItems.length > 0;
  const canSubmit =
    hasCustomer && Boolean(CurDate) && hasItems && !Loading;

  const customerRemaining = Number(SelectedCustomer?.remaining || 0);
  const remainingAfter = useMemo(() => {
    if (!SelectedCustomer) return 0;
    if (saleType !== "SALE") return customerRemaining;
    return customerRemaining + netTotal;
  }, [SelectedCustomer, customerRemaining, netTotal, saleType]);

  const stockByItemId = useMemo(() => {
    const map = new Map();
    for (const it of ItemState?.data ?? []) {
      if (it?._id) map.set(it._id, Number(it?.qty ?? 0));
    }
    return map;
  }, [ItemState?.data]);

  const articleNames = useMemo(() => {
    const set = new Set();
    for (const it of ItemState?.data ?? []) {
      if (it?.article_name) set.add(it.article_name);
    }
    return ["All", ...Array.from(set).sort()];
  }, [ItemState?.data]);

  const visibleArticles = useMemo(
    () => articleNames.slice(0, 8),
    [articleNames]
  );
  const moreArticles = useMemo(
    () => articleNames.slice(8),
    [articleNames]
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return (ItemState?.data ?? []).filter((it) => {
      if (articleFilter !== "All" && it.article_name !== articleFilter)
        return false;
      if (!q) return true;
      const name = `${it.article_name || ""} ${it.size || ""}`.toLowerCase();
      return name.includes(q);
    });
  }, [ItemState?.data, productSearch, articleFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const pagedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [productSearch, articleFilter]);

  const cartQtyFor = (itemId) =>
    NewItems.filter((r) => r.itemId === itemId).reduce(
      (s, r) => s + Number(r.qty || 0),
      0
    );

  const resetForm = () => {
    setSelectedCustomer("");
    setDescription("");
    setShowNote(false);
    setNewItems([]);
    setSaleInvoiceNo("");
    setCurDate(toDateTimeLocal());
    setDiscount("");
    setProductSearch("");
    setArticleFilter("All");
    loadNextInvoiceNo();
  };

  const finishAfterPrint = () => {
    setPrintPayload(null);
    resetForm();
    dispatch(fetchItems());
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Sale Invoice",
    removeAfterPrint: true,
    onAfterPrint: finishAfterPrint,
    pageStyle:
      printPayload?.format === "thermal"
        ? getThermalPageStyle(
            printPayload?.thermalWidthMm ?? appConfig.thermalWidthMm
          )
        : A4_PAGE_STYLE,
  });

  // Note: Printing ko separate effect mein trigger nahi kar rahe.
  // Browser pop-up blockers async setState/effect timing par dialog block kar sakte hain,
  // is liye print success ke foran baad trigger karte hain (see `onSubmit`).

  const holdCurrentSale = () => {
    if (!SelectedCustomer?._id) {
      WarningToast("Please select a customer first");
      return;
    }
    if (!NewItems.length) {
      WarningToast("Add items before holding a sale");
      return;
    }
    const held = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      heldAt: Date.now(),
      customer: SelectedCustomer,
      items: NewItems,
      discount: Discount,
      description: Description,
      showNote,
      saleType,
      saleInvoiceNo: SaleInvoiceNo,
      curDate: CurDate,
    };
    setHeldSales((prev) => [held, ...prev]);
    resetForm();
    SuccessToast("Sale held successfully");
    setShowHeldPanel(true);
  };

  const resumeHeldSale = (id) => {
    const held = heldSales.find((h) => h.id === id);
    if (!held) return;
    if (NewItems.length > 0) {
      WarningToast("Clear or hold the current cart before resuming");
      return;
    }
    setSelectedCustomer(held.customer || "");
    setNewItems(Array.isArray(held.items) ? held.items : []);
    setDiscount(held.discount ?? "");
    setDescription(held.description || "");
    setShowNote(Boolean(held.showNote || held.description));
    setSaleType(held.saleType === "RETURN" ? "RETURN" : "SALE");
    setSaleInvoiceNo(held.saleInvoiceNo || "");
    setCurDate(normalizeDateTimeValue(held.curDate));
    setHeldSales((prev) => prev.filter((h) => h.id !== id));
    setShowHeldPanel(false);
    SuccessToast("Held sale restored");
  };

  const removeHeldSale = (id) => {
    setHeldSales((prev) => prev.filter((h) => h.id !== id));
  };

  const onHoldSaleClick = () => {
    if (NewItems.length > 0) {
      holdCurrentSale();
      return;
    }
    setShowHeldPanel(true);
  };

  const handleCustomerChange = (customer) => {
    const nextId = customer?._id || "";
    const prevId = SelectedCustomer?._id || "";
    setSelectedCustomer(customer);
    // Same customer refresh (e.g. after edit) — keep cart/invoice fields
    if (nextId && nextId === prevId) return;
    setNewItems([]);
    setDescription("");
    setShowNote(false);
    setDiscount("");
  };

  const addProductToCart = (item) => {
    if (!hasCustomer) {
      WarningToast("Please select a customer first");
      return;
    }
    if (!item?._id) return;

    const stock = Number(item.qty ?? 0);
    const price = Number(item.sale ?? 0);
    if (!price) {
      WarningToast("This product has no sale price");
      return;
    }

    const existingIdx = NewItems.findIndex((r) => r.itemId === item._id);
    if (existingIdx >= 0) {
      const next = [...NewItems];
      const row = next[existingIdx];
      const nextQty = Number(row.qty) + 1;
      if (saleType === "SALE" && nextQty > stock) {
        WarningToast(`Only ${stock} in stock`);
        return;
      }
      next[existingIdx] = {
        ...row,
        qty: nextQty,
        amount: lineAmount(nextQty, row.price),
      };
      setNewItems(next);
      return;
    }

    if (saleType === "SALE" && stock <= 0) {
      WarningToast("Out of stock");
      return;
    }

    setNewItems([
      ...NewItems,
      {
        itemId: item._id,
        article_name: item.article_name,
        article_size: item.size,
        qty: 1,
        price,
        purchase: price,
        amount: lineAmount(1, price),
      },
    ]);
  };

  const updateCartQty = (idx, nextQty) => {
    const qty = Number(nextQty);
    if (!qty || qty <= 0) {
      setNewItems(NewItems.filter((_, i) => i !== idx));
      return;
    }
    const row = NewItems[idx];
    const stock = stockByItemId.get(row.itemId) ?? 0;
    if (saleType === "SALE" && qty > stock) {
      WarningToast(`Quantity must be ≤ ${stock}`);
      return;
    }
    const next = [...NewItems];
    next[idx] = {
      ...row,
      qty,
      amount: lineAmount(qty, row.price),
    };
    setNewItems(next);
  };

  const updateCartPrice = (idx, nextPrice) => {
    const row = NewItems[idx];
    const next = [...NewItems];
    if (nextPrice === "" || nextPrice === null || nextPrice === undefined) {
      next[idx] = {
        ...row,
        price: "",
        purchase: 0,
        amount: 0,
      };
      setNewItems(next);
      return;
    }
    const price = Number(nextPrice);
    if (!Number.isFinite(price) || price < 0) return;
    next[idx] = {
      ...row,
      price,
      purchase: price,
      amount: lineAmount(row.qty, price),
    };
    setNewItems(next);
  };

  const removeCartRow = (idx) => {
    setNewItems(NewItems.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (Loading) return;

    if (!SelectedCustomer) return WarningToast("Please select a customer");
    if (!CurDate) return WarningToast("Please enter invoice date");
    if (!NewItems.length) return WarningToast("Add at least one item");
    if (
      NewItems.some(
        (row) =>
          !Number(row.price) || Number(row.price) <= 0 || !Number(row.amount)
      )
    ) {
      return WarningToast("Please enter a valid unit price for all items");
    }

    const desc = Description.trim() || "Counter Sale";

    setLoading(true);
    try {
      let response;
      if (saleType === "SALE") {
        response = await CreateTransactionApi({
          customerId: SelectedCustomer._id,
          date: CurDate,
          items: NewItems,
          discount: discountNumber,
          desc,
          ...(branchId && { branchId }),
        });
      } else {
        response = await CreateReturnApi({
          customerId: SelectedCustomer._id,
          items: NewItems,
          date: CurDate,
          sale_invoice_no: SaleInvoiceNo ? Number(SaleInvoiceNo) : null,
          ...(branchId && { branchId }),
        });
      }

      if (response.data.success) {
        SuccessToast(
          saleType === "SALE"
            ? "Sale invoice created successfully"
            : "Return invoice created successfully"
        );
        const inv = response.data.data.payload;
        const lineTotal = NewItems.reduce(
          (total, item) => total + Number(item?.amount || 0),
          0
        );
        const disc = saleType === "SALE" ? discountNumber : 0;
        const cfg = loadAppConfig();
        setAppConfig(cfg);
        setPrintPayload({
          format: printFormat,
          saleType,
          invoiceNo: inv?.invoice_no ?? InvoiceNo ?? "—",
          date: CurDate,
          customerName: SelectedCustomer?.name || "—",
          customerAddress:
            SelectedCustomer?.address ?? SelectedCustomer?.Address ?? "",
          desc,
          items: NewItems.map((row) => ({ ...row })),
          discount: disc,
          total: Math.max(0, lineTotal - disc),
          subtotal: lineTotal,
          appName: cfg.appName,
          logoUrl: cfg.logoUrl,
          companyAddress: cfg.companyAddress || "",
          companyContact: cfg.companyContact || "",
          thermalWidthMm: cfg.thermalWidthMm,
          thermalFontSizePx: cfg.thermalFontSizePx,
        });
        // Allow react-to-print template to update once, then open print dialog.
        window.setTimeout(() => {
          try {
            handlePrint();
          } catch (e) {
            // Fallback: if printing library fails, at least don't crash the POS.
            console.error(e);
          }
        }, 0);
      } else {
        ErrorToast(response.data.error?.msg);
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || "Failed to create invoice");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15";

  const ResizeHandle = ({ orientation, onPointerDown, active, label }) => (
    <div
      role="separator"
      aria-orientation={orientation === "vertical" ? "vertical" : "horizontal"}
      aria-label={label}
      onPointerDown={onPointerDown}
      onTouchStart={onPointerDown}
      className={[
        "group relative z-10 shrink-0 touch-none select-none",
        orientation === "vertical"
          ? "hidden w-1.5 cursor-col-resize md:block"
          : "hidden h-1.5 cursor-row-resize md:block",
        active ? "bg-blue-400" : "bg-slate-200 hover:bg-blue-300",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 group-hover:bg-blue-500",
          orientation === "vertical" ? "h-8 w-1" : "h-1 w-8",
          active ? "!bg-blue-600" : "",
        ].join(" ")}
      />
    </div>
  );

  return (
    <div
      className={[
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f1f5f9]",
        draggingKind ? "select-none" : "",
      ].join(" ")}
    >
      {/* Top bar — attachment style */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FiShoppingCart className="text-lg" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight text-slate-900">
              Counter Sale
            </h1>
            <p className="truncate text-xs text-slate-500">
              {SelectedCustomer?.name || "Select customer"}
            </p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5"
            role="group"
            aria-label="Print format"
          >
            <button
              type="button"
              onClick={() => setPrintFormat("a4")}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2",
                printFormat === "a4"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat("thermal")}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2",
                printFormat === "thermal"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              Thermal
            </button>
          </div>
          <SaleType saleType={saleType} setSaleType={setSaleType} />
          <button
            type="button"
            onClick={onHoldSaleClick}
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm"
          >
            <FiPause className="text-sm" />
            <span className="hidden sm:inline">Hold Sale</span>
            {heldSales.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {heldSales.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 sm:px-4 sm:text-sm"
          >
            + New Sale
          </button>
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-2 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {cashierInitial}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-slate-900">
                {cashierName}
              </div>
              <div className="text-[11px] text-slate-500">Cashier</div>
            </div>
          </div>
        </div>
      </header>

      {showHeldPanel && (
        <div
          className="absolute inset-0 z-40 flex items-start justify-end bg-slate-900/30 p-3 sm:p-4"
          onClick={() => setShowHeldPanel(false)}
        >
          <div
            className="flex max-h-[min(80vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-slate-900">Held Sales</div>
                <div className="text-xs text-slate-500">
                  {heldSales.length} parked · resume anytime
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHeldPanel(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {heldSales.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-slate-400">
                  No held sales
                </div>
              ) : (
                heldSales.map((held) => {
                  const itemCount = held.items?.length || 0;
                  const total = (held.items || []).reduce(
                    (s, r) => s + Number(r.amount || 0),
                    0
                  );
                  const disc = Number(held.discount) || 0;
                  const net =
                    held.saleType === "SALE"
                      ? Math.max(0, total - disc)
                      : total;
                  return (
                    <div
                      key={held.id}
                      className="mb-2 rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900">
                            {held.customer?.name || "Customer"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {held.saleType || "SALE"} · {itemCount} item
                            {itemCount === 1 ? "" : "s"} ·{" "}
                            {held.heldAt
                              ? new Date(held.heldAt).toLocaleString()
                              : ""}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-blue-600">
                            {formatPKR(net)}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => resumeHeldSale(held.id)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                          >
                            Resume
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHeldSale(held.id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={splitRef}
        className="flex min-h-0 flex-1 flex-col md:flex-row"
      >
        {/* LEFT — Cart */}
        <aside
          ref={asideRef}
          style={
            isDesktop
              ? { width: layout.cartWidth, flex: "0 0 auto" }
              : undefined
          }
          className="flex min-h-0 min-w-0 flex-col border-b border-slate-200 bg-white max-md:h-[46%] max-md:max-h-[46%] max-md:flex-none md:max-h-none md:flex-none md:border-b-0 md:shadow-[2px_0_12px_rgba(15,23,42,0.04)]"
        >
          <div
            style={
              isDesktop
                ? {
                    height: layout.metaHeight,
                    maxHeight: layout.metaHeight,
                    flex: "0 0 auto",
                  }
                : undefined
            }
            className="shrink-0 space-y-2 overflow-y-auto border-b border-slate-100 p-2.5 md:space-y-1.5 md:p-2"
          >
            <div className="min-w-0">
              <CustomerSelector
                SelectedCustomer={SelectedCustomer}
                setSelectedCustomer={handleCustomerChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                  Invoice No
                </label>
                <input
                  type="text"
                  value={InvoiceNo || "Auto"}
                  readOnly
                  className={`${inputClass} cursor-default bg-slate-50 py-1 text-slate-600`}
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={CurDate}
                  onChange={(e) => setCurDate(e.target.value)}
                  className={`${inputClass} py-1`}
                />
              </div>
              {saleType === "RETURN" && (
                <div className="col-span-2">
                  <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                    Original Sale Invoice
                  </label>
                  <input
                    type="number"
                    value={SaleInvoiceNo}
                    onChange={(e) => setSaleInvoiceNo(e.target.value)}
                    className={`${inputClass} py-1`}
                    placeholder="Optional"
                  />
                </div>
              )}
            </div>
          </div>

          <ResizeHandle
            orientation="horizontal"
            label="Resize customer section"
            active={draggingKind === "meta"}
            onPointerDown={startDrag("meta")}
          />

          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            {NewItems.length === 0 ? (
              <div className="flex h-full min-h-[5rem] flex-col items-center justify-center gap-1 px-4 py-8 text-center text-slate-400">
                <FiShoppingCart className="text-3xl" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs">Click a product to add</p>
              </div>
            ) : (
              <table className="w-full min-w-[320px] text-sm">
                <thead className="sticky top-0 z-[1] bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2 font-semibold md:py-1.5 sm:px-3">#</th>
                    <th className="px-2 py-2 font-semibold md:py-1.5">Item Name</th>
                    <th className="px-2 py-2 font-semibold md:py-1.5">Qty</th>
                    <th className="px-2 py-2 font-semibold md:py-1.5">Price</th>
                    <th className="px-2 py-2 font-semibold text-right md:py-1.5">
                      Total
                    </th>
                    <th className="w-8 px-1 py-2 md:py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {NewItems.map((row, idx) => (
                    <tr
                      key={`${row.itemId}-${idx}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-2 py-2 text-slate-400 md:py-1.5 sm:px-3">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-2 md:py-1.5">
                        <div className="font-semibold text-slate-900">
                          {row.article_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Size: {row.article_size}
                        </div>
                      </td>
                      <td className="px-2 py-2 md:py-1.5">
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <button
                            type="button"
                            className="px-2 py-1 text-slate-600 hover:bg-slate-50"
                            onClick={() =>
                              updateCartQty(idx, Number(row.qty) - 1)
                            }
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) => updateCartQty(idx, e.target.value)}
                            className="w-9 border-x border-slate-200 py-1 text-center text-sm outline-none"
                          />
                          <button
                            type="button"
                            className="px-2 py-1 text-slate-600 hover:bg-slate-50"
                            onClick={() =>
                              updateCartQty(idx, Number(row.qty) + 1)
                            }
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:py-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.price}
                          onChange={(e) =>
                            updateCartPrice(idx, e.target.value)
                          }
                          className="w-[4.5rem] rounded-lg border border-slate-200 px-1.5 py-1 text-right text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 sm:w-20"
                        />
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-slate-900 md:py-1.5">
                        {formatPKR(row.amount)}
                      </td>
                      <td className="px-1 py-2 md:py-1.5">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          onClick={() => removeCartRow(idx)}
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <ResizeHandle
            orientation="horizontal"
            label="Resize checkout section"
            active={draggingKind === "footer"}
            onPointerDown={startDrag("footer")}
          />

          <div
            style={
              isDesktop
                ? {
                    height: layout.footerHeight,
                    maxHeight: layout.footerHeight,
                    flex: "0 0 auto",
                  }
                : undefined
            }
            className="shrink-0 overflow-y-auto border-t border-slate-200 bg-white p-2.5 md:p-2"
          >
            {!showNote ? (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <FiPlus className="text-xs" /> Add Note
              </button>
            ) : (
              <div className="mb-2">
                <input
                  type="text"
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                  placeholder="Invoice note / description"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatPKR(billTotal)}
                </span>
              </div>
              {saleType === "SALE" && (
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span>Discount (Rs)</span>
                  <div className="flex items-center gap-2">
                    <input
                      ref={discountInputRef}
                      type="number"
                      min="0"
                      value={Discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/15"
                    />
                    {discountNumber > 0 && (
                      <span className="text-xs font-semibold text-red-500">
                        − {formatPKR(discountNumber)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-end justify-between border-t border-slate-100 pt-1.5">
                <span className="text-sm font-bold text-slate-800">
                  Total Payable
                </span>
                <span className="text-xl font-bold tracking-tight text-blue-600 md:text-2xl">
                  {formatPKR(saleType === "SALE" ? netTotal : billTotal)}
                </span>
              </div>
              {hasCustomer && saleType === "SALE" && (
                <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                  Balance after:{" "}
                  <span className="font-bold text-slate-900">
                    {formatPKR(remainingAfter)}
                  </span>
                </div>
              )}
            </div>

            {Loading ? (
              <div className="mt-2">
                <FetchingLoading />
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onHoldSaleClick}
                  className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700 hover:bg-amber-100 sm:min-w-[4.5rem]"
                >
                  <FiPause />
                  Hold
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-100 sm:min-w-[4.5rem]"
                >
                  <FiTrash2 />
                  Clear
                </button>
                <button
                  id="pos-create-print"
                  type="button"
                  disabled={!canSubmit}
                  onClick={onSubmit}
                  className={[
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold text-white shadow-sm",
                    canSubmit
                      ? saleType === "SALE"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                      : "cursor-not-allowed bg-slate-300",
                  ].join(" ")}
                >
                  Create & Print
                  <FiArrowRight />
                </button>
              </div>
            )}
          </div>
        </aside>

        <ResizeHandle
          orientation="vertical"
          label="Resize cart panel"
          active={draggingKind === "width"}
          onPointerDown={startDrag("width")}
        />

        {/* RIGHT — Products */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
          <div className="shrink-0 space-y-2.5 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleArticles.map((name) => {
                const active = articleFilter === name;
                const base = pillStyleFor(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setArticleFilter(name)}
                    className={[
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                      active
                        ? name === "All"
                          ? "bg-blue-600 text-white shadow-sm"
                          : `${base} ring-2 ring-offset-1 ring-slate-300`
                        : name === "All"
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : `${base} opacity-80 hover:opacity-100`,
                    ].join(" ")}
                  >
                    {name}
                  </button>
                );
              })}
              {moreArticles.length > 0 && (
                <select
                  value={
                    moreArticles.includes(articleFilter) ? articleFilter : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) setArticleFilter(e.target.value);
                  }}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 outline-none"
                >
                  <option value="">More</option>
                  {moreArticles.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="relative max-w-md">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product by name / size (F3)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
            {ItemState.loading ? (
              <div className="flex justify-center py-20">
                <FetchingLoading />
              </div>
            ) : (
              <div className="h-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="sticky top-0 z-[1] bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-semibold sm:px-4">#</th>
                      <th className="px-3 py-3 font-semibold">Product Name</th>
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Size</th>
                      <th className="px-3 py-3 font-semibold text-right">
                        Price (Rs.)
                      </th>
                      <th className="px-3 py-3 font-semibold text-right sm:px-4">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((item, i) => {
                      const stock = Number(item.qty ?? 0);
                      const inCart = cartQtyFor(item._id);
                      const out =
                        saleType === "SALE" && stock <= 0 && inCart === 0;
                      return (
                        <tr
                          key={item._id}
                          onClick={() => !out && addProductToCart(item)}
                          className={[
                            "border-t border-slate-100 transition",
                            out
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:bg-blue-50/70",
                            inCart > 0 ? "bg-blue-50/50" : "",
                          ].join(" ")}
                        >
                          <td className="px-3 py-3 text-slate-400 sm:px-4">
                            {page * rowsPerPage + i + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-900">
                              {item.article_name}
                            </div>
                            {inCart > 0 && (
                              <div className="mt-0.5 text-[11px] font-bold text-blue-600">
                                In cart: {inCart}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                pillStyleFor(item.article_name),
                              ].join(" ")}
                            >
                              {item.article_name}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-700">
                            {item.size}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-900">
                            {Number(item.sale || 0).toFixed(2)}
                          </td>
                          <td
                            className={[
                              "px-3 py-3 text-right font-bold sm:px-4",
                              stock > 0 ? "text-emerald-600" : "text-red-500",
                            ].join(" ")}
                          >
                            {stock}
                          </td>
                        </tr>
                      );
                    })}
                    {pagedProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-16 text-center text-sm text-slate-400"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 sm:px-4">
            <span>
              Showing{" "}
              {filteredProducts.length === 0 ? 0 : page * rowsPerPage + 1} to{" "}
              {Math.min((page + 1) * rowsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length} items
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let n = i;
                if (pageCount > 5) {
                  const start = Math.min(
                    Math.max(0, page - 2),
                    pageCount - 5
                  );
                  n = start + i;
                }
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={[
                      "min-w-[1.75rem] rounded-lg px-2 py-1 font-semibold",
                      page === n
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {n + 1}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Shortcut footer */}
      <footer className="hidden shrink-0 items-center gap-4 overflow-x-auto border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500 sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-700">
            F3
          </kbd>
          Search
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-700">
            F5
          </kbd>
          Payment
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-700">
            F6
          </kbd>
          Discount
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-700">
            /
          </kbd>
          Focus search
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-slate-400">
          <FiUser className="text-xs" />
          {cashierName}
        </span>
      </footer>

      {/* Off-screen print template — Create & Print triggers browser print directly */}
      <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
        <div ref={printRef}>
          {printPayload?.format === "thermal" ? (
            <div
              className="bg-white p-3 text-black"
              style={{
                width: `${printPayload.thermalWidthMm || 80}mm`,
                fontSize: `${printPayload.thermalFontSizePx || 11}px`,
              }}
            >
              <div className="border-b border-dashed border-black pb-2 text-center">
                {printPayload.logoUrl ? (
                  <img
                    src={printPayload.logoUrl}
                    alt=""
                    className="mx-auto mb-1 h-12 object-contain"
                  />
                ) : null}
                <div className="text-sm font-bold">
                  {printPayload.appName || "Golden Plus PCU"}
                </div>
                {(printPayload.companyAddress || printPayload.companyContact) && (
                  <div className="mt-0.5 text-[10px] leading-snug">
                    {printPayload.companyAddress ? (
                      <div>{printPayload.companyAddress}</div>
                    ) : null}
                    {printPayload.companyContact ? (
                      <div>Tel: {printPayload.companyContact}</div>
                    ) : null}
                  </div>
                )}
                <div className="mt-0.5 text-[10px] uppercase tracking-wide">
                  {printPayload.saleType === "RETURN"
                    ? "Sale Return"
                    : "Sale Invoice"}
                </div>
              </div>
              <div className="space-y-0.5 border-b border-dashed border-black py-2">
                <div className="flex justify-between gap-2">
                  <span>Invoice #</span>
                  <span className="font-semibold">{printPayload.invoiceNo}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Date / Time</span>
                  <span>{formatDateTimeDisplay(printPayload.date)}</span>
                </div>
                <div>
                  <span className="font-semibold">Customer: </span>
                  {printPayload.customerName}
                </div>
                {printPayload.desc ? (
                  <div>
                    <span className="font-semibold">Note: </span>
                    {printPayload.desc}
                  </div>
                ) : null}
              </div>
              <div className="border-b border-dashed border-black py-2">
                <table
                  className="w-full border-collapse"
                  style={{ tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col />
                    <col style={{ width: "2.25rem" }} />
                    <col style={{ width: "4.75rem" }} />
                  </colgroup>
                  <thead>
                    <tr className="text-[10px] font-bold uppercase">
                      <th className="pb-1 text-left font-bold">Item</th>
                      <th className="pb-1 text-right font-bold">Qty</th>
                      <th className="pb-1 text-right font-bold">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printPayload.items || []).map((row, idx) => (
                      <tr
                        key={`${row.itemId}-${idx}`}
                        className="border-t border-dotted border-slate-300 align-top"
                      >
                        <td className="min-w-0 py-1 pr-1">
                          <div className="font-semibold leading-tight">
                            {row.article_name}
                          </div>
                          <div className="text-[10px] leading-tight">
                            Size: {row.article_size}
                            {row.price != null
                              ? ` · ${formatPKR(row.price)}`
                              : ""}
                          </div>
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {row.qty}
                        </td>
                        <td className="py-1 text-right font-semibold tabular-nums">
                          {formatPKR(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {printPayload.discount > 0 && (
                <div className="flex justify-between pt-1">
                  <span>Discount</span>
                  <span>− {formatPKR(printPayload.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total</span>
                <span>{formatPKR(printPayload.total)}</span>
              </div>
              <div className="mt-3 text-center text-[10px]">Thank you</div>
            </div>
          ) : printPayload ? (
            <div className="w-[210mm] bg-white p-6 text-black">
              <div className="border-b-2 border-black pb-3 text-center text-2xl font-bold">
                {printPayload.appName || "Golden Plus PCU"}
              </div>
              <div className="mt-1 text-center text-sm font-semibold">
                {printPayload.saleType === "RETURN"
                  ? "Sale Return"
                  : "Sale Invoice"}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <img
                  src={printPayload.logoUrl || "/GoldenPCU.svg"}
                  alt="Logo"
                  className="h-24 w-auto object-contain"
                />
                <div className="text-right">
                  <div className="text-lg font-bold">
                    Invoice No {printPayload.invoiceNo}
                  </div>
                  <div className="text-sm">
                    {formatDateTimeDisplay(printPayload.date)}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div>
                  <span className="font-bold">Customer Name: </span>
                  {printPayload.customerName}
                </div>
                {printPayload.customerAddress ? (
                  <div>
                    <span className="font-bold">Address: </span>
                    {printPayload.customerAddress}
                  </div>
                ) : null}
                {printPayload.desc ? (
                  <div>
                    <span className="font-bold">Description: </span>
                    {printPayload.desc}
                  </div>
                ) : null}
              </div>
              <table className="mt-4 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Item</th>
                    <th className="py-2 pr-2">Size</th>
                    <th className="py-2 pr-2 text-right">Qty</th>
                    <th className="py-2 pr-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(printPayload.items || []).map((row, idx) => (
                    <tr
                      key={`${row.itemId}-${idx}`}
                      className="border-b border-slate-300"
                    >
                      <td className="py-1.5 pr-2">{idx + 1}</td>
                      <td className="py-1.5 pr-2">{row.article_name}</td>
                      <td className="py-1.5 pr-2">{row.article_size}</td>
                      <td className="py-1.5 pr-2 text-right">{row.qty}</td>
                      <td className="py-1.5 pr-2 text-right">
                        {formatPKR(row.price)}
                      </td>
                      <td className="py-1.5 text-right font-semibold">
                        {formatPKR(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                <div>
                  <span className="font-semibold">Subtotal: </span>
                  {formatPKR(printPayload.subtotal)}
                </div>
                {printPayload.discount > 0 && (
                  <div>
                    <span className="font-semibold">Discount: </span>−{" "}
                    {formatPKR(printPayload.discount)}
                  </div>
                )}
                <div className="text-base font-bold">
                  Grand Total: {formatPKR(printPayload.total)}
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterSale;
