// layout/admin_layout.jsx
import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiList,
  FiClock,
  FiCheckCircle,
  FiLogOut,
  FiBell,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiBook,
  FiAward,
  FiHelpCircle,
  FiFolder,
  FiUsers,
  FiBarChart2,
  FiCalendar
} from "react-icons/fi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { AuthContext } from '../context/AuthContext';

const OfficialLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    management: location.pathname.includes('/official/management')
  });
  const navigate = useNavigate();
  const { logout, user, refresh } = useContext(AuthContext);

  const adminFirstName = user?.first_name;
  const adminMiddleName = user?.middle_name;
  const adminLastName = user?.last_name;
  const adminEmail = user?.email;
  const adminId = user?._id || "N/A";

  // Optimized navigation with grouped items for WasteWise
  const navItems = [
    { path: "/official/dashboard", icon: FiHome, label: "Dashboard" },

    // Grouped Waste Management
    {
      path: "/official/management",
      icon: FiFolder,
      label: "Management",
      subItems: [
         { path: "/official/management/schedules", icon: FiUsers, label: "Schedule Management" },
         { path: "/official/management/complains", icon: FiUsers, label: "Complain Management" },
      ]
    },

    // Analytics & Settings
    { path: "/official/login_history", icon: FiBarChart2, label: "Login History" },
    { path: "/official/update_profile", icon: FiBarChart2, label: "Profile" },
    // { path: "/official/analytics", icon: FiBarChart2, label: "Analytics" },
    // { path: "/official/settings", icon: FiSettings, label: "System Settings" },
  ];


  useEffect(() => {
    refresh();
  }, []);



  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    navigate("/");
    localStorage.clear();
    logout();
  };



  const customTitles = {
    // Dashboard
    'dashboard': 'Waste Wise Dashboard',

    // Management section
    'management': 'Waste Management',
    'management/logs': 'Log Management',
    'management/schedules': 'Schedule Management',
    'management/routes': 'Route Management',
    'management/trucks': 'Truck Management',
    'management/complains': 'Complain Management',

    // Approval section
    'approval': 'Approval Management',
    'approval/schedules': 'Schedule Approval',

    // Other pages
    'login_history': 'Login History',
    'update_profile': 'Profile Management',
  };

  const getPageTitle = () => {
    const segments = location.pathname.split("/").filter(Boolean);

    const relevantSegments = segments.slice(1);
    const pathKey = relevantSegments.join('/');

    // Try exact match
    if (customTitles[pathKey]) {
      return customTitles[pathKey];
    }

    // Try parent sections
    for (let i = relevantSegments.length - 1; i >= 0; i--) {
      const testKey = relevantSegments.slice(0, i + 1).join('/');
      if (customTitles[testKey]) {
        return customTitles[testKey];
      }
    }

    // Fallback
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      ?.replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Waste Management Dashboard";
  };

  // Get pending requests count
  const pendingRequestsCount = 5;
  const urgentRequestsCount = 2;

  const isRequestActive = (requestPath) => {
    return location.pathname.startsWith(requestPath);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100">
      {/* Sidebar */}
      <div
        className={`relative bg-white/95 backdrop-blur-lg shadow-xl border-r border-blue-200/60 transition-all duration-500 ease-in-out flex flex-col ${sidebarOpen ? "w-64" : "w-16"
          }`}
      >
        {/* Header and Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo Section - Compact */}
          <div className="p-3 border-b border-blue-200/40 flex items-center justify-between flex-shrink-0">
            {sidebarOpen && (
              <div className="flex items-center space-x-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    Barangay Official
                  </h1>
                  <p className="text-xs text-gray-500 truncate">WasteWise</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 shadow-sm border border-blue-200/40 flex-shrink-0 ${!sidebarOpen
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                : 'bg-white hover:bg-blue-50/80'
                }`}
            >
              {sidebarOpen ? (
                <HiOutlineChevronLeft className={`w-3 h-3 transition-colors ${!sidebarOpen ? 'text-white' : 'text-blue-600'
                  }`} />
              ) : (
                <HiOutlineChevronRight className={`w-3 h-3 transition-colors ${!sidebarOpen ? 'text-white' : 'text-blue-600'
                  }`} />
              )}
            </button>
          </div>

          {/* Navigation - Compact Design */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const hasSubItems = item.subItems;
              const isExpanded = expandedSections[item.label.toLowerCase().replace(' ', '')];

              if (hasSubItems) {
                return (
                  <div key={item.path} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(item.label.toLowerCase().replace(' ', ''))}
                      className={`flex items-center w-full p-2 rounded-lg transition-all duration-300 group ${isRequestActive(item.path)
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                      <item.icon className="text-base flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="ml-2 font-medium text-sm truncate flex-1 text-left">
                            {item.label}
                          </span>
                          <FiChevronDown
                            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                              }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Sub Items */}
                    {sidebarOpen && isExpanded && (
                      <div className="ml-6 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname.startsWith(subItem.path);
                          const showBadge = subItem.badge && subItem.badge > 0;

                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center p-1.5 rounded-md transition-all duration-200 group relative ${isSubActive
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                            >
                              <subItem.icon className="text-sm flex-shrink-0" />
                              <span className="ml-2 text-sm font-medium truncate flex-1">
                                {subItem.label}
                              </span>
                              {showBadge && (
                                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[18px] text-center">
                                  {subItem.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation item
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg transition-all duration-300 group relative ${isActive
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm hover:border hover:border-blue-200/60"
                    }`}
                >
                  <item.icon className="text-base flex-shrink-0" />
                  {sidebarOpen && (
                    <span className={`ml-2 font-medium text-sm truncate flex-1 ${isActive ? "text-white" : "group-hover:text-blue-600"
                      }`}>
                      {item.label}
                    </span>
                  )}
                  {!sidebarOpen && isActive && (
                    <div className="absolute left-1.5 w-1 h-4 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout - Compact */}
        <div className="p-2 border-t border-blue-200/40 space-y-2 flex-shrink-0">
          {/* Admin Quick Stats - Only show when sidebar is open */}
          {/* {sidebarOpen && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-200/40">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">Pending</span>
                <span className="text-xs font-bold text-orange-500">{pendingRequestsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Admin ID</span>
                <span className="text-xs font-bold text-blue-600 truncate">{adminId}</span>
              </div>
            </div>
          )} */}

          {/* Admin & Logout */}
          <div className="space-y-1">
            <div className="flex items-center p-2 rounded-lg bg-blue-50/80 border border-blue-200/40">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-semibold text-xs">
                  {adminFirstName?.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarOpen && (
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {adminFirstName} {adminLastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Barangay Official</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50/80 border border-transparent hover:border-red-200/60 w-full transition-all duration-300 group"
            >
              <FiLogOut className="text-base group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
              {sidebarOpen && <span className="ml-2 text-sm font-medium truncate">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Compact */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-blue-200/60 sticky top-0 z-20">
          <div className="px-6 py-3 flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-800 truncate">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {location.pathname.includes('dashboard')
                  ? `Welcome, ${adminFirstName}! Monitor waste collection and system operations.`
                  : `Administrative control panel for WasteWise Management System.`
                }
              </p>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-blue-50/80 transition-all duration-300 group">
                <FiBell className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Admin Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-blue-50/80 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {adminFirstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {adminFirstName} {adminLastName}
                    </p>
                    {/* <p className="text-xs text-gray-500 truncate">ID: {adminId}</p> */}
                  </div>
                  <FiChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 flex-shrink-0 ${userDropdownOpen ? "rotate-180" : ""
                    }`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-blue-200/60 py-1 z-30">
                    <div className="px-3 py-2 border-b border-blue-200/40">
                      <p className="font-semibold text-gray-800 truncate text-sm">{adminFirstName} {adminLastName}</p>
                      <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">WasteWise Official</p>
                    </div>
                    <Link
                      to="/admin/profile"
                      className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50/80 transition-colors duration-200 text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiUser className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate">Admin Profile</span>
                    </Link>
                    <Link
                      to="/admin/management/requests"
                      className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50/80 transition-colors duration-200 text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiFileText className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate flex-1">Collection Requests</span>
                      {pendingRequestsCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center px-3 py-2 text-gray-600 hover:bg-blue-50/80 transition-colors duration-200 text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiSettings className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate">System Settings</span>
                    </Link>
                    <div className="border-t border-blue-200/40 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50/80 transition-colors duration-200 text-sm"
                      >
                        <FiLogOut className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Backdrop for dropdown */}
      {userDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setUserDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default OfficialLayout;