import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateAccountApi } from "../../ApiRequests";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditAccountModal = ({ Open, setOpen, account }) => {
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
      const response = await UpdateAccountApi(account._id, {
        account_name: values.account_name,
        account_no: values.account_no,
      });
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Account updated successfully");
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
      title="Edit Account"
      subtitle="Update account details"
      size="sm"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        defaultValues={{
          account_name: account.account_name || "",
          account_no: account.account_no || "",
        }}
        onSubmit={onSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Save Changes"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default EditAccountModal;
