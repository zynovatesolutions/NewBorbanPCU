import React from "react";
import { LoadingState } from "../ui";

const FetchingLoading = ({ label = "Loading..." }) => {
  return <LoadingState label={label} />;
};

export default FetchingLoading;
