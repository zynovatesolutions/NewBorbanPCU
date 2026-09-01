import React, { useState, useEffect, useMemo } from "react";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../../store/Slices/CustomerSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/Modals/DeleteModal";
import {
  Delete_RM_StatsApi,
  DeleteCustomerApi,
  DeleteStockStatsApi,
} from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import PrintButton from "../../../components/Buttons/PrintButton";
import AddOpeningBalanceCustomerModal from "../../../components/Modals/AddOpeningBalanceCustomerModal";
import {
  CustomerColumns,
  RM_Stat_Columns,
  StockStatsColumns,
} from "../../../assets/Columns";
import EditCustomerModal from "../../../components/Modals/EditCustomerModal";
import CreateCustomerModal from "../../../components/Modals/CreateCustomer";
import AddRMStockModal from "../../../components/Modals/AddRMStockModal";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import { fetchStockStats } from "../../../store/Slices/StockStatsSlice";
import { fetchRMStats } from "../../../store/Slices/RMStatsSlice";
import AddStockModal from "../../../components/Modals/AddStockModal";
import EditStockModal from "../../../components/Modals/EditStockModal";
import EditRMStockModal from "../../../components/Modals/EditRMStockModal";
import { fetchSuppliers } from "../../../store/Slices/SupplierSlice";
const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

