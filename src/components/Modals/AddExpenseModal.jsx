import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { CreateExpensesApi } from "../../ApiRequests";
import { fetchExpenses } from "../../store/Slices/ExpenseSlice";
import ExpenseTypeSelector from "../Selector/ExpenseTypeSelector";
import AccountSelector from "../Selector/AccountSelector";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";
const branch = "";

const AddExpenseModal = ({ Open, setOpen }) => {
  const [SelectedAccount, setSelectedAccount] = useState("");
  const [ExpenseType, setExpenseType] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "account",
      type: "custom",
      fullWidth: true,
      required: true,
      label: "Account",
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
      label: "Expense Type",
      validate: () => (!ExpenseType ? "Select an expense type" : undefined),
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Expense Type <span className="text-red-500">*</span>
          </span>
          <ExpenseTypeSelector
            activeTab={ExpenseType}
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
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
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

  const handleSubmit = async (values) => {
    setLoading(true);
    if (!SelectedAccount || !SelectedAccount._id) {
      WarningToast("Select an account");
      setLoading(false);
      return;
    }
    if (!ExpenseType) {
      WarningToast("Select an expense type");
      setLoading(false);
      return;
    }

    const payload = {
      accountId: SelectedAccount._id,
      account_name: SelectedAccount.account_name,
      type: ExpenseType,
      desc: String(values.desc || "").trim(),
      expense: Number(values.amount),
      date: values.date,
      ...(branchId ? { branchId, branch } : {}),
    };

    try {
      const response = await CreateExpensesApi(payload);
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Expense added successfully");
        dispatch(fetchExpenses());
      } else {
        ErrorToast(response.data.error?.msg);
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={Open}
      setOpen={setOpen}
      title="Add Expense"
      subtitle="Record a new expense against an account"
      size="md"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{
          desc: "",
          date: new Date().toISOString().split("T")[0],
          amount: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Add Expense"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default AddExpenseModal;
