// src/pages/UnauthorizedPage.jsx
import { Shield, Home, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-auto transform hover:scale-[1.02] transition-all duration-300">
        
        {/* Icon Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Access Restricted</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 leading-relaxed">
            You don't have permission to access this page. This area requires 
            special authorization. Please contact your administrator or 
            return to the homepage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
          {/* <button
            onClick={() => window.history.back()}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Go Back
          </button> */}
        </div>

        {/* Support Text */}
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@company.com" className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors">
              Contact Support
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default UnauthorizedPage;