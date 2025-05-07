import { create } from 'zustand';
import { Notification } from '../types';

// Store interface
interface NotificationState {
  // State
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Create notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<string>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useNotificationStore = create<NotificationState>((set: any, get: any) => ({
  // Initial state
  notifications: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/notifications`);
      // set({ notifications: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          notifications: [
            {
              id: 'notification-1',
              type: 'info',
              title: 'Project Created',
              message: 'New project "Chicago Distribution Center" has been created.',
              createdAt: '2025-05-01T14:30:00Z',
              read: false,
              actionUrl: '/projects/project-1',
              userId: 'user-1'
            },
            {
              id: 'notification-2',
              type: 'success',
              title: 'Optimization Complete',
              message: 'Layout optimization for "Chicago Distribution Center" has completed successfully.',
              createdAt: '2025-05-02T10:15:00Z',
              read: true,
              actionUrl: '/projects/project-1/layout',
              userId: 'user-1'
            },
            {
              id: 'notification-3',
              type: 'warning',
              title: 'Collaboration Invitation',
              message: 'You have been invited to collaborate on "Atlanta Fulfillment Center".',
              createdAt: '2025-05-03T16:45:00Z',
              read: false,
              actionUrl: '/projects/project-2',
              userId: 'user-1'
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({
        error: 'Failed to fetch notifications',
        isLoading: false
      });
    }
  },
  
  markAsRead: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.put(`${API_URL}/notifications/${id}/read`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state: NotificationState) => ({
        notifications: state.notifications.map((notification: Notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      set({
        error: `Failed to mark notification ${id} as read`,
        isLoading: false
      });
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.put(`${API_URL}/notifications/read-all`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state: NotificationState) => ({
        notifications: state.notifications.map((notification: Notification) => ({
          ...notification,
          read: true
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({
        error: 'Failed to mark all notifications as read',
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteNotification: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/notifications/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state: NotificationState) => ({
        notifications: state.notifications.filter((notification: Notification) => notification.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      set({
        error: `Failed to delete notification ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  clearAllNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/notifications`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({
        notifications: [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      set({
        error: 'Failed to clear all notifications',
        isLoading: false
      });
      throw error;
    }
  },
  
  addNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/notifications`, notification);
      // const newNotification = response.data;
      
      // Simulate API call
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      set((state: NotificationState) => ({
        notifications: [newNotification, ...state.notifications],
        isLoading: false
      }));
      
      return newNotification.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      set({
        error: 'Failed to add notification',
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useNotificationStore;