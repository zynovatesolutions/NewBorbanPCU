export const CustomerColumns = [
  {
    id: "actions",
    title: "Actions",
    type: "customer",
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "contact",
    title: "Contact",
  },
  {
    id: "address",
    title: "Address",
  },
  {
    id: "ref",
    title: "Reference",
  },
  {
    id: "page",
    title: "Page",
  },
  {
    id: "total",
    title: "Total",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "return_amount",
    title: "Return Amount",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "opening_balance",
    title: "Opening Balance",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "discount",
    title: "Discount",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "paid",
    title: "Recieved",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "remaining",
    title: "Recievable",

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "date",
    title: "Date",
    format: (value) => value.toLocaleString("en-US"),
  },
];

export const CustomerPaymentsColumns = [
  { id: "actions", title: "Actions" },
  { id: "date", title: "Date" },
  // { id: "invoice_no", title: "Invoice No" },
  { id: "user_name", title: "Customer Name" },
  // { id: "payment_type", title: "Payment Type" },
  { id: "bank_name", title: "Bank Name" },
  // { id: "bank_number", title: "Bank Number" },
  { id: "desc", title: "Description" },
  { id: "amount", title: "Amount" },
];
export const SupplierPaymentsColumns = [
  { id: "actions", title: "Actions" },
  { id: "date", title: "Date" },
  // { id: "invoice_no", title: "Invoice No" },
  { id: "user_name", title: "Supplier Name" },
  // { id: "payment_type", title: "Payment Type" },
  { id: "bank_name", title: "Bank Name" },
  // { id: "bank_number", title: "Bank Number" },
  { id: "desc", title: "Description" },
  { id: "amount", title: "Amount" },
];
export const CustomerAccountsColumns = [
  { id: "view", title: "View Payments" },
  { id: "name", title: "Name" },
  { id: "contact", title: "Contact" },
  { id: "total", title: "Total" },
  { id: "recieved", title: "Received" },
  { id: "recieveable", title: "Receivable" },
];

export const SupplierAccountsColumns = [
  { id: "name", title: "Supplier Name" },
  { id: "contact", title: "Contact Person" },
  { id: "total", title: "Total" },
  { id: "paid", title: "Paid" },
  { id: "payable", title: "Payable" },
];

export const CartItemsColumns = [
  { id: "actions", title: "Actions", type: "cart" },
  { id: "name", title: "Name" },
  { id: "price", title: "Sale Price" },
  { id: "qty", title: "Quantity" },
  { id: "amount", title: "Amount" },
  { id: "createdAt", title: "Created At" },
];

export const SupplierColumns = [
  {
    id: "actions",
    title: "Actions",
    type: "supplier",
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "contact",
    title: "Contact",
  },
  {
    id: "description",
    title: "Description",
  },
  {
    id: "address",
    title: "Address",
  },
  {
    id: "total",
    title: "Total",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "paid",
    title: "Paid",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "remaining",
    title: "Payable",
    format: (value) => value.toLocaleString("en-US"),
  },
];

export const ItemColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "article_name",
    title: "Article",
  },
  {
    id: "size",
    title: "Size",
  },
  {
    id: "purchase",
    title: "Purchase",
  },
  {
    id: "sale",
    title: "Sale",
  },
  {
    id: "in_qty",
    title: "In Qty",
  },
  {
    id: "out_qty",
    title: "Out Qty",
  },
  {
    id: "qty",
    title: "Qty",
  },
];
export const ArticleColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "name",
    title: "Article",
  },
];

export const RawMaterialColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "name",
    title: "Raw Material",
  },
];

export const CustomerCompleteLedgerColumns = [
  {
    id: "invoice",
    title: "Invoice",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "desc",
    title: "Desc",
  },
  {
    id: "article_name",
    title: "Article",
    type: "Ledger",
  },
  {
    id: "article_size",
    title: "Size",
    type: "Ledger",
  },
  {
    id: "qty",
    title: "QTY",
  },
  {
    id: "price",
    title: "U Price",
  },
  {
    id: "cr",
    title: "DR",
  },
  {
    id: "dr",
    title: "CR",
  },
  {
    id: "balance",
    title: "Balance",
  },
];

export const CompanyCompleteLedgerColumns = [
  {
    id: "invoice",
    title: "Invoice",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "desc",
    title: "Desc",
  },
  {
    id: "name",
    title: "Item Name",
  },
  {
    id: "qty",
    title: "QTY",
  },
  {
    id: "price",
    title: "U Price",
  },
  {
    id: "cr",
    title: "DR",
  },
  {
    id: "dr",
    title: "CR",
  },
  {
    id: "balance",
    title: "Balance",
  },
];

export const StockStatsColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "article_name",
    title: "Article",
  },
  {
    id: "size",
    title: "Size",
  },
  {
    id: "purchase",
    title: "Purchase",
  },
  {
    id: "qty",
    title: "Qty",
  },
  {
    id: "total_amount",
    title: "Total Amount",
  },
  {
    id: "invoice_no",
    title: "Invoice #",
  },
  {
    id: "original_invoice_no",
    title: "Original Invoice #",
  },
];

