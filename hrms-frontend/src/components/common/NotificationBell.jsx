// src/components/common/NotificationBell.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiBell, FiCheck, FiTrash2, FiX,
  FiExternalLink, FiInbox
} from 'react-icons/fi';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getRecent();
      setNotifications(res.data.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id
            ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        console.error('Failed to mark as read');
      }
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch {
      toast.error('Delete failed');
    }
  };

  const getNotificationIcon = (type, priority) => {
    const icons = {
      ANNOUNCEMENT: '📢',
      EVENT: '🗓️',
      LEAVE: '🏖️',
      ATTENDANCE: '⏰',
      PAYROLL: '💰',
      SYSTEM: '⚙️',
      GENERAL: '🔔',
    };
    return icons[type] || icons.GENERAL;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-blue-500',
      LOW: 'bg-gray-400',
    };
    return colors[priority] || colors.MEDIUM;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-gray-100
                   transition-colors text-gray-600"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white
                           text-[10px] font-bold rounded-full min-w-[18px] h-[18px]
                           flex items-center justify-center px-1
                           animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl
                        shadow-2xl border border-gray-100 z-50
                        max-h-[600px] flex flex-col overflow-hidden
                        animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center
                          justify-between bg-gradient-to-r from-blue-50
                          to-indigo-50">
            <div>
              <h3 className="font-bold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up!'}
              </p>
            </div>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded-lg hover:bg-white text-blue-600"
                  title="Mark all as read"
                >
                  <FiCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white text-gray-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8
                                border-4 border-blue-200 border-t-blue-600
                                mx-auto" />
                <p className="text-sm text-gray-500 mt-3">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex
                                items-center justify-center mx-auto mb-3">
                  <FiInbox className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer
                                transition-colors relative group ${
                      !notif.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full
                                        bg-gradient-to-br from-blue-100
                                        to-indigo-100 flex items-center
                                        justify-center text-lg">
                          {getNotificationIcon(notif.type, notif.priority)}
                        </div>
                        {!notif.isRead && (
                          <span className={`absolute -top-0.5 -right-0.5
                                             w-3 h-3 rounded-full border-2
                                             border-white ${
                                               getPriorityColor(notif.priority)}`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm ${!notif.isRead
                            ? 'font-semibold text-gray-800'
                            : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          <button
                            onClick={(e) => handleDelete(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100
                                       p-1 rounded hover:bg-red-50
                                       text-red-500 transition-opacity"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5
                                      line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {notif.timeAgo}
                          </span>
                          {notif.actionUrl && (
                            <FiExternalLink className="h-3 w-3
                                                       text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full py-2 text-sm text-blue-600
                           hover:text-blue-700 font-medium
                           hover:bg-white rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;