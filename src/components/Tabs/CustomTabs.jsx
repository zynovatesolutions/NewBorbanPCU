import React from "react";

const CustomTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="mb-4 w-full overflow-x-auto">
      <div
        className="inline-flex min-w-full rounded-xl border border-slate-200 bg-slate-100 p-1 sm:min-w-0"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const active = index === activeTab;
          return (
            <button
              key={tab.label || index}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(index)}
              className={[
                "flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomTabs;
