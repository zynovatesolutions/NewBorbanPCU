import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreateArticleApi } from "../../ApiRequests";

const CreateArticleModal = ({ openModal, setOpenModal }) => {
  const [Loading, setLoading] = useState(false);

  const fields = [
    {
      name: "name",
      label: "Article",
      type: "text",
      required: true,
      placeholder: "Enter Article name",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await CreateArticleApi({
        name: values.name,
        branch: -1,
        branchId: null,
      });
      if (response.data.success) {
        SuccessToast(response.data.message);
        setOpenModal(false);
      } else {
        ErrorToast("Unable to add new article");
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
      title="Add New Article"
      subtitle="Create a new article / product family"
      size="sm"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ name: "" }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Create Article"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default CreateArticleModal;
