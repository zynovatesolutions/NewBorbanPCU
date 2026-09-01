import React, { useState } from "react";
import SelectPopover, { SelectOption } from "./SelectPopover";

const OPTIONS = ["Self", "Supplier", "Purchase Return"];

const StockTypeSelector = ({ activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <SelectPopover
      label="Stock Type"
      placeholder="Select Type"
      valueLabel={activeTab || ""}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="stock-type-selector"
    >
      <div className="space-y-1">
        {OPTIONS.map((dt) => (
          <SelectOption
            key={dt}
            selected={activeTab === dt}
            onClick={() => {
              setActiveTab(dt);
              setAnchorEl(null);
            }}
          >
            {dt}
          </SelectOption>
        ))}
      </div>
    </SelectPopover>
  );
};

export default StockTypeSelector;
