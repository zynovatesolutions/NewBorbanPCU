import React, { useMemo, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import ArticleSelector from "../Selector/ArticleSelector";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateItemApi } from "../../ApiRequests";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { useDispatch } from "react-redux";

const EditItemModal = ({ openModal, setOpenModal, itemData }) => {
  const [SelectedArticle, setSelectedArticle] = useState({
    _id: itemData?.articleId?._id || "",
    name: itemData?.article_name || "",
  });
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);

  const defaultValues = useMemo(
    () => ({
      article: itemData?.articleId?._id || "",
      size: itemData?.size || "",
      purchase: itemData?.purchase ?? "",
      sale: itemData?.sale ?? "",
    }),
    [itemData]
  );

  const fields = [
    {
      name: "article",
      type: "custom",
      fullWidth: true,
      required: true,
      label: "Article",
      validate: () =>
        !SelectedArticle || !SelectedArticle._id
          ? "Article is required"
          : undefined,
      render: ({ error, onChange }) => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Article <span className="text-red-500">*</span>
          </span>
          <ArticleSelector
            SelectedArticle={SelectedArticle}
            setSelectedArticle={(article) => {
              setSelectedArticle(article);
              onChange(article?._id || "");
            }}
          />
          {error ? (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          ) : null}
        </div>
      ),
    },
    {
      name: "size",
      label: "Size",
      type: "text",
      required: true,
      placeholder: "Enter Item Size",
    },
    {
      name: "purchase",
      label: "Purchase",
      type: "number",
      required: true,
      placeholder: "Enter Purchase rate",
    },
    {
      name: "sale",
      label: "Sale",
      type: "number",
      required: true,
      placeholder: "Enter Sale rate",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (!SelectedArticle || !SelectedArticle._id) {
        ErrorToast("Please select an article");
        setLoading(false);
        return;
      }
      const response = await UpdateItemApi({
        itemId: itemData._id,
        size: values.size,
        purchase: Number(values.purchase),
        sale: Number(values.sale),
        article_name: SelectedArticle.name,
        articleId: SelectedArticle._id,
      });
      if (response.data.success) {
        SuccessToast(
          response.data.data?.msg ||
            response.data.message ||
            "Item updated successfully"
        );
        dispatch(fetchItems());
        setOpenModal(false);
      } else {
        ErrorToast("Unable to update the item");
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={openModal}
      setOpen={setOpenModal}
      title="Edit Item"
      subtitle="Update size and pricing"
      size="md"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Update Item"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditItemModal;
