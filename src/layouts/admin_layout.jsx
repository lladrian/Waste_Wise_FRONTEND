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
  FiCalendar,
  FiX
} from "react-icons/fi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

import { AuthContext } from '../context/AuthContext';
import { toast } from "react-toastify";
import { formatDistanceToNow } from 'date-fns';


import { getAllNotificationSpecificUser, updateReadSpecificNotification, updateReadAllNotificationSpecificUser, } from "../hooks/notification_hook";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    management: location.pathname.includes('/admin/management')
  });
  const [expandedSectionsApproval, setExpandedSectionsApproval] = useState({
    approval: location.pathname.includes('/admin/approval')
  });
  const { logout, user, refresh } = useContext(AuthContext);
  const adminFirstName = user?.first_name;
  const adminMiddleName = user?.middle_name;
  const adminLastName = user?.last_name;
  const adminEmail = user?.email;
  const adminId = user?._id || "N/A";

  // Notification state
  const [notifications, setNotifications] = useState([]);

  // Optimized navigation with grouped items for WasteWise
  const navItems = [
    { path: "/admin/dashboard", icon: FiHome, label: "Dashboard" },

    // Grouped Waste Management
    {
      path: "/admin/management",
      icon: FiFolder,
      label: " Management",
      subItems: [
        { path: "/admin/management/users", icon: FiUsers, label: "User Management" },
        { path: "/admin/management/residents", icon: FiUsers, label: "Resident Management" },
        { path: "/admin/management/role_actions", icon: FiUsers, label: "Role Action Management" },
        { path: "/admin/management/logs", icon: FiUsers, label: "Log Management" },
        { path: "/admin/management/routes", icon: FiUsers, label: "Route Management" },
        { path: "/admin/management/barangays", icon: FiUsers, label: "Barangay Management" },
        { path: "/admin/management/trucks", icon: FiUsers, label: "Truck Management" },
        { path: "/admin/management/complains", icon: FiUsers, label: "Complain Management" },
        { path: "/admin/management/garbage_sites", icon: FiUsers, label: "Garbage Site Management" },
        { path: "/admin/management/garbage_reports", icon: FiUsers, label: "Garbage Report Management" },
        { path: "/admin/management/collector_reports", icon: FiUsers, label: "Collector Report Management" },
        { path: "/admin/management/collector_attendances", icon: FiUsers, label: "Collector Attendance Management" },
      ]
    },
    {
      path: "/admin/approval",
      icon: FiFolder,
      label: "Approval",
      subItems: [
        { path: "/admin/approval/schedules", icon: FiUsers, label: "Schedule Approval" },
        { path: "/admin/approval/requests", icon: FiUsers, label: "User Request Approval" },
      ]
    },
    // Analytics & Settings
    { path: "/admin/login_history", icon: FiBarChart2, label: "Login History" },
    { path: "/admin/truck_map", icon: FiBarChart2, label: "Truck Map" },
    { path: "/admin/update_profile", icon: FiBarChart2, label: "Profile" },
  ];

  useEffect(() => {
    refresh();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, success } = await getAllNotificationSpecificUser(user?._id);
      if (success === true) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notification data:", err);
      toast.error("Failed to load notifications");
    } 
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    setExpandedSectionsApproval(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    navigate("/");
    logout();
    localStorage.clear();
  };

 
  const markAsRead = async (notificationId) => {
      try {
      const { data, success } = await updateReadSpecificNotification(notificationId);
      if (success === true) {
        // toast.success("Notification marked as read");
      }
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
      try {
          const { data, success } = await updateReadAllNotificationSpecificUser(user?._id);
          if (success === true) {
            toast.success("All notifications marked as read");
            fetchData();
          }
        } catch (err) {
          console.error("Error marking all as read:", err);
          toast.error("Failed to mark all as read");
        }
  };

  const deleteNotification = (notificationId, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notification => notification._id !== notificationId));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setNotificationDropdownOpen(false);
    navigate(notification.link);
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  const customTitles = {
    // Dashboard
    'dashboard': 'Waste Wise Dashboard',

    // Management section
    'management': 'Waste Management',
    'management/logs': 'Log Management',
    'management/schedules': 'Schedule Management',
    'management/routes': 'Route Management',
    'management/barangays': 'Barangay Management',
    'management/trucks': 'Truck Management',
    'management/complains': 'Complain Management',
    'management/users': 'User Management',
    'management/residents': 'Resident Management',
    'management/role_actions': 'Role Action Management',
    'management/garbage_reports': 'Garbage Report Management',
    'management/collector_reports': 'Collector Report Management',
    'management/collector_attendances': 'Collector Attendance Management',
    'management/garbage_sites': 'Garbage Site Management',
    

    // Approval section
    'approval': 'Approval Management',
    'approval/schedules': 'Schedule Approval',
    'approval/requests': 'User Request Approval',

    // Other pages
    'login_history': 'Login History',
    'update_profile': 'Profile Management',
    'truck_map': 'Truck Map',
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
                    Admin
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
              const isExpanded = expandedSections[item.label.toLowerCase().replace(' ', '')] || expandedSectionsApproval[item.label.toLowerCase().replace(' ', '')];

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
                      <div className="ml-2 space-y-1">
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
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
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
              <div className="relative">
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="relative p-2 rounded-lg hover:bg-blue-50/80 transition-all duration-300 group"
                >
                  <FiBell className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-blue-200/60 py-2 z-30 max-h-96 overflow-hidden">
                    <div className="px-4 py-2 border-b border-blue-200/40 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-64">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-b border-blue-200/40 last:border-b-0 cursor-pointer transition-colors duration-200 hover:bg-blue-50/50 ${!notification.is_read ? 'bg-blue-50/30' : ''
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`font-medium text-sm truncate ${!notification.is_read ? 'text-blue-800' : 'text-gray-800'
                                    }`}>
                                    {notification.title}
                                  </h4>
                                  {/* <button
                                    onClick={(e) => deleteNotification(notification._id, e)}
                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </button> */}
                                </div>
                                <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                  {notification.notif_content}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </span>
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-blue-200/40">
                        <Link
                          to="/admin/notifications"
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium text-center block"
                          onClick={() => setNotificationDropdownOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                      <p className="text-xs text-blue-600 font-medium mt-1">WasteWise Administrator</p>
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
                      {unreadCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {unreadCount}
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

      {/* Backdrop for dropdowns */}
      {(userDropdownOpen || notificationDropdownOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setUserDropdownOpen(false);
            setNotificationDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminLayout;