/**
 * Optimization service for the RackOptix API.
 * 
 * This service handles communication with the Python optimization engine.
 */

import axios from 'axios';
import { logger } from '../utils/logger';

// Configuration
const OPTIMIZATION_ENGINE_URL = process.env.OPTIMIZATION_ENGINE_URL || 'http://localhost:8000';

/**
 * Interface for optimization parameters
 */
export interface OptimizationParameters {
  layout_id: string;
  facility_id?: string;
  parameters?: Record<string, any>;
}

/**
 * Interface for optimization results
 */
export interface OptimizationResults {
  layout_id: string;
  metrics: Record<string, any>;
  [key: string]: any;
}

/**
 * Generate a layout using the optimization engine.
 * 
 * @param params Optimization parameters
 * @returns Optimization results
 */
export const generateLayout = async (params: OptimizationParameters): Promise<OptimizationResults> => {
  try {
    logger.info(`Generating layout for facility: ${params.facility_id}`);
    
    // Call the optimization engine API
    const response = await axios.post(`${OPTIMIZATION_ENGINE_URL}/layouts`, {
      facility_id: params.facility_id,
      parameters: params.parameters
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error generating layout:', error);
    throw error;
  }
};

/**
 * Optimize a layout using the optimization engine.
 * 
 * @param params Optimization parameters
 * @returns Optimization results
 */
export const optimizeLayout = async (params: OptimizationParameters): Promise<OptimizationResults> => {
  try {
    logger.info(`Optimizing layout: ${params.layout_id}`);
    
    // Call the optimization engine API
    const response = await axios.post(`${OPTIMIZATION_ENGINE_URL}/optimize`, {
      layout_id: params.layout_id,
      parameters: params.parameters
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error optimizing layout:', error);
    throw error;
  }
};

/**
 * Optimize rack elevations for a layout.
 * 
 * @param layoutId Layout ID
 * @param rackId Rack ID
 * @param params Optimization parameters
 * @returns Optimization results
 */
export const optimizeElevations = async (
  layoutId: string,
  rackId: string,
  params: Record<string, any> = {}
): Promise<any> => {
  try {
    logger.info(`Optimizing elevations for rack ${rackId} in layout ${layoutId}`);
    
    // Call the optimization engine API
    const response = await axios.post(`${OPTIMIZATION_ENGINE_URL}/optimize/elevations`, {
      layout_id: layoutId,
      rack_id: rackId,
      parameters: params
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error optimizing elevations:', error);
    throw error;
  }
};

/**
 * Optimize aisle widths for a layout.
 * 
 * @param layoutId Layout ID
 * @param params Optimization parameters
 * @returns Optimization results
 */
export const optimizeAisles = async (
  layoutId: string,
  params: Record<string, any> = {}
): Promise<any> => {
  try {
    logger.info(`Optimizing aisles for layout ${layoutId}`);
    
    // Call the optimization engine API
    const response = await axios.post(`${OPTIMIZATION_ENGINE_URL}/optimize/aisles`, {
      layout_id: layoutId,
      parameters: params
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error optimizing aisles:', error);
    throw error;
  }
};

/**
 * Optimize SKU slotting for a layout.
 * 
 * @param layoutId Layout ID
 * @param params Optimization parameters
 * @returns Optimization results
 */
export const optimizeSlotting = async (
  layoutId: string,
  params: Record<string, any> = {}
): Promise<any> => {
  try {
    logger.info(`Optimizing SKU slotting for layout ${layoutId}`);
    
    // Call the optimization engine API
    const response = await axios.post(`${OPTIMIZATION_ENGINE_URL}/optimize/slotting`, {
      layout_id: layoutId,
      parameters: params
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error optimizing SKU slotting:', error);
    throw error;
  }
};

/**
 * Evaluate a layout and calculate metrics.
 * 
 * @param layoutId Layout ID
 * @param metrics List of metrics to calculate
 * @returns Evaluation results
 */
export const evaluateLayout = async (
  layoutId: string,
  metrics: string[] = []
): Promise<Record<string, any>> => {
  try {
    logger.info(`Evaluating layout ${layoutId}`);
    
    // Call the optimization engine API
    const response = await axios.get(`${OPTIMIZATION_ENGINE_URL}/layouts/${layoutId}/evaluate`, {
      params: { metrics: metrics.join(',') }
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error evaluating layout:', error);
    throw error;
  }
};