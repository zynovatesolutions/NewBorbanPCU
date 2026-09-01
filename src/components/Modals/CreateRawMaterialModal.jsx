import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreateRawMaterialApi } from "../../ApiRequests";
import { fetchRawMaterials } from "../../store/Slices/RawMaterialSlice";

const CreateRawMaterialModal = ({ openModal, setOpenModal, onCreated }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "name",
      label: "Raw Material Name",
      type: "text",
      required: true,
      placeholder: "Enter Raw Material name",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await CreateRawMaterialApi({
        name: values.name,
        branch: -1,
      });
      if (response.data.success) {
        const created = response.data.data?.payload;
        SuccessToast(response.data.data?.msg || "Raw Material added");
        dispatch(fetchRawMaterials());
        onCreated?.(created);
        setOpenModal(false);
      } else {
        ErrorToast("Unable to add raw material");
      }
    } catch (err) {
      ErrorToast(err.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={openModal}
      setOpen={setOpenModal}
      title="Add Raw Material"
      subtitle="Create a raw material name (qty is added in RM Stock)"
      size="sm"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ name: "" }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Create Raw Material"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default CreateRawMaterialModal;
