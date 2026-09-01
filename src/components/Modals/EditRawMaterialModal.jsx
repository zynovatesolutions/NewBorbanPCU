import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateRawMaterialApi } from "../../ApiRequests";
import { fetchRawMaterials } from "../../store/Slices/RawMaterialSlice";

const EditRawMaterialModal = ({ openModal, setOpenModal, selected }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "oldName",
      label: "Old Name",
      type: "text",
      disabled: true,
    },
    {
      name: "name",
      label: "New Name",
      type: "text",
      required: true,
      placeholder: "Enter New Name",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await UpdateRawMaterialApi({
        id: selected._id,
        name: values.name,
      });
      if (response.data.success) {
        SuccessToast(
          response.data.data?.msg ||
            response.data.message ||
            "Raw Material updated"
        );
        dispatch(fetchRawMaterials());
        setOpenModal(false);
      } else {
        ErrorToast("Unable to update raw material");
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
      title="Edit Raw Material"
      subtitle="Rename this raw material"
      size="sm"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        defaultValues={{
          oldName: selected?.name || "",
          name: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Update"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditRawMaterialModal;
