import React from "react";

const Checkbox = ({ label }) => {
  return (
    <div className="flex items-center">
      <input type="checkbox" id="saveLoginDetails" className="mr-2 rounded" />
      <label htmlFor="saveLoginDetails" className="text-sm">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
