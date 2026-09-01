import React from "react";
import Button from "@mui/material/Button";

const ActionButtons = () => {
  return (
    <div className="flex flex-row gap-3 justify-center items-center">
      <Button
        variant="contained"
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          borderRadius: "8px",
          minWidth: "120px",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          padding: "10px 14px",
          textTransform: "none",
        }}
        className="hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
      >
        Income Tracker
      </Button>
      <Button
        variant="contained"
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          borderRadius: "8px",
          minWidth: "120px",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          padding: "10px 14px",
          textTransform: "none",
        }}
        className="hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
      >
        Expense Tracker
      </Button>
    </div>
  );
};

export default ActionButtons;
