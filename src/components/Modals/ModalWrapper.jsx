import React from "react";
import AppModal from "../ui/AppModal";

export default function ModalWrapper({ open, setOpen, children, title, subtitle, size = "md" }) {
  return (
    <AppModal open={open} setOpen={setOpen} title={title} subtitle={subtitle} size={size}>
      {children}
    </AppModal>
  );
}
