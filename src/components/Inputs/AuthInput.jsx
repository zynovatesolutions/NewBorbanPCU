import React from "react";
// import { v4 } from "uuid";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { CheckInvoiceNoAvailabliltyAPI } from "../../ApiRequests";
// import { CheckInvoiceNoAvailabliltyAPI } from "../../ApiRequests";

const AuthInput = ({
  Type,
  label,
  placeholder,
  required,
  Value,
  setValue,
  readonly,
  disabled,
  Named,
  // setVerifiedInvoiceNo,
}) => {
  return (
    <div className="relative mb-[15px] w-[297px] font-[Quicksand] 3xl:w-[370px] 3xl:mb-[25px] 4xl:w-[400px] 4xl:mb-[25px] 5xl:w-[600px] 5xl:mb-[35px] 6xl:w-[600px] 6xl:mb-[35px]">
      <p className="absolute left-3 w-fit bg-white h-[13px] text-[15px] font-bold text-main top-[-11px] 3xl:text-[20px] 3xl:top-[-14px] 4xl:text-[22px] 4xl:top-[-18px] 5xl:text-[2.2rem] 5xl:top-[-29px] 6xl:text-[2.2rem] 6xl:top-[-29px]">
        {label}
      </p>
      <input
        type={Type ? Type : "text"}
        required={required}
        // id={v4()}
        placeholder={placeholder}
        className="w-full outline-none border border-gray-300 rounded-[7.94px] px-3 py-2 3xl:px-4 3xl:py-3 3xl:text-[1.3rem] 4xl:rounded-[10.94px] 4xl:px-[18px] 4xl:py-[14px] 4xl:text-[1.5rem] 5xl:rounded-[10.94px] 5xl:px-5 5xl:py-5 5xl:text-[2.7rem] 6xl:rounded-[10.94px] 6xl:px-5 6xl:py-5 6xl:text-[2.7rem]"
        value={Value}
        readOnly={readonly ? true : false}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value.length ? value : "");
        }}
        onBlur={async (e) => {
          if (Named === "SaleBill") {
            try {
              const result = await CheckInvoiceNoAvailabliltyAPI(
                e.target.value
              );
              if (result.data.success) {
                SuccessToast(result.data.data.msg);
              } else {
                WarningToast(
                  "Invoice already exists. Please use another number."
                );
                setValue("");
              }
            } catch (err) {
              ErrorToast(
                err.response.data.error.msg ||
                "Something went wrong while checking invoice"
              );
              if (err.response.data.error.msg === "Invoice is not Available") {
                setValue("");
              }
            }
          }
        }}
        disabled={disabled ? disabled : false}
      />
    </div>
  );
};

export default AuthInput;
