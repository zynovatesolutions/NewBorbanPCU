import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { MdEmail, MdLock, MdVisibilityOff } from "react-icons/md";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="h-screen flex bg-[#fafafa] max1000:justify-center max1000:items-center max-w-[1400px] w-full mx-auto">
        {/* Left side - Login Form */}
        <div className="w-1/2 max1050:w-[45%] max1000:w-full flex items-center justify-center">
          <div className="w-[402px] max1050:w-[90%] max-w-[400px] flex flex-col gap-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/logo.svg"
                alt="KPK Enterprises Logo"
                className="w-[204px] h-[195px] object-contain"
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Input */}
              <TextField
                variant="outlined"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <MdEmail className="mr-2" />,
                }}
                className="w-full"
              />

              {/* Password Input */}
              <TextField
                variant="outlined"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <MdLock className="mr-2" />,
                  endAdornment: (
                    <MdVisibilityOff
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer"
                    />
                  ),
                }}
                className="w-full"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="w-full h-[50px] bg-black text-white rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors mt-4"
              >
                Continue
              </Button>
            </form>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="w-1/2 max1050:flex-1 max1000:hidden p-2 overflow-hidden">
          <img
            src="/LogoInSideBg.svg"
            alt="Decorative"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
