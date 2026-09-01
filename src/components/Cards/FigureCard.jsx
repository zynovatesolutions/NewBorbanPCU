import React from "react";

const FigureCard = ({ title, value, textColor = "text-slate-900" }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${textColor}`}>{value}</p>
    </div>
  );
};

export default FigureCard;
