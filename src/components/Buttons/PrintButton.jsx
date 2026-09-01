import React from "react";
import { FaPrint } from "react-icons/fa";
import { AppButton } from "../ui";

const PrintButton = ({ onClick, title = "Print" }) => {
  return (
    <AppButton variant="primary" icon={FaPrint} onClick={onClick}>
      {title}
    </AppButton>
  );
};

export default PrintButton;
