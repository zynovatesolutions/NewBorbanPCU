import { useState } from "react";
import { RiEyeFill, RiEyeCloseFill } from "react-icons/ri"; // Import eye icons from react-icons
// import { v4 } from "uuid";

const AuthInputPassword = ({
  label,
  placeholder,
  required,
  Value,
  setValue,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative mb-[15px] w-[297px] font-[Quicksand] 3xl:w-[370px] 3xl:mb-[25px] 4xl:w-[400px] 4xl:mb-[25px] 5xl:w-[600px] 5xl:mb-[35px] 6xl:w-[600px] 6xl:mb-[35px]">
      <p className="absolute left-3 w-fit bg-white font-[Quicksand] z-10 font-bold text-main top-[-11px] text-[15px] 3xl:text-[20px] 3xl:top-[-14px] 4xl:text-[22px] 4xl:top-[-18px] 5xl:text-[2.2rem] 5xl:top-[-29px] 6xl:text-[2.2rem] 6xl:top-[-29px]">
        {label}
      </p>
      <div className="relative font-[Quicksand]">
        <input
          type={showPassword ? "text" : "password"} // Toggle between 'text' and 'password'
          required={required}
          // id={v4()}
          placeholder={placeholder}
          className="w-full outline-none border border-gray-300 rounded-[7.94px] px-3 py-2 pr-10 3xl:px-4 3xl:py-3 3xl:text-[1.3rem] 4xl:rounded-[10.94px] 4xl:px-[18px] 4xl:py-[14px] 4xl:text-[1.5rem] 5xl:rounded-[10.94px] 5xl:px-5 5xl:py-5 5xl:text-[2.7rem] 6xl:rounded-[10.94px] 6xl:px-5 6xl:py-5 6xl:text-[2.7rem]"
          value={Value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 px-3 py-2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {!showPassword ? <RiEyeCloseFill /> : <RiEyeFill />}{" "}
        </button>
      </div>
    </div>
  );
};

export default AuthInputPassword;