/** Normalize any date shape to YYYY-MM-DD for range filters */
const toDayKey = (value) => {
  if (value == null || value === "") return null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dmy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  if (/^\d{9,12}$/.test(str)) {
    const d = new Date(Number(str) * (str.length <= 10 ? 1000 : 1));
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Stocks = () => {
  const [SearchText, setSearchText] = useState("");
  const [OpenModal, setOpenModal] = useState(false);
  const [OpenRMModal, setOpenRMModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [OpenInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);

  const [FromDate, setFromDate] = useState("");
  const [ToDate, setToDate] = useState("");

  const [OpenOpeningBalance, setOpenOpeningBalance] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const StockStatsState = useSelector((state) => state.StockStatsState);
  const RMStatsState = useSelector((state) => state.RMStatsState);

  useEffect(() => {
    if (activeTab === 0) {
      dispatch(fetchStockStats());
    }
    if (activeTab === 1) {
      dispatch(fetchRMStats());
    }
  }, [activeTab, dispatch]);

  const filteredRMStockStatsData = useMemo(() => {
    const rows = Array.isArray(RMStatsState.data) ? RMStatsState.data : [];
    return rows.filter((dt) => {
      const day = toDayKey(dt.f_date) || toDayKey(dt.date);
      const matchFrom = !FromDate || (day && day >= FromDate);
      const matchTo = !ToDate || (day && day <= ToDate);
      const matchSearch =
        SearchText === "" ||
        (dt.rm_name || "").toLowerCase().includes(SearchText.toLowerCase()) ||
        (dt.supplier_name || "")
          .toLowerCase()
          .includes(SearchText.toLowerCase());
      return matchFrom && matchTo && matchSearch;
    });
  }, [RMStatsState.data, FromDate, ToDate, SearchText]);

  const filteredStockStatsData = useMemo(() => {
    const rows = Array.isArray(StockStatsState.data) ? StockStatsState.data : [];
    return rows.filter((dt) => {
      const day = toDayKey(dt.f_date) || toDayKey(dt.date);
      const matchSearch =
        SearchText === "" ||
        (dt.article_name || "")
          .toLowerCase()
          .includes(SearchText.toLowerCase());
      const matchFrom = !FromDate || (day && day >= FromDate);
      const matchTo = !ToDate || (day && day <= ToDate);
      return matchFrom && matchTo && matchSearch;
    });
  }, [StockStatsState.data, FromDate, ToDate, SearchText]);

  useEffect(() => {
    setFromDate("");
    setToDate("");
    setSearchText("");
  }, [activeTab]);

  return (
    <BodyWrapper>
      <Header title="Stock Stats" desc="Overview of your stocks management">
        <CustomBtn
          title={"Add RM Stock"}
          onClick={() => {
            setOpenRMModal(true);
          }}
        />
        <CustomBtn
          title={"Add Item Stock"}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </Header>
      <CustomTabs
        tabs={[{ label: "Item" }, { label: "RM" }]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex justify-end gap-x-2">
        <PrintButton
          onClick={() => {
            navigate("/admin/customers-report");
          }}
          title="Customers Report"
        />
        <ExportToExcelButton
          data={StockStatsState.data
            .filter((dt) =>
              SearchText === ""
                ? true
                : dt.article_name
                    .toLowerCase()
                    .startsWith(SearchText.toLowerCase()),
            )
            .map((dt) => {
              return {
                date: dt.date,
                article_name: dt.article_name,
                size: dt.size,
                qty: dt.qty,
                desc: dt.desc,
                supplier: dt.supplierId ? dt.supplierId.name : "",
              };
            })}
          fileName={"Customers"}
        />
      </div>
      {activeTab === 0 ? (
        <div className="w-full mt-10 flex flex-col items-center">
          {StockStatsState.loading ? (
            <div className="flex flex-1 justify-center items-center">
              <FetchingLoading />
            </div>
          ) : (
            StockStatsState.data.length !== 0 && (
              <div className="w-full max-w-7xl">
                <div className="flex justify-between items-end mb-10">
                  <div className="flex gap-4 px-5 mt-5 mb-2 max-md:flex-col max-md:items-start">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        className="border px-3 py-2 rounded w-[180px]"
                        value={FromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        className="border px-3 py-2 rounded w-[180px]"
                        value={ToDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <SearchableTable
                  setOpenEditModal={setOpenEditModal}
                  setOpenDeleteModal={setOpenDeleteModal}
                  setSelected={setSelected}
                  SearchPlaceholder={"Search Article Name..."}
                  SearchText={SearchText}
                  setSearchText={setSearchText}
                  CurrentData={filteredStockStatsData}
                  Columns={StockStatsColumns.filter(
                    (dt) => dt.id !== "branch" && dt.id !== "branch_name",
                  )}
                />
              </div>
            )
          )}
        </div>
      ) : (
        activeTab === 1 && (
          <div className="w-full mt-10 flex flex-col items-center bg-white z-10">
            {RMStatsState.loading ? (
              <div className="flex flex-1 justify-center items-center">
                <FetchingLoading />
              </div>
            ) : (
              RMStatsState.data.length !== 0 && (
                <div className="w-full max-w-7xl">
                  <div className="flex justify-between items-end mb-10">
                    <div className="flex gap-4 px-5 mt-5 mb-2 max-md:flex-col max-md:items-start">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          className="border px-3 py-2 rounded w-[180px]"
                          value={FromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          className="border px-3 py-2 rounded w-[180px]"
                          value={ToDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <SearchableTable
                    setOpenEditModal={setOpenEditModal}
                    setOpenDeleteModal={setOpenDeleteModal}
                    setSelected={setSelected}
                    SearchPlaceholder={"Search Customer Name..."}
                    SearchText={SearchText}
                    setSearchText={setSearchText}
                    CurrentData={filteredRMStockStatsData}
                    Columns={RM_Stat_Columns.filter(
                      (dt) => dt.id !== "branch" && dt.id !== "branch_name",
                    )}
                  />
                </div>
              )
            )}
          </div>
        )
      )}
      {OpenModal && (
        <AddStockModal OpenModal={OpenModal} setOpenModal={setOpenModal} />
      )}
      {OpenRMModal && (
        <AddRMStockModal
          OpenModal={OpenRMModal}
          setOpenModal={setOpenRMModal}
        />
      )}

      {OpenOpeningBalance && (
        <AddOpeningBalanceCustomerModal
          Open={OpenOpeningBalance}
          setOpen={setOpenOpeningBalance}
        />
      )}
      {OpenEditModal && activeTab === 0 && (
        <EditStockModal
          OpenModal={OpenEditModal}
          setOpenModal={setOpenEditModal}
          StockDetail={Selected}
        />
      )}
      {OpenEditModal && activeTab === 1 && (
        <EditRMStockModal
          OpenModal={OpenEditModal}
          setOpenModal={setOpenEditModal}
          StockDetail={Selected}
        />
      )}
      {OpenEditModal && activeTab === 0 && (
        <EditStockModal
          OpenModal={OpenEditModal}
          setOpenModal={setOpenEditModal}
          StockDetail={Selected}
        />
      )}
      {OpenDeleteModal && activeTab === 0 && (
        <DeleteModal
          Open={OpenDeleteModal}
          setOpen={setOpenDeleteModal}
          Loading={Loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              const response = await DeleteStockStatsApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Customer delete successfully");
                dispatch(
                  fetchCustomers({
                    role: role,
                    branchId: -1,
                  }),
                );
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              ErrorToast(
                err.response.data.error.msg || "Failed to delete customer!",
              );
            }
            setLoading(false);
          }}
        />
      )}

      {OpenDeleteModal && activeTab === 1 && (
        <DeleteModal
          Open={OpenDeleteModal}
          setOpen={setOpenDeleteModal}
          Loading={Loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              const response = await Delete_RM_StatsApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("RM delete successfully");
                dispatch(fetchRMStats());
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              ErrorToast(err.response.data.error.msg || "Failed to delete RM!");
            }
            setLoading(false);
          }}
        />
      )}
    </BodyWrapper>
  );
};

export default Stocks;
