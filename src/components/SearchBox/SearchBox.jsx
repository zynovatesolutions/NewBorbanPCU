import React from "react";
import "./SearchBox.css";
import { FiSearch } from "react-icons/fi";

const SearchBox = ({ value, onChange }) => {
  return (
    <div class="input-wrapper">
      <button class="icon">
        <FiSearch className="text-[1rem] icon-item" />
      </button>
      <input
        placeholder="Search Station Name"
        className="input outline-none w-full font-[Quicksand]"
        name="text"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBox;
