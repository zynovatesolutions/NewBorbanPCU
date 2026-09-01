import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { ChangePasswordApi } from "../../ApiRequests";

const ChangePasswordModal = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: "newPassword",
      label: "New Password",
      type: "password",
      required: true,
      placeholder: "Enter your new password",
      validate: (v) =>
        String(v || "").length < 6
          ? "New password must be at least 6 characters long!"
          : undefined,
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      type: "password",
      required: true,
      placeholder: "Confirm your new password",
      validate: (v, values) =>
        v !== values.newPassword
          ? "New password and confirm password do not match!"
          : undefined,
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await ChangePasswordApi({
        newPassword: values.newPassword,
      });
      if (response.data.success) {
        SuccessToast("Password changed successfully!");
        setOpen(false);
      } else {
        ErrorToast(response.data.message || "Failed to change password");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.error?.msg ||
          error.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={open}
      setOpen={setOpen}
      title="Change Password"
      subtitle="Password must be at least 6 characters"
      size="sm"
    >
      <DynamicForm
        fields={fields}
        defaultValues={{ newPassword: "", confirmPassword: "" }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Change Password"
        loading={loading}
      />
    </ModalWrapper>
  );
};

export default ChangePasswordModal;
