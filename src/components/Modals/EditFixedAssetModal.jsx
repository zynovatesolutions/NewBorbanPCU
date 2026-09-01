import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { UpdateFixedAssetsApi } from "../../ApiRequests";
import {
  fetchDeletedFixedAssets,
  fetchFixedAssets,
} from "../../store/Slices/FixedAssetSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const EditFixedAssetModal = ({
  openModal,
  setOpenModal,
  currentFixedAsset,
}) => {
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
      const response = await UpdateFixedAssetsApi(currentFixedAsset._id, {
        desc: values.desc,
        price: values.price,
        qty: values.qty,
        amount,
      });
      if (response.data.success) {
        SuccessToast(response.data.message);
        dispatch(fetchFixedAssets());
      dispatch(fetchDeletedFixedAssets());
        setOpenModal(false);
      } else {
        ErrorToast("Unable to update fixed asset");
      }
    } catch (err) {
      ErrorToast(
        err.response?.data?.error?.msg || "Unable to update fixed asset"
      );
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={openModal}
      setOpen={setOpenModal}
      title="Edit Fixed Asset"
      subtitle="Amount is calculated as price × quantity"
      size="md"
    >
      <DynamicForm
        mode="edit"
        fields={fields}
        columns={2}
        defaultValues={{
          desc: currentFixedAsset.desc || "",
          price: currentFixedAsset.price || "",
          qty: currentFixedAsset.qty || "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpenModal(false)}
        submitLabel="Update Fixed Asset"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default EditFixedAssetModal;
