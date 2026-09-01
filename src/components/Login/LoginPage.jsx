import React, { useState } from "react";
import { LoginApi } from "../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { AppButton, AppInput, AppCard } from "../ui";

const LoginPage = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (!Email || !Password) {
      ErrorToast("All fields required!");
      setIsLoading(false);
      return;
    }
    const dataF = {
      email: Email,
      password: Password,
    };
    try {
      const { data } = await LoginApi(dataF);
      localStorage.setItem("user", JSON.stringify(data.data.payload.user));
      localStorage.setItem("token", data.data.payload.token);
      localStorage.setItem("role", data.data.payload.user.role);
      // Optional write-side branch id only (no multi-branch UX)
      const branchRef = data.data.payload.user?.branchId;
      if (branchRef) {
        localStorage.setItem(
          "branchId",
          typeof branchRef === "object" ? branchRef._id || branchRef.id : branchRef
        );
      }
      SuccessToast(data?.data?.msg || "Successfully Logged In!");
      window.location.reload();
    } catch (err) {
      ErrorToast(
        err?.response?.data?.error?.msg || "Check email and password...!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(182,149,58,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(15,23,42,0.9),_#020617)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <AppCard
          className="w-full max-w-md border-slate-200/80 shadow-panel fade-in"
          padding="p-0"
        >
          <div className="border-b border-slate-100 px-6 py-8 text-center">
            <img
              src="/logo-gpcu.png"
              alt="Golden Plus PCU"
              className="mx-auto h-24 w-auto object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Welcome
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
            <AppInput
              label="Email"
              type="email"
              placeholder="Enter Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <AppInput
              label="Password"
              type="password"
              placeholder="Enter Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <AppButton
              type="submit"
              variant="accent"
              className="w-full"
              loading={isLoading}
            >
              Login
            </AppButton>
          </form>
        </AppCard>
      </div>
    </div>
  );
};

export default LoginPage;
