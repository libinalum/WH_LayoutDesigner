/**
 * Facility routes for the RackOptix API.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import {
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilityObstructions,
  createFacilityObstruction,
  updateFacilityObstruction,
  deleteFacilityObstruction,
  getFacilityZones,
  createFacilityZone,
  updateFacilityZone,
  deleteFacilityZone,
  getFacilitiesInBounds,
  calculateFacilityArea
} from '../services/facility.service';

// Create router
const facilityRoutes = Router();

/**
 * @route   GET /api/facilities
 * @desc    Get all facilities
 * @access  Public
 */
facilityRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facilities = await getAllFacilities();
    res.json(facilities);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/facilities/bounds
 * @desc    Get facilities within bounds
 * @access  Public
 */
facilityRoutes.get('/bounds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { minLat, minLng, maxLat, maxLng } = req.query;
    
    if (!minLat || !minLng || !maxLat || !maxLng) {
      throw new ApiError(400, 'Missing required query parameters: minLat, minLng, maxLat, maxLng');
    }
    
    const bounds = {
      minLat: parseFloat(minLat as string),
      minLng: parseFloat(minLng as string),
      maxLat: parseFloat(maxLat as string),
      maxLng: parseFloat(maxLng as string)
    };
    
    const facilities = await getFacilitiesInBounds(bounds);
    res.json(facilities);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/facilities/:id
 * @desc    Get facility by ID
 * @access  Public
 */
facilityRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const facility = await getFacilityById(id);
    res.json(facility);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/facilities/:id/area
 * @desc    Calculate facility area
 * @access  Public
 */
facilityRoutes.get('/:id/area', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const area = await calculateFacilityArea(id);
    res.json({ area });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/facilities/:id/obstructions
 * @desc    Get facility obstructions
 * @access  Public
 */
facilityRoutes.get('/:id/obstructions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const obstructions = await getFacilityObstructions(id);
    res.json(obstructions);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/facilities/:id/obstructions
 * @desc    Create facility obstruction
 * @access  Public
 */
facilityRoutes.post('/:id/obstructions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const obstructionData = req.body;
    
    // Validate required fields
    if (!obstructionData.type || !obstructionData.shape) {
      throw new ApiError(400, 'Missing required fields: type, shape');
    }
    
    const newObstruction = await createFacilityObstruction(id, obstructionData);
    res.status(201).json(newObstruction);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/facilities/:facilityId/obstructions/:obstructionId
 * @desc    Update facility obstruction
 * @access  Public
 */
facilityRoutes.put('/:facilityId/obstructions/:obstructionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facilityId, obstructionId } = req.params;
    const obstructionData = req.body;
    
    const updatedObstruction = await updateFacilityObstruction(facilityId, obstructionId, obstructionData);
    res.json(updatedObstruction);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/facilities/:facilityId/obstructions/:obstructionId
 * @desc    Delete facility obstruction
 * @access  Public
 */
facilityRoutes.delete('/:facilityId/obstructions/:obstructionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facilityId, obstructionId } = req.params;
    
    await deleteFacilityObstruction(facilityId, obstructionId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/facilities/:id/zones
 * @desc    Get facility zones
 * @access  Public
 */
facilityRoutes.get('/:id/zones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const zones = await getFacilityZones(id);
    res.json(zones);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/facilities/:id/zones
 * @desc    Create facility zone
 * @access  Public
 */
facilityRoutes.post('/:id/zones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const zoneData = req.body;
    
    // Validate required fields
    if (!zoneData.name || !zoneData.boundary) {
      throw new ApiError(400, 'Missing required fields: name, boundary');
    }
    
    const newZone = await createFacilityZone(id, zoneData);
    res.status(201).json(newZone);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/facilities/:facilityId/zones/:zoneId
 * @desc    Update facility zone
 * @access  Public
 */
facilityRoutes.put('/:facilityId/zones/:zoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facilityId, zoneId } = req.params;
    const zoneData = req.body;
    
    const updatedZone = await updateFacilityZone(facilityId, zoneId, zoneData);
    res.json(updatedZone);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/facilities/:facilityId/zones/:zoneId
 * @desc    Delete facility zone
 * @access  Public
 */
facilityRoutes.delete('/:facilityId/zones/:zoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facilityId, zoneId } = req.params;
    
    await deleteFacilityZone(facilityId, zoneId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/facilities
 * @desc    Create a new facility
 * @access  Public
 */
facilityRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facilityData = req.body;
    
    // Validate required fields
    if (!facilityData.name || !facilityData.clear_height || !facilityData.boundary) {
      throw new ApiError(400, 'Missing required fields: name, clear_height, boundary');
    }
    
    const newFacility = await createFacility(facilityData);
    
    logger.info(`Created new facility: ${newFacility.id}`);
    
    res.status(201).json(newFacility);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/facilities/:id
 * @desc    Update a facility
 * @access  Public
 */
facilityRoutes.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const facilityData = req.body;
    
    const updatedFacility = await updateFacility(id, facilityData);
    
    logger.info(`Updated facility: ${id}`);
    
    res.json(updatedFacility);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/facilities/:id
 * @desc    Delete a facility
 * @access  Public
 */
facilityRoutes.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await deleteFacility(id);
    
    logger.info(`Deleted facility: ${id}`);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { facilityRoutes };