import React, { useEffect, useState } from "react";

const DepositorTypeSelector = ({ selectedType, setSelectedType }) => {
  const [selected, setSelected] = useState(selectedType);

  useEffect(() => {
    setSelected(selectedType);
  }, [selectedType]);

  const handleTypeChange = (type) => {
    setSelected(type);
    setSelectedType(type);
  };

  return (
    <div className="w-full">
      <div className="mb-1.5 text-sm font-semibold text-slate-700">
        Depositor Type
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        {["Customer", "Supplier"].map((type) => {
          const active = selected === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={[
                "rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-white",
              ].join(" ")}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DepositorTypeSelector;
