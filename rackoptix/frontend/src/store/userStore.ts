import { create } from 'zustand';
import { User, UserPreferences } from '../types';

// Store interface
interface UserState {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCurrentUser: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Collaboration actions
  fetchCollaborators: (projectId: string) => Promise<User[]>;
  addCollaborator: (projectId: string, userId: string) => Promise<void>;
  removeCollaborator: (projectId: string, userId: string) => Promise<void>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  measurementUnit: 'imperial',
  notifications: true,
  defaultView: 'grid',
  shortcuts: {
    'save': 'Ctrl+S',
    'new': 'Ctrl+N',
    'delete': 'Delete',
    'duplicate': 'Ctrl+D',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y'
  }
};

// Create store
const useUserStore = create<UserState>((set: any, get: any) => ({
  // Initial state
  currentUser: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/users/me`);
      // set({ currentUser: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          currentUser: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            preferences: DEFAULT_PREFERENCES
          },
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching current user:', error);
      set({
        error: 'Failed to fetch current user',
        isLoading: false
      });
    }
  },
  
  updateUserPreferences: async (preferences: Partial<UserPreferences>) => {
    set({ isLoading: true, error: null });
    try {
      const { currentUser } = get();
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      // In a real implementation, this would call the API
      // await axios.put(`${API_URL}/users/me/preferences`, preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedPreferences = {
        ...currentUser.preferences,
        ...preferences
      };
      
      set({
        currentUser: {
          ...currentUser,
          preferences: updatedPreferences
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      set({
        error: 'Failed to update user preferences',
        isLoading: false
      });
      throw error;
    }
  },
  
  fetchCollaborators: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/projects/${projectId}/collaborators`);
      // const collaborators = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate collaborators
      const collaborators: User[] = [
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'user',
          preferences: DEFAULT_PREFERENCES
        },
        {
          id: 'user-3',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          role: 'viewer',
          preferences: DEFAULT_PREFERENCES
        }
      ];
      
      set({ isLoading: false });
      return collaborators;
    } catch (error) {
      console.error(`Error fetching collaborators for project ${projectId}:`, error);
      set({
        error: `Failed to fetch collaborators for project ${projectId}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  addCollaborator: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.post(`${API_URL}/projects/${projectId}/collaborators`, { userId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({ isLoading: false });
    } catch (error) {
      console.error(`Error adding collaborator to project ${projectId}:`, error);
      set({
        error: `Failed to add collaborator to project ${projectId}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  removeCollaborator: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/projects/${projectId}/collaborators/${userId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({ isLoading: false });
    } catch (error) {
      console.error(`Error removing collaborator from project ${projectId}:`, error);
      set({
        error: `Failed to remove collaborator from project ${projectId}`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useUserStore;