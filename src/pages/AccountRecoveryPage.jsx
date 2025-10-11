import React, { useState } from "react";
import { FaRecycle, FaWater } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png';

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
        return "Create a new password for your WasteWise account.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={WasteWiseLogo}
                    alt="WasteWise Logo"
                    className="h-24 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <FaRecycle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Account Recovery</h2>
              <p className="text-blue-100 text-sm">
                Secure access to your WasteWise account
              </p>
            </div>

            <div className="p-8">
              {/* Progress Steps */}
              <div className="flex justify-center mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${step >= stepNumber
                        ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                        : "bg-white border-blue-200 text-blue-300"
                        }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-1 mx-2 transition-all duration-300 ${step > stepNumber ? "bg-blue-500" : "bg-blue-100"
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {getStepTitle()}
                  </h3>
                  <p className="text-gray-600 text-sm">{getStepDescription()}</p>
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                        placeholder="admin@wastewise.com"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Verification Code */}
                {step === 2 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="verification_code"
                        value={formData.verification_code}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm text-center text-lg tracking-widest font-mono"
                        placeholder="000000"
                        maxLength="6"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={resendVerificationCode}
                        disabled={countdown > 0 || loading}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
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
                      <div className="relative">
                        <input
                          type="password"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                          placeholder="••••••••"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                          placeholder="••••••••"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
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