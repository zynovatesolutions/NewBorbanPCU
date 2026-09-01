import axios from "axios";
import { BASE_URL, BASE_URL_LOCAL } from "../assets/config";
// const BASE_URL_LOCAL = "http://localhost:9426/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

export const apiForImage = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

const attachAuthToken = (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.token = token;
  } else {
    delete config.headers.token;
  }

  return config;
};

api.interceptors.request.use(attachAuthToken, Promise.reject);
apiForImage.interceptors.request.use(attachAuthToken, Promise.reject);

let refreshInFlight = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const shouldAttemptTokenRefresh = (error) => {
  const cfg = error.config;
  if (!cfg || cfg.skipAuthRefresh) return false;
  const url = cfg.url || "";
  if (url.includes("/auth/login") || url.includes("/auth/register")) {
    return false;
  }
  const status = error.response?.status;
  const msg = String(error.response?.data?.error?.msg ?? "");
  if (status === 401) return true;
  if (
    status === 403 &&
    /invalid or expired token|no token provided/i.test(msg)
  ) {
    return true;
  }
  return false;
};

const attachRefreshInterceptor = (client) => {
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (!shouldAttemptTokenRefresh(error)) {
        return Promise.reject(error);
      }
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (refreshInFlight) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.token = token;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      refreshInFlight = true;

      try {
        const { data } = await client.post(
          "/auth/refresh-token",
          {},
          { skipAuthRefresh: true },
        );
        const newToken = data?.data?.payload?.token;
        if (!newToken) {
          throw new Error("No token in refresh response");
        }
        localStorage.setItem("token", newToken);
        processQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.token = newToken;
        return client(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("branch");
        localStorage.removeItem("branchId");
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshErr);
      } finally {
        refreshInFlight = false;
      }
    },
  );
};

attachRefreshInterceptor(api);
attachRefreshInterceptor(apiForImage);

// Get overall dashboard stats (for admin)
//app.get(
//  "/api/dashboard/stats",
//  VerifyUserCookie,
//  DashboardController.getDashboardStats
//);

// Get branch-specific dashboard stats
//app.get(
//  "/api/dashboard/stats/:branchId",
//  VerifyUserCookie,
//  DashboardController.getBranchDashboardStats
//);
// dashboard requests
export const GetBranchDashboardStats = (id) =>
  api.get("/dashboard/stats/" + id);
export const GetDashboardStats = () => api.get("/dashboard/stats");

// AUth requests
export const LoginApi = (payload) => api.post("/auth/login", payload);
export const ChangePasswordApi = (payload) =>
  api.patch("/auth/change-password", payload);

// User Requests
export const BranchesApi = () => api.get("/auth/branches");
export const BranchesPasswordChangesApi = (id, payload) =>
  api.patch("/auth/admin/change-password/" + id, payload);
// Dashboard Requests
export const GetDashboardDataApi = () => api.get("/dashboard/cards-data");

//  Suppliers Requests
export const CreateCompanyApi = (payload) =>
  api.post("/supplier/create", payload);
export const UpdateSupplierApi = (id, payload) =>
  api.patch("/supplier/" + id, payload);
export const DeleteCompanyApi = (id) => api.delete("/supplier/delete/" + id);
export const GetCompanyApi = (id) => api.get("/supplier/" + id);
export const GetAdminCompanyApi = () => api.get("/supplier");
export const GetCompanyItemLedgerApi = (payload) =>
  api.post("/company/item-ledger", payload);

// Raw Material
export const GetRM_StatsApi = (id) => api.get("/raw-material/" + id);
export const GetRM_StatsByAdminApi = () => api.get("/raw-material");
export const AddRM_StatsApi = (payload) =>
  api.post("/raw-material/add", payload);
export const AddRM_ReturnApi = (payload) =>
  api.post("/raw-material/return", payload);
export const Update_RM_StatsApi = (id, payload) =>
  api.patch("/raw-material/" + id, payload);
export const Delete_RM_StatsApi = (id) => api.delete("/raw-material/" + id);
export const Get_RM_InvoicesByBranchApi = (id) =>
  api.get("/raw-material-invoices/" + id);
export const Get_RM_InvoicesByAdminApi = () =>
  api.get("/raw-material-invoices");

export const Delete_RM_InvoicesBySupplierIdApi = (id) =>
  api.delete("/raw-material/" + id);

// Raw Material master (name-only catalog)
export const GetRawMaterialsApi = () => api.get("/raw-materials");
export const CreateRawMaterialApi = (payload) =>
  api.post("/raw-materials/create", payload);
export const UpdateRawMaterialApi = (payload) =>
  api.patch("/raw-materials/update", payload);
export const DeleteRawMaterialApi = (id) =>
  api.delete("/raw-materials/delete/" + id);

export const UpdateCompanyOpeningBalanceApi = (payload) =>
  api.patch("/company/update-opening-balance", payload);

// ======================================
//  items requests
// ======================================
export const CreateItemApi = (payload) => api.post("/item/create", payload);
export const DeleteItemApi = (id) => api.delete("/item/delete/" + id);
export const UpdateItemApi = (payload) => api.patch("/item/update", payload);

// ======================================
//  Stocks requests
// ======================================
export const AddItemQtyApi = (payload) => api.post("/stock/add", payload);
export const AddItemQtyBulkApi = (payload) =>
  api.post("/stock/add-bulk", payload);
export const GetNextStockInvoiceNoApi = () =>
  api.get("/stock/next-invoice-no");
export const AddPurchaseReturnApi = (payload) =>
  api.post("/stock/return", payload);
export const UpdateItemQtyApi = (id, payload) =>
  api.patch("/stock/edit/" + id, payload);
export const EditStockStatsApi = (payload) => api.patch("/stock/edit", payload);
export const DeleteStockStatsApi = (id) => api.delete("/stock/" + id);
export const GetStockStatsApi = (id) => api.get("/stock/" + id);
export const GetStockStatsAdminApi = () => api.get("/stock");
export const GetRMStockStatsApi = (payload) =>
  api.post("/raw-material/admin/stats", payload);

export const GetItemsByBranchApi = (id) => api.get("/item/" + id);
export const GetItemsByAdminApi = () => api.get("/item");

// Article Stats Requests
export const GetArticlesStatsApi = (id) => api.get("/article-summary/" + id);

// Article Requests
export const GetArticlesByBranchApi = (id) => api.get("/article/" + id);
export const GetArticlesByAdminApi = () => api.get("/article");
export const CreateArticleApi = (payload) =>
  api.post("/article/create", payload);
export const UpdateArticleApi = (payload) =>
  api.patch("/article/update", payload);
export const DeleteArticleApi = (id) => api.delete("/article/delete/" + id);

// Customer REQUESTS
export const CreateCustomerApi = (payload) =>
  api.post("/customer/create", payload);
export const GetCustomerBranchApi = (id) => api.get("/customer/" + id);
export const GetCustomerAdminApi = () => api.get("/customer");
export const UpdateAllCustomersApi = () => api.post("/customer/update-all");
export const DeleteCustomerApi = (id) => api.delete("/customer/delete/" + id);
export const UpdateCustomerApi = (payload) =>
  api.patch("/customer/update", payload);
export const UpdateCustomersOpeningBalanceAPI = (id, payload) =>
  api.patch("/customer/opening_balance/" + id, payload);

export const GetBranchCustomerLedgerApi = (id) =>
  api.get("/admin/complete-ledger/" + id);
export const GetCashSummaryApi = (payload) =>
  api.post("/admin/cash-summary", payload);

export const GetBranchSupplierLedgerApi = (id) =>
  api.get("/admin/supplier-complete-ledger/" + id);

export const GetCustomerApi = () => api.get("/customer");
export const GetBillNoApi = (id) => api.get("/customer/get-bill-nos/" + id);

// Employee Requests
export const CreateEmployeeApi = (payload) => api.post("/employee", payload);
export const UpdateEmployeeApi = (payload) => api.patch("/employee", payload);
export const DeleteEmployeeApi = (payload) =>
  api.post("/employee/delete", payload);
export const GetEmployeeApi = () => api.get("/employee");

// Payment Requests
export const CreatePaymentApi = (payload) =>
  api.post("/payment/create", payload);
export const GetPaymentsByIdApi = (id) => api.get("/payment/" + id);
export const DeletePaymentAPI = (id) => api.delete("/payment/delete/" + id);
export const DeletedPaymentAPI = () => api.post("/payment/deleted");
export const UpdateSupplierPaymentAPI = (id, payload) =>
  api.patch("/payment/supplier-payment/" + id, payload);
export const UpdateCustomerPaymentAPI = (id, payload) =>
  api.patch("/payment/customer-payment/" + id, payload);

// Transactions Request
export const CheckInvoiceNoApi = (payload) =>
  api.post("/transaction/check-invoice-no", payload);
export const UpdateInvoiceNoApi = (payload) =>
  api.post("/transaction/update-invoice-data", payload);
export const GetInvoiceDataApi = (payload) =>
  api.post("/transaction/get-invoice-item", payload);
export const CreateTransactionApi = (payload) =>
  api.post("/transaction/create", payload);
export const DeleteTransactionItemApi = (payload) =>
  api.post("/transaction/delete-invoice-item", payload);
export const GetTransactionsApi = (payload) =>
  api.post("/transaction/all", payload);
export const GetTransactionByIdApi = (id) => api.get("/transaction/" + id);
export const DeleteInvoiceApi = (payload) =>
  api.post("/transaction/delete", payload);
export const DeleteWholeCustomerInvoice = (id) =>
  api.delete("/customer-invoice/whole-delete/" + id);

export const CheckInvoiceNoAvailabliltyAPI = (checkinvoice) =>
  api.get("/transaction/check-invoice/" + checkinvoice);
