import React from "react";

const InputField = ({
  label,
  type,
  placeholder,
  required,
  Full,
  value,
  setValue,
}) => {
  return (
    <div className={`w-full ${Full === true ? "w-full" : "max-w-[500px]"}`}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className="w-full h-[5.5vh] flex items-center justify-center px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
};

export default InputField;