export const RM_Stat_Columns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "supplier_name",
    title: "Supplier Name",
  },
  {
    id: "rm_name",
    title: "Raw Material Name",
  },
  {
    id: "purchase",
    title: "Purchase Amount",
  },
  {
    id: "qty",
    title: "Quantity",
  },
  {
    id: "total_amount",
    title: "Total Amount",
  },
  {
    id: "invoice_no",
    title: "Invoice #",
  },
  {
    id: "truck_no",
    title: "Truck #",
  },
  {
    id: "desc",
    title: "Description",
  },
];

export const AccountColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "account_name",
    title: "Account Name",
  },
  {
    id: "account_no",
    title: "Account Number",
  },
  {
    id: "opening_balance",
    title: "Opening Balance",
  },
  {
    id: "amount",
    title: "Current Amount",
  },
];

export const ExpenseColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "type",
    title: "Expense Type",
  },
  {
    id: "desc",
    title: "Description",
  },
  {
    id: "expense",
    title: "Expense",
  },
];
export const TransactionsColumns = [
  {
    id: "actions",
    title: "Actions",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "invoice_no",
    title: "Invoice",
  },
  {
    id: "customerId",
    title: "Customer",
  },
  {
    id: "discount",
    title: "Discount",
  },
  {
    id: "total_amount",
    title: "Total",
  },
];

export const SupplierInvoiceColumns = [
  {
    id: "company_invoice_actions",
    title: "Actions",
  },
  {
    id: "date",
    title: "Date",
  },
  {
    id: "companyId",
    title: "Supplier",
  },
  {
    id: "itemId",
    title: "Item Name",
  },
  {
    id: "purchase",
    title: "Price",
  },
  {
    id: "qty",
    title: "Quantity",
  },
  {
    id: "total_amount",
    title: "Total Amount",
  },
  {
    id: "desc",
    title: "Description",
  },
  {
    id: "truck_no",
    title: "Truck No",
  },
  {
    id: "invoice_no",
    title: "Builti No",
  },
];

export const CustomerInvoiceColumns = [
  {
    id: "invoice_actions",
    type: "edit",
    title: "Actions",
  },
  {
    id: "article_name",
    title: "Article",
  },
  {
    id: "article_size",
    title: "Size",
  },
  {
    id: "qty",
    title: "Quantity",
  },
  {
    id: "price",
    title: "Price",
  },
  {
    id: "amount",
    title: "Total",
  },
];

export const AccountSummaryColumns = [
  {
    id: "date",
    title: "Date",
  },
  {
    id: "desc",
    title: "Description",
  },
  {
    id: "dr",
    title: "Debit",
  },
  {
    id: "cr",
    title: "Credit",
  },
  {
    id: "bal",
    title: "Closing Balance",
  },
];

export const ItemStockStatsColumns = [
  {
    id: "date",
    title: "Date",
  },
  {
    id: "article_name",
    title: "Article",
  },
  {
    id: "size",
    title: "Size",
  },
  {
    id: "invoice_no",
    title: "Invoice #",
  },
  {
    id: "purchase",
    title: "Purchase",
  },
  {
    id: "qty",
    title: "Qty",
  },
  {
    id: "total_amount",
    title: "Total Amount",
  },
];

export const ItemStatsColumns = [
  {
    id: "date",
    title: "Date",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "customer_name",
    title: "Customer",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "invoice_no",
    title: "Invoice No",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "article_name",
    title: "Article",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "article_size",
    title: "Size",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "qty",
    title: "Quantity",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },

  {
    id: "price",
    title: "Price",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
  {
    id: "amount",
    title: "Total Amount",
    web1: "20px",
    web2: "25px",
    web3: "30px",
    web4: "35px",
  },
];

export const ReceiptCol = [
  {
    title: "Article",
    id: "article_name",
  },
  {
    title: "Size",
    id: "article_size",
  },
  {
    title: "Qty",
    id: "qty",
  },
  {
    title: "Price",
    id: "price",
  },
  {
    title: "Amount",
    id: "amount",
  },
];

export const FixedAssetsColumns = [
  {
    title: "Actions",
    id: "actions",
  },
  {
    title: "Description",
    id: "desc",
  },
  {
    title: "Price",
    id: "price",
  },
  {
    title: "Qty",
    id: "qty",
  },
  {
    title: "Amount",
    id: "amount",
  },
  {
    title: "Created At",
    id: "createdAt",
  },
  {
    title: "Updated At",
    id: "updatedAt",
  },
];

export const PaymentReportColumns = [
  {
    id: "invoice_no",
    title: "Invoice No",
  },
  {
    id: "user_type",
    title: "User Type",
  },
  {
    id: "user_Id",
    title: "Name",
  },
  {
    id: "payment_type",
    title: "Payment Type", // Will show either "Cash" or "Bank" (1 or 2)
  },
  {
    id: "bank_name",
    title: "Bank Name",
  },
  {
    id: "bank_number",
    title: "Bank Number",
  },
  {
    id: "desc",
    title: "Description",
  },
  {
    id: "amount",
    title: "Amount",
  },
  {
    id: "date",
    title: "Date",
  },
];
