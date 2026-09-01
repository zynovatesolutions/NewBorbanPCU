import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { UpdateExpensesApi } from "../../ApiRequests";
import { fetchExpenses } from "../../store/Slices/ExpenseSlice";
import ExpenseTypeSelector from "../Selector/ExpenseTypeSelector";
import AccountSelector from "../Selector/AccountSelector";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditExpenseModal = ({ open, setOpen, selectedExpense }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [SelectedAccount, setSelectedAccount] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [defaults, setDefaults] = useState({
    desc: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  useEffect(() => {
    if (!selectedExpense) return;
    const accountId =
      selectedExpense.accountId?._id || selectedExpense.accountId || "";
    setSelectedAccount(
      accountId
        ? {
            account_name: selectedExpense.account_name,
            _id: accountId,
          }
        : ""
    );
    setExpenseType(selectedExpense.type || "");
    setDefaults({
      desc: selectedExpense.desc || "",
      date:
        selectedExpense.f_date ||
        (selectedExpense.date
          ? new Date(selectedExpense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]),
      amount: selectedExpense.expense?.toString() || "",
    });
  }, [selectedExpense]);

  const fields = [
    {
      name: "account",
      type: "custom",
      fullWidth: true,
      required: true,
      validate: () =>
        !SelectedAccount || !SelectedAccount._id
          ? "Select an account"
          : undefined,
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Account <span className="text-red-500">*</span>
          </span>
          <AccountSelector
            activeTab={SelectedAccount}
            setActiveTab={setSelectedAccount}
          />
        </div>
      ),
    },
    {
      name: "expenseType",
      type: "custom",
      fullWidth: true,
      required: true,
      validate: () => (!expenseType ? "Select Expense Type" : undefined),
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Expense Type <span className="text-red-500">*</span>
          </span>
          <ExpenseTypeSelector
            activeTab={expenseType}
            setActiveTab={setExpenseType}
          />
        </div>
      ),
    },
    {
      name: "desc",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Enter Description",
      fullWidth: true,
    },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter Amount",
      validate: (v) =>
        !v || isNaN(v) || Number(v) <= 0 ? "Enter a valid Amount" : undefined,
    },
  ];

  const onSubmit = async (values) => {
    setLoading(true);
    if (!SelectedAccount?._id) {
      WarningToast("Select an account");
      setLoading(false);
      return;
    }
    if (!expenseType) {
      WarningToast("Select Expense Type");
      setLoading(false);
      return;
    }
    try {
      const response = await UpdateExpensesApi(selectedExpense._id, {
        accountId: SelectedAccount._id,
        account_name: SelectedAccount.account_name,
        type: expenseType,
        desc: String(values.desc || "").trim(),
        expense: Number(values.amount),
        date: values.date,
      });
      if (response.data.success) {
        SuccessToast("Expense updated successfully");
        dispatch(fetchExpenses());
        setOpen(false);
      } else {
        ErrorToast(response.data.error?.msg || "Update failed");
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || "Failed to update expense");
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={open}
      setOpen={setOpen}
      title="Edit Expense"
      subtitle="Update expense details"
      size="md"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        defaultValues={defaults}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Update"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default EditExpenseModal;
