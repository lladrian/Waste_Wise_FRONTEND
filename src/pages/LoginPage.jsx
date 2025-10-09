import React, { useState } from "react";
import { FaRecycle, FaTrashAlt, FaLeaf, FaTruck, FaWater } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png'; // or .jpg, .svg

const LoginPage = () => {
  const navigate = useNavigate();
  const initialFormData = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const input_data = {
        password: formData.password,
        email: formData.email,
      };

      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Welcome to WasteWise!");
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
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
                {/* <div className="relative">
                  <FaRecycle className="h-8 w-8 text-blue-600 animate-spin-slow" />
                  <FaWater className="h-4 w-4 text-cyan-500 absolute -top-1 -right-1" />
                </div> */}
                <div className="relative">
                  <img
                    src={WasteWiseLogo}
                    alt="WasteWise Logo"
                    className="h-24 w-auto object-fit"
                  />
                </div>
                {/* <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  WasteWise
                </span> */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => { navigate('/register') }}
              >
                Join WasteWise
              </button> */}
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-6xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="lg:flex">
              {/* Left side - Branding & Info */}
              <div className="lg:w-2/5 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-600 text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10">
                    <FaRecycle className="h-20 w-20" />
                  </div>
                  <div className="absolute bottom-10 right-10">
                    <FaWater className="h-16 w-16" />
                  </div>
                  <div className="absolute top-1/2 left-1/3">
                    <FaTrashAlt className="h-12 w-12" />
                  </div>
                  <div className="absolute top-1/4 right-1/4">
                    <FaLeaf className="h-14 w-14" />
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-6 flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <FaRecycle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    Smart Waste Management
                  </h2>
                  <p className="text-blue-100 text-lg leading-relaxed max-w-md mx-auto mb-8">
                    Join thousands of communities transforming waste management through technology. Track, manage, and optimize your waste collection system.
                  </p>

                  {/* Features Grid */}
                  {/* <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                      <FaTruck className="h-5 w-5 text-blue-200" />
                      <span className="text-sm font-medium">Smart Routes</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                      <FaLeaf className="h-5 w-5 text-blue-200" />
                      <span className="text-sm font-medium">Eco Analytics</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                      <FaRecycle className="h-5 w-5 text-blue-200" />
                      <span className="text-sm font-medium">Recycling</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                      <FaTrashAlt className="h-5 w-5 text-blue-200" />
                      <span className="text-sm font-medium">Waste Track</span>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Right side - Login Form */}
              <div className="lg:w-3/5 p-8 lg:p-12">
                <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
                  <div className="text-center lg:text-left">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome Back
                    </h3>
                    <p className="text-gray-600">
                      Sign in to your WasteWise dashboard
                    </p>
                  </div>

                  <div className="space-y-4">
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
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
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>

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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <FaRecycle className="mr-2 h-5 w-5" />
                        Sign In to WasteWise
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    New to WasteWise?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      Create your account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Reset Password</h3>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Send Reset Instructions
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;