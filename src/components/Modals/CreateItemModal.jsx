import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import ArticleSelector from "../Selector/ArticleSelector";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreateItemApi } from "../../ApiRequests";
import { fetchItems } from "../../store/Slices/ItemSlice";

const CreateItemModal = ({ openModal, setOpenModal }) => {
  const [SelectedArticle, setSelectedArticle] = useState("");
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const defaultValues = useMemo(
    () => ({ article: "", size: "", purchase: "", sale: "" }),
    []
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
      const payload = {
        size: values.size,
        purchase: Number(values.purchase),
        sale: Number(values.sale),
        branch: -1,
        branch_name: "",
        branchId: null,
        article_name: SelectedArticle.name,
        articleId: SelectedArticle._id,
      };
      const response = await CreateItemApi(payload);
      if (response.data.success) {
        SuccessToast(
          response.data.data?.msg ||
            response.data.message ||
            "Item created successfully"
        );
        dispatch(fetchItems());
        setSelectedArticle("");
        setOpenModal(false);
      } else {
        ErrorToast("Unable to add new Item");
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
      title="Create Item"
      subtitle="Add a new size/SKU under an article"
      size="md"
    >
      <DynamicForm
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Create Item"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default CreateItemModal;
