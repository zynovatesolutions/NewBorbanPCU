import React, { useState } from "react";
import { ConvertExpenseTypeToText } from "../../utils/ExpenseConverter";
import SelectPopover, { SelectOption } from "./SelectPopover";

const TYPES = [
  { label: "Rent", value: 1 },
  { label: "Kitchen", value: 2 },
  { label: "Sallary", value: 3 },
  { label: "Other", value: 4 },
];

const ExpenseTypeSelector = ({ activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <SelectPopover
      label="Expense Type"
      placeholder="Select Type"
      valueLabel={activeTab ? ConvertExpenseTypeToText(activeTab) : ""}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="expense-type-selector"
    >
      <div className="space-y-1">
        {TYPES.map((tab) => (
          <SelectOption
            key={tab.value}
            selected={Number(activeTab) === tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setAnchorEl(null);
            }}
          >
            {tab.label}
          </SelectOption>
        ))}
      </div>
    </SelectPopover>
  );
};

export default ExpenseTypeSelector;
