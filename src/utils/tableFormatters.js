import moment from "moment";
import { ConvertExpenseTypeToText } from "./ExpenseConverter";

const currencyFields = [
  "total",
  "amount",
  "payable",
  "total_amount",
  "return_amount",
  "opening_balance",
  "discount",
  "paid",
  "purchase",
  "sale",
  "sale_shop",
  "expense",
  "remaining",
  "dr",
  "cr",
];

const qtyFields = ["in_qty", "out_qty", "qty"];

export function isActionColumn(column) {
  return [
    "actions",
    "payments",
    "customer_payment_actions",
    "company_invoice_actions",
    "invoice_actions",
    "actions_invoice_delete",
  ].includes(column.id);
}

export function formatCellValue(Data, column) {
  if (column.id === "type" && Data.type !== undefined) {
    return ConvertExpenseTypeToText(Data.type);
  }
  if (column.id === "category_id") return Data?.category_id?.name;
  if (column.id === "createdAt")
    return moment(new Date(Data?.createdAt)).format("DD/MM/YYYY hh:mm:ss A");
  if (column.id === "updatedAt")
    return moment(new Date(Data?.updatedAt)).format("DD/MM/YYYY hh:mm:ss A");
  if (column.id === "companyId") return Data?.companyId?.name;
  if (column.id === "customerId") return Data?.customerId?.name;
  if (column.id === "user_Id") return Data?.user_name;
  if (column.id === "categoryId") return Data?.categoryId?.name;
  if (column.id === "subcategoryId") return Data?.subcategoryId?.name;
  if (column.id === "supplierId") return Data?.supplierId?.name;
  if (column.id === "itemId") return Data?.itemId?.name;
  if (column.id === "payment_type")
    return Data.payment_type === 1 ? "Cash" : "Bank";
  if (column.id === "date" && Data.date != null && Data.date !== "") {
    const raw = Data.date;
    // Already a display/ISO string (not a pure numeric timestamp)
    if (typeof raw === "string" && !/^\d+$/.test(raw.trim())) {
      const parsed = moment(
        raw,
        ["DD/MM/YYYY", "DD/MM/YY", "YYYY-MM-DD", "DD MMM YYYY", moment.ISO_8601],
        true
      );
      if (parsed.isValid()) return parsed.format("DD MMM YYYY");
      return raw;
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) return "—";
    const m = num < 1e12 ? moment.unix(num) : moment(num);
    return m.isValid() ? m.format("DD MMM YYYY") : "—";
  }
  if (currencyFields.includes(column.id)) {
    const val = Number(Data[column.id] || 0);
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(val);
  }
  if (qtyFields.includes(column.id)) {
    return Data[column.id] ? Data[column.id].toLocaleString() : "0";
  }
  if (column.id === "catId") return Data[column.id]?.name;
  return Data[column.id];
}

export function getDisplayColumns(Columns) {
  return Columns.filter((col) => !isActionColumn(col));
}

export function getPrimaryColumn(Columns) {
  const priority = ["name", "user_name", "companyId", "customerId", "invoice_no"];
  for (const id of priority) {
    const col = Columns.find((c) => c.id === id && !isActionColumn(c));
    if (col) return col;
  }
  return getDisplayColumns(Columns)[0];
}
