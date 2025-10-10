import React, { useEffect, useState } from 'react';
import { FaRecycle, FaLock, FaEnvelope, FaPhone, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom';

import { getSpecificUser } from "../hooks/disabled_hook";

const AccountDisabledPage = () => {
    const { id } = useParams(); // This gets the id from the URL
    const navigate = useNavigate();
    const [dataUser, setDataUser] = useState([]);

    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array

    const fetchData = async () => {
        try {
            const { data, success } = await getSpecificUser(id);

            if (success === true) {
                setDataUser(data.data);
            } else {
                navigate('/login')
            }
        } catch (err) {
            navigate('/login')
            return;
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };



    // Mock user data - in real app, this would come from props or context
    const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        accountType: "Resident",
        disabledReason: "Account suspended due to multiple policy violations",
        disabledDate: "2024-01-15",
        adminContact: {
            email: "kapetstone@gmail.com",
            phone: "+639123456789",
            hours: "Mon-Fri, 9:00 AM - 5:00 PM"
        }
    };

const formatDate = (dateString) => {
  if (!dateString || dateString === "none") return "none";
  
  try {
    const date = new Date(dateString.replace(' ', 'T')); // Replace space with T for ISO format
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Invalid date";
  }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 flex flex-col">
            {/* Navigation */}
            {/* <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={WasteWiseLogo}
                    alt="WasteWise Logo"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  WasteWise
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                onClick={handleGoHome}
              >
                Home
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
                onClick={handleGoToLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav> */}

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-4xl">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-8 text-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 left-10">
                                    <FaRecycle className="h-16 w-16" />
                                </div>
                                <div className="absolute bottom-4 right-10">
                                    <FaLock className="h-12 w-12" />
                                </div>
                                <div className="absolute top-1/2 left-1/3">
                                    <FaUserShield className="h-14 w-14" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                                        <FaExclamationTriangle className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Account Temporarily Disabled</h1>
                                <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                                    Your WasteWise account has been suspended. Please contact system administration for assistance.
                                </p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-10">
                            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                                {/* Left Column - Account Details */}
                                <div className="space-y-6">
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 h-full"> {/* Added h-full */}
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                            <FaUserShield className="h-5 w-5 text-blue-600 mr-2" />
                                            Account Information
                                        </h3>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Name:</span>
                                                <span className="text-sm font-semibold text-gray-800">{dataUser.first_name} {dataUser.middle_name} {dataUser.last_name}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Email:</span>
                                                <span className="text-sm font-semibold text-gray-800">{dataUser.email}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Gender:</span>
                                                <span className="text-sm font-semibold text-gray-600">
                                                    {dataUser.gender ? dataUser.gender.charAt(0).toUpperCase() + dataUser.gender.slice(1) : "none"}                                             
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Contact Number:</span>
                                                <span className="text-sm font-semibold text-gray-600">{dataUser.contact_number}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Account Type:</span>
                                                <span className="text-sm font-semibold text-blue-600">{dataUser.role}</span>
                                            </div>

                                       

                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-sm font-medium text-gray-600">Disabled Since:</span>
                                                <span className="text-sm font-semibold text-gray-800">{formatDate(dataUser.disabled_at) || "none"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Contact Information */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 h-full"> {/* Added h-full */}
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                            <FaUserShield className="h-5 w-5 text-blue-600 mr-2" />
                                            Contact Administration
                                        </h3>

                                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                            To reactivate your account, please contact the WasteWise administration team.
                                            Provide your account details and explain your situation for review.
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                                                <FaEnvelope className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                                    <p className="text-sm font-semibold text-blue-600">{userData.adminContact.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                                                <FaPhone className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Phone</p>
                                                    <p className="text-sm font-semibold text-blue-600">{userData.adminContact.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100">
                                                <FaRecycle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Available Hours</p>
                                                    <p className="text-sm font-semibold text-gray-800">{userData.adminContact.hours}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            {/* <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Need immediate assistance? Call our support line at{" "}
                            <span className="font-semibold text-blue-600">{userData.adminContact.phone}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            WasteWise Digital Waste Management System • Protecting our environment together
                        </p>
                    </div>
                </div>
            </footer> */}
        </div>
    );
};

export default AccountDisabledPage;