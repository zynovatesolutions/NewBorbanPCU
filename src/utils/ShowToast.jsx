import React from "react";
import toast from "react-hot-toast";
import { MdWarning } from "react-icons/md";

export const ErrorToast = (msg) => {
  return toast.error(msg, {
    duration: 4000,
    position: "top-right",
    style: {
      border: "1px solid red",
      padding: "16px",
      color: "red",
      backgroundColor: "white",
      fontFamily: "Quicksand",
    },
    iconTheme: {
      primary: "red",
      secondary: "white",
    },
  });
};

export const SuccessToast = (msg) => {
  return toast.success(msg, {
    duration: 4000,
    position: "top-right",
    style: {
      border: "1px solid green",
      padding: "16px",
      color: "green",
      backgroundColor: "white",
      fontFamily: "Quicksand",
    },
    iconTheme: {
      primary: "green",
      secondary: "white",
    },
  });
};

export const WarningToast = (msg) => {
  return toast(
    (t) => (
      <div className="flex items-center">
        <MdWarning size={30} color="#ff9800" />
        <div className="ml-2">
          <h2 className="text-yellow-600 font-bold">Warning!</h2>
          <p>{msg}</p>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "top-right",
      style: {
        border: "1px solid #ff9800",
        padding: "16px",
        color: "#ff9800",
        backgroundColor: "white",
        fontFamily: "Quicksand",
      },
      iconTheme: {
        primary: "#ff9800",
        secondary: "white",
      },
    }
  );
};
