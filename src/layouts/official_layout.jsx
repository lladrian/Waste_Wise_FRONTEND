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
  FiX,
  FiShuffle
} from "react-icons/fi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

import { AuthContext } from '../context/AuthContext';
import { toast } from "react-toastify";
import { formatDistanceToNow } from 'date-fns';

import { getAllNotificationSpecificUser, updateReadMultipleNotification, updateReadAllNotificationSpecificUser, } from "../hooks/notification_hook";
import { updateUserSelectedRole } from "../hooks/user_management_hook";


const OfficialLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    management: location.pathname.includes('/official/management')
  });
  const { logout, user, refresh, update_profile } = useContext(AuthContext);
  const adminFirstName = user?.first_name;
  const adminMiddleName = user?.middle_name;
  const adminLastName = user?.last_name;
  const adminEmail = user?.email;
  const adminId = user?._id || "N/A";

  // Dynamic role options based on user's multiple_role array
  const getRoleOptions = () => {
    if (!user?.multiple_role || !Array.isArray(user.multiple_role)) {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'enro_staff_monitoring', label: 'ENRO Staff Monitoring' },
        { value: 'enro_staff_scheduler', label: 'ENRO Staff Scheduler' },
        { value: 'enro_staff_head', label: 'ENRO Staff Head' },
        { value: 'enro_staff_eswm_section_head', label: 'ENRO ESWM Section Head' },
        { value: 'barangay_official', label: 'Barangay Official' },
        { value: 'garbage_collector', label: 'Garbage Collector' },
      ];
    }

    // Map the user's multiple_role to the role options format
    const roleLabels = {
      'admin': 'Admin',
      'enro_staff_monitoring': 'ENRO Staff Monitoring',
      'enro_staff_scheduler': 'ENRO Staff Scheduler',
      'enro_staff_head': 'ENRO Staff Head',
      'enro_staff_eswm_section_head': 'ENRO ESWM Section Head',
      'barangay_official': 'Barangay Official',
      'garbage_collector': 'Garbage Collector'
    };

    return user.multiple_role
      .filter(roleObj => roleObj.role && roleLabels[roleObj.role])
      .map(roleObj => ({
        value: roleObj.role,
        label: roleLabels[roleObj.role],
        role_action: roleObj.role_action // Include role_action in the option
      }));
  };

  const roleOptions = getRoleOptions();

  // Get current role label
  const getCurrentRoleLabel = () => {
    const currentRole = roleOptions.find(role => role.value === user?.role);
    return currentRole?.label || 'Admin';
  };

  // Check if user has multiple roles
  const hasMultipleRoles = roleOptions.length > 1;

  // Notification state
  const [notifications, setNotifications] = useState([]);

  // Optimized navigation with grouped items for WasteWise
 const navItems = [
    { path: "/official/dashboard", icon: FiHome, label: "Dashboard" },

    // Grouped Waste Management
    {
      path: "/official/management",
      icon: FiFolder,
      label: "Management",
      subItems: [
         { path: "/official/management/residents", icon: FiUsers, label: "Resident Management" },
         { path: "/official/management/schedules", icon: FiUsers, label: "Schedule Management" },
         { path: "/official/management/complains", icon: FiUsers, label: "Barangay Complain Management" },
         { path: "/official/management/garbage_sites", icon: FiUsers, label: "Garbage Site Management" },
         { path: "/official/management/garbage_reports", icon: FiUsers, label: "Garbage Report Management" },
         { path: "/official/management/collector_reports", icon: FiUsers, label: "Collector Report Management" },
         { path: "/official/management/barangay_requests", icon: FiUsers, label: "Barangay Request Management" },
      ]
    },

     // Analytics & Settings
    { path: "/official/login_history", icon: FiBarChart2, label: "Login History" },
    { path: "/official/truck_map", icon: FiBarChart2, label: "Truck Map" },
    { path: "/official/update_profile", icon: FiBarChart2, label: "Update Profile" },
    { path: "/official/garbage_sites", icon: FiBarChart2, label: "Garbage Sites" },
    // { path: "/official/analytics", icon: FiBarChart2, label: "Analytics" },
    // { path: "/official/settings", icon: FiSettings, label: "System Settings" },
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
  };

  const handleLogout = () => {
    navigate("/");
    logout();
    localStorage.clear();
  };

  const handleRoleSwitch = async (newRole, role_action) => {
    try {
      const input_data = {
        role: newRole,
        role_action: role_action
      }

      const { data, success } = await updateUserSelectedRole(user?._id, input_data);

      if(success === true) {
        setRoleDropdownOpen(false);
        const role = data.data.role;

        await update_profile(data.data)
        // await refresh()

        if (role == 'admin') {
          navigate('/admin/dashboard');
          // window.location.reload();
        }

        if (role === 'enro_staff_scheduler' || role === 'enro_staff_head' || role === 'enro_staff_monitoring' || role === 'enro_staff_eswm_section_head') {
          navigate('/staff/dashboard');
          // window.location.reload();
        }

        if (role == 'barangay_official') {
          navigate('/official/dashboard');
          // window.location.reload();
        }
      }
    } catch (error) {
      toast.error("Failed to switch role");
      console.error("Role switch error:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data, success } = await updateReadMultipleNotification({
        notif_ids: [notificationId] // This should be an array of notification IDs
      });

      if (success === true) {
        toast.success("Notification marked as read");
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
    'management/residents': 'Resident Management',
    'management/logs': 'Log Management',
    'management/schedules': 'Schedule Management',
    'management/routes': 'Route Management',
    'management/trucks': 'Truck Management',
    'management/complains': 'Barangay Complain Management',
    'management/garbage_reports': 'Garbage Report Management',
    'management/collector_reports': 'Collector Report Management',
    'management/garbage_sites': 'Garbage Site Management',
    'management/barangay_requests': 'Barangay Request Management',




    // Approval section
    'approval': 'Approval Management',
    'approval/schedules': 'Schedule Approval',
    
    // Other pages
    'garbage_sites': 'Garbage Site',
    'login_history': 'Login History',
    'update_profile': 'Update Profile',
    'truck_map': 'Truck Map',
    'notifications': 'Notifications',
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
                    {/* {
                      user?.role === 'barangay_official' ? 'Official' : 'Official'
                    } */}
                    Official
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

        {/* User Profile & Actions - Compact */}
        <div className="p-2 border-t border-blue-200/40 space-y-2 flex-shrink-0 relative">
          {hasMultipleRoles && (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="cursor-pointer flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 border border-transparent hover:border-blue-200/60 w-full transition-all duration-300 group"
              >
                <FiShuffle className="text-base group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="ml-2 text-sm font-medium truncate">Switch Role</span>
                    <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[18px] text-center">
                      {roleOptions.length}
                    </span>
                  </>
                )}
              </button>

              {roleDropdownOpen && sidebarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />

                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-200/60 py-2 z-50">
                    <div className="px-4 py-2 border-b border-blue-200/40">
                      <h3 className="font-semibold text-gray-800 text-sm">Switch Role</h3>
                      <p className="text-xs text-gray-500 mt-1">Select a role to switch to</p>
                    </div>
                    <div>
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling to backdrop
                            handleRoleSwitch(role.value, role.role_action);
                          }}
                          className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-200 hover:bg-blue-50/80 ${user?.role === role.value
                            ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-500'
                            : 'text-gray-600'
                            }`}
                        >
                          <span className="truncate text-left flex-1">{role.label}</span>
                          {user?.role === role.value && (
                            <FiCheckCircle className="w-4 h-4 ml-2 text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* {sidebarOpen && (
            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
                <FiUser className="text-white text-xs" />
              </div>
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {getCurrentRoleLabel()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {hasMultipleRoles ? `${roleOptions.length} roles available` : 'Current Role'}
                </p>
              </div>
            </div>
          )} */}

          {/* User Info & Logout */}
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
              {/* Current Role Badge */}
              {/* <div className="hidden sm:flex items-center space-x-2 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-200/60">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">{getCurrentRoleLabel()}</span>
                {hasMultipleRoles && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                    {roleOptions.length}
                  </span>
                )}
              </div> */}

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
                      {unreadCount >= 0 && (
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
                          to="/official/notifications"
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
                      <p className="text-xs text-blue-600 font-medium mt-1">{getCurrentRoleLabel()}</p>
                      {hasMultipleRoles && (
                        <p className="text-xs text-gray-500 mt-1">
                          {roleOptions.length} roles available
                        </p>
                      )}
                    </div>
                    {hasMultipleRoles && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setRoleDropdownOpen(true);
                        }}
                        className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-blue-50/80 transition-colors duration-200 text-sm"
                      >
                        <FiShuffle className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">Switch Role</span>
                        <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {roleOptions.length}
                        </span>
                      </button>
                    )}
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
        <main
          className="flex-1 overflow-auto p-6"
          onClick={() => {
            setRoleDropdownOpen(false);
            setNotificationDropdownOpen(false);
          }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfficialLayout;