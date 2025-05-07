/**
 * Zone model for the RackOptix API.
 */

import { Boundary } from './Facility';

export interface Zone {
  id: string;
  facility_id: string;
  name: string;
  purpose: string; // 'receiving', 'shipping', 'storage', 'staging', 'office', etc.
  boundary: {
    type: string; // 'Polygon'
    coordinates: number[][][]; // GeoJSON coordinates
  };
  properties: {
    [key: string]: any;
  };
}

export interface CreateZoneDto {
  name: string;
  purpose: string;
  boundary: {
    type: string;
    coordinates: number[][][];
  };
  properties?: {
    [key: string]: any;
  };
}

export interface UpdateZoneDto {
  name?: string;
  purpose?: string;
  boundary?: {
    type: string;
    coordinates: number[][][];
  };
  properties?: {
    [key: string]: any;
  };
}