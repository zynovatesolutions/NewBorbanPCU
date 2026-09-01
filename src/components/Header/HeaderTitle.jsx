import React from "react";

const HeaderTitle = ({ title, description }) => {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 h-1 w-8 rounded-full bg-accent" aria-hidden />
      <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[1.75rem] lg:leading-tight">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
};

export default HeaderTitle;
