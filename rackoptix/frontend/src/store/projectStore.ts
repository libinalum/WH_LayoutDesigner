import { create } from 'zustand';
import { Project } from '../types';

// Store interface
interface ProjectState {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Project template actions
  createProjectFromTemplate: (templateId: string, name: string) => Promise<Project>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useProjectStore = create<ProjectState>((set: any, get: any) => ({
  // Initial state
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/projects`);
      // set({ projects: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          projects: [
            {
              id: 'project-1',
              name: 'Chicago Distribution Center',
              description: 'Optimization project for Chicago DC',
              createdAt: '2025-04-15T10:30:00Z',
              updatedAt: '2025-05-01T14:45:00Z',
              status: 'active',
              facilityId: 'facility-1',
              layoutId: 'layout-1',
              metrics: {
                storage_density: 0.82,
                space_utilization: 0.75,
                pallet_positions: 1350
              },
              thumbnail: '/assets/thumbnails/project-1.png',
              tags: ['optimization', 'chicago', 'distribution'],
              owner: 'user-1',
              collaborators: ['user-2', 'user-3']
            },
            {
              id: 'project-2',
              name: 'Atlanta Fulfillment Center',
              description: 'New facility design for Atlanta',
              createdAt: '2025-04-20T09:15:00Z',
              updatedAt: '2025-04-30T11:20:00Z',
              status: 'active',
              facilityId: 'facility-2',
              metrics: {
                storage_density: 0.78,
                space_utilization: 0.72,
                pallet_positions: 980
              },
              thumbnail: '/assets/thumbnails/project-2.png',
              tags: ['new facility', 'atlanta', 'fulfillment'],
              owner: 'user-1'
            },
            {
              id: 'project-3',
              name: 'Dallas Warehouse Expansion',
              description: 'Expansion project for Dallas warehouse',
              createdAt: '2025-03-10T14:20:00Z',
              updatedAt: '2025-04-25T16:30:00Z',
              status: 'completed',
              facilityId: 'facility-3',
              layoutId: 'layout-3',
              metrics: {
                storage_density: 0.85,
                space_utilization: 0.79,
                pallet_positions: 2200
              },
              thumbnail: '/assets/thumbnails/project-3.png',
              tags: ['expansion', 'dallas', 'warehouse'],
              owner: 'user-1',
              collaborators: ['user-4']
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({
        error: 'Failed to fetch projects',
        isLoading: false
      });
    }
  },
  
  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/projects/${id}`);
      // set({ currentProject: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const project = get().projects.find((p: Project) => p.id === id);
        if (project) {
          set({
            currentProject: project,
            isLoading: false
          });
        } else {
          set({
            error: `Project not found with id: ${id}`,
            isLoading: false
          });
        }
      }, 300);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      set({
        error: `Failed to fetch project ${id}`,
        isLoading: false
      });
    }
  },
  
  createProject: async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/projects`, projectData);
      // const newProject = response.data;
      
      // Simulate API call
      const newProject: Project = {
        ...projectData,
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set((state: ProjectState) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        isLoading: false
      }));
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      set({
        error: 'Failed to create project',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const project = get().projects.find((p: Project) => p.id === id);
      if (!project) {
        set({
          error: `Project not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/projects/${id}`, {
      //   ...project,
      //   ...updates,
      //   updatedAt: new Date().toISOString()
      // });
      // const updatedProject = response.data;
      
      // Simulate API call
      const updatedProject: Project = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      set((state: ProjectState) => ({
        projects: state.projects.map((p: Project) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false
      }));
      
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      set({
        error: `Failed to update project ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/projects/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state: ProjectState) => ({
        projects: state.projects.filter((p: Project) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      set({
        error: `Failed to delete project ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
  
  createProjectFromTemplate: async (templateId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/projects/template/${templateId}`, { name });
      // const newProject = response.data;
      
      // Simulate API call
      let templateData: Partial<Project> = {};
      
      // Define different templates
      switch (templateId) {
        case 'distribution-center':
          templateData = {
            description: 'Distribution center template with standard layout',
            tags: ['template', 'distribution', 'standard'],
            metrics: {
              storage_density: 0.80,
              space_utilization: 0.75,
              pallet_positions: 1200
            }
          };
          break;
        case 'fulfillment-center':
          templateData = {
            description: 'Fulfillment center template optimized for e-commerce',
            tags: ['template', 'fulfillment', 'e-commerce'],
            metrics: {
              storage_density: 0.75,
              space_utilization: 0.70,
              pallet_positions: 900
            }
          };
          break;
        case 'cold-storage':
          templateData = {
            description: 'Cold storage facility template',
            tags: ['template', 'cold-storage', 'refrigerated'],
            metrics: {
              storage_density: 0.70,
              space_utilization: 0.65,
              pallet_positions: 800
            }
          };
          break;
        default:
          templateData = {
            description: 'Basic warehouse template',
            tags: ['template', 'warehouse', 'basic'],
            metrics: {
              storage_density: 0.75,
              space_utilization: 0.70,
              pallet_positions: 1000
            }
          };
      }
      
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name,
        description: templateData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: templateData.tags || [],
        metrics: templateData.metrics || {},
        owner: 'current-user'
      };
      
      set((state: ProjectState) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        isLoading: false
      }));
      
      return newProject;
    } catch (error) {
      console.error(`Error creating project from template ${templateId}:`, error);
      set({
        error: `Failed to create project from template ${templateId}`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useProjectStore;