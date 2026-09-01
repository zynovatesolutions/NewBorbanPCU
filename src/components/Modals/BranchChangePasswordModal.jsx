import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import AuthInput from "../Inputs/AuthInput";
import AuthInputPassword from "../Inputs/AuthInputPassword";
import { useDispatch } from "react-redux";
import { ErrorToast, SuccessToast, WarningToast } from "../../utils/ShowToast";
import { BranchesPasswordChangesApi } from "../../ApiRequests";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";
import { AppButton } from "../ui";

const BranchChangePasswordModal = ({ Open, setOpen, CurrentBranch }) => {
  const [Name] = useState(CurrentBranch.name || "");
  const [Password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);

    if (!Password) {
      WarningToast("Valid Branch Details Required");
      setLoading(false);
      return;
    }

    try {
      const response = await BranchesPasswordChangesApi(CurrentBranch._id, {
        password: Password,
      });

      if (response.data.success) {
        setOpen(false);
        SuccessToast("Branch password updated successfully");
        dispatch(fetchAccountsAmount());
      } else {
        ErrorToast(response.data.error?.msg);
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Failed to update branch password");
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={Open}
      setOpen={setOpen}
      title="Branch Password"
      subtitle="Set a new password for this branch account"
      size="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Name"
          placeholder="Enter Branch Name"
          Value={Name}
          setValue={() => {}}
          disabled={true}
        />
        <AuthInputPassword
          label="Password"
          placeholder="Enter Password"
          Value={Password}
          setValue={setPassword}
          required={false}
        />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </AppButton>
          <AppButton type="submit" variant="accent" loading={loading}>
            Update Password
          </AppButton>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default BranchChangePasswordModal;
