import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { UpdateCustomersOpeningBalanceAPI } from "../../ApiRequests";
import CustomerSelector from "../Selector/CustomerSelector";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";

const AddOpeningBalanceCustomerModal = ({ Open, setOpen }) => {
  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "customer",
      type: "custom",
      fullWidth: true,
      validate: () =>
        !SelectedCustomer?._id ? "Select a customer" : undefined,
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Customer <span className="text-red-500">*</span>
          </span>
          <CustomerSelector
            SelectedCustomer={SelectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
        </div>
      ),
    },
    {
      name: "newBalance",
      label: "Opening Balance",
      type: "number",
      required: true,
      placeholder: "Enter Opening Balance",
    },
  ];

  const onSubmit = async (values) => {
    setLoading(true);
    if (!SelectedCustomer?._id) {
      WarningToast("Please select a customer");
      setLoading(false);
      return;
    }
    if (
      values.newBalance === "" ||
      values.newBalance === null ||
      values.newBalance === undefined
    ) {
      WarningToast("Customer and opening balance are required");
      setLoading(false);
      return;
    }
    try {
      // Backend expects `balance` (see UpdateCustomerOpeningBalance)
      const response = await UpdateCustomersOpeningBalanceAPI(
        SelectedCustomer._id,
        { balance: Number(values.newBalance) }
      );
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Opening Balance added successfully");
        dispatch(fetchCustomers());
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
      subtitle="Set opening balance for a customer"
      size="md"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ newBalance: "" }}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Save Opening Balance"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default AddOpeningBalanceCustomerModal;
