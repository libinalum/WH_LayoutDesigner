import { useState, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationOptions {
  autoHideDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const defaultOptions: NotificationOptions = {
  autoHideDuration: 5000,
  position: 'bottom-right',
};

export const useNotification = (options: NotificationOptions = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const mergedOptions = { ...defaultOptions, ...options };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications((prev: Notification[]) => [...prev, newNotification]);

    if (mergedOptions.autoHideDuration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, mergedOptions.autoHideDuration);
    }

    return newNotification.id;
  }, [mergedOptions.autoHideDuration]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev: Notification[]) => prev.filter((notification: Notification) => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev: Notification[]) =>
      prev.map((notification: Notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    success: (message: string, title: string = 'Success') =>
      addNotification({ type: 'success', message, title, userId: 'current-user' }),
    error: (message: string, title: string = 'Error') =>
      addNotification({ type: 'error', message, title, userId: 'current-user' }),
    info: (message: string, title: string = 'Information') =>
      addNotification({ type: 'info', message, title, userId: 'current-user' }),
    warning: (message: string, title: string = 'Warning') =>
      addNotification({ type: 'warning', message, title, userId: 'current-user' }),
  };
};

export default useNotification;