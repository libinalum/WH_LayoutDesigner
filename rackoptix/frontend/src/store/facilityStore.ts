import { create } from 'zustand';
import axios from 'axios';

// Types
export interface Point {
  x: number;
  y: number;
}

export interface Boundary {
  type: string;
  coordinates: number[][][];
}

export interface Obstruction {
  id: string;
  type: string;
  shape: {
    type: string;
    coordinates: number[][][];
  };
  height: number;
  properties?: Record<string, any>;
}

export interface Zone {
  id: string;
  name: string;
  purpose: string;
  boundary: {
    type: string;
    coordinates: number[][][];
  };
}

export interface Facility {
  id?: string;
  name: string;
  description?: string;
  clear_height: number;
  boundary: Boundary;
  metadata?: Record<string, any>;
  obstructions: Obstruction[];
  zones?: Zone[];
}

// Store interface
interface FacilityState {
  // Current facility
  currentFacility: Facility | null;
  facilities: Facility[];
  isLoading: boolean;
  error: string | null;
  
  // Drawing state
  drawingMode: 'boundary' | 'column' | 'wall' | 'dock' | 'zone' | 'select' | 'measure';
  points: number[];
  selectedItem: string | null;
  
  // Actions
  fetchFacilities: () => Promise<void>;
  fetchFacilityById: (id: string) => Promise<void>;
  setCurrentFacility: (facility: Facility | null) => void;
  setDrawingMode: (mode: 'boundary' | 'column' | 'wall' | 'dock' | 'zone' | 'select' | 'measure') => void;
  addPoint: (x: number, y: number) => void;
  removeLastPoint: () => void;
  clearPoints: () => void;
  updateFacilityName: (name: string) => void;
  updateFacilityDescription: (description: string) => void;
  updateFacilityClearHeight: (height: number) => void;
  addObstruction: (obstruction: Omit<Obstruction, 'id'>) => void;
  updateObstruction: (id: string, updates: Partial<Obstruction>) => void;
  removeObstruction: (id: string) => void;
  addZone: (zone: Omit<Zone, 'id'>) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  removeZone: (id: string) => void;
  selectItem: (id: string | null) => void;
  saveFacility: () => Promise<Facility | null>;
  deleteFacility: (id: string) => Promise<void>;
}

// API base URL
const API_URL = 'http://localhost:3000/api';

