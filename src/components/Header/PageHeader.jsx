import React from "react";
import Typography from "@mui/material/Typography";

const PageHeader = ({
  title = "Inventory",
  subtitle = "Manage and keep track of your products.",
}) => {
  return (
    <div className="flex flex-col gap-2 min-w-[303px]">
      <Typography
        variant="h4"
        component="h1"
        className="text-[#2A2A2A] font-['Plus_Jakarta_Sans']"
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        className="text-[#535862] font-['Plus_Jakarta_Sans']"
      >
        {subtitle}
      </Typography>
    </div>
  );
};

export default PageHeader;
