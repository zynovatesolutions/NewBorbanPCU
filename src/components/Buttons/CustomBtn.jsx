import React from "react";
import AppButton from "../ui/AppButton";

const CustomBtn = ({ title, onClick, variant = "accent", ...props }) => {
  return (
    <AppButton title={title} onClick={onClick} variant={variant} size="md" {...props} />
  );
};

export default CustomBtn;
