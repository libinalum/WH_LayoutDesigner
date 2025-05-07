import { create } from 'zustand';
import axios from 'axios';

// Types
export interface Rack {
  id: string;
  layout_id: string;
  rack_type_id: string;
  location: {
    type: string;
    coordinates: number[][][];
  };
  orientation: number;
  height: number;
  length: number;
  depth: number;
  bays: number;
  configuration: Record<string, any>;
}

export interface Aisle {
  id: string;
  layout_id: string;
  equipment_id?: string;
  path: {
    type: string;
    coordinates: number[][];
  };
  width: number;
  properties?: Record<string, any>;
}

export interface Layout {
  id: string;
  facility_id: string;
  name: string;
  description: string;
  status: string;
  parameters: Record<string, any>;
  metrics: Record<string, any>;
  racks: Rack[];
  aisles: Aisle[];
}

// Store interface
interface LayoutState {
  // State
  currentLayout: Layout | null;
  layouts: Layout[];
  selectedRack: Rack | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLayouts: (facilityId: string) => Promise<void>;
  fetchLayoutById: (id: string) => Promise<void>;
  createLayout: (layout: Omit<Layout, 'id' | 'racks' | 'aisles'>) => Promise<Layout>;
  updateLayout: (layout: Partial<Layout>) => Promise<Layout | null>;
  deleteLayout: (id: string) => Promise<void>;
  
  // Rack actions
  selectRack: (id: string | null) => void;
  addRack: (rack: Omit<Rack, 'id'>) => Promise<Rack>;
  updateRack: (id: string, updates: Partial<Rack>) => Promise<Rack | null>;
  deleteRack: (id: string) => Promise<void>;
  
  // Aisle actions
  addAisle: (aisle: Omit<Aisle, 'id'>) => Promise<Aisle>;
  updateAisle: (id: string, updates: Partial<Aisle>) => Promise<Aisle | null>;
  deleteAisle: (id: string) => Promise<void>;
  
