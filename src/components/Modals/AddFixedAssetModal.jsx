import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreateFixedAssetsApi } from "../../ApiRequests";
import {
  fetchDeletedFixedAssets,
  fetchFixedAssets,
} from "../../store/Slices/FixedAssetSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const AddFixedAssetModal = ({ openModal, setOpenModal }) => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fields = [
    {
      name: "desc",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Enter Description",
      fullWidth: true,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      required: true,
      placeholder: "Enter Price",
    },
    {
      name: "qty",
      label: "Quantity",
      type: "number",
      required: true,
      placeholder: "Enter Quantity",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    const amount = Number(values.price) * Number(values.qty);
    try {
      const response = await CreateFixedAssetsApi({
        desc: values.desc,
        price: values.price,
        qty: values.qty,
        amount,
        branchId: null,
      });
      if (response.data.success) {
        SuccessToast(response.data.message);
        dispatch(fetchFixedAssets());
      dispatch(fetchDeletedFixedAssets());
        setOpenModal(false);
      } else {
        ErrorToast("Unable to add new fixed asset");
      }
    } catch (err) {
      ErrorToast(
        err.response?.data?.error?.msg || "Unable to add new fixed asset"
      );
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={openModal}
      setOpen={setOpenModal}
      title="Add Fixed Asset"
      subtitle="Amount is calculated as price × quantity"
      size="md"
    >
      <DynamicForm
        fields={fields}
        columns={2}
        defaultValues={{ desc: "", price: "", qty: "" }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Add Fixed Asset"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default AddFixedAssetModal;
