import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as notificationService from '../services/notificationService';
import {
  Bell,
  X,
  Ticket,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_ticket':
        return <Ticket className="w-4 h-4 text-blue-600" />;
      case 'ticket_assigned':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'reassign_request':
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      case 'high_priority':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'ticket_resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-slate-200 dark:border-dark-border overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
              <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-dark-hover rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-10 h-10 text-slate-300 dark:text-dark-border mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-dark-border">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleMarkAsRead(notification._id)}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-hover cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-dark-elevated rounded-full flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 dark:text-white font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
