import React, { useState } from "react";
import { MdDateRange } from "react-icons/md";

const DatePicker = ({ placeholder, labelFor }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setShowDatePicker(false);
  };

  return (
    <div className="flex w-full relative border-[1.5px] border-gray-300 p-[.60rem] rounded-lg">
      <input
        type="text"
        value={selectedDate}
        onClick={() => setShowDatePicker(!showDatePicker)}
        placeholder={placeholder}
        className="w-full cursor-pointer"
        readOnly
      />
      <MdDateRange
        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
        onClick={() => setShowDatePicker(!showDatePicker)}
      />
      {showDatePicker && (
        <input
          type="date"
          onChange={handleDateChange}
          className="absolute top-full left-0 mt-1 border border-gray-300 rounded-lg p-2 w-full z-10 bg-[#fffaff] text-black"
          style={{ color: "black" }} // Change date icon color to white
        />
      )}
    </div>
  );
};

export default DatePicker;