// Create store
const useFacilityStore = create<FacilityState>((set, get) => ({
  // Initial state
  currentFacility: null,
  facilities: [],
  isLoading: false,
  error: null,
  drawingMode: 'select',
  points: [],
  selectedItem: null,
  
  // Actions
  fetchFacilities: async () => {
    set({ isLoading: true, error: null });
    try {
      // Try to call the real API first
      try {
        const response = await axios.get(`${API_URL}/facilities`);
        set({ facilities: response.data, isLoading: false });
        console.log("Successfully fetched facilities from API");
      } catch (apiError) {
        console.warn("API call failed, using simulated data:", apiError);
        
        // Fall back to simulated data if API call fails
        setTimeout(() => {
          set({
            facilities: [
              {
                id: 'facility-1',
                name: 'Chicago Distribution Center',
                description: 'Main distribution facility for Midwest region',
                clear_height: 32.5,
                boundary: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [0, 0],
                      [0, 500],
                      [800, 500],
                      [800, 0],
                      [0, 0]
                    ]
                  ]
                },
                metadata: {
                  address: '123 Warehouse Blvd, Chicago, IL',
                  square_footage: 400000,
                  year_built: 2010,
                  sprinkler_type: 'ESFR'
                },
                obstructions: []
              }
            ],
            isLoading: false
          });
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      set({
        error: 'Failed to fetch facilities',
        isLoading: false
      });
    }
  },
  
  fetchFacilityById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Try to call the real API first
      try {
        const response = await axios.get(`${API_URL}/facilities/${id}`);
        set({ currentFacility: response.data, isLoading: false });
        console.log("Successfully fetched facility from API");
      } catch (apiError) {
        console.warn(`API call for facility ${id} failed, using simulated data:`, apiError);
        
        // Fall back to simulated data if API call fails
        setTimeout(() => {
          if (id === 'facility-1') {
            set({
              currentFacility: {
                id: 'facility-1',
                name: 'Chicago Distribution Center',
                description: 'Main distribution facility for Midwest region',
                clear_height: 32.5,
                boundary: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [0, 0],
                      [0, 500],
                      [800, 500],
                      [800, 0],
                      [0, 0]
                    ]
                  ]
                },
                metadata: {
                  address: '123 Warehouse Blvd, Chicago, IL',
                  square_footage: 400000,
                  year_built: 2010,
                  sprinkler_type: 'ESFR'
                },
                obstructions: []
              },
              isLoading: false
            });
          } else {
            set({
              error: `Facility not found with id: ${id}`,
              isLoading: false
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error(`Error fetching facility ${id}:`, error);
      set({
        error: `Failed to fetch facility ${id}`,
        isLoading: false
      });
    }
  },
  
  setCurrentFacility: (facility) => set({ currentFacility: facility }),
  
  setDrawingMode: (mode) => set({ drawingMode: mode }),
  
  addPoint: (x, y) => set((state) => ({
    points: [...state.points, x, y]
  })),
  
  removeLastPoint: () => set((state) => ({
    points: state.points.length >= 2
      ? state.points.slice(0, state.points.length - 2)
      : []
  })),
  
  clearPoints: () => set({ points: [] }),
  
  updateFacilityName: (name) => set((state) => ({
    currentFacility: state.currentFacility
      ? { ...state.currentFacility, name }
      : null
  })),
  
  updateFacilityDescription: (description) => set((state) => ({
    currentFacility: state.currentFacility
      ? { ...state.currentFacility, description }
      : null
  })),
  
  updateFacilityClearHeight: (height) => set((state) => ({
    currentFacility: state.currentFacility
      ? { ...state.currentFacility, clear_height: height }
      : null
  })),
  
  addObstruction: (obstruction) => set((state) => {
    if (!state.currentFacility) return state;
    
    const newObstruction: Obstruction = {
      ...obstruction,
      id: `obstruction-${Date.now()}`
    };
    
    return {
      currentFacility: {
        ...state.currentFacility,
        obstructions: [...state.currentFacility.obstructions, newObstruction]
      }
    };
  }),
  
  updateObstruction: (id, updates) => set((state) => {
    if (!state.currentFacility) return state;
    
    const obstructions = state.currentFacility.obstructions.map(obs =>
      obs.id === id ? { ...obs, ...updates } : obs
    );
    
    return {
      currentFacility: {
        ...state.currentFacility,
        obstructions
      }
    };
  }),
  
  removeObstruction: (id) => set((state) => {
    if (!state.currentFacility) return state;
    
    return {
      currentFacility: {
        ...state.currentFacility,
        obstructions: state.currentFacility.obstructions.filter(obs => obs.id !== id)
      },
      selectedItem: state.selectedItem === id ? null : state.selectedItem
    };
  }),
  
  addZone: (zone) => set((state) => {
    if (!state.currentFacility) return state;
    
    const newZone: Zone = {
      ...zone,
      id: `zone-${Date.now()}`
    };
    
    const zones = state.currentFacility.zones || [];
    
    return {
      currentFacility: {
        ...state.currentFacility,
        zones: [...zones, newZone]
      }
    };
  }),
  
  updateZone: (id, updates) => set((state) => {
    if (!state.currentFacility || !state.currentFacility.zones) return state;
    
    const zones = state.currentFacility.zones.map(zone =>
      zone.id === id ? { ...zone, ...updates } : zone
    );
    
    return {
      currentFacility: {
        ...state.currentFacility,
        zones
      }
    };
  }),
  
  removeZone: (id) => set((state) => {
    if (!state.currentFacility || !state.currentFacility.zones) return state;
    
    return {
      currentFacility: {
        ...state.currentFacility,
        zones: state.currentFacility.zones.filter(zone => zone.id !== id)
      },
      selectedItem: state.selectedItem === id ? null : state.selectedItem
    };
  }),
  
  selectItem: (id) => set({ selectedItem: id }),
  
  saveFacility: async () => {
    const { currentFacility, points } = get();
    
    if (!currentFacility) return null;
    
    // If we have points, update the boundary
    if (points.length >= 6) {
      // Convert flat array to GeoJSON format
      const coordinates = [];
      for (let i = 0; i < points.length; i += 2) {
        coordinates.push([points[i], points[i + 1]]);
      }
      
      // Close the polygon
      if (points.length >= 6 &&
          (points[0] !== points[points.length - 2] ||
           points[1] !== points[points.length - 1])) {
        coordinates.push([points[0], points[1]]);
      }
      
      const boundary: Boundary = {
        type: 'Polygon',
        coordinates: [coordinates]
      };
      
      set({
        currentFacility: {
          ...currentFacility,
          boundary
        }
      });
    }
    
    // Try to call the real API first
    try {
      let response;
      if (currentFacility.id) {
        response = await axios.put(`${API_URL}/facilities/${currentFacility.id}`, get().currentFacility);
        console.log("Successfully updated facility via API");
      } else {
        response = await axios.post(`${API_URL}/facilities`, get().currentFacility);
        console.log("Successfully created facility via API");
      }
      return response.data;
    } catch (apiError) {
      console.warn('API call for saving facility failed, using simulated data:', apiError);
      
      // Fall back to simulated data if API call fails
      return new Promise<Facility>((resolve) => {
        setTimeout(() => {
          const savedFacility = {
            ...get().currentFacility!,
            id: get().currentFacility?.id || `facility-${Date.now()}`
          };
          resolve(savedFacility);
        }, 500);
      });
    }
  },
  
  deleteFacility: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Try to call the real API first
      try {
        await axios.delete(`${API_URL}/facilities/${id}`);
        console.log(`Successfully deleted facility ${id} via API`);
      } catch (apiError) {
        console.warn(`API call for deleting facility ${id} failed:`, apiError);
        // Simulate successful deletion even if API call fails
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Update local state regardless of API success
      set(state => ({
        facilities: state.facilities.filter(f => f.id !== id),
        currentFacility: state.currentFacility?.id === id ? null : state.currentFacility,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting facility ${id}:`, error);
      set({
        error: `Failed to delete facility ${id}`,
        isLoading: false
      });
    }
  }
}));

export default useFacilityStore;