/**
 * Mock facility data for testing
 */

export const mockFacility = {
  id: 'facility-1',
  name: 'Test Facility',
  length: 100,
  width: 80,
  height: 30,
  units: 'ft',
  boundary: [[0, 0], [100, 0], [100, 80], [0, 80], [0, 0]],
  zones: [
    {
      id: 'zone-1',
      name: 'Receiving',
      geometry: [[0, 0], [20, 0], [20, 80], [0, 80], [0, 0]],
    },
    {
      id: 'zone-2',
      name: 'Storage',
      geometry: [[20, 0], [80, 0], [80, 80], [20, 80], [20, 0]],
    },
  ],
  obstructions: [
    {
      id: 'obstruction-1',
      type: 'column',
      geometry: [[10, 10], [11, 10], [11, 11], [10, 11], [10, 10]],
    },
  ],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-02'),
};

export const mockFacilityList = [
  mockFacility,
  {
    id: 'facility-2',
    name: 'Second Test Facility',
    length: 200,
    width: 150,
    height: 40,
    units: 'ft',
    boundary: [[0, 0], [200, 0], [200, 150], [0, 150], [0, 0]],
    zones: [],
    obstructions: [],
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-02'),
  },
];