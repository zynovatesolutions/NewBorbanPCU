import React from "react";
import { useNavigate } from "react-router-dom";
import "./AuthBtn.css";

const AuthBtn = ({ title, onSubmit, type }) => {
  const navigate = useNavigate();
  return (
    <button
      className={`w-fit px-5 h-fit py-2 border-2 border-[#90898E] ${
        type === 1
          ? "bg-[#90898E] hover:bg-[#465462] text-white"
          : type === 2 && "bg-white hover:bg-gray-100 text-black"
      } rounded-[40px] text-[1.2rem] font-[700] transition-all duration-500 ease-in-out AuthBtn`}
      onClick={onSubmit}
    >
      {title}
    </button>
  );
};

export default AuthBtn;
