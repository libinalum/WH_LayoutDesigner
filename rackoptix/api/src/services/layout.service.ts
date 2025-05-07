/**
 * Layout service for the RackOptix API.
 * 
 * This service handles CRUD operations for layouts, racks, and aisles.
 */

import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { optimizeLayout } from './optimization.service';

// In-memory storage for layouts (would be replaced with database in production)
const layouts: any[] = [];

/**
 * Get all layouts for a facility
 * 
 * @param facilityId Facility ID
 * @returns Array of layouts
 */
export const getAllLayouts = async (facilityId: string): Promise<any[]> => {
  logger.info(`Getting all layouts for facility: ${facilityId}`);
  return layouts.filter(layout => layout.facility_id === facilityId);
};

/**
 * Get layout by ID
 * 
 * @param id Layout ID
 * @returns Layout object
 */
export const getLayoutById = async (id: string): Promise<any> => {
  logger.info(`Getting layout: ${id}`);
  
  const layout = layouts.find(layout => layout.id === id);
  
  if (!layout) {
    throw new ApiError(404, `Layout not found with id: ${id}`);
  }
  
  return layout;
};

/**
 * Create a new layout
 * 
 * @param layoutData Layout data
 * @returns Created layout
 */
export const createLayout = async (layoutData: any): Promise<any> => {
  logger.info(`Creating new layout for facility: ${layoutData.facility_id}`);
  
  const newLayout = {
    id: uuidv4(),
    ...layoutData,
    status: layoutData.status || 'draft',
    parameters: layoutData.parameters || {},
    metrics: layoutData.metrics || {},
    racks: [],
    aisles: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  layouts.push(newLayout);
  
  return newLayout;
};

/**
 * Update a layout
 * 
 * @param id Layout ID
 * @param layoutData Layout data
 * @returns Updated layout
 */
export const updateLayout = async (id: string, layoutData: any): Promise<any> => {
  logger.info(`Updating layout: ${id}`);
  
  const layoutIndex = layouts.findIndex(layout => layout.id === id);
  
  if (layoutIndex === -1) {
    throw new ApiError(404, `Layout not found with id: ${id}`);
  }
  
  // Preserve racks and aisles
  const racks = layouts[layoutIndex].racks;
  const aisles = layouts[layoutIndex].aisles;
  
  // Update layout
  layouts[layoutIndex] = {
    ...layouts[layoutIndex],
    ...layoutData,
    racks,
    aisles,
    updated_at: new Date().toISOString()
  };
  
  return layouts[layoutIndex];
};

/**
 * Delete a layout
 * 
 * @param id Layout ID
 */
export const deleteLayout = async (id: string): Promise<void> => {
  logger.info(`Deleting layout: ${id}`);
  
  const layoutIndex = layouts.findIndex(layout => layout.id === id);
  
  if (layoutIndex === -1) {
    throw new ApiError(404, `Layout not found with id: ${id}`);
  }
  
  layouts.splice(layoutIndex, 1);
};

/**
 * Get all racks for a layout
 * 
 * @param layoutId Layout ID
 * @returns Array of racks
 */
export const getLayoutRacks = async (layoutId: string): Promise<any[]> => {
  logger.info(`Getting all racks for layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  return layout.racks;
};

/**
 * Create a new rack for a layout
 * 
 * @param layoutId Layout ID
 * @param rackData Rack data
 * @returns Created rack
 */
export const createLayoutRack = async (layoutId: string, rackData: any): Promise<any> => {
  logger.info(`Creating new rack for layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const newRack = {
    id: uuidv4(),
    layout_id: layoutId,
    ...rackData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  layout.racks.push(newRack);
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
  
  return newRack;
};

/**
 * Update a rack
 * 
 * @param layoutId Layout ID
 * @param rackId Rack ID
 * @param rackData Rack data
 * @returns Updated rack
 */
export const updateLayoutRack = async (layoutId: string, rackId: string, rackData: any): Promise<any> => {
  logger.info(`Updating rack ${rackId} in layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const rackIndex = layout.racks.findIndex((rack: any) => rack.id === rackId);
  
  if (rackIndex === -1) {
    throw new ApiError(404, `Rack not found with id: ${rackId}`);
  }
  
  // Update rack
  layout.racks[rackIndex] = {
    ...layout.racks[rackIndex],
    ...rackData,
    updated_at: new Date().toISOString()
  };
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
  
  return layout.racks[rackIndex];
};

/**
 * Delete a rack
 * 
 * @param layoutId Layout ID
 * @param rackId Rack ID
 */
export const deleteLayoutRack = async (layoutId: string, rackId: string): Promise<void> => {
  logger.info(`Deleting rack ${rackId} from layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const rackIndex = layout.racks.findIndex((rack: any) => rack.id === rackId);
  
  if (rackIndex === -1) {
    throw new ApiError(404, `Rack not found with id: ${rackId}`);
  }
  
  layout.racks.splice(rackIndex, 1);
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
};

/**
 * Get all aisles for a layout
 * 
 * @param layoutId Layout ID
 * @returns Array of aisles
 */
export const getLayoutAisles = async (layoutId: string): Promise<any[]> => {
  logger.info(`Getting all aisles for layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  return layout.aisles;
};

/**
 * Create a new aisle for a layout
 * 
 * @param layoutId Layout ID
 * @param aisleData Aisle data
 * @returns Created aisle
 */
export const createLayoutAisle = async (layoutId: string, aisleData: any): Promise<any> => {
  logger.info(`Creating new aisle for layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const newAisle = {
    id: uuidv4(),
    layout_id: layoutId,
    ...aisleData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  layout.aisles.push(newAisle);
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
  
  return newAisle;
};

/**
 * Update an aisle
 * 
 * @param layoutId Layout ID
 * @param aisleId Aisle ID
 * @param aisleData Aisle data
 * @returns Updated aisle
 */
export const updateLayoutAisle = async (layoutId: string, aisleId: string, aisleData: any): Promise<any> => {
  logger.info(`Updating aisle ${aisleId} in layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const aisleIndex = layout.aisles.findIndex((aisle: any) => aisle.id === aisleId);
  
  if (aisleIndex === -1) {
    throw new ApiError(404, `Aisle not found with id: ${aisleId}`);
  }
  
  // Update aisle
  layout.aisles[aisleIndex] = {
    ...layout.aisles[aisleIndex],
    ...aisleData,
    updated_at: new Date().toISOString()
  };
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
  
  return layout.aisles[aisleIndex];
};

/**
 * Delete an aisle
 * 
 * @param layoutId Layout ID
 * @param aisleId Aisle ID
 */
export const deleteLayoutAisle = async (layoutId: string, aisleId: string): Promise<void> => {
  logger.info(`Deleting aisle ${aisleId} from layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  const aisleIndex = layout.aisles.findIndex((aisle: any) => aisle.id === aisleId);
  
  if (aisleIndex === -1) {
    throw new ApiError(404, `Aisle not found with id: ${aisleId}`);
  }
  
  layout.aisles.splice(aisleIndex, 1);
  
  // Update layout metrics
  await updateLayoutMetrics(layoutId);
};

/**
 * Evaluate a layout and calculate metrics
 * 
 * @param layoutId Layout ID
 * @param metrics List of metrics to calculate
 * @returns Evaluation results
 */
export const evaluateLayout = async (layoutId: string, metrics: string[] = []): Promise<any> => {
  logger.info(`Evaluating layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  // Calculate metrics
  const evaluation = calculateLayoutMetrics(layout);
  
  // Filter metrics if specified
  if (metrics.length > 0) {
    const filteredEvaluation: any = {};
    
    metrics.forEach(metric => {
      if (evaluation[metric] !== undefined) {
        filteredEvaluation[metric] = evaluation[metric];
      }
    });
    
    return filteredEvaluation;
  }
  
  return evaluation;
};

/**
 * Update layout metrics
 * 
 * @param layoutId Layout ID
 */
const updateLayoutMetrics = async (layoutId: string): Promise<void> => {
  logger.info(`Updating metrics for layout: ${layoutId}`);
  
  const layout = await getLayoutById(layoutId);
  
  // Calculate metrics
  const metrics = calculateLayoutMetrics(layout);
  
  // Update layout metrics
  layout.metrics = metrics;
};

/**
 * Calculate layout metrics
 * 
 * @param layout Layout object
 * @returns Metrics object
 */
const calculateLayoutMetrics = (layout: any): any => {
  // Calculate pallet positions
  let palletPositions = 0;
  
  layout.racks.forEach((rack: any) => {
    // Calculate based on rack type, bays, and levels
    const beamLevels = rack.configuration?.beam_levels || 3;
    const bays = rack.bays || 1;
    
    // Different rack types have different capacity calculations
    switch (rack.rack_type_id) {
      case 'selective':
        // 1 pallet per bay per level
        palletPositions += bays * beamLevels;
        break;
        
      case 'drive-in':
        // Multiple pallets deep (assume 4 deep)
        palletPositions += bays * beamLevels * 4;
        break;
        
      case 'push-back':
        // Typically 2-5 pallets deep (assume 3)
        palletPositions += bays * beamLevels * 3;
        break;
        
      case 'pallet-flow':
        // Multiple pallets deep (assume 6 deep)
        palletPositions += bays * beamLevels * 6;
        break;
        
      case 'mobile':
        // Higher density due to eliminated aisles (assume 1.5x selective)
        palletPositions += bays * beamLevels * 1.5;
        break;
        
      default:
        // Default to selective rack calculation
        palletPositions += bays * beamLevels;
    }
  });
  
  // Calculate storage density (simplified)
  // In a real implementation, this would consider the actual facility area
  const storageDensity = Math.min(0.95, 0.5 + (layout.racks.length * 0.05));
  
  // Calculate space utilization (simplified)
  // In a real implementation, this would consider the actual rack footprints
  const spaceUtilization = Math.min(0.9, 0.4 + (layout.racks.length * 0.04));
  
  // Calculate average travel distance (simplified)
  // In a real implementation, this would consider actual travel paths
  const travelDistance = Math.max(20, 100 - (layout.aisles.length * 5));
  
  // Calculate accessibility score (simplified)
  // In a real implementation, this would consider aisle widths and rack types
  const accessibilityScore = Math.min(0.95, 0.6 + (layout.aisles.length * 0.03));
  
  // Calculate throughput capacity (simplified)
  // In a real implementation, this would consider equipment and travel distances
  const throughputCapacity = Math.min(200, 50 + (palletPositions / 10));
  
  return {
    pallet_positions: palletPositions,
    storage_density: storageDensity,
    space_utilization: spaceUtilization,
    travel_distance: travelDistance,
    accessibility_score: accessibilityScore,
    throughput_capacity: throughputCapacity
  };
};