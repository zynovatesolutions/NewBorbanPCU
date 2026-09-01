import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { LoginApi } from "../../ApiRequests";
import { AppButton, AppInput, AppCard } from "../ui";

const LoginComp = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    if (!Email || !Password) {
      ErrorToast("All fields required!");
      setLoading(false);
      return;
    }
    try {
      const response = await LoginApi({ email: Email, password: Password });
      if (response.data.success) {
        localStorage.setItem("token", response.data?.data?.payload?.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.data.payload.user)
        );
        SuccessToast(response.data?.data?.msg);
        navigate("/admin");
        window.location.reload();
      }
    } catch (err) {
      ErrorToast(err.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(182,149,58,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(15,23,42,0.9),_#020617)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <AppCard className="w-full max-w-md border-slate-200/80 shadow-panel" padding="p-0">
          <div className="border-b border-slate-100 px-6 py-8 text-center">
            <img
              src="/logo.png"
              alt="Golden Plus"
              className="mx-auto h-28 w-auto object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in with your credentials to continue
            </p>
          </div>

          <form
            onKeyDown={handleKeyDown}
            onSubmit={onSubmit}
            className="space-y-4 px-6 py-6"
          >
            <AppInput
              label="Email"
              type="email"
              placeholder="abc@xyz.com"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AppInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <AppButton
              type="submit"
              variant="accent"
              className="w-full"
              loading={Loading}
            >
              Sign In
            </AppButton>
          </form>
        </AppCard>
      </div>
    </div>
  );
};

export default LoginComp;
