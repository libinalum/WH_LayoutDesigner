/**
 * Facility model for the RackOptix API.
 */

export interface Boundary {
  type: string;
  coordinates: number[][][];
}

export interface FacilityMetadata {
  address?: string;
  square_footage?: number;
  year_built?: number;
  sprinkler_type?: string;
  [key: string]: any;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  clear_height: number;
  boundary: Boundary;
  metadata?: FacilityMetadata;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFacilityDto {
  name: string;
  description?: string;
  clear_height: number;
  boundary: Boundary;
  metadata?: FacilityMetadata;
}

export interface UpdateFacilityDto {
  name?: string;
  description?: string;
  clear_height?: number;
  boundary?: Boundary;
  metadata?: FacilityMetadata;
}