import React from "react";
import "./CustomInput.css";

const CustomInput = ({
  id,
  Type,
  label,
  placeholder,
  required,
  Value,
  setValue,
  readonly,
  disabled,
}) => {
  return (
    <div className="relative w-[300px] maxInputWidth h-[48px] max480:!w-[100%]">
      <p className="absolute top-[-9px] left-3 w-fit bg-white h-[13px] text-[13px] font-bold InputLabel">
        {label}
      </p>
      <input
        type={Type ? Type : "text"}
        required={required}
        id={id}
        placeholder={placeholder}
        className="px-3 py-2 border border-[#000] rounded-[7.94px] w-full outline-none InputText shadow-[#0e25802d_0px_2px_8px_0px] font-bold text-[15px] placeholder:font-normal h-full"
        value={Value}
        readOnly={readonly ? true : false}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value.length ? value : "");
        }}
        disabled={disabled ? disabled : false}
      />
    </div>
  );
};

export default CustomInput;
