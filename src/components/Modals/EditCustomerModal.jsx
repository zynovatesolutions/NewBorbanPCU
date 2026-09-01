import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { DynamicForm } from "../ui";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import { UpdateCustomerApi } from "../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditCustomerModal = ({ OpenModal, setOpenModal, customer }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter Name" },
    { name: "contact", label: "Contact", type: "tel", required: true, placeholder: "Enter Contact" },
    { name: "address", label: "Address", type: "text", required: true, placeholder: "Enter Address" },
    { name: "ref", label: "Ref", type: "text", required: true, placeholder: "Enter Ref" },
    { name: "page", label: "Page", type: "number", required: true, placeholder: "Enter Page" },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await UpdateCustomerApi({
        customerId: customer._id,
        name: values.name,
        contact: values.contact,
        address: values.address,
        ref: values.ref,
        page: values.page,
        // Keep existing DB values; fields removed from UI
        email: customer.email || "",
        cnic: customer.cnic || "",
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
      title="Edit Customer"
      subtitle="Update customer profile details"
      size="lg"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        columns={2}
        defaultValues={{
          name: customer.name || "",
          contact: customer.contact || "",
          address: customer.address || "",
          ref: customer.ref || "",
          page: customer.page ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Save Changes"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditCustomerModal;
