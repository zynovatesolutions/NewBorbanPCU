import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import {
  UpdateCustomerPaymentAPI,
  UpdateSupplierPaymentAPI,
} from "../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";

const EditPaymentModal = ({ open, setOpen, paymentData, customertype }) => {
  const [Loading, setLoading] = useState(false);
  const [defaults, setDefaults] = useState({
    desc: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    depositor: "",
  });

  useEffect(() => {
    if (!paymentData) return;
    setDefaults({
      desc: paymentData.desc || "",
      amount: paymentData.amount || "",
      depositor: paymentData.depositor || "",
      date: paymentData.f_date
        ? new Date(paymentData.f_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  }, [paymentData]);

  const fields = [
    {
      name: "party",
      label: "Party",
      type: "text",
      disabled: true,
      fullWidth: true,
    },
    {
      name: "depositor",
      label: "Depositor",
      type: "text",
      placeholder: "Enter Depositor",
    },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "desc",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Enter Description",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter Amount",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        desc: values.desc,
        amount: values.amount,
        date: values.date,
        depositor: values.depositor,
      };
      let response;
      if (customertype === 2) {
        response = await UpdateCustomerPaymentAPI(paymentData._id, payload);
      } else {
        response = await UpdateSupplierPaymentAPI(paymentData._id, payload);
      }
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Payment updated successfully!");
      } else {
        ErrorToast(response.data.error?.msg);
      }
    } catch (err) {
      ErrorToast(
        err?.response?.data?.error?.msg || "Failed to update payment"
      );
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={open}
      setOpen={setOpen}
      title="Edit Payment"
      subtitle="Update payment amount or description"
      size="md"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        columns={2}
        defaultValues={{
          ...defaults,
          party: paymentData?.user_name || "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Save Changes"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditPaymentModal;
