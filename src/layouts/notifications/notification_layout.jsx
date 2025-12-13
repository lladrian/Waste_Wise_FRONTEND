// pages/NotificationsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
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
  FiArchive,
  FiPackage,
  FiInbox
} from 'react-icons/fi';

import { AuthContext } from '../../context/AuthContext';
import {
  getAllNotificationSpecificUser,
  updateReadAllNotificationSpecificUser,
  updateReadMultipleNotification,
  updateArchiveMultipleNotification,
} from "../../hooks/notification_hook";

import { toast } from "react-toastify";

const NotificationsPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, success } = await getAllNotificationSpecificUser(user?._id, user?.role);
      if (success === true) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notification data:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications based on selected filter, search term, and archive status
  const filteredNotifications = notifications.filter(notification => {
    // Filter by archive status
    if (showArchived && !notification.is_archived) return false;
    if (!showArchived && notification.is_archived) return false;

    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.is_read) ||
      (filter === 'read' && notification.is_read) ||
      notification.category === filter;

    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.notif_content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get counts
  const unreadCount = notifications.filter(n => !n.is_read && !n.is_archived).length;
  const archivedCount = notifications.filter(n => n.is_archived).length;
  const activeCount = notifications.filter(n => !n.is_archived).length;

  // Get counts by category
  const categoryCounts = {
    all: showArchived ? archivedCount : activeCount,
    unread: notifications.filter(n => !n.is_read && (showArchived ? n.is_archived : !n.is_archived)).length,
    read: notifications.filter(n => n.is_read && (showArchived ? n.is_archived : !n.is_archived)).length,
    collection: notifications.filter(n => n.category === 'collection' && (showArchived ? n.is_archived : !n.is_archived)).length,
    approval: notifications.filter(n => n.category === 'approval' && (showArchived ? n.is_archived : !n.is_archived)).length,
    user: notifications.filter(n => n.category === 'user' && (showArchived ? n.is_archived : !n.is_archived)).length,
    complaint: notifications.filter(n => n.category === 'complaint' && (showArchived ? n.is_archived : !n.is_archived)).length,
    system: notifications.filter(n => n.category === 'system' && (showArchived ? n.is_archived : !n.is_archived)).length,
    maintenance: notifications.filter(n => n.category === 'maintenance' && (showArchived ? n.is_archived : !n.is_archived)).length,
    inventory: notifications.filter(n => n.category === 'inventory' && (showArchived ? n.is_archived : !n.is_archived)).length
  };

  // Mark notification as read
  const markAsRead = async (notif_id) => {
    try {
      const input_data = {
        notif_ids: [notif_id]
      };

      const { data, success } = await updateReadMultipleNotification(input_data);

      if (success === true) {
        toast.success("Notification marked as read");
        fetchData();
      }
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Failed to mark as read");
    }
  };

  // Mark all as read
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

  const markAsReadMultiple = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const input_data = {
        notif_ids: selectedNotifications
      };

      const { data, success } = await updateReadMultipleNotification(input_data);

      if (success === true) {
        toast.success(`${selectedNotifications.length} notifications marked as read`);
        fetchData();
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  // Archive notification
  const archiveNotificationHandler = async (notif_id) => {
    try {
      const input_data = {
        notif_ids: [notif_id],
        archive: true,
      };

      const { data, success } = await updateArchiveMultipleNotification(input_data);

      if (success === true) {
        toast.success("Notification archived");
        fetchData();
      }
    } catch (err) {
      console.error("Error archiving notification:", err);
      toast.error("Failed to archive notification");
    }
  };

  // Unarchive notification
  const unarchiveNotificationHandler = async (notif_id) => {
    try {
      const input_data = {
        notif_ids: [notif_id],
        archive: 'false',
      };

      const { data, success } = await updateArchiveMultipleNotification(input_data);
      if (success === true) {
        toast.success("Notification restored");
        fetchData();
      }
    } catch (err) {
      console.error("Error unarchiving notification:", err);
      toast.error("Failed to restore notification");
    }
  };

  // Archive selected notifications
  const archiveSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const input_data = {
        notif_ids: selectedNotifications,
        archive: true,
      };

      const { data, success } = await updateArchiveMultipleNotification(input_data);

      if (success === true) {
        toast.success(`${selectedNotifications.length} notifications archived`);
        setSelectedNotifications([]);
        fetchData();
      }
    } catch (err) {
      console.error("Error archiving notifications:", err);
      toast.error("Failed to archive notifications");
    }
  };

  // Unarchive selected notifications
  const unarchiveSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const input_data = {
        notif_ids: selectedNotifications,
        archive: 'false',
      };

      const { data, success } = await updateArchiveMultipleNotification(input_data);
      if (success === true) {
        toast.success(`${selectedNotifications.length} notifications restored`);
        setSelectedNotifications([]);
        fetchData();
      }
    } catch (err) {
      console.error("Error unarchiving notifications:", err);
      toast.error("Failed to restore notifications");
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
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
        return FiPackage;
      default:
        return FiBell;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {/* <div className="p-2 bg-blue-100 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div> */}
              {/* Notifications */}

            </h1>
            <p className="text-gray-600 mt-1">
              {showArchived
                ? `Viewing ${archivedCount} archived notifications`
                : `Managing ${activeCount} active notifications`
              }
              {showArchived && (
                <span className="text-lg font-medium text-gray-500"> (Archived) </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {/* Toggle Archive View */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${showArchived
                ? 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100'
                : 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
            >
              <FiArchive className="w-4 h-4" />
              {showArchived ? 'View Active' : `View Archived (${archivedCount})`}
            </button>

            {selectedNotifications.length > 0 && (
              <>
                {!showArchived ? (
                  <>
                    <button
                      onClick={markAsReadMultiple}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Mark Read
                    </button>
                    <button
                      onClick={archiveSelected}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FiArchive className="w-4 h-4" />
                      Archive
                    </button>
                  </>
                ) : (
                  <button
                    onClick={unarchiveSelected}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiInbox className="w-4 h-4" />
                    Restore
                  </button>
                )}
              </>
            )}

            {!showArchived && (
              <button
                onClick={markAllAsRead}
                disabled={loading || unreadCount === 0}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { key: 'all', label: 'All', count: categoryCounts.all },
          { key: 'unread', label: 'Unread', count: categoryCounts.unread },
          { key: 'read', label: 'Read', count: categoryCounts.read },
          // { key: 'collection', label: 'Collection', count: categoryCounts.collection },
          // { key: 'approval', label: 'Approval', count: categoryCounts.approval },
          // { key: 'user', label: 'User', count: categoryCounts.user },
          // { key: 'complaint', label: 'Complaint', count: categoryCounts.complaint },
          // { key: 'system', label: 'System', count: categoryCounts.system },
          // { key: 'inventory', label: 'Inventory', count: categoryCounts.inventory },
          // { key: 'maintenance', label: 'Maintenance', count: categoryCounts.maintenance }
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`p-4 rounded-xl border-2 transition-all ${filter === stat.key
              ? showArchived
                ? 'border-purple-500 bg-purple-50 shadow-sm'
                : 'border-blue-500 bg-blue-50 shadow-sm'
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
              placeholder={`Search ${showArchived ? 'archived' : 'active'} notifications...`}
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
              {!showArchived && <option value="unread">Unread Only</option>}
              <option value="read">Read Only</option>
              {/* <option value="collection">Collection</option>
              <option value="approval">Approval</option>
              <option value="user">User</option>
              <option value="complaint">Complaint</option>
              <option value="system">System</option> */}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No archived notifications' : 'No notifications found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : showArchived
                  ? 'No notifications have been archived yet'
                  : 'All caught up! No notifications at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const CategoryIcon = getCategoryIcon(notification.category);

              return (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read && !showArchived ? 'bg-blue-50/50' : ''
                    } ${notification.is_archived ? 'bg-gray-50/70' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => toggleNotificationSelection(notification._id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryIcon className={`w-4 h-4 ${notification.is_archived ? 'text-gray-400' : 'text-gray-400'}`} />
                        <h3 className={`font-medium flex-1 ${!notification.is_read && !notification.is_archived
                          ? 'text-blue-900'
                          : 'text-gray-900'
                          }`}>
                          {notification.title}
                          {notification.is_archived && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              Archived
                            </span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {notification.created_at}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {notification.notif_content}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link
                          to={notification.link}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {!notification.is_read && !notification.is_archived && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                        {notification.is_read && !notification.is_archived && (
                          <span className="text-gray-500 text-sm font-medium">
                            Read
                          </span>
                        )}

                        {/* Archive/Unarchive Button */}
                        {!notification.is_archived ? (
                          <button
                            onClick={() => archiveNotificationHandler(notification._id)}
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium ml-auto flex items-center gap-1"
                          >
                            <FiArchive className="w-3 h-3" />
                            Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveNotificationHandler(notification._id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium ml-auto flex items-center gap-1"
                          >
                            <FiInbox className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.is_read && !notification.is_archived && (
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