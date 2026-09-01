import React from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function DeleteModal({
  Open,
  setOpen,
  onSubmit,
  Loading,
  title = "Delete confirmation",
  description = "This action can’t be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  return (
    <ConfirmDialog
      open={Open}
      setOpen={setOpen}
      title={title}
      message={description}
      confirmLabel={confirmText}
      cancelLabel={cancelText}
      onConfirm={onSubmit}
      loading={Loading}
      danger
    />
  );
}
