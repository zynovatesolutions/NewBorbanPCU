import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreateCustomerApi } from "../../ApiRequests";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";

const CreateCustomerModal = ({ OpenModal, setOpenModal }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter Name" },
    { name: "contact", label: "Contact", type: "tel", required: true, placeholder: "Enter Contact" },
    { name: "password", label: "Password", type: "password", required: true, placeholder: "Enter Password" },
    { name: "address", label: "Address", type: "text", required: true, placeholder: "Enter Address" },
    { name: "ref", label: "Ref", type: "text", required: true, placeholder: "Enter Ref" },
    { name: "page", label: "Page", type: "number", required: true, placeholder: "Enter Page" },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await CreateCustomerApi({
        name: values.name,
        contact: values.contact,
        password: values.password,
        address: values.address,
        ref: values.ref,
        page: values.page,
        // Kept for DB compatibility (fields removed from UI)
        email: "",
        cnic: "",
        branch: -1,
      });
      if (response.data.success) {
        SuccessToast(response.data.message);
        dispatch(fetchCustomers());
        setOpenModal(false);
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={OpenModal}
      setOpen={setOpenModal}
      title="Add Customer"
      subtitle="Create a new customer profile"
      size="lg"
    >
      <DynamicForm
        fields={fields}
        columns={2}
        defaultValues={{
          name: "",
          contact: "",
          password: "",
          address: "",
          ref: "",
          page: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Add Customer"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default CreateCustomerModal;
