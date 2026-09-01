import React from "react";

const NewCustomTabs = ({
  tabs = [],
  CurrentTab = 0,
  setCurrentTab = () => {},
  children,
}) => {
  return (
    <div className="w-full">
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {tabs.map((tab, idx) => {
          const active = CurrentTab === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentTab(idx)}
              className={[
                "flex-1 px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {Array.isArray(children) ? children[CurrentTab] : children}
      </div>
    </div>
  );
};

export default NewCustomTabs;
