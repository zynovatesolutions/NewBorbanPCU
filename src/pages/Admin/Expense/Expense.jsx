import React, { useEffect, useState, useMemo } from "react";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { fetchExpenses } from "../../../store/Slices/ExpenseSlice";
import { useDispatch, useSelector } from "react-redux";
import AddExpenseModal from "../../../components/Modals/AddExpenseModal";
import EditExpenseModal from "../../../components/Modals/EditExpenseModal";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { DeleteExpensesApi } from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import ExpenseTypeSelector from "../../../components/Selector/ExpenseTypeSelector";
import { ExpenseColumns } from "../../../assets/Columns";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const Expense = () => {
  const [SearchText, setSearchText] = useState("");
  const [FromDate, setFromDate] = useState("");
  const [ToDate, setToDate] = useState("");
  const [CurrentTab, setCurrentTab] = useState("Expenses");

  const [OpenModal, setOpenModal] = useState(false);
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);
  const [ExpenseType, setExpenseType] = useState("");

  const dispatch = useDispatch();
  const Expenses = useSelector((state) => state.ExpenseState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchExpenses());
    }
    Mounted = true;
  }, [dispatch]);

  // Filtered Expenses based on Search, FromDate, ToDate, and Expense Type
  const filteredData = (Expenses.data?.expenses || []).filter((dt) => {
    // Safely handle date conversion
    let expenseDate;
    try {
      expenseDate = dt.f_date
        ? new Date(dt.f_date).toISOString().split("T")[0]
        : null;
    } catch (error) {
      console.warn("Invalid date format:", dt.f_date);
      expenseDate = null;
    }

    const matchSearch =
      SearchText === "" ||
      dt.desc?.toLowerCase().includes(SearchText.toLowerCase());

    const matchFrom =
      !FromDate || !expenseDate || new Date(expenseDate) >= new Date(FromDate);
    const matchTo =
      !ToDate || !expenseDate || new Date(expenseDate) <= new Date(ToDate);

    const matchType =
      !ExpenseType || Number(dt.type) === Number(ExpenseType);

    return matchSearch && matchFrom && matchTo && matchType;
  });

  // All Expenses Total
  const grandTotal = useMemo(() => {
    return (Expenses.data?.expenses || []).reduce(
      (sum, item) => sum + (item.expense || 0),
      0
    );
  }, [Expenses.data]);

  // Filtered Total
  const filteredTotal = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.expense || 0), 0);
  }, [filteredData]);

  // Grouped Totals by Expense Type
  const groupedTotals = useMemo(() => {
    const groups = {};
    (Expenses.data?.expenses || []).forEach((item) => {
      const typeMap = {
        1: "Rent",
        2: "Kitchen",
        3: "Salary",
        4: "Other",
      };
      const type = typeMap[item.type] || "Other"; // fallback if typeName missing
      groups[type] = (groups[type] || 0) + (item.expense || 0);
    });
    return groups;
  }, [Expenses.data]);

  return (
    <BodyWrapper>
      <Header title="Expense" desc="Track and manage your expenses effectively">
        <CustomBtn
          title={"Add New Expense"}
          onClick={() => setOpenModal(true)}
        />
      </Header>

      {/* Date filters */}
      <div className="flex justify-between items-end">
        <div className="flex gap-4 px-5 mt-5 mb-2 max-md:flex-col max-md:items-start">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="border px-3 py-2 rounded w-[180px]"
              value={FromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="border px-3 py-2 rounded w-[180px]"
              value={ToDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1">
          <ExpenseTypeSelector
            activeTab={ExpenseType}
            setActiveTab={setExpenseType}
          />
        </div>
      </div>
      <div className="">
        <div className="flex w-full mt-3 rounded-xl overflow-hidden bg-gray-200 border-2 border-black">
          {["Expenses", "Deleted"].map((tb) => {
            return (
              <div
                className={`text-center py-3 font-poppins transition-all ease-in-out duration-700 cursor-pointer w-full  ${
                  CurrentTab === tb ? "bg-black text-white" : "text-black"
                } `}
                onClick={() => {
                  setCurrentTab(tb);
                }}
              >
                {tb}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table or loader */}
      <div className="w-full mt-4 flex justify-center items-center">
        {Expenses.loading ? (
          <div className="flex flex-1 justify-center items-center">
            <FetchingLoading />
          </div>
        ) : (
          <SearchableTable
            setOpenEditModal={setOpenEditModal}
            setOpenDeleteModal={setOpenDeleteModal}
            setSelected={setSelected}
            SearchPlaceholder={"Search Expense..."}
            SearchText={SearchText}
            setSearchText={setSearchText}
            CurrentData={
              CurrentTab === "Expenses" ? filteredData : Expenses.data.deleted
            }
            Columns={
              CurrentTab === "Expenses"
                ? ExpenseColumns
                : ExpenseColumns.filter((col) => col.id !== "actions")
            }
          />
        )}
      </div>

      {/* Summary Totals */}
      {!Expenses.loading && (
        <div className="w-full px-5 mt-6 space-y-2">
          <div className="text-lg font-semibold text-right">
            Grand Total (All Expenses):{" "}
            <span className="text-blue-600">Rs. {grandTotal}</span>
          </div>

          <div className="text-lg font-semibold text-right">
            Filtered Total:{" "}
            <span className="text-green-600">Rs. {filteredTotal}</span>
          </div>

          <div className="mt-4">
            <h2 className="text-md font-bold underline mb-1">Total by Type:</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(groupedTotals).map(([type, total]) => (
                <div
                  key={type}
                  className="p-2 rounded bg-gray-100 text-sm flex justify-between"
                >
                  <span className="font-medium">{type}</span>
                  <span className="text-right font-semibold text-blue-700">
                    Rs. {total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {OpenModal && <AddExpenseModal Open={OpenModal} setOpen={setOpenModal} />}
      {OpenEditModal && (
        <EditExpenseModal
          open={OpenEditModal}
          setOpen={setOpenEditModal}
          selectedExpense={Selected}
        />
      )}
      {OpenDeleteModal && (
        <DeleteModal
          Open={OpenDeleteModal}
          setOpen={setOpenDeleteModal}
          Loading={Loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              const response = await DeleteExpensesApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Expense deleted successfully");
                dispatch(fetchExpenses());
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              console.error(err);
              ErrorToast(
                err?.response?.data?.error?.msg || "Failed to delete Expense!"
              );
            }
            setLoading(false);
          }}
        />
      )}
    </BodyWrapper>
  );
};

export default Expense;
