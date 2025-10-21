import React, { useState, useEffect, useRef, useContext } from "react";
import { FaRecycle, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png';

import { getSpecificUser, verifyOTP, createOTP, verifyUser } from "../hooks/verification_hook";
import { AuthContext } from '../context/AuthContext';


const AccountVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // This gets the id from the URL
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const [dataUser, setDataUser] = useState([]);
  const { login } = useContext(AuthContext);
  



  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array

  const fetchData = async () => {
    try {
      const { data, success } = await getSpecificUser(id);

      if (success === true) {
        setDataUser(data.data.user);
        return;
      }

      navigate('/login')
      return;
    } catch (err) {
      navigate('/login')
      return;
      console.error("Error fetching reg data:", err);
      toast.error("Failed to load registration data");
    }
  };


  useEffect(() => {
    // Start initial countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split("").concat(Array(6 - pasteData.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasteData.length, 5)].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const input_data = {
        otp_type: "verification",
        email: dataUser.user.email,
        otp: otp
      };

      const { data, success } = await verifyOTP(input_data);

      if (success === false) {
        toast.error(data.message || "Invalid verification code. Please try again.");
      } else {
        const input_data_2 = {
          verify: true
        };
        const { data, success } = await verifyUser(dataUser.user._id, input_data_2);

        if (success === false) {
          toast.error(data.message || "Failed to verify. Please try again.");
        }
    
        await login(dataUser.user, dataUser.fetched_at);

        toast.success("Account verified successfully!");
        if (dataUser.user.role == 'admin') {
          navigate('/admin/dashboard');
        }
        if (dataUser.user.role == 'enro_staff' || dataUser.user.role == 'enro_staff_head') {
          navigate('/staff/dashboard');
        }
        if (dataUser.user.role == 'barangay_official') {
          navigate('/official/dashboard');
        }
      }
    } catch (error) {
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Invalid verification code. Please try again.");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
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
        otp_type: "verification",
        email: dataUser.user.email
      };

      const { data, success } = await createOTP(input_data);

      if (success === false) {
        toast.error(data.message || "Create OTP failed");
      } else {
        toast.success(data.data || "New verification code sent!");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to send verification code. Please try again.");
      } else {
        toast.error("Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.join("").length === 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <FaShieldAlt className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3">Verify Your Account</h2>
              <p className="text-blue-100 text-lg">
                Secure Access to WasteWise
              </p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Enter Verification Code
                </h3>
                <p className="text-gray-600 mb-2">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-blue-600">{dataUser.email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Enter the code below to verify your account
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Inputs */}
                <div className="flex justify-center space-x-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-14 h-14 text-2xl text-center font-bold border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white shadow-sm"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Resend Code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : "Didn't receive code? Resend"}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={!isOtpComplete || loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                    <FaShieldAlt className="h-4 w-4" />
                    <span className="text-sm font-semibold">Secure Verification</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    This code expires in 1 minute. <br /> Keep your account secure by not sharing this code.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountVerificationPage;