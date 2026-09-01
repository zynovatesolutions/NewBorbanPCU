import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";
import { CreateCompanyApi } from "../../ApiRequests";

const CreateCompany = ({ Open, setOpen }) => {
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
      validate: (v) => (!/^\d+$/.test(String(v || "")) ? "Contact must be a number." : undefined),
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
      const response = await CreateCompanyApi({
        name: values.name,
        contact: String(values.contact),
        description: values.description,
        address: values.address,
        // Kept for DB compatibility (fields removed from UI)
        email: "",
        cnic: "",
        branch: -1,
      });
      if (response.data.success) {
        SuccessToast(response.data.data.msg || "Supplier added successfully");
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
      open={Open}
      setOpen={setOpen}
      title="Create Supplier"
      subtitle="Add a new supplier"
      size="lg"
    >
      <DynamicForm
        fields={fields}
        columns={2}
        defaultValues={{
          name: "",
          contact: "",
          description: "",
          address: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Create Supplier"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default CreateCompany;
