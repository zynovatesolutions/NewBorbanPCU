import React from "react";

const AddingLightLoader = () => {
  return (
    <div
      className="inline-flex h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-accent"
      role="status"
      aria-label="Loading"
    />
  );
};

export default AddingLightLoader;
