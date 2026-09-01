import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { UpdateAccountsOpeningBalanceApi } from "../../ApiRequests";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";
import AccountSelector from "../Selector/AccountSelector";

const AddOpeningBalanceModal = ({ Open, setOpen }) => {
  const [CurrentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "account",
      type: "custom",
      fullWidth: true,
      validate: () =>
        !CurrentAccount?._id ? "Select an account" : undefined,
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Account <span className="text-red-500">*</span>
          </span>
          <AccountSelector
            activeTab={CurrentAccount}
            setActiveTab={setCurrentAccount}
          />
        </div>
      ),
    },
    {
      name: "balance",
      label: "Opening Balance",
      type: "number",
      required: true,
      placeholder: "Enter Opening Balance",
    },
  ];

  const onSubmit = async (values) => {
    setLoading(true);
    if (!CurrentAccount?._id) {
      WarningToast("Please select an account");
      setLoading(false);
      return;
    }
    if (
      values.balance === "" ||
      values.balance === null ||
      values.balance === undefined
    ) {
      WarningToast("Account and opening balance are required");
      setLoading(false);
      return;
    }
    try {
      // Backend expects `amount` (see updateAccountOpeningBalance)
      const response = await UpdateAccountsOpeningBalanceApi(
        CurrentAccount._id,
        { amount: Number(values.balance) }
      );
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Opening balance added successfully");
        dispatch(fetchAccountsAmount());
      } else {
        ErrorToast(response.data.error?.msg);
      }
    } catch (err) {
      ErrorToast(err.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={Open}
      setOpen={setOpen}
      title="Add Opening Balance"
      subtitle="Set opening balance for an account"
      size="md"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ balance: "" }}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Save Opening Balance"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default AddOpeningBalanceModal;
