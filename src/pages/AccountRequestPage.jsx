import React, { useState, useContext, useEffect } from "react";
import { FaRecycle, FaTrashAlt, FaLeaf, FaTruck, FaWater, FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import WasteWiseLogo from '../assets/wastewise_logo.png';

// import { requestAccount } from "../hooks/account_request_hook"; // You'll need to create this hook

const AccountRequestPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const initialFormData = {
        // Step 1: Personal Information
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        contact_number: "",

        // Step 2: Account Details
        email: "",
        password: "",

        // Step 3: Role & Purpose
        role: "",
        purpose: "",
        barangay: "",

        // Step 4: Additional Information
        address: "",
        id_type: "",
        id_number: "",
        id_photo: null
    };

    const [formData, setFormData] = useState(initialFormData);

    // Caps lock detection
    const handleKeyDown = (e) => {
        if (e.getModifierState("CapsLock")) {
            setCapsLockOn(true);
        }
    };

    const handleKeyUp = (e) => {
        if (e.getModifierState("CapsLock")) {
            setCapsLockOn(true);
        } else {
            setCapsLockOn(false);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.first_name || !formData.last_name || !formData.gender || !formData.contact_number) {
                    toast.error("Please fill in all required personal information");
                    return false;
                }
                return true;
            case 2:
                if (!formData.email || !formData.password) {
                    toast.error("Please fill in all required account details");
                    return false;
                }
                if (formData.password.length < 6) {
                    toast.error("Password must be at least 6 characters long");
                    return false;
                }
                return true;
            case 3:
                if (!formData.role || !formData.purpose) {
                    toast.error("Please select your role and purpose");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const input_data = {
                ...formData,
                status: "pending" // All requests start as pending
            };

            const { data, success } = await requestAccount(input_data);

            if (data && success === false) {
                toast.error(data.message || "Account request failed");
            } else {
                toast.success("Account request submitted successfully! Please wait for admin approval.");
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "Request failed. Please try again.");
            } else {
                toast.error("Request failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === currentStep
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : step < currentStep
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 text-gray-500'
                            }`}>
                            {step}
                        </div>
                        {step < 4 && (
                            <div className={`w-12 h-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const StepTitles = {
        1: "Personal Information",
        2: "Account Details",
        3: "Role & Purpose",
        4: "Additional Information"
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
                                        className="h-24 w-auto object-fit"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-7xl">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="lg:flex">
                            {/* Left side - Branding & Info */}
                            <div className="w-full max-w-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-600 text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
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
                                        Join WasteWise
                                    </h2>
                                    <p className="text-blue-100 text-lg leading-relaxed max-w-md mx-auto mb-8">
                                        Request access to our smart waste management platform. Your account will be activated after admin approval.
                                    </p>

                                    {/* Progress Info */}
                                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm w-full max-w-xs">
                                        <div className="text-sm text-blue-100 mb-2">Step {currentStep} of 4</div>
                                        <div className="text-white font-semibold">{StepTitles[currentStep]}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Request Form */}
                            <div className="lg:w-3/5 p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="text-center lg:text-left">
                                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                            Request Account Access
                                        </h3>
                                        <p className="text-gray-600">
                                            {StepTitles[currentStep]}
                                        </p>
                                    </div>

                                    <StepIndicator />

                                    {/* Step 1: Personal Information */}
                                    {currentStep === 1 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        placeholder="Enter your first name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Middle Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="middle_name"
                                                        value={formData.middle_name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        placeholder="Enter your middle name"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    placeholder="Enter your last name"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Gender *
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        required
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact Number *
                                                    </label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                            +63
                                                        </span>
                                                        <input
                                                            type="tel"
                                                            name="contact_number"
                                                            value={formData.contact_number}
                                                            onChange={(e) => {
                                                                // Remove any non-digit characters
                                                                let value = e.target.value.replace(/\D/g, '');

                                                                // Limit to 10 digits (after +63)
                                                                if (value.length > 10) {
                                                                    value = value.slice(0, 10);
                                                                }

                                                                handleChange({
                                                                    target: {
                                                                        name: 'contact_number',
                                                                        value: value
                                                                    }
                                                                });
                                                            }}
                                                            required
                                                            className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                            placeholder="9123456789"
                                                            pattern="\d{10}"
                                                            title="Please enter 10-digit Philippine mobile number"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Enter 10-digit number (e.g., 9123456789)</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Account Details */}
                                    {currentStep === 2 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        placeholder="your.email@example.com"
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
                                                    Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        onKeyDown={handleKeyDown}
                                                        onKeyUp={handleKeyUp}
                                                        className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        placeholder="••••••••"
                                                        required
                                                        minLength="6"
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Password must be at least 6 characters long
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Role & Purpose */}
                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Requested Role *
                                                </label>
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    required
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="enro_staff_monitoring">ENRO Staff Monitoring</option>
                                                    <option value="enro_staff_scheduler">ENRO Staff Scheduler</option>
                                                    <option value="enro_staff_head">ENRO Staff Head</option>
                                                    <option value="enro_staff_eswm_section_head">ENRO Staff ESWM Section Head</option>
                                                    <option value="barangay_official">Barangay Official</option>
                                                    <option value="garbage_collector">Garbage Collector</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Purpose of Request *
                                                </label>
                                                <textarea
                                                    name="purpose"
                                                    value={formData.purpose}
                                                    onChange={handleChange}
                                                    rows="4"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    placeholder="Please describe why you need access to WasteWise..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Barangay (if applicable)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="barangay"
                                                    value={formData.barangay}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    placeholder="Enter your barangay"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Additional Information */}
                                    {currentStep === 4 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Complete Address
                                                </label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    placeholder="Enter your complete address"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        ID Type
                                                    </label>
                                                    <select
                                                        name="id_type"
                                                        value={formData.id_type}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                    >
                                                        <option value="">Select ID Type</option>
                                                        <option value="driver_license">Driver's License</option>
                                                        <option value="passport">Passport</option>
                                                        <option value="national_id">National ID</option>
                                                        <option value="voters_id">Voter's ID</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        ID Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="id_number"
                                                        value={formData.id_number}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                        placeholder="Enter ID number"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Upload ID (Optional)
                                                </label>
                                                <input
                                                    type="file"
                                                    name="id_photo"
                                                    onChange={handleChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Upload a clear photo of your ID (JPG, PNG, or PDF)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={currentStep === 1}
                                            className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                                        >
                                            <FaArrowLeft className="w-4 h-4" />
                                            <span>Previous</span>
                                        </button>

                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                            >
                                                <span>Next</span>
                                                <FaArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaRecycle className="mr-2 h-5 w-5" />
                                                        Submit Request
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-center text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                                        >
                                            Sign in here
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccountRequestPage;