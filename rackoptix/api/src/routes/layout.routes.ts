/**
 * Layout routes for the RackOptix API.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import {
  getAllLayouts,
  getLayoutById,
  createLayout,
  updateLayout,
  deleteLayout,
  getLayoutRacks,
  createLayoutRack,
  updateLayoutRack,
  deleteLayoutRack,
  getLayoutAisles,
  createLayoutAisle,
  updateLayoutAisle,
  deleteLayoutAisle,
  evaluateLayout
} from '../services/layout.service';
import {
  optimizeLayout,
  optimizeElevations,
  optimizeAisles,
  optimizeSlotting
} from '../services/optimization.service';

// Create router
const layoutRoutes = Router();

/**
 * @route   GET /api/layouts
 * @desc    Get all layouts for a facility
 * @access  Public
 */
layoutRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facility_id } = req.query;
    
    if (!facility_id) {
      throw new ApiError(400, 'Missing required query parameter: facility_id');
    }
    
    const layouts = await getAllLayouts(facility_id as string);
    res.json(layouts);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/layouts/:id
 * @desc    Get layout by ID
 * @access  Public
 */
layoutRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const layout = await getLayoutById(id);
    res.json(layout);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/layouts
 * @desc    Create a new layout
 * @access  Public
 */
layoutRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const layoutData = req.body;
    
    // Validate required fields
    if (!layoutData.facility_id || !layoutData.name) {
      throw new ApiError(400, 'Missing required fields: facility_id, name');
    }
    
    const newLayout = await createLayout(layoutData);
    
    logger.info(`Created new layout: ${newLayout.id}`);
    
    res.status(201).json(newLayout);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/layouts/:id
 * @desc    Update a layout
 * @access  Public
 */
layoutRoutes.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const layoutData = req.body;
    
    const updatedLayout = await updateLayout(id, layoutData);
    
    logger.info(`Updated layout: ${id}`);
    
    res.json(updatedLayout);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/layouts/:id
 * @desc    Delete a layout
 * @access  Public
 */
layoutRoutes.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await deleteLayout(id);
    
    logger.info(`Deleted layout: ${id}`);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/layouts/:id/racks
 * @desc    Get all racks for a layout
 * @access  Public
 */
layoutRoutes.get('/:id/racks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const racks = await getLayoutRacks(id);
    res.json(racks);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/layouts/:id/racks
 * @desc    Create a new rack for a layout
 * @access  Public
 */
layoutRoutes.post('/:id/racks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const rackData = req.body;
    
    // Validate required fields
    if (!rackData.rack_type_id || !rackData.location) {
      throw new ApiError(400, 'Missing required fields: rack_type_id, location');
    }
    
    const newRack = await createLayoutRack(id, rackData);
    
    logger.info(`Created new rack: ${newRack.id}`);
    
    res.status(201).json(newRack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/layouts/:layoutId/racks/:rackId
 * @desc    Update a rack
 * @access  Public
 */
layoutRoutes.put('/:layoutId/racks/:rackId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId, rackId } = req.params;
    const rackData = req.body;
    
    const updatedRack = await updateLayoutRack(layoutId, rackId, rackData);
    
    logger.info(`Updated rack: ${rackId}`);
    
    res.json(updatedRack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/layouts/:layoutId/racks/:rackId
 * @desc    Delete a rack
 * @access  Public
 */
layoutRoutes.delete('/:layoutId/racks/:rackId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId, rackId } = req.params;
    
    await deleteLayoutRack(layoutId, rackId);
    
    logger.info(`Deleted rack: ${rackId}`);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/layouts/:id/aisles
 * @desc    Get all aisles for a layout
 * @access  Public
 */
layoutRoutes.get('/:id/aisles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const aisles = await getLayoutAisles(id);
    res.json(aisles);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/layouts/:id/aisles
 * @desc    Create a new aisle for a layout
 * @access  Public
 */
layoutRoutes.post('/:id/aisles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const aisleData = req.body;
    
    // Validate required fields
    if (!aisleData.path || !aisleData.width) {
      throw new ApiError(400, 'Missing required fields: path, width');
    }
    
    const newAisle = await createLayoutAisle(id, aisleData);
    
    logger.info(`Created new aisle: ${newAisle.id}`);
    
    res.status(201).json(newAisle);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/layouts/:layoutId/aisles/:aisleId
 * @desc    Update an aisle
 * @access  Public
 */
layoutRoutes.put('/:layoutId/aisles/:aisleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId, aisleId } = req.params;
    const aisleData = req.body;
    
    const updatedAisle = await updateLayoutAisle(layoutId, aisleId, aisleData);
    
    logger.info(`Updated aisle: ${aisleId}`);
    
    res.json(updatedAisle);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/layouts/:layoutId/aisles/:aisleId
 * @desc    Delete an aisle
 * @access  Public
 */
layoutRoutes.delete('/:layoutId/aisles/:aisleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId, aisleId } = req.params;
    
    await deleteLayoutAisle(layoutId, aisleId);
    
    logger.info(`Deleted aisle: ${aisleId}`);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/layouts/:id/evaluate
 * @desc    Evaluate a layout and calculate metrics
 * @access  Public
 */
layoutRoutes.get('/:id/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { metrics } = req.query;
    
    const metricsArray = metrics ? (metrics as string).split(',') : [];
    
    const evaluation = await evaluateLayout(id, metricsArray);
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/layouts/:id/optimize
 * @desc    Optimize a layout
 * @access  Public
 */
layoutRoutes.post('/:id/optimize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, parameters } = req.body;
    
    if (!type) {
      throw new ApiError(400, 'Missing required field: type');
    }
    
    let result;
    
    switch (type) {
      case 'elevation':
        if (!parameters?.rack_id) {
          throw new ApiError(400, 'Missing required parameter: rack_id');
        }
        result = await optimizeElevations(id, parameters.rack_id, parameters);
        break;
        
      case 'aisle':
        result = await optimizeAisles(id, parameters);
        break;
        
      case 'slotting':
        result = await optimizeSlotting(id, parameters);
        break;
        
      case 'layout':
        result = await optimizeLayout({ layout_id: id, parameters });
        break;
        
      default:
        throw new ApiError(400, `Invalid optimization type: ${type}`);
    }
    
    logger.info(`Optimized layout ${id} with type ${type}`);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { layoutRoutes };