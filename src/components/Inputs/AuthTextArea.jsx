import React from "react";
import TextField from "@mui/material/TextField";
import "./AuthTextArea.css";

const AuthTextArea = ({ label, placeholder, required, Value, setValue }) => {
  return (
    <div className="relative mb-[11px] w-[297px] maxTextAreaWidth font-[Quicksand]">
      <p className="absolute top-[-11px] left-3 w-fit bg-white font-[Quicksand] text-[14px] font-bold TextAreaLabel">
        {label}
      </p>
      <textarea
        required={required}
        placeholder={placeholder}
        className="font-[Quicksand] font-[600] text-[13.9px] px-3 py-2 pr-10 border border-black rounded-[7.94px] w-full outline-none h-[95px] overflow-hidden TextAreaText"
        value={Value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default AuthTextArea;
