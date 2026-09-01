import React, { useState } from "react";
import Header from "../../../components/Header/Header";
import AuthInputPassword from "../../../components/Inputs/AuthInputPassword";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import { ChangePasswordApi } from "../../../ApiRequests";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import { AppButton } from "../../../components/ui";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      ErrorToast("All fields are required!");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      ErrorToast("New password and confirm password do not match!");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      ErrorToast("New password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    try {
      const response = await ChangePasswordApi({
        newPassword,
      });

      if (response.data.success) {
        SuccessToast("Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
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
    <BodyWrapper>
      <Header
        title="Change Password"
        desc="Update your account password securely"
      />

      <div className="flex flex-1 justify-start">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-center text-xl font-bold text-slate-900">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInputPassword
              label="New Password"
              placeholder="Enter your new password"
              Value={newPassword}
              setValue={setNewPassword}
              required={true}
            />
            <AuthInputPassword
              label="Confirm New Password"
              placeholder="Confirm your new password"
              Value={confirmPassword}
              setValue={setConfirmPassword}
              required={true}
            />
            <AppButton
              type="submit"
              variant="accent"
              className="w-full"
              loading={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </AppButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Password must be at least 6 characters long.
          </p>
        </div>
      </div>
    </BodyWrapper>
  );
};

export default ChangePassword;
