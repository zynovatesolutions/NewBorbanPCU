import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateSupplierApi } from "../../ApiRequests";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";

const EditCompany = ({ open, setOpen, currentSupplier }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter Name" },
    {
      name: "contact",
      label: "Contact",
      type: "tel",
      required: true,
      placeholder: "Enter Contact",
      validate: (v) =>
        !/^\d+$/.test(String(v || "")) ? "Contact must be a number." : undefined,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Enter Description",
      fullWidth: true,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      required: true,
      placeholder: "Enter Address",
      fullWidth: true,
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await UpdateSupplierApi(currentSupplier._id, {
        name: values.name,
        contact: String(values.contact),
        description: values.description,
        address: values.address,
        // Keep existing DB values; fields removed from UI
        email: currentSupplier.email || "",
        cnic: currentSupplier.cnic || "",
      });
      if (response.data.success) {
        SuccessToast(response.data.data.msg || "Supplier updated successfully");
        dispatch(fetchSuppliers());
        setOpen(false);
      }
    } catch (err) {
      ErrorToast(err.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={open}
      setOpen={setOpen}
      title="Edit Supplier"
      subtitle="Update supplier details"
      size="lg"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        columns={2}
        defaultValues={{
          name: currentSupplier.name || "",
          contact: currentSupplier.contact || "",
          description: currentSupplier.description || "",
          address: currentSupplier.address || "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Save Changes"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditCompany;