  // Optimization actions
  runOptimization: (layoutId: string, optimizationType: string, params: Record<string, any>) => Promise<any>;
  evaluateLayout: (layoutId: string) => Promise<Record<string, any>>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useLayoutStore = create<LayoutState>((set, get) => ({
  // Initial state
  currentLayout: null,
  layouts: [],
  selectedRack: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchLayouts: async (facilityId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/facilities/${facilityId}/layouts`);
      // set({ layouts: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          layouts: [
            {
              id: 'layout-1',
              facility_id: facilityId,
              name: 'Default Layout',
              description: 'Initial layout for facility',
              status: 'draft',
              parameters: {},
              metrics: {
                storage_density: 0.75,
                space_utilization: 0.68,
                pallet_positions: 1200
              },
              racks: [],
              aisles: []
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching layouts:', error);
      set({
        error: 'Failed to fetch layouts',
        isLoading: false
      });
    }
  },
  
  fetchLayoutById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/layouts/${id}`);
      // set({ currentLayout: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const layout = get().layouts.find(l => l.id === id);
        if (layout) {
          set({
            currentLayout: layout,
            isLoading: false
          });
        } else {
          set({
            error: `Layout not found with id: ${id}`,
            isLoading: false
          });
        }
      }, 300);
    } catch (error) {
      console.error(`Error fetching layout ${id}:`, error);
      set({
        error: `Failed to fetch layout ${id}`,
        isLoading: false
      });
    }
  },
  
  createLayout: async (layoutData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/layouts`, layoutData);
      // const newLayout = response.data;
      
      // Simulate API call
      const newLayout: Layout = {
        ...layoutData,
        id: `layout-${Date.now()}`,
        racks: [],
        aisles: []
      };
      
      set(state => ({
        layouts: [...state.layouts, newLayout],
        currentLayout: newLayout,
        isLoading: false
      }));
      
      return newLayout;
    } catch (error) {
      console.error('Error creating layout:', error);
      set({
        error: 'Failed to create layout',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateLayout: async (layoutUpdates) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/layouts/${currentLayout.id}`, {
      //   ...currentLayout,
      //   ...layoutUpdates
      // });
      // const updatedLayout = response.data;
      
      // Simulate API call
      const updatedLayout: Layout = {
        ...currentLayout,
        ...layoutUpdates
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        isLoading: false
      }));
      
      return updatedLayout;
    } catch (error) {
      console.error(`Error updating layout ${currentLayout.id}:`, error);
      set({
        error: `Failed to update layout ${currentLayout.id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteLayout: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/layouts/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        layouts: state.layouts.filter(l => l.id !== id),
        currentLayout: state.currentLayout?.id === id ? null : state.currentLayout,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting layout ${id}:`, error);
      set({
        error: `Failed to delete layout ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  selectRack: (id: string | null) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    
    if (id === null) {
      set({ selectedRack: null });
      return;
    }
    
    const rack = currentLayout.racks.find(r => r.id === id);
    set({ selectedRack: rack || null });
  },
  
  addRack: async (rackData) => {
    const { currentLayout } = get();
    if (!currentLayout) throw new Error('No layout selected');
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/layouts/${currentLayout.id}/racks`, rackData);
      // const newRack = response.data;
      
      // Simulate API call
      const newRack: Rack = {
        ...rackData,
        id: `rack-${Date.now()}`
      };
      
      const updatedLayout = {
        ...currentLayout,
        racks: [...currentLayout.racks, newRack]
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        selectedRack: newRack,
        isLoading: false
      }));
      
      return newRack;
    } catch (error) {
      console.error('Error adding rack:', error);
      set({
        error: 'Failed to add rack',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateRack: async (id: string, updates: Partial<Rack>) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;
    
    const rackIndex = currentLayout.racks.findIndex(r => r.id === id);
    if (rackIndex === -1) return null;
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/layouts/${currentLayout.id}/racks/${id}`, {
      //   ...currentLayout.racks[rackIndex],
      //   ...updates
      // });
      // const updatedRack = response.data;
      
      // Simulate API call
      const updatedRack: Rack = {
        ...currentLayout.racks[rackIndex],
        ...updates
      };
      
      const updatedRacks = [...currentLayout.racks];
      updatedRacks[rackIndex] = updatedRack;
      
      const updatedLayout = {
        ...currentLayout,
        racks: updatedRacks
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        selectedRack: state.selectedRack?.id === id ? updatedRack : state.selectedRack,
        isLoading: false
      }));
      
      return updatedRack;
    } catch (error) {
      console.error(`Error updating rack ${id}:`, error);
      set({
        error: `Failed to update rack ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteRack: async (id: string) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/layouts/${currentLayout.id}/racks/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedLayout = {
        ...currentLayout,
        racks: currentLayout.racks.filter(r => r.id !== id)
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        selectedRack: state.selectedRack?.id === id ? null : state.selectedRack,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting rack ${id}:`, error);
      set({
        error: `Failed to delete rack ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  addAisle: async (aisleData) => {
    const { currentLayout } = get();
    if (!currentLayout) throw new Error('No layout selected');
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/layouts/${currentLayout.id}/aisles`, aisleData);
      // const newAisle = response.data;
      
      // Simulate API call
      const newAisle: Aisle = {
        ...aisleData,
        id: `aisle-${Date.now()}`
      };
      
      const updatedLayout = {
        ...currentLayout,
        aisles: [...currentLayout.aisles, newAisle]
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        isLoading: false
      }));
      
      return newAisle;
    } catch (error) {
      console.error('Error adding aisle:', error);
      set({
        error: 'Failed to add aisle',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateAisle: async (id: string, updates: Partial<Aisle>) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;
    
    const aisleIndex = currentLayout.aisles.findIndex(a => a.id === id);
    if (aisleIndex === -1) return null;
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/layouts/${currentLayout.id}/aisles/${id}`, {
      //   ...currentLayout.aisles[aisleIndex],
      //   ...updates
      // });
      // const updatedAisle = response.data;
      
      // Simulate API call
      const updatedAisle: Aisle = {
        ...currentLayout.aisles[aisleIndex],
        ...updates
      };
      
      const updatedAisles = [...currentLayout.aisles];
      updatedAisles[aisleIndex] = updatedAisle;
      
      const updatedLayout = {
        ...currentLayout,
        aisles: updatedAisles
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        isLoading: false
      }));
      
      return updatedAisle;
    } catch (error) {
      console.error(`Error updating aisle ${id}:`, error);
      set({
        error: `Failed to update aisle ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteAisle: async (id: string) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/layouts/${currentLayout.id}/aisles/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedLayout = {
        ...currentLayout,
        aisles: currentLayout.aisles.filter(a => a.id !== id)
      };
      
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === updatedLayout.id ? updatedLayout : l
        ),
        currentLayout: updatedLayout,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting aisle ${id}:`, error);
      set({
        error: `Failed to delete aisle ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  runOptimization: async (layoutId: string, optimizationType: string, params: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/layouts/${layoutId}/optimize`, {
      //   type: optimizationType,
      //   parameters: params
      // });
      // const result = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate optimization results
      let result: any;
      const { currentLayout } = get();
      
      if (optimizationType === 'elevation') {
        // Simulate elevation optimization
        result = {
          rack_id: params.rack_id,
          beam_elevations: [0, 6, 12, 18, 24]
        };
        
        // Update the rack with optimized elevations
        if (currentLayout) {
          const rackIndex = currentLayout.racks.findIndex(r => r.id === params.rack_id);
          if (rackIndex !== -1) {
            const updatedRack = {
              ...currentLayout.racks[rackIndex],
              configuration: {
                ...currentLayout.racks[rackIndex].configuration,
                beam_elevations: result.beam_elevations
              }
            };
            
            const updatedRacks = [...currentLayout.racks];
            updatedRacks[rackIndex] = updatedRack;
            
            const updatedLayout = {
              ...currentLayout,
              racks: updatedRacks
            };
            
            set(state => ({
              layouts: state.layouts.map(l => 
                l.id === updatedLayout.id ? updatedLayout : l
              ),
              currentLayout: updatedLayout,
              selectedRack: state.selectedRack?.id === params.rack_id ? updatedRack : state.selectedRack
            }));
          }
        }
      } else if (optimizationType === 'aisle') {
        // Simulate aisle width optimization
        result = {
          layout_id: layoutId,
          optimized_aisles: [
            {
              id: 'aisle-1',
              width: 12.5
            }
          ]
        };
        
        // Update aisles with optimized widths
        if (currentLayout) {
          const updatedAisles = currentLayout.aisles.map(aisle => {
            const optimizedAisle = result.optimized_aisles.find((a: any) => a.id === aisle.id);
            if (optimizedAisle) {
              return {
                ...aisle,
                width: optimizedAisle.width
              };
            }
            return aisle;
          });
          
          const updatedLayout = {
            ...currentLayout,
            aisles: updatedAisles
          };
          
          set(state => ({
            layouts: state.layouts.map(l => 
              l.id === updatedLayout.id ? updatedLayout : l
            ),
            currentLayout: updatedLayout
          }));
        }
      } else if (optimizationType === 'slotting') {
        // Simulate SKU slotting optimization
        result = {
          layout_id: layoutId,
          assignments: [
            {
              product_id: 'product-1',
              location_id: 'location-1',
              quantity: 1
            }
          ]
        };
      } else {
        // General layout optimization
        result = {
          layout_id: layoutId,
          metrics: {
            storage_density: 0.85,
            space_utilization: 0.78,
            pallet_positions: 1500,
            travel_distance: 45.6
          }
        };
        
        // Update layout metrics
        if (currentLayout) {
          const updatedLayout = {
            ...currentLayout,
            metrics: result.metrics
          };
          
          set(state => ({
            layouts: state.layouts.map(l => 
              l.id === updatedLayout.id ? updatedLayout : l
            ),
            currentLayout: updatedLayout
          }));
        }
      }
      
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error(`Error running ${optimizationType} optimization:`, error);
      set({
        error: `Failed to run ${optimizationType} optimization`,
        isLoading: false
      });
      throw error;
    }
  },
  
  evaluateLayout: async (layoutId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/layouts/${layoutId}/evaluate`);
      // const result = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate evaluation results
      const result = {
        storage_density: 0.82,
        space_utilization: 0.75,
        pallet_positions: 1350,
        travel_distance: 48.2,
        accessibility_score: 0.88,
        throughput_capacity: 120
      };
      
      // Update layout metrics
      const { currentLayout } = get();
      if (currentLayout && currentLayout.id === layoutId) {
        const updatedLayout = {
          ...currentLayout,
          metrics: result
        };
        
        set(state => ({
          layouts: state.layouts.map(l => 
            l.id === updatedLayout.id ? updatedLayout : l
          ),
          currentLayout: updatedLayout,
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      return result;
    } catch (error) {
      console.error(`Error evaluating layout ${layoutId}:`, error);
      set({
        error: `Failed to evaluate layout ${layoutId}`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useLayoutStore;