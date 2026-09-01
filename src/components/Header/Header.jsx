import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeaderTitle from "./HeaderTitle";

const Header = ({ title, desc, back = false, children }) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6 border-b border-slate-200/80 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {back && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <FaArrowLeft className="text-sm" />
            </button>
          )}
          <HeaderTitle title={title} description={desc} />
        </div>

        {children ? (
          <div className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-0.5 sm:max-w-[min(100%,28rem)] sm:flex-wrap sm:justify-end lg:max-w-none">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
