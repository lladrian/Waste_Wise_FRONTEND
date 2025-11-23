import React, { useState, useContext, useEffect, useRef } from "react";
import { 
  FaRecycle, FaTrashAlt, FaLeaf, FaTruck, FaWater, FaEye, FaEyeSlash,
  FaChartLine, FaMobileAlt, FaMapMarkedAlt, FaClock, FaCheckCircle,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, 
  FaUser, FaEnvelope, FaCommentDots, FaPaperPlane, FaStar
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png'; 

import { loginUser } from "../hooks/login_hook";
import { createOTP } from "../hooks/recovery_hook";

import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // ADDED: Ref to target the login section for smooth scrolling
  const loginRef = useRef(null);
  
  // --- Login State ---
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const { user, login, logout } = useContext(AuthContext);
  
  const initialFormData = {
    email: "",
    password: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // --- Contact Form State ---
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    rating: 0
  });
  const [hoverRating, setHoverRating] = useState(0);

  // Caps lock detection handlers
  const handleKeyDown = (e) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  // Add event listeners for caps lock detection
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- Login Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const encryptData = (data, key) => {
    const dataStr = JSON.stringify(data);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const combinedData = Array.from(iv).concat(Array.from(new TextEncoder().encode(dataStr)));
    let encrypted = '';
    for (let i = 0; i < combinedData.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = combinedData[i];
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(encrypted);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const input_data = {
        password: formData.password,
        email: formData.email
      };

      const { data, success } = await loginUser(input_data);

      if (data && success === false) {
        toast.error(data.message || "Login failed");
      } else {

        if (data.data.user.is_disabled === true) {
          navigate(`/disabled/${data.data.user._id}`);
          return;
        }
        const user_id = data.data.user._id;
        const role = data.data.user.role;

        if (data.data.user.is_verified === false) {
          const input_data_2 = {
            otp_type: "verification",
            email: formData.email
          };

          const { data, success } = await createOTP(input_data_2);

          if (data && success === false) {
            toast.error(data.message || "Create OTP failed");
            return;
          }
          navigate(`/verification/${user_id}`);
          return;
        }

        await login(data.data.user, data.data.logged_in_at);

        toast.success("Welcome to WasteWise!");

        if (role == 'admin') {
          navigate('/admin/dashboard');
        }
        if (role === 'enro_staff_scheduler' || role === 'enro_staff_head' || role === 'enro_staff_monitoring' || role === 'enro_staff_eswm_section_head') {
          navigate('/staff/dashboard');
        }
        if (role == 'barangay_official') {
          navigate('/official/dashboard');
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Login failed. Please check your credentials.");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Contact Form Handlers ---
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (ratingValue) => {
    setContactForm((prev) => ({
      ...prev,
      rating: ratingValue
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate sending data
    console.log("Form Submitted:", contactForm);
    toast.success(`Message sent! Thank you for rating us ${contactForm.rating} stars.`);
    // Reset form
    setContactForm({ fullName: "", email: "", subject: "", message: "", rating: 0 });
  };

  const handleGetStartedClick = () => {
    if (loginRef.current) {
      loginRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 flex flex-col">
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <img
                src={WasteWiseLogo}
                alt="WasteWise Logo"
                className="h-20 w-auto object-contain"
              />
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  WasteWise
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Garbage Collection Monitoring System
                </span>
              </div>
            </div>
            
            {/* Right: Buttons */}
            <div className="flex items-center space-x-3">
             <button 
                onClick={() => navigate('/account_request')}
                className="px-5 py-2 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200 cursor-pointer border border-slate-200">
                Request Access
              </button>
              <button                       
                onClick={() => navigate('/')}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        
        {/* LOGIN SECTION (Form Left, Text Right) - ASSIGNED REF HERE */}
        <div ref={loginRef} className="w-full max-w-7xl mx-auto mt-12 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Login Form (Standalone Card) */}
            <div className="w-full max-w-[990px] mx-auto lg:ml-0">
                <div className="bg-white rounded-3xl shadow-xl border border-white/50 p-8 lg:p-10 relative backdrop-blur-xl">
                   <form onSubmit={handleLogin} className="space-y-6">
                     <div className="text-left mb-8">
                       <h3 className="text-3xl font-bold text-gray-900">Welcome Back</h3>
                       <p className="text-gray-500 mt-2">Sign in to your WasteWise dashboard</p>
                     </div>

                     <div className="space-y-5">
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
                             className="w-full px-4 py-3.5 pl-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                             placeholder="admin@wastewise.com"
                             required
                           />
                           <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
                             type={showPassword ? "text" : "password"}
                             name="password"
                             value={formData.password}
                             onChange={handleChange}
                             onKeyDown={handleKeyDown}
                             onKeyUp={handleKeyUp}
                             className="w-full px-4 py-3.5 pl-11 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                             placeholder="••••••••"
                             required
                           />
                           <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                             </svg>
                           </div>
                           <button
                             type="button"
                             onClick={togglePasswordVisibility}
                             className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                           >
                             {showPassword ? (
                               <FaEyeSlash className="h-5 w-5" />
                             ) : (
                               <FaEye className="h-5 w-5" />
                             )}
                           </button>
                         </div>
                         {capsLockOn && (
                           <div className="mt-2 flex items-center text-amber-600 text-sm">
                             <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                             </svg>
                             Caps Lock is ON
                           </div>
                         )}
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
                         <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                           Remember me
                         </label>
                       </div>
                       <button
                         type="button"
                         onClick={() => navigate('/account_recovery')}
                         className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                       >
                         Forgot password?
                       </button>
                     </div>

                     <button
                       type="submit"
                       disabled={loading}
                       className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                     >
                       {loading ? (
                         <>
                           <svg
                             className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                           >
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                     
                     <div className="text-center text-sm text-gray-600 pt-2">
                       No account?{" "}
                       <button
                         type="button"
                         onClick={() => navigate('/account_request')}
                         className="font-bold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                       >
                         Request access from admin
                       </button>
                     </div>
                   </form>
                </div>
            </div>

            {/* Right Side: Branding & Info */}
            <div className="relative px-4 lg:px-0">
                {/* Decorative Background Icons */}
                <div className="absolute -top-16 -left-16 text-blue-200/60 animate-pulse delay-700 -z-10">
                   <FaRecycle className="h-40 w-40 transform -rotate-12" />
                </div>
                <div className="absolute top-1/2 right-0 text-cyan-200/60 animate-bounce delay-1000 -z-10">
                   <FaLeaf className="h-20 w-20 transform rotate-45" />
                </div>

                <div className="space-y-8 relative z-10">
                    
                    <h2 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
                       Monitor. Manage <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                           Maintain
                       </span>
                    </h2>
                    
                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                       From Collection to Connection. Together, we track, act, and keep Ormoc City clean.
                    </p>

                    <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                        <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-2"/> Real-time GPS Tracking</span>
                        <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-2"/> Monitoring Made Simple</span>
                        <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-2"/> Never Miss a Collection</span>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* Hero / Intro Section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                <FaCheckCircle className="mr-2 h-4 w-4" />
                Ormoc City Solution
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Ormoc City Waste Management</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Monitor garbage trucks live, optimize routes, and ensure efficient waste collection across all barangays.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handleGetStartedClick}
                  className="px-8 py-3 rounded-xl bg-blue-500 text-white font-semibold shadow-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Get Started
                </button>
                <button className="px-8 py-3 rounded-xl bg-white text-gray-700 font-semibold shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                 {/* Placeholder for the Truck Illustration */}
                 <img 
                  src="src\assets\wastebg.jpg" 
                  alt="truck picture hehe" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Header */}
        <div className="w-full max-w-7xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Improving waste collection in Ormoc City</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to monitor, manage, and optimize your waste collection operations
          </p>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 rounded-2xl mb-4 text-blue-600">
                <FaTruck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fleet Tracking</h3>
              <p className="text-gray-600 text-sm">
                Real-time GPS tracking to monitor all garbage collection vehicles as they move across the city.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 rounded-2xl mb-4 text-blue-600">
                <FaMapMarkedAlt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600 text-sm">
                Access detailed performance insights for smarter decision-making.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 rounded-2xl mb-4 text-blue-600">
                <FaChartLine className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Role Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive insights and reports on collection efficiency and performance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 rounded-2xl mb-4 text-blue-600">
                <FaMobileAlt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Access</h3>
              <p className="text-gray-600 text-sm">
                Access the system anywhere with our mobile-responsive platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-12 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">Ormoc City</h4>
                <p className="text-blue-100 font-medium">City Served</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">15</h4>
                <p className="text-blue-100 font-medium">Active Trucks</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">100+</h4>
                <p className="text-blue-100 font-medium">Collections Tracked</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">99.9%</h4>
                <p className="text-blue-100 font-medium">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose & Contact Form Section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left List */}
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose WasteWise?</h2>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaClock className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Partnership with Ormoc City ENRO</h3>
                  <p className="text-gray-600 mt-1">Developed in collaboration with the Environmental and Natural Resources Office to meet the specific needs of municipal waste management operations.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaLeaf className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Digital Tools for Field Operators</h3>
                  <p className="text-gray-600 mt-1">Digital routes, logging, and instant reporting of delays or missed pickups.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Improved Service for Residents</h3>
                  <p className="text-gray-600 mt-1">Timely collection, real-time updates, and easy issue reporting.</p>
                </div>
              </div>
            </div>
          
            {/* Right Card (CONTACT FORM + RATE US) */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-blue-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          value={contactForm.fullName}
                          onChange={handleContactChange}
                          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Enter your full name"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="your@email.com"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="What is this about?"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCommentDots className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder="Tell us more about your inquiry..."
                      required
                    ></textarea>
                  </div>

                  {/* Rate Us Section */}
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Us</label>
                     <div className="flex items-center space-x-2">
                        {[...Array(5)].map((star, index) => {
                           const ratingValue = index + 1;
                           return (
                              <label key={index}>
                                 <input 
                                    type="radio" 
                                    name="rating" 
                                    value={ratingValue} 
                                    onClick={() => handleRatingClick(ratingValue)}
                                    className="hidden"
                                 />
                                 <FaStar 
                                    className="cursor-pointer transition-colors duration-200" 
                                    color={ratingValue <= (hoverRating || contactForm.rating) ? "#fbbf24" : "#e5e7eb"} 
                                    size={32}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                 />
                              </label>
                           );
                        })}
                     </div>
                  </div>

                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                    <FaPaperPlane /> Send Message
                  </button>

                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

{/* Footer */}
<footer className="bg-gray-900 text-white pt-8 pb-4">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Brand */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">WasteWise</span>
        </div>

        {/* Logos */}
        <div className="flex space-x-2 pt-1">
          <img src="src\assets\enro_logo.png" alt="ENRO Logo" className="h-16 w-auto" />
          <img src="src\assets\ormoc_logo.png" alt="Ormoc City Logo" className="h-16 w-auto" />
          <img src="src\assets\wastewise_logo.png" alt="WasteWise Logo" className="h-16 w-auto" />
        </div>
      </div>

      {/* Contact Us - UPDATED to open Gmail */}
<div>
  <h4 className="text-md font-bold mb-2">Contact Us</h4>
  <ul className="space-y-2 text-gray-400">
    <li>
      <p className="font-semibold text-sm">Email Us</p>
      {/* *** CODE MODIFICATION HERE ***
        Updated <a> tag to open Gmail compose window directly.
      */}
      <a 
        href="https://mail.google.com/mail/?view=cm&fs=1&to=kapetstone@gmail.com" 
        className="text-sm text-white hover:underline transition-colors duration-200"
        target="_blank" // Opens in a new browser tab
        rel="noopener noreferrer" // Essential for security with target="_blank"
      >
        kapetstone@gmail.com
      </a>
      <p className="text-xs text-gray-500">Send us an email anytime</p>
    </li>
    <li>
      <p className="font-semibold text-sm">Call Us</p>
      <p className="text-sm">+63 1 2222 4567</p>
      <p className="text-xs text-gray-500">Mon-Fri from 10am to 4pm</p>
    </li>
  </ul>
</div>

{/* Visit Us */}
      <div>
        <h4 className="text-md font-bold mb-2">Visit Us</h4>
        {/* MODIFICATION: Changed 'text-gray-400' to 'text-white' and removed 'font-bold' */}
        <a
          href="https://www.google.com/maps/place/Eastern+Visayas+State+University+-+Ormoc+City+Campus/@11.0105808,124.6027851,17z/data=!3m1!4b1!4m6!3m5!1s0x3307f131d2ab0ad5:0xc22c5f5d5de97bf1!8m2!3d11.0105808!4d124.60536!16s%2Fg%2F11bc6ms7b3?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D"
          className="text-white text-sm hover:underline cursor-pointer"
          target="_blank"
        >
          Eastern Visayas State University - Ormoc Campus
        </a>
        <p className="text-xs text-gray-500">Schedule a consultation</p>
      </div>
    </div>

    <div className="border-t border-gray-800 pt-4 text-center text-gray-500 text-sm">
      <p>&copy; 2025 WasteWise. All rights reserved.</p>
    </div>
  </div>
</footer>

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