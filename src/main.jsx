import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Layout from "./Layout";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import CounterSale from "./pages/Admin/CounterSale/CounterSale";
import EditCounterSale from "./pages/Admin/CounterSale/EditCounterSale";
import Auth from "./components/Auth/Auth";
import Customers from "./pages/Admin/Customers/Customers";
import Suppliers from "./pages/Admin/Suppliers/Suppliers";
import Items from "./pages/Admin/Items/Items";
import Ledger from "./pages/Admin/Ledger/Ledger";
import Stocks from "./pages/Admin/Stocks/Stocks";
import Payment from "./pages/Admin/Payment/Payment";
import CustomerPayments from "./pages/Admin/Payment/CustomerPayments";
import CompanyPayments from "./pages/Admin/Payment/CompanyPayments";
import Accounts from "./pages/Admin/Accounts/Accounts";
import Expense from "./pages/Admin/Expense/Expense";
import Invoices from "./pages/Admin/Invoices/Invoices";
import AccountSummary from "./pages/Admin/Accounts/AccountSummary";
import ArticleSummary from "./pages/Admin/Items/ArticleSummary";
import DeletedPayment from "./pages/Admin/Payment/DeletedPayments";
import SaleInvoiceReport from "./components/Reports/SaleInvoiceReport";
import ItemsReport from "./components/Reports/ItemsReport";
import CustomersReport from "./components/Reports/CustomersReport";
import CustomersOgraiReport from "./components/Reports/CustomersOgraiReport";
import SupplierReport from "./components/Reports/SupplierReport";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Report from "./pages/Admin/Report/Report";
import FixedAssets from "./pages/Admin/FixedAssets";
import ChangePassword from "./pages/Admin/ChangePassword/ChangePassword";
import Config from "./pages/Admin/Config/Config";
import { BASE_PATH } from "./utils/appMode";

const userData = JSON.parse(localStorage.getItem("user"));
const isLoggedIn = Boolean(userData);

const appRoutes = [
  {
    path: BASE_PATH,
    element: <Layout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "counter-sale", element: <CounterSale /> },
      { path: "edit-counter-sale", element: <EditCounterSale /> },
      { path: "fixed-assets", element: <FixedAssets /> },
      { path: "customers", element: <Customers /> },
      { path: "items", element: <Items /> },
      { path: "items-report", element: <ItemsReport /> },
      { path: "customers-report", element: <CustomersReport /> },
      { path: "customers-ograi-report", element: <CustomersOgraiReport /> },
      { path: "suppliers-report", element: <SupplierReport /> },
      { path: "suppliers", element: <Suppliers /> },
      { path: "ledgers", element: <Ledger /> },
      { path: "payments", element: <Payment /> },
      { path: "customers-payments/:id", element: <CustomerPayments /> },
      { path: "supplier-payments/:id", element: <CompanyPayments /> },
      { path: "stocks-stats", element: <Stocks /> },
      { path: "expense", element: <Expense /> },
      { path: "invoices", element: <Invoices /> },
      { path: "customer-invoice/detail/:id", element: <SaleInvoiceReport /> },
      { path: "accounts", element: <Accounts /> },
      { path: "accounts-summary", element: <AccountSummary /> },
      { path: "article-summary", element: <ArticleSummary /> },
      { path: "deleted-payments", element: <DeletedPayment /> },
      { path: "report", element: <Report /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "config", element: <Config /> },
    ],
  },
  { path: "/branch/*", element: <Navigate to={BASE_PATH} replace /> },
  { path: "*", element: <Navigate to={BASE_PATH} replace /> },
];

const authRoutes = [
  { path: "/auth", element: <Auth /> },
  { path: "*", element: <Navigate to="/auth" replace /> },
];

const router = createBrowserRouter(isLoggedIn ? appRoutes : authRoutes);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </Provider>
  </React.StrictMode>
);
