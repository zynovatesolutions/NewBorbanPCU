import React from "react";
import { BsChevronDown } from "react-icons/bs";

const CustomPopOver = ({ label, placeholder, Value, onClick }) => {
  return (
    <div
      className="relative w-[300px] font-[Quicksand] h-[48px] max750:w-full"
      onClick={onClick}
    >
      <p className="absolute top-[-11px] left-3 w-fit bg-white font-[Quicksand] text-[15px] font-bold">
        {label}
      </p>
      <div className="px-3 py-2 pr-10 border border-[#000] rounded-[7.94px] w-full outline-none cursor-pointer shadow-[#0e25802d_0px_2px_8px_0px] h-full flex items-center">
        {Value === "" ? placeholder : Value}
      </div>
      <BsChevronDown className="flex absolute right-3 top-[.85rem]" />
    </div>
  );
};

export default CustomPopOver;
