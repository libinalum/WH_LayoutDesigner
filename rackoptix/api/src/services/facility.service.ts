import { Facility } from '../models/Facility';
import { Zone } from '../models/Zone';
import { Obstruction } from '../models/Obstruction';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Service for facility-related operations
 */
export class FacilityService {
  /**
   * Get all facilities
   * @returns Promise<Facility[]> List of all facilities
   */
  async getAllFacilities(): Promise<Facility[]> {
    try {
      return await Facility.findAll({
        include: [Zone, Obstruction],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a facility by ID
   * @param id Facility ID
   * @returns Promise<Facility | null> Facility or null if not found
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    try {
      return await Facility.findByPk(id, {
        include: [Zone, Obstruction],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new facility
   * @param facilityData Facility data
   * @returns Promise<Facility> Created facility
   */
  async createFacility(facilityData: any): Promise<Facility> {
    try {
      // Validate facility data
      this.validateFacilityData(facilityData);

      // Create facility
      const facility = await Facility.create(facilityData);

      // Add zones if provided
      if (facilityData.zones && Array.isArray(facilityData.zones)) {
        for (const zoneData of facilityData.zones) {
          await this.addZoneToFacility(facility.id, zoneData);
        }
      }

      // Add obstructions if provided
      if (facilityData.obstructions && Array.isArray(facilityData.obstructions)) {
        for (const obstructionData of facilityData.obstructions) {
          await this.addObstructionToFacility(facility.id, obstructionData);
        }
      }

      // Return the complete facility
      return await this.getFacilityById(facility.id) as Facility;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing facility
   * @param id Facility ID
   * @param facilityData Updated facility data
   * @returns Promise<Facility | null> Updated facility or null if not found
   */
  async updateFacility(id: string, facilityData: any): Promise<Facility | null> {
    try {
      // Find the facility
      const facility = await Facility.findByPk(id);
      if (!facility) {
        return null;
      }

      // Validate facility data
      this.validateFacilityData(facilityData);

      // Update facility
      await facility.update(facilityData);

      // Return the updated facility
      return await this.getFacilityById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a facility
   * @param id Facility ID
   * @returns Promise<boolean> True if deleted, false if not found
   */
  async deleteFacility(id: string): Promise<boolean> {
    try {
      // Find the facility
      const facility = await Facility.findByPk(id);
      if (!facility) {
        return false;
      }

      // Delete facility
      await facility.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a zone to a facility
   * @param facilityId Facility ID
   * @param zoneData Zone data
   * @returns Promise<Zone> Created zone
   */
  async addZoneToFacility(facilityId: string, zoneData: any): Promise<Zone> {
    try {
      // Find the facility
      const facility = await Facility.findByPk(facilityId);
      if (!facility) {
        throw new NotFoundError('Facility not found');
      }

      // Validate zone data
      this.validateZoneData(zoneData);

      // Create zone
      const zone = await Zone.create({
        ...zoneData,
        facilityId,
      });

      return zone;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add an obstruction to a facility
   * @param facilityId Facility ID
   * @param obstructionData Obstruction data
   * @returns Promise<Obstruction> Created obstruction
   */
  async addObstructionToFacility(facilityId: string, obstructionData: any): Promise<Obstruction> {
    try {
      // Find the facility
      const facility = await Facility.findByPk(facilityId);
      if (!facility) {
        throw new NotFoundError('Facility not found');
      }

      // Validate obstruction data
      this.validateObstructionData(obstructionData);

      // Create obstruction
      const obstruction = await Obstruction.create({
        ...obstructionData,
        facilityId,
      });

      return obstruction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate facility data
   * @param facilityData Facility data to validate
   * @throws ValidationError if data is invalid
   */
  private validateFacilityData(facilityData: any): void {
    // Check required fields
    if (!facilityData.name) {
      throw new ValidationError('Facility name is required');
    }

    if (!facilityData.length || facilityData.length <= 0) {
      throw new ValidationError('Facility length must be positive');
    }

    if (!facilityData.width || facilityData.width <= 0) {
      throw new ValidationError('Facility width must be positive');
    }

    if (!facilityData.height || facilityData.height <= 0) {
      throw new ValidationError('Facility height must be positive');
    }

    if (!facilityData.units) {
      throw new ValidationError('Facility units are required');
    }

    if (!facilityData.boundary || !Array.isArray(facilityData.boundary) || facilityData.boundary.length < 4) {
      throw new ValidationError('Facility boundary must be an array of at least 4 points');
    }

    // Validate that the boundary is closed (first point equals last point)
    const firstPoint = facilityData.boundary[0];
    const lastPoint = facilityData.boundary[facilityData.boundary.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      throw new ValidationError('Facility boundary must be closed (first point equals last point)');
    }
  }

  /**
   * Validate zone data
   * @param zoneData Zone data to validate
   * @throws ValidationError if data is invalid
   */
  private validateZoneData(zoneData: any): void {
    // Check required fields
    if (!zoneData.name) {
      throw new ValidationError('Zone name is required');
    }

    if (!zoneData.geometry || !Array.isArray(zoneData.geometry) || zoneData.geometry.length < 4) {
      throw new ValidationError('Zone geometry must be an array of at least 4 points');
    }

    // Validate that the geometry is closed (first point equals last point)
    const firstPoint = zoneData.geometry[0];
    const lastPoint = zoneData.geometry[zoneData.geometry.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      throw new ValidationError('Zone geometry must be closed (first point equals last point)');
    }
  }

  /**
   * Validate obstruction data
   * @param obstructionData Obstruction data to validate
   * @throws ValidationError if data is invalid
   */
  private validateObstructionData(obstructionData: any): void {
    // Check required fields
    if (!obstructionData.type) {
      throw new ValidationError('Obstruction type is required');
    }

    if (!obstructionData.geometry || !Array.isArray(obstructionData.geometry) || obstructionData.geometry.length < 4) {
      throw new ValidationError('Obstruction geometry must be an array of at least 4 points');
    }

    // Validate that the geometry is closed (first point equals last point)
    const firstPoint = obstructionData.geometry[0];
    const lastPoint = obstructionData.geometry[obstructionData.geometry.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      throw new ValidationError('Obstruction geometry must be closed (first point equals last point)');
    }
  }
}

// Create a singleton instance of the service
const facilityService = new FacilityService();

// Export the service instance methods as standalone functions
export const getAllFacilities = facilityService.getAllFacilities.bind(facilityService);
export const getFacilityById = facilityService.getFacilityById.bind(facilityService);
export const createFacility = facilityService.createFacility.bind(facilityService);
export const updateFacility = facilityService.updateFacility.bind(facilityService);
export const deleteFacility = facilityService.deleteFacility.bind(facilityService);
export const addZoneToFacility = facilityService.addZoneToFacility.bind(facilityService);
export const addObstructionToFacility = facilityService.addObstructionToFacility.bind(facilityService);

// These functions need to be implemented
export const getFacilityObstructions = async (id: string) => {
  console.log('getFacilityObstructions called with id:', id);
  return [];
};

export const createFacilityObstruction = async (facilityId: string, data: any) => {
  console.log('createFacilityObstruction called with facilityId:', facilityId);
  return await facilityService.addObstructionToFacility(facilityId, data);
};

export const updateFacilityObstruction = async (facilityId: string, obstructionId: string, data: any) => {
  console.log('updateFacilityObstruction called with facilityId:', facilityId, 'obstructionId:', obstructionId);
  return { id: obstructionId, ...data };
};

export const deleteFacilityObstruction = async (facilityId: string, obstructionId: string) => {
  console.log('deleteFacilityObstruction called with facilityId:', facilityId, 'obstructionId:', obstructionId);
  return true;
};

export const getFacilityZones = async (id: string) => {
  console.log('getFacilityZones called with id:', id);
  return [];
};

export const createFacilityZone = async (facilityId: string, data: any) => {
  console.log('createFacilityZone called with facilityId:', facilityId);
  return await facilityService.addZoneToFacility(facilityId, data);
};

export const updateFacilityZone = async (facilityId: string, zoneId: string, data: any) => {
  console.log('updateFacilityZone called with facilityId:', facilityId, 'zoneId:', zoneId);
  return { id: zoneId, ...data };
};

export const deleteFacilityZone = async (facilityId: string, zoneId: string) => {
  console.log('deleteFacilityZone called with facilityId:', facilityId, 'zoneId:', zoneId);
  return true;
};

export const getFacilitiesInBounds = async (bounds: any) => {
  console.log('getFacilitiesInBounds called with bounds:', bounds);
  return [];
};

export const calculateFacilityArea = async (id: string) => {
  console.log('calculateFacilityArea called with id:', id);
  return 10000; // Dummy value
};