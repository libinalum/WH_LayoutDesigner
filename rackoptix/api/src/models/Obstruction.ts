/**
 * Obstruction model for the RackOptix API.
 */

import { Boundary } from './Facility';

export interface Obstruction {
  id: string;
  facility_id: string;
  type: string; // 'column', 'wall', 'dock', etc.
  shape: {
    type: string; // 'Polygon', 'LineString', etc.
    coordinates: number[][][] | number[][]; // GeoJSON coordinates
  };
  height: number;
  properties: {
    width?: number; // For walls
    [key: string]: any;
  };
}

export interface CreateObstructionDto {
  type: string;
  shape: {
    type: string;
    coordinates: number[][][] | number[][];
  };
  height: number;
  properties?: {
    width?: number;
    [key: string]: any;
  };
}

export interface UpdateObstructionDto {
  type?: string;
  shape?: {
    type: string;
    coordinates: number[][][] | number[][];
  };
  height?: number;
  properties?: {
    width?: number;
    [key: string]: any;
  };
}