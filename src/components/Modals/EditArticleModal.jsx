import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { fetchArticles } from "../../store/Slices/ArticleSlice";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateArticleApi } from "../../ApiRequests";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditArticleModal = ({ openModal, setOpenModal, selectedArticle }) => {
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
      name: "newName",
      label: "New Name",
      type: "text",
      required: true,
      placeholder: "Enter New Name",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await UpdateArticleApi({
        articleId: selectedArticle._id,
        newName: values.newName,
      });
      if (response.data.success) {
        SuccessToast(response.data.message);
        dispatch(fetchArticles());
        setOpenModal(false);
      } else {
        ErrorToast("Unable to update the article");
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
      title="Edit Article"
      subtitle="Rename this article"
      size="sm"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        defaultValues={{
          oldName: selectedArticle?.name || "",
          newName: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Update Article"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditArticleModal;
