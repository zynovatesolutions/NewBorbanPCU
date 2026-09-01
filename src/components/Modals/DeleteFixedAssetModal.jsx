import React from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

const DeleteFixedAssetModal = ({ show, asset, onClose, onDelete }) => {
  if (!show || !asset) return null;

  return (
    <ConfirmDialog
      open={show}
      setOpen={(v) => {
        if (!v) onClose?.();
      }}
      title="Delete Fixed Asset"
      message={`Are you sure you want to delete "${asset.desc}"? This action can’t be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      danger
      onConfirm={() => {
        onDelete?.(asset);
        onClose?.();
      }}
    />
  );
};

export default DeleteFixedAssetModal;
