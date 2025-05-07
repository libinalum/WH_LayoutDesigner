import { create } from 'zustand';
import axios from 'axios';

// Types
export interface EquipmentType {
  id: string;
  name: string;
  description: string;
}

export interface Equipment {
  id: string;
  type_id: string;
  name: string;
  
  // Operational parameters
  reach_height: number;
  min_aisle_width: number;
  max_aisle_width: number;
  turning_radius: number;
  lift_capacity: number;
  
  // Additional specifications
  specifications?: Record<string, any>;
}

// Store interface
interface EquipmentState {
  // State
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  selectedEquipment: Equipment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEquipment: () => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<void>;
  fetchEquipmentTypes: () => Promise<void>;
  createEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<Equipment>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<Equipment | null>;
  deleteEquipment: (id: string) => Promise<void>;
  createEquipmentType: (type: Omit<EquipmentType, 'id'>) => Promise<EquipmentType>;
  updateEquipmentType: (id: string, updates: Partial<EquipmentType>) => Promise<EquipmentType | null>;
  deleteEquipmentType: (id: string) => Promise<void>;
  selectEquipment: (id: string | null) => void;
  
  // Compatibility actions
  checkRackCompatibility: (equipmentId: string, rackId: string) => Promise<{
    compatible: boolean;
    issues: string[];
  }>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useEquipmentStore = create<EquipmentState>((set, get) => ({
  // Initial state
  equipment: [],
  equipmentTypes: [],
  selectedEquipment: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchEquipment: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/equipment`);
      // set({ equipment: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          equipment: [
            {
              id: 'equipment-1',
              type_id: 'type-1',
              name: 'Reach Truck Model RT-5000',
              reach_height: 30,
              min_aisle_width: 8.5,
              max_aisle_width: 12,
              turning_radius: 6.2,
              lift_capacity: 4500,
              specifications: {
                power_source: 'Electric',
                battery_life: '8 hours',
                max_speed: 7.5
              }
            },
            {
              id: 'equipment-2',
              type_id: 'type-2',
              name: 'Counterbalance Forklift FL-3000',
              reach_height: 22,
              min_aisle_width: 12,
              max_aisle_width: 15,
              turning_radius: 8.5,
              lift_capacity: 6000,
              specifications: {
                power_source: 'Propane',
                fuel_capacity: '33 lbs',
                max_speed: 10.5
              }
            },
            {
              id: 'equipment-3',
              type_id: 'type-3',
              name: 'Turret Truck TT-8000',
              reach_height: 40,
              min_aisle_width: 6,
              max_aisle_width: 8,
              turning_radius: 5.5,
              lift_capacity: 3000,
              specifications: {
                power_source: 'Electric',
                battery_life: '10 hours',
                max_speed: 6.0
              }
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      set({
        error: 'Failed to fetch equipment',
        isLoading: false
      });
    }
  },
  
  fetchEquipmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/equipment/${id}`);
      // set({ selectedEquipment: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const equipment = get().equipment.find(e => e.id === id);
        if (equipment) {
          set({
            selectedEquipment: equipment,
            isLoading: false
          });
        } else {
          set({
            error: `Equipment not found with id: ${id}`,
            isLoading: false
          });
        }
      }, 300);
    } catch (error) {
      console.error(`Error fetching equipment ${id}:`, error);
      set({
        error: `Failed to fetch equipment ${id}`,
        isLoading: false
      });
    }
  },
  
  fetchEquipmentTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/equipment/types`);
      // set({ equipmentTypes: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          equipmentTypes: [
            {
              id: 'type-1',
              name: 'Reach Truck',
              description: 'Used for narrow aisle operations with high reach capabilities'
            },
            {
              id: 'type-2',
              name: 'Counterbalance Forklift',
              description: 'General purpose forklift for loading/unloading and transport'
            },
            {
              id: 'type-3',
              name: 'Turret Truck',
              description: 'Very narrow aisle (VNA) truck with high reach and 90° rotation'
            },
            {
              id: 'type-4',
              name: 'Pallet Jack',
              description: 'Low-level pallet handling equipment'
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      set({
        error: 'Failed to fetch equipment types',
        isLoading: false
      });
    }
  },
  
  createEquipment: async (equipmentData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/equipment`, equipmentData);
      // const newEquipment = response.data;
      
      // Simulate API call
      const newEquipment: Equipment = {
        ...equipmentData,
        id: `equipment-${Date.now()}`
      };
      
      set(state => ({
        equipment: [...state.equipment, newEquipment],
        selectedEquipment: newEquipment,
        isLoading: false
      }));
      
      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      set({
        error: 'Failed to create equipment',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateEquipment: async (id: string, updates: Partial<Equipment>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/equipment/${id}`, updates);
      // const updatedEquipment = response.data;
      
      // Simulate API call
      const equipmentIndex = get().equipment.findIndex(e => e.id === id);
      if (equipmentIndex === -1) {
        set({
          error: `Equipment not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      const updatedEquipment: Equipment = {
        ...get().equipment[equipmentIndex],
        ...updates
      };
      
      set(state => ({
        equipment: state.equipment.map(e => e.id === id ? updatedEquipment : e),
        selectedEquipment: state.selectedEquipment?.id === id ? updatedEquipment : state.selectedEquipment,
        isLoading: false
      }));
      
      return updatedEquipment;
    } catch (error) {
      console.error(`Error updating equipment ${id}:`, error);
      set({
        error: `Failed to update equipment ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteEquipment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/equipment/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        equipment: state.equipment.filter(e => e.id !== id),
        selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting equipment ${id}:`, error);
      set({
        error: `Failed to delete equipment ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  createEquipmentType: async (typeData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/equipment/types`, typeData);
      // const newType = response.data;
      
      // Simulate API call
      const newType: EquipmentType = {
        ...typeData,
        id: `type-${Date.now()}`
      };
      
      set(state => ({
        equipmentTypes: [...state.equipmentTypes, newType],
        isLoading: false
      }));
      
      return newType;
    } catch (error) {
      console.error('Error creating equipment type:', error);
      set({
        error: 'Failed to create equipment type',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateEquipmentType: async (id: string, updates: Partial<EquipmentType>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/equipment/types/${id}`, updates);
      // const updatedType = response.data;
      
      // Simulate API call
      const typeIndex = get().equipmentTypes.findIndex(t => t.id === id);
      if (typeIndex === -1) {
        set({
          error: `Equipment type not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      const updatedType: EquipmentType = {
        ...get().equipmentTypes[typeIndex],
        ...updates
      };
      
      set(state => ({
        equipmentTypes: state.equipmentTypes.map(t => t.id === id ? updatedType : t),
        isLoading: false
      }));
      
      return updatedType;
    } catch (error) {
      console.error(`Error updating equipment type ${id}:`, error);
      set({
        error: `Failed to update equipment type ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteEquipmentType: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/equipment/types/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        equipmentTypes: state.equipmentTypes.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting equipment type ${id}:`, error);
      set({
        error: `Failed to delete equipment type ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  selectEquipment: (id: string | null) => {
    if (id === null) {
      set({ selectedEquipment: null });
      return;
    }
    
    const equipment = get().equipment.find(e => e.id === id);
    set({ selectedEquipment: equipment || null });
  },
  
  checkRackCompatibility: async (equipmentId: string, rackId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/equipment/${equipmentId}/compatibility/${rackId}`);
      // const result = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate compatibility check
      const equipment = get().equipment.find(e => e.id === equipmentId);
      
      if (!equipment) {
        throw new Error(`Equipment not found with id: ${equipmentId}`);
      }
      
      // In a real implementation, this would check against actual rack data
      // For now, we'll use a simplified approach
      const compatible = Math.random() > 0.3; // 70% chance of compatibility
      
      const issues = [];
      if (!compatible) {
        // Generate random issues
        const possibleIssues = [
          `Aisle width too narrow for equipment (minimum ${equipment.min_aisle_width}ft required)`,
          `Rack height exceeds equipment reach capability (${equipment.reach_height}ft maximum)`,
          `Turning radius of ${equipment.turning_radius}ft exceeds available space`,
          `Weight capacity of ${equipment.lift_capacity}lbs insufficient for rack load`
        ];
        
        // Select 1-2 random issues
        const numIssues = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numIssues; i++) {
          const issueIndex = Math.floor(Math.random() * possibleIssues.length);
          issues.push(possibleIssues[issueIndex]);
          possibleIssues.splice(issueIndex, 1);
        }
      }
      
      set({ isLoading: false });
      
      return {
        compatible,
        issues
      };
    } catch (error) {
      console.error(`Error checking compatibility between equipment ${equipmentId} and rack ${rackId}:`, error);
      set({
        error: `Failed to check compatibility`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useEquipmentStore;