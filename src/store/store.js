import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./Slices/AuthSlice";
import SupplierSlice from "./Slices/SupplierSlice";
import ItemSlice from "./Slices/ItemSlice";
import CustomerSlice from "./Slices/CustomerSlice";
import EmployeeSlice from "./Slices/EmployeeSlice";
import CompanyItemLegderSlice from "./Slices/CompanyItemLegderSlice";
import PaymentSlice from "./Slices/PaymentSlice";
import DeletedPaymentSlice from "./Slices/DeletedPaymentSlice";
import CompanyInfoStatSlice from "./Slices/CompanyInfoStatSlice";
import TopTenStatSlice from "./Slices/TopTenStatSlice";
import AccountsStatSlice from "./Slices/AccountsStatSlice";
import CustomerItemLegderSlice from "./Slices/CustomerItemLegderSlice";
import CustomerLegderSlice from "./Slices/CustomerLegderSlice";
import ArticleSlice from "./Slices/ArticleSlice";
import BranchSlice from "./Slices/BranchSlice";
import ExpenseSlice from "./Slices/ExpenseSlice";
import RMStatsSlice from "./Slices/RMStatsSlice";
import ReturnSlice from "./Slices/ReturnSlice";
import AccountSlice from "./Slices/AccountSlice";
import ArticleStatSlice from "./Slices/ArticleStatsSlice";
import SupplierLegderSlice from "./Slices/SupplierLegderSlice";
import CashSummarySlice from "./Slices/CashSummarySlice";
import InvoiceDetailSlice from "./Slices/CustomerInvoiceDetailSlice";
import StockStatsSlice from "./Slices/StockStatsSlice";
import CustomerLedgerSlice from "./Slices/CustomerLedgerSlice";
import SupplierLedgerSlice from "./Slices/SupplierLedgerSlice";
import SupplierInvoiceSlice from "./Slices/SupplierInvoiceSlice";
import CustomerInvoiceSlice from "./Slices/CustomerInvoiceSlice";
import CustomerReturnInvoiceSlice from "./Slices/CustomerReturnInvoiceSlice";
import DashboardStatsSlice from "./Slices/DashboardStatsSlice";
import ReportSlice from "./Slices/ReportSlice";
import FixedAssetSlice from "./Slices/FixedAssetSlice";
import RawMaterialSlice from "./Slices/RawMaterialSlice";

export const store = configureStore({
  reducer: {
    AuthState: AuthReducer,
    SupplierState: SupplierSlice,
    ItemState: ItemSlice,
    CustomerState: CustomerSlice,
    EmployeeState: EmployeeSlice,
    CustomerLedgers: CustomerLedgerSlice,
    SupplierLedgers: SupplierLedgerSlice,
    CompanyItemLegderState: CompanyItemLegderSlice,
    SupplierLegderState: SupplierLegderSlice,
    PaymentState: PaymentSlice,
    DeletedPaymentState: DeletedPaymentSlice,
    CompanyStatState: CompanyInfoStatSlice,
    TopTenState: TopTenStatSlice,
    AccountsState: AccountsStatSlice,
    CustomerInvoices: CustomerInvoiceSlice,
    CustomerReturnInvoices: CustomerReturnInvoiceSlice,
    CustomerItemLegderState: CustomerItemLegderSlice,
    CustomerLegderState: CustomerLegderSlice,
    SupplierInvoices: SupplierInvoiceSlice,
    ArticleState: ArticleSlice,
    RawMaterialState: RawMaterialSlice,
    BranchState: BranchSlice,
    ExpenseState: ExpenseSlice,
    RMStatsState: RMStatsSlice,
    ReturnState: ReturnSlice,
    AccountState: AccountSlice,
    ArticleStatsState: ArticleStatSlice,
    AccountSummaryState: CashSummarySlice,
    InvoiceDetailState: InvoiceDetailSlice,
    StockStatsState: StockStatsSlice,
    DashboardStatsState: DashboardStatsSlice,
    ReportState: ReportSlice,
    FixedAssetState: FixedAssetSlice,
  },
});
