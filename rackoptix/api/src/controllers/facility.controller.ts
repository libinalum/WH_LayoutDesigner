import { Request, Response, NextFunction } from 'express';
import { FacilityService } from '../services/facility.service';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Controller for facility-related endpoints
 */
export class FacilityController {
  private facilityService: FacilityService;

  /**
   * Create a new FacilityController
   * @param facilityService Facility service instance
   */
  constructor(facilityService: FacilityService) {
    this.facilityService = facilityService;
  }

  /**
   * Get all facilities
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getAllFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facilities = await this.facilityService.getAllFacilities();
      res.status(200).json(facilities);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a facility by ID
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async getFacilityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const facility = await this.facilityService.getFacilityById(id);
      
      if (!facility) {
        res.status(404).json({ message: 'Facility not found' });
        return;
      }
      
      res.status(200).json(facility);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new facility
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async createFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facilityData = req.body;
      const facility = await this.facilityService.createFacility(facilityData);
      res.status(201).json(facility);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing facility
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async updateFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const facilityData = req.body;
      const facility = await this.facilityService.updateFacility(id, facilityData);
      
      if (!facility) {
        res.status(404).json({ message: 'Facility not found' });
        return;
      }
      
      res.status(200).json(facility);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a facility
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async deleteFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.facilityService.deleteFacility(id);
      
      if (!deleted) {
        res.status(404).json({ message: 'Facility not found' });
        return;
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a zone to a facility
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async addZoneToFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const zoneData = req.body;
      const zone = await this.facilityService.addZoneToFacility(id, zoneData);
      res.status(201).json(zone);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add an obstruction to a facility
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  async addObstructionToFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const obstructionData = req.body;
      const obstruction = await this.facilityService.addObstructionToFacility(id, obstructionData);
      res.status(201).json(obstruction);
    } catch (error) {
      next(error);
    }
  }
}