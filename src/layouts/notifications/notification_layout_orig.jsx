// pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBell, 
  FiCheckCircle, 
  FiTrash2, 
  FiFilter,
  FiSearch,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiCalendar,
  FiSettings,
  FiArchive
} from 'react-icons/fi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Collection Request",
      message: "Resident John Doe from Barangay 1 submitted a waste collection request for tomorrow",
      type: "request",
      priority: "high",
      time: "2024-01-15T10:30:00Z",
      read: false,
      link: "/admin/approval/requests",
      category: "collection"
    },
    {
      id: 2,
      title: "Schedule Approval Needed",
      message: "3 new collection schedules are waiting for your approval in Barangay 5",
      type: "approval",
      priority: "high",
      time: "2024-01-15T09:15:00Z",
      read: false,
      link: "/admin/approval/schedules",
      category: "approval"
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "System maintenance is scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes",
      type: "system",
      priority: "medium",
      time: "2024-01-15T08:00:00Z",
      read: true,
      link: "/admin/dashboard",
      category: "system"
    },
    {
      id: 4,
      title: "New User Registration",
      message: "A new resident, Maria Santos, has registered in Barangay 3",
      type: "user",
      priority: "medium",
      time: "2024-01-14T16:45:00Z",
      read: true,
      link: "/admin/management/users",
      category: "user"
    },
    {
      id: 5,
      title: "Truck Maintenance Due",
      message: "Truck WW-001 is due for maintenance in 3 days. Please schedule service",
      type: "maintenance",
      priority: "medium",
      time: "2024-01-14T14:20:00Z",
      read: true,
      link: "/admin/management/trucks",
      category: "maintenance"
    },
    {
      id: 6,
      title: "Complaint Received",
      message: "New complaint received regarding missed collection in Barangay 2",
      type: "complaint",
      priority: "high",
      time: "2024-01-14T11:10:00Z",
      read: true,
      link: "/admin/management/complains",
      category: "complaint"
    },
    {
      id: 7,
      title: "Route Optimization Complete",
      message: "Route optimization for tomorrow's collection has been completed successfully",
      type: "system",
      priority: "low",
      time: "2024-01-14T10:05:00Z",
      read: true,
      link: "/admin/management/routes",
      category: "system"
    },
    {
      id: 8,
      title: "Inventory Low - Waste Bags",
      message: "Waste bag inventory is running low. Current stock: 150 units",
      type: "inventory",
      priority: "medium",
      time: "2024-01-13T15:30:00Z",
      read: true,
      link: "/admin/dashboard",
      category: "inventory"
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter notifications based on selected filter and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         notification.category === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get counts by category
  const categoryCounts = {
    all: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    collection: notifications.filter(n => n.category === 'collection').length,
    approval: notifications.filter(n => n.category === 'approval').length,
    user: notifications.filter(n => n.category === 'user').length,
    complaint: notifications.filter(n => n.category === 'complaint').length,
    system: notifications.filter(n => n.category === 'system').length,
    maintenance: notifications.filter(n => n.category === 'maintenance').length,
    inventory: notifications.filter(n => n.category === 'inventory').length
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      setLoading(false);
      setSelectedNotifications([]);
    }, 500);
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Delete selected notifications
  const deleteSelected = () => {
    setNotifications(notifications.filter(notification => 
      !selectedNotifications.includes(notification.id)
    ));
    setSelectedNotifications([]);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Toggle single notification selection
  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  // Get priority icon and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'medium':
        return { icon: FiClock, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
      case 'low':
        return { icon: FiInfo, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      default:
        return { icon: FiInfo, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'collection':
        return FiCalendar;
      case 'approval':
        return FiCheckCircle;
      case 'user':
        return FiUser;
      case 'complaint':
        return FiAlertCircle;
      case 'system':
        return FiSettings;
      case 'maintenance':
        return FiSettings;
      case 'inventory':
        return FiArchive;
      default:
        return FiBell;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and review all system notifications
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Mark Read
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
            <button
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { key: 'all', label: 'All', count: categoryCounts.all },
          { key: 'unread', label: 'Unread', count: categoryCounts.unread },
          { key: 'read', label: 'Read', count: categoryCounts.read },
          { key: 'collection', label: 'Collection', count: categoryCounts.collection },
          { key: 'approval', label: 'Approval', count: categoryCounts.approval },
          { key: 'user', label: 'User', count: categoryCounts.user },
          { key: 'complaint', label: 'Complaint', count: categoryCounts.complaint },
          { key: 'system', label: 'System', count: categoryCounts.system },
          { key: 'inventory', label: 'Inventory', count: categoryCounts.inventory },
          { key: 'maintenance', label: 'Maintenance', count: categoryCounts.maintenance }
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filter === stat.key
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
              <option value="collection">Collection</option>
              <option value="approval">Approval</option>
              <option value="user">User</option>
              <option value="complaint">Complaint</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'All caught up! No notifications at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const PriorityIcon = getPriorityInfo(notification.priority).icon;
              const CategoryIcon = getCategoryIcon(notification.category);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Priority Indicator */}
                    <div className={`p-2 rounded-lg ${getPriorityInfo(notification.priority).bgColor}`}>
                      <PriorityIcon className={`w-4 h-4 ${getPriorityInfo(notification.priority).color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryIcon className="w-4 h-4 text-gray-400" />
                        <h3 className={`font-medium flex-1 ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatTime(notification.time)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link
                          to={notification.link}
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mark as Read
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Select All Footer */}
        {filteredNotifications.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length > 0 
                    ? `${selectedNotifications.length} selected` 
                    : 'Select all'
                  }
                </span>
              </div>
              
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} notifications selected
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Updating notifications...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;