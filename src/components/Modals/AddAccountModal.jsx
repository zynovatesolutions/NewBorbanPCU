import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { CreateAccountApi } from "../../ApiRequests";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";

const AddAccountModal = ({ Open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "account_name",
      label: "Bank Name",
      type: "text",
      required: true,
      placeholder: "Enter Bank Name",
    },
    {
      name: "account_no",
      label: "Bank Number",
      type: "number",
      required: true,
      placeholder: "Enter Bank Number",
    },
  ];

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await CreateAccountApi({
        account_name: values.account_name,
        account_no: values.account_no,
      });
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Account added successfully");
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
      title="Add Account"
      subtitle="Create a new bank / cash account"
      size="sm"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ account_name: "", account_no: "" }}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Add Account"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default AddAccountModal;
