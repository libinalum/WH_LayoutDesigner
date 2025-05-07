/**
 * Equipment service for the RackOptix API.
 * 
 * This service handles business logic for equipment management.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

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

// Mock data for development
let equipment: Equipment[] = [
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
];

let equipmentTypes: EquipmentType[] = [
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
];

// Backend URL for Python services
const BACKEND_URL = 'http://localhost:5000';

/**
 * Get all equipment.
 * 
 * @returns Array of equipment
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  // In a real implementation, this would fetch from a database
  // For now, return mock data
  return equipment;
}

/**
 * Get equipment by ID.
 * 
 * @param id Equipment ID
 * @returns Equipment or null if not found
 */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  // In a real implementation, this would fetch from a database
  // For now, search mock data
  const item = equipment.find(e => e.id === id);
  return item || null;
}

/**
 * Create new equipment.
 * 
 * @param equipmentData Equipment data
 * @returns Newly created equipment
 */
export async function createEquipment(equipmentData: Omit<Equipment, 'id'>): Promise<Equipment> {
  // In a real implementation, this would save to a database
  // For now, add to mock data
  const newEquipment: Equipment = {
    ...equipmentData,
    id: `equipment-${uuidv4()}`
  };
  
  equipment.push(newEquipment);
  return newEquipment;
}

/**
 * Update existing equipment.
 * 
 * @param id Equipment ID
 * @param updates Equipment updates
 * @returns Updated equipment or null if not found
 */
export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment | null> {
  // In a real implementation, this would update in a database
  // For now, update mock data
  const index = equipment.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  const updatedEquipment = {
    ...equipment[index],
    ...updates
  };
  
  equipment[index] = updatedEquipment;
  return updatedEquipment;
}

/**
 * Delete equipment.
 * 
 * @param id Equipment ID
 * @returns True if deleted, false if not found
 */
export async function deleteEquipment(id: string): Promise<boolean> {
  // In a real implementation, this would delete from a database
  // For now, remove from mock data
  const initialLength = equipment.length;
  equipment = equipment.filter(e => e.id !== id);
  return equipment.length < initialLength;
}

/**
 * Get all equipment types.
 * 
 * @returns Array of equipment types
 */
export async function getAllEquipmentTypes(): Promise<EquipmentType[]> {
  // In a real implementation, this would fetch from a database
  // For now, return mock data
  return equipmentTypes;
}

/**
 * Get equipment type by ID.
 * 
 * @param id Equipment type ID
 * @returns Equipment type or null if not found
 */
export async function getEquipmentTypeById(id: string): Promise<EquipmentType | null> {
  // In a real implementation, this would fetch from a database
  // For now, search mock data
  const type = equipmentTypes.find(t => t.id === id);
  return type || null;
}

/**
 * Create new equipment type.
 * 
 * @param typeData Equipment type data
 * @returns Newly created equipment type
 */
export async function createEquipmentType(typeData: Omit<EquipmentType, 'id'>): Promise<EquipmentType> {
  // In a real implementation, this would save to a database
  // For now, add to mock data
  const newType: EquipmentType = {
    ...typeData,
    id: `type-${uuidv4()}`
  };
  
  equipmentTypes.push(newType);
  return newType;
}

/**
 * Update existing equipment type.
 * 
 * @param id Equipment type ID
 * @param updates Equipment type updates
 * @returns Updated equipment type or null if not found
 */
export async function updateEquipmentType(id: string, updates: Partial<EquipmentType>): Promise<EquipmentType | null> {
  // In a real implementation, this would update in a database
  // For now, update mock data
  const index = equipmentTypes.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  const updatedType = {
    ...equipmentTypes[index],
    ...updates
  };
  
  equipmentTypes[index] = updatedType;
  return updatedType;
}

/**
 * Delete equipment type.
 * 
 * @param id Equipment type ID
 * @returns True if deleted, false if not found
 */
export async function deleteEquipmentType(id: string): Promise<boolean> {
  // In a real implementation, this would delete from a database
  // For now, remove from mock data
  const initialLength = equipmentTypes.length;
  equipmentTypes = equipmentTypes.filter(t => t.id !== id);
  return equipmentTypes.length < initialLength;
}

/**
 * Check equipment-rack compatibility.
 * 
 * @param equipmentId Equipment ID
 * @param rackId Rack ID
 * @returns Compatibility result
 */
export async function checkRackCompatibility(
  equipmentId: string,
  rackId: string
): Promise<{ compatible: boolean; issues: string[] }> {
  try {
    // In a real implementation, this would call the Python backend
    // const response = await axios.get(`${BACKEND_URL}/equipment/${equipmentId}/compatibility/${rackId}`);
    // return response.data;
    
    // For now, simulate compatibility check
    const item = equipment.find(e => e.id === equipmentId);
    
    if (!item) {
      throw new Error(`Equipment not found with id: ${equipmentId}`);
    }
    
    // In a real implementation, this would check against actual rack data
    // For now, we'll use a simplified approach
    const compatible = Math.random() > 0.3; // 70% chance of compatibility
    
    const issues = [];
    if (!compatible) {
      // Generate random issues
      const possibleIssues = [
        `Aisle width too narrow for equipment (minimum ${item.min_aisle_width}ft required)`,
        `Rack height exceeds equipment reach capability (${item.reach_height}ft maximum)`,
        `Turning radius of ${item.turning_radius}ft exceeds available space`,
        `Weight capacity of ${item.lift_capacity}lbs insufficient for rack load`
      ];
      
      // Select 1-2 random issues
      const numIssues = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numIssues; i++) {
        const issueIndex = Math.floor(Math.random() * possibleIssues.length);
        issues.push(possibleIssues[issueIndex]);
        possibleIssues.splice(issueIndex, 1);
      }
    }
    
    return {
      compatible,
      issues
    };
  } catch (error) {
    logger.error(`Error checking compatibility between equipment ${equipmentId} and rack ${rackId}:`, error);
    throw new Error('Failed to check compatibility');
  }
}