import React from "react";
import AppModal from "./AppModal";
import AppButton from "./AppButton";

export default function ConfirmDialog({
  open,
  setOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  danger = false,
}) {
  return (
    <AppModal
      open={open}
      setOpen={setOpen}
      title={title}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton variant="secondary" onClick={() => setOpen(false)}>
            {cancelLabel}
          </AppButton>
          <AppButton
            variant={danger ? "danger" : "accent"}
            loading={loading}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </AppButton>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </AppModal>
  );
}