export const GetNextInvoiceNoApi = () => api.get("/transaction/next-invoice-no");
export const GetCustomerInvoicesByIdAPI = (id) =>
  api.get("/transaction-invoices/" + id);
export const GetCustomerInvoicesByBranchIdAPI = (id) =>
  api.get("/transaction-invoices/" + id);
export const GetCustomerInvoicesByAdminAPI = () =>
  api.get("/transaction-invoices");

export const UpdateInvoiceItemApi = (id, payload) =>
  api.patch("/customer-invoice/item/" + id, payload);
export const UpdateCustomerInvoiceHeaderApi = (id, payload) =>
  api.patch("/customer-invoice/" + id, payload);

export const createNewItemInvoiceApi = (payload) =>
  api.post("/customer-invoice/add-new-item", payload);
export const DeleteItemInvoiceApi = (id) =>
  api.post("/customer-invoice/delete-item/" + id);

// Ledgers Requests
export const GetCustomerLedgerApi = (id) => api.get("/ledger/customer/" + id);
export const GetCustomerItemLedgerApi = (id) =>
  api.get("/item-ledger/customer/" + id);
export const GetSupplierLedgerApi = (id) => api.get("/ledger/supplier/" + id);

// RETURN REQUEST
// export const CreateReturnApi = (payload) => api.post("/return", payload);
// export const GetReturnByIdApi = (payload) =>
// api.post("/return/get-by-id", payload);
export const DELETECustomerReturnInvoicesApi = (id) =>
  api.delete("/sale-return/" + id);
export const CreateReturnApi = (payload) =>
  api.post("/sale-return/create", payload);
export const GetReturnsByIdApi = (payload) =>
  api.post("/sale-return/branch", payload);
export const DeleteReturnsInvoiceApi = (payload) =>
  api.post("/sale-return/delete", payload);
export const GetCustomerReturnsByCustomerId = (id) =>
  api.get("/sale-return/" + id);
export const GetCustomerReturnsByBranchIdApi = (id) =>
  api.get("/sale-return-branch/" + id);
export const GetCustomerReturnsByAdminIdApi = () =>
  api.get("/sale-return-admin");

// Statistics
export const GetCompanyInfoStatsApi = () => api.get("/stats/company_info");
export const GetTopTenStatsApi = () => api.get("/stats/top-ten");
export const GetAccountsStatsApi = () => api.get("/stats/accounts-info");

// Branches
export const CreateNewBranchApi = (payload) =>
  api.post("/admin/create", payload);
export const GetAllBranchApi = () => api.get("/admin/all");
export const UpdateBranchApi = (payload) =>
  api.patch("/admin/update", payload);

// Expense
export const GetBranchExpensesApi = (id) => api.get("/expense/" + id);
export const GetAdminExpensesApi = () => api.get("/expense");
export const CreateExpensesApi = (payload) =>
  api.post("/expense/create", payload);
export const UpdateExpensesApi = (payload) =>
  api.patch("/expense/update", payload);
export const DeleteExpensesApi = (id) => api.delete("/expense/delete/" + id);

// Accounts
export const CreateAccountApi = (payload) =>
  api.post("/accounts/create", payload);
export const UpdateAccountApi = (id, payload) =>
  api.patch("/accounts/" + id, payload);
export const GetAccountsApi = (id) =>
  id ? api.get("/accounts/" + id) : api.get("/accounts"); // no id = all accounts
export const GetAccountSummaryApi = (id, payload) =>
  api.post("/accounts/summary/" + id, payload); // id ===  Account Id
export const UpdateAccountsAmountApi = (payload) =>
  api.patch("/accounts/add-amount", payload);
export const UpdateAccountsOpeningBalanceApi = (id, payload) =>
  api.patch("/accounts/opening-balance/" + id, payload);

// Fixed Assets
export const CreateFixedAssetsApi = (payload) =>
  api.post("/fixed-asset/create", payload);
export const GetFixedAssetsByAdminApi = () => api.get("/fixed-asset/admin");
export const GetFixedAssetsByBranchIdApi = (id) =>
  api.get(`/fixed-asset/admin/${id}`);

export const GetDeletedFixedAssetsByAdminApi = () =>
  api.get("/fixed-asset/deleted/admin");
export const GetDeletedFixedAssetsByBranchIdApi = (id) =>
  api.get(`/fixed-asset/deleted/admin/${id}`);
export const UpdateFixedAssetsApi = (id, payload) =>
  api.patch("/fixed-asset/update/" + id, payload);

export const DeleteFixedAssetsApi = (id) => api.delete("/fixed-asset/" + id);

// Reports
export const GetReportApi = (payload) => api.post("/daily-report", payload);

// App config (branding / thermal print) — shared across browsers via backend
export const GetAppConfigApi = () => api.get("/app/config");
export const SaveAppConfigApi = (payload) => api.put("/app/config", payload);

