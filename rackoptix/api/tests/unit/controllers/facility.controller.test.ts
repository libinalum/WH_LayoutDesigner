import { Request, Response } from 'express';
import { FacilityController } from '../../../src/controllers/facility.controller';
import { FacilityService } from '../../../src/services/facility.service';
import { mockFacility, mockFacilityList } from '../../mocks/facility.mock';

// Mock the facility service
jest.mock('../../../src/services/facility.service');

describe('FacilityController', () => {
  let facilityController: FacilityController;
  let facilityService: jest.Mocked<FacilityService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    facilityService = new FacilityService() as jest.Mocked<FacilityService>;
    facilityController = new FacilityController(facilityService);
    
    req = {
      params: {},
      body: {},
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn(),
    };
    
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFacilities', () => {
    it('should return all facilities', async () => {
      facilityService.getAllFacilities.mockResolvedValue(mockFacilityList);
      
      await facilityController.getAllFacilities(req as Request, res as Response, next);
      
      expect(facilityService.getAllFacilities).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFacilityList);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      facilityService.getAllFacilities.mockRejectedValue(error);
      
      await facilityController.getAllFacilities(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getFacilityById', () => {
    it('should return a facility by id', async () => {
      req.params = { id: 'facility-1' };
      facilityService.getFacilityById.mockResolvedValue(mockFacility);
      
      await facilityController.getFacilityById(req as Request, res as Response, next);
      
      expect(facilityService.getFacilityById).toHaveBeenCalledWith('facility-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFacility);
    });

    it('should return 404 if facility not found', async () => {
      req.params = { id: 'non-existent' };
      facilityService.getFacilityById.mockResolvedValue(null);
      
      await facilityController.getFacilityById(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Facility not found' });
    });

    it('should handle errors', async () => {
      req.params = { id: 'facility-1' };
      const error = new Error('Database error');
      facilityService.getFacilityById.mockRejectedValue(error);
      
      await facilityController.getFacilityById(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createFacility', () => {
    it('should create a new facility', async () => {
      const newFacility = {
        name: 'New Facility',
        length: 100,
        width: 80,
        height: 30,
        units: 'ft',
        boundary: [[0, 0], [100, 0], [100, 80], [0, 80], [0, 0]],
      };
      
      req.body = newFacility;
      facilityService.createFacility.mockResolvedValue({ id: 'new-facility', ...newFacility });
      
      await facilityController.createFacility(req as Request, res as Response, next);
      
      expect(facilityService.createFacility).toHaveBeenCalledWith(newFacility);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'new-facility', ...newFacility });
    });

    it('should handle validation errors', async () => {
      const invalidFacility = {
        name: 'Invalid Facility',
        // Missing required fields
      };
      
      req.body = invalidFacility;
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';
      facilityService.createFacility.mockRejectedValue(validationError);
      
      await facilityController.createFacility(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith(validationError);
    });
  });

  describe('updateFacility', () => {
    it('should update an existing facility', async () => {
      const updatedFacility = {
        name: 'Updated Facility',
        length: 120,
        width: 90,
        height: 35,
        units: 'ft',
        boundary: [[0, 0], [120, 0], [120, 90], [0, 90], [0, 0]],
      };
      
      req.params = { id: 'facility-1' };
      req.body = updatedFacility;
      facilityService.updateFacility.mockResolvedValue({ id: 'facility-1', ...updatedFacility });
      
      await facilityController.updateFacility(req as Request, res as Response, next);
      
      expect(facilityService.updateFacility).toHaveBeenCalledWith('facility-1', updatedFacility);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'facility-1', ...updatedFacility });
    });

    it('should return 404 if facility not found', async () => {
      req.params = { id: 'non-existent' };
      req.body = { name: 'Updated Facility' };
      facilityService.updateFacility.mockResolvedValue(null);
      
      await facilityController.updateFacility(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Facility not found' });
    });
  });

  describe('deleteFacility', () => {
    it('should delete a facility', async () => {
      req.params = { id: 'facility-1' };
      facilityService.deleteFacility.mockResolvedValue(true);
      
      await facilityController.deleteFacility(req as Request, res as Response, next);
      
      expect(facilityService.deleteFacility).toHaveBeenCalledWith('facility-1');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('should return 404 if facility not found', async () => {
      req.params = { id: 'non-existent' };
      facilityService.deleteFacility.mockResolvedValue(false);
      
      await facilityController.deleteFacility(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Facility not found' });
    });
  });

  describe('addZoneToFacility', () => {
    it('should add a zone to a facility', async () => {
      const zone = {
        name: 'New Zone',
        geometry: [[0, 0], [50, 0], [50, 50], [0, 50], [0, 0]],
      };
      
      req.params = { id: 'facility-1' };
      req.body = zone;
      
      const updatedFacility = {
        ...mockFacility,
        zones: [...(mockFacility.zones || []), { id: 'zone-1', ...zone }],
      };
      
      facilityService.addZoneToFacility.mockResolvedValue({ id: 'zone-1', ...zone });
      
      await facilityController.addZoneToFacility(req as Request, res as Response, next);
      
      expect(facilityService.addZoneToFacility).toHaveBeenCalledWith('facility-1', zone);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'zone-1', ...zone });
    });

    it('should return 404 if facility not found', async () => {
      req.params = { id: 'non-existent' };
      req.body = { name: 'New Zone' };
      
      const notFoundError = new Error('Facility not found');
      notFoundError.name = 'NotFoundError';
      facilityService.addZoneToFacility.mockRejectedValue(notFoundError);
      
      await facilityController.addZoneToFacility(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith(notFoundError);
    });
  });

  describe('addObstructionToFacility', () => {
    it('should add an obstruction to a facility', async () => {
      const obstruction = {
        type: 'column',
        geometry: [[10, 10], [11, 10], [11, 11], [10, 11], [10, 10]],
      };
      
      req.params = { id: 'facility-1' };
      req.body = obstruction;
      
      const updatedFacility = {
        ...mockFacility,
        obstructions: [...(mockFacility.obstructions || []), { id: 'obstruction-1', ...obstruction }],
      };
      
      facilityService.addObstructionToFacility.mockResolvedValue({ id: 'obstruction-1', ...obstruction });
      
      await facilityController.addObstructionToFacility(req as Request, res as Response, next);
      
      expect(facilityService.addObstructionToFacility).toHaveBeenCalledWith('facility-1', obstruction);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'obstruction-1', ...obstruction });
    });
  });
});