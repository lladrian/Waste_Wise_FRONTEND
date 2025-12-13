// pages/UpdateProfile.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { updateUserProfile, getSpecificUser, updateUserPassword } from "../../hooks/user_profile_hook";
import { toast } from "react-toastify";


const UpdateProfile = () => {
    const { user, refresh, update_profile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        contact_number: user?.contact_number || '',
        gender: user?.gender || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add your update profile API call here
        const input_data = {
            email: formData.email,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            gender: formData.gender,
            contact_number: formData.contact_number
        };


        try {
            const { data, success } = await updateUserProfile(user._id, input_data);

            if (data && success === false) {
                toast.error(data.message || "Failed to update profile");
            }

            if (success === true) {
                const { data, success } = await getSpecificUser(user._id);

                if (success === false) {
                    toast.error(data.message || "Failed to update profile");
                }

                if (success === true) {
                    setIsEditing(false);
                    toast.success(data.data);
                    await update_profile(data.data.user)
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || error.message || "Failed to update user");
            } else {
                toast.error("Failed to update user");
            }
        }

        // resetForm();
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Comprehensive Password Validation
        const validatePassword = () => {
            const errors = [];

            // Required fields check
            if (!passwordData.newPassword?.trim()) errors.push("New password is required");
            if (!passwordData.confirmPassword?.trim()) errors.push("Confirm password is required");

            if (errors.length > 0) return errors;

            // Password strength validation
            const newPassword = passwordData.newPassword;
            if (newPassword.length < 8) {
                errors.push("Password must be at least 8 characters long");
            }
            // if (!/(?=.*[a-z])/.test(newPassword)) {
            //     errors.push("Password must contain at least one lowercase letter");
            // }
            // if (!/(?=.*[A-Z])/.test(newPassword)) {
            //     errors.push("Password must contain at least one uppercase letter");
            // }
            // if (!/(?=.*\d)/.test(newPassword)) {
            //     errors.push("Password must contain at least one number");
            // }
            // if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
            //     errors.push("Password must contain at least one special character (@$!%*?&)");
            // }

            // Password match validation
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                errors.push("New passwords do not match");
            }



            return errors;
        };

        const validationErrors = validatePassword();

        if (validationErrors.length > 0) {
            validationErrors.forEach(error => toast.error(error));
            return;
        }

        const input_data = {
            password: passwordData.newPassword
        };

        try {
            const { data, success } = await updateUserPassword(user._id, input_data);

            if (!success) {
                toast.error(data?.message || "Failed to update password");
                return;
            }

            toast.success(data?.data || "Password updated successfully!");

            // Refresh user data
            try {
                const userResponse = await getSpecificUser(user._id);
                if (userResponse.success) {
                    await update_profile(userResponse.data.data);
                }
            } catch (refreshError) {
                console.error("Failed to refresh user data:", refreshError);
            }

            // Reset form and close modal
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
            handlePasswordCancel();

        } catch (error) {
            console.error("Password update error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update password";
            toast.error(errorMessage);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            middle_name: user?.middle_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            contact_number: user?.contact_number || '',
            gender: user?.gender || ''
        });
        setIsEditing(false);
    };


    const handlePasswordCancel = () => {
        setPasswordData({
            newPassword: '',
            confirmPassword: ''
        });
        setShowChangePassword(false);
    };

    function format_role(role) {
         const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'enro_staff_monitoring': 'ENRO Staff Monitoring',
            'enro_staff_scheduler': 'ENRO Staff Scheduler',
            'enro_staff_head': 'ENRO Staff Head',
            'enro_staff_eswm_section_head': 'ENRO Staff ESWM Section Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
                    <span className="text-2xl font-bold text-white">
                        {user?.first_name?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Your Profile
                </h1>
                <p className="text-gray-600 text-lg">
                    Manage your account information and preferences
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Account Status</p>
                            <p className="text-2xl font-bold text-gray-800">Active</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Member Since</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">User Role</p>
                            <p className="text-2xl font-bold text-gray-800 capitalize">
                                {format_role(user?.role)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                            <p className="text-blue-100 text-sm">Update your account details and contact information</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                    required
                                />
                            </div>

                            {/* Middle Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                    required
                                />
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    {/* <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option> */}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Security Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Security & Preferences</h2>
                    <p className="text-blue-100 text-sm">Manage your password and account security</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="text-left p-4 border border-gray-200 rounded-xl  hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                        >
                            <div className="flex items-center space-x-3 ">
                                <div className="w-12 h-12 bg-blue-100  rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Change Password</h3>
                                    <p className="text-sm text-gray-600">Update your account password</p>
                                </div>
                            </div>
                        </button>

                        {/* <button className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Privacy Settings</h3>
                  <p className="text-sm text-gray-600">Manage your privacy preferences</p>
                </div>
              </div>
            </button> */}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Change Password</h2>
                                    <p className="text-blue-100 text-sm">Secure your account with a new password</p>
                                </div>
                                <button
                                    onClick={handlePasswordCancel}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="Enter new password"
                                            required
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Confirm New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs font-medium text-blue-600 mb-2">Password Requirements:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Minimum 8 characters</li>
                                        {/* <li>• At least one uppercase letter</li>
                                        <li>• At least one number</li>
                                        <li>• At least one special character</li> */}
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3 pt-6 mt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handlePasswordCancel}
                                        className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {/* <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                    Need help? <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Contact support</a> or
                    <a href="#" className="text-blue-500 hover:text-blue-600 font-medium ml-1">read our guide</a>
                </p>
            </div> */}
        </div>
    );
};

export default UpdateProfile;