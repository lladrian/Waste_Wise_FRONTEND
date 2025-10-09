import React, { useState } from "react";
import { FaLaptopCode } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png'; // or .jpg, .svg

import { verifyOTP, createOTP, changePasswordRecovery } from "../hooks/recovery_hook";

const AccountRecoveryPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const initialFormData = {
    email: "",
    verification_code: "",
    new_password: "",
    confirm_password: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    try {
      // Start countdown for resend (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const input_data = {
        otp_type: "recovery",
        email: formData.email
      };

      const { data, success } = await createOTP(input_data);

      if (data && success === false) {
        toast.error(data.message || "Create OTP failed");
      } else {
        toast.success(data.data || "Verification code sent to your email!");
        setStep(2);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to send verification code. Please try again.");
      } else {
        toast.error("Failed to send verification code. Please try again.");
      }
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      // For demo purposes, any 6-digit code will work
      if (formData.verification_code.length === 6) {
        const input_data = {
          otp_type: "recovery",
          email: formData.email,
          otp: formData.verification_code
        };

        const { data, success } = await verifyOTP(input_data);

        if (data && success === false) {
          toast.error(data.message || "Create OTP failed");
        } else {
          toast.success(data.data || "Code verified successfully!");
          setStep(3);
        }
      } else {
        toast.error("Please enter a valid 6-digit code");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Invalid verification code. Please try again.");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const input_data = {
        password: formData.new_password,
        email: formData.email,
      };

      const { data, success } = await changePasswordRecovery(input_data);

      if (data && success === false) {
        toast.error(data.message || "Falled to reset password.");
      } else {
        toast.success(data.data || "Password reset successfully!");
        navigate('/login');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to reset password. Please try again.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    }
  };

  const resendVerificationCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const input_data = {
        otp_type: "recovery",
        email: formData.email,
      };
      const { data, success } = await createOTP(input_data);

      if (data && success === false) {
        toast.error(data.message || "Create OTP failed");
      } else {
        toast.success(data.data || "Verification code sent again!");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to resend code. Please try again.");
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password";
      case 2:
        return "Enter Verification Code";
      case 3:
        return "Create New Password";
      default:
        return "Reset Your Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email address and we'll send you a verification code.";
      case 2:
        return `Enter the 6-digit code sent to ${formData.email}`;
      case 3:
        return "Create a new password for your account.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <img
                  src={WasteWiseLogo}
                  alt="WasteWise Logo"
                  className="h-24 w-auto object-fit"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => { navigate('/role_selection') }}
              >
                Register
              </button> */}
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="p-8 md:p-10">
              {/* Progress Steps */}
              <div className="flex justify-center mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= stepNumber
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-300 text-gray-600"
                        }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-1 mx-2 ${step > stepNumber ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={
                  step === 1
                    ? handleSendVerificationCode
                    : step === 2
                      ? handleVerifyCode
                      : handleResetPassword
                }
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {getStepTitle()}
                  </h3>
                  <p className="text-gray-600">{getStepDescription()}</p>
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                )}

                {/* Step 2: Verification Code */}
                {step === 2 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="verification_code"
                      value={formData.verification_code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={resendVerificationCode}
                        disabled={countdown > 0 || loading}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {countdown > 0
                          ? `Resend code in ${countdown}s`
                          : "Resend verification code"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {step === 1 && "Sending Code..."}
                      {step === 2 && "Verifying..."}
                      {step === 3 && "Resetting Password..."}
                    </>
                  ) : (
                    <>
                      {step === 1 && "Send Verification Code"}
                      {step === 2 && "Verify Code"}
                      {step === 3 && "Reset Password"}
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountRecoveryPage;