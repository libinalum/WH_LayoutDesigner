import { create } from 'zustand';
import { Report } from '../types';
import { generateDefaultReportConfig } from '../utils/reportUtils';

// Store interface
interface ReportState {
  // State
  reports: Report[];
  currentReport: Report | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchReports: (projectId?: string) => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  createReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Report>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report | null>;
  deleteReport: (id: string) => Promise<void>;
  setCurrentReport: (report: Report | null) => void;
  
  // Report template actions
  createReportFromTemplate: (
    type: 'layout' | 'inventory' | 'optimization' | 'custom',
    name: string,
    projectId: string,
    facilityId?: string,
    layoutId?: string
  ) => Promise<Report>;
  
  // Export actions
  exportReportToPDF: (reportId: string) => Promise<string>;
  exportReportToExcel: (reportId: string) => Promise<string>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useReportStore = create<ReportState>((set: any, get: any) => ({
  // Initial state
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchReports: async (projectId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const url = projectId ? `${API_URL}/projects/${projectId}/reports` : `${API_URL}/reports`;
      // const response = await axios.get(url);
      // set({ reports: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const reports: Report[] = [
          {
            id: 'report-1',
            name: 'Chicago DC Layout Summary',
            type: 'layout',
            projectId: 'project-1',
            facilityId: 'facility-1',
            layoutId: 'layout-1',
            createdAt: '2025-05-01T14:30:00Z',
            updatedAt: '2025-05-01T14:30:00Z',
            data: {
              metrics: {
                storage_density: 0.82,
                space_utilization: 0.75,
                pallet_positions: 1350,
                travel_distance: 48.2
              },
              racks: [
                { id: 'rack-1', type: 'selective', dimensions: '40x8x24', capacity: 120 },
                { id: 'rack-2', type: 'drive-in', dimensions: '60x8x24', capacity: 240 },
                { id: 'rack-3', type: 'selective', dimensions: '40x8x24', capacity: 120 }
              ]
            },
            config: generateDefaultReportConfig('layout')
          },
          {
            id: 'report-2',
            name: 'Chicago DC Inventory Report',
            type: 'inventory',
            projectId: 'project-1',
            facilityId: 'facility-1',
            createdAt: '2025-05-02T10:15:00Z',
            updatedAt: '2025-05-02T10:15:00Z',
            data: {
              products: [
                { sku: 'SKU001', description: 'Widget A', quantity: 120, location: 'A-01-01' },
                { sku: 'SKU002', description: 'Widget B', quantity: 85, location: 'A-01-02' },
                { sku: 'SKU003', description: 'Widget C', quantity: 210, location: 'A-02-01' }
              ],
              categories: [
                { name: 'Category A', count: 120 },
                { name: 'Category B', count: 85 },
                { name: 'Category C', count: 210 }
              ]
            },
            config: generateDefaultReportConfig('inventory')
          },
          {
            id: 'report-3',
            name: 'Chicago DC Optimization Results',
            type: 'optimization',
            projectId: 'project-1',
            facilityId: 'facility-1',
            layoutId: 'layout-1',
            createdAt: '2025-05-03T16:45:00Z',
            updatedAt: '2025-05-03T16:45:00Z',
            data: {
              before: {
                storage_density: 0.75,
                space_utilization: 0.68,
                pallet_positions: 1200,
                travel_distance: 52.5
              },
              after: {
                storage_density: 0.82,
                space_utilization: 0.75,
                pallet_positions: 1350,
                travel_distance: 48.2
              }
            },
            config: generateDefaultReportConfig('optimization')
          }
        ];
        
        // Filter by project if projectId is provided
        const filteredReports = projectId 
          ? reports.filter(report => report.projectId === projectId)
          : reports;
        
        set({
          reports: filteredReports,
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching reports:', error);
      set({
        error: 'Failed to fetch reports',
        isLoading: false
      });
    }
  },
  
  fetchReportById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/reports/${id}`);
      // set({ currentReport: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const report = get().reports.find((r: Report) => r.id === id);
        if (report) {
          set({
            currentReport: report,
            isLoading: false
          });
        } else {
          set({
            error: `Report not found with id: ${id}`,
            isLoading: false
          });
        }
      }, 300);
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error);
      set({
        error: `Failed to fetch report ${id}`,
        isLoading: false
      });
    }
  },
  
  createReport: async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/reports`, reportData);
      // const newReport = response.data;
      
      // Simulate API call
      const newReport: Report = {
        ...reportData,
        id: `report-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set((state: ReportState) => ({
        reports: [...state.reports, newReport],
        currentReport: newReport,
        isLoading: false
      }));
      
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      set({
        error: 'Failed to create report',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateReport: async (id: string, updates: Partial<Report>) => {
    set({ isLoading: true, error: null });
    try {
      const report = get().reports.find((r: Report) => r.id === id);
      if (!report) {
        set({
          error: `Report not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/reports/${id}`, {
      //   ...report,
      //   ...updates,
      //   updatedAt: new Date().toISOString()
      // });
      // const updatedReport = response.data;
      
      // Simulate API call
      const updatedReport: Report = {
        ...report,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      set((state: ReportState) => ({
        reports: state.reports.map((r: Report) => 
          r.id === updatedReport.id ? updatedReport : r
        ),
        currentReport: state.currentReport?.id === id ? updatedReport : state.currentReport,
        isLoading: false
      }));
      
      return updatedReport;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      set({
        error: `Failed to update report ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteReport: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/reports/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state: ReportState) => ({
        reports: state.reports.filter((r: Report) => r.id !== id),
        currentReport: state.currentReport?.id === id ? null : state.currentReport,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error);
      set({
        error: `Failed to delete report ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  setCurrentReport: (report: Report | null) => {
    set({ currentReport: report });
  },
  
  createReportFromTemplate: async (
    type: 'layout' | 'inventory' | 'optimization' | 'custom',
    name: string,
    projectId: string,
    facilityId?: string,
    layoutId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      // Generate default config based on report type
      const config = generateDefaultReportConfig(type);
      
      // Create empty data structure based on report type
      let data: any = {};
      
      switch (type) {
        case 'layout':
          data = {
            metrics: {
              storage_density: 0,
              space_utilization: 0,
              pallet_positions: 0
            },
            racks: []
          };
          break;
        case 'inventory':
          data = {
            products: [],
            categories: []
          };
          break;
        case 'optimization':
          data = {
            before: {
              storage_density: 0,
              space_utilization: 0,
              pallet_positions: 0,
              travel_distance: 0
            },
            after: {
              storage_density: 0,
              space_utilization: 0,
              pallet_positions: 0,
              travel_distance: 0
            }
          };
          break;
        default:
          data = {};
      }
      
      // Create new report
      const newReport: Report = {
        id: `report-${Date.now()}`,
        name,
        type,
        projectId,
        facilityId,
        layoutId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data,
        config
      };
      
      set((state: ReportState) => ({
        reports: [...state.reports, newReport],
        currentReport: newReport,
        isLoading: false
      }));
      
      return newReport;
    } catch (error) {
      console.error(`Error creating report from template:`, error);
      set({
        error: `Failed to create report from template`,
        isLoading: false
      });
      throw error;
    }
  },
  
  exportReportToPDF: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/reports/${reportId}/export/pdf`, {
      //   responseType: 'blob'
      // });
      // const url = URL.createObjectURL(response.data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a fake data URL
      const url = 'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvWE9iamVjdCAvU3VidHlwZSA...';
      
      set({ isLoading: false });
      return url;
    } catch (error) {
      console.error(`Error exporting report ${reportId} to PDF:`, error);
      set({
        error: `Failed to export report ${reportId} to PDF`,
        isLoading: false
      });
      throw error;
    }
  },
  
  exportReportToExcel: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/reports/${reportId}/export/excel`, {
      //   responseType: 'blob'
      // });
      // const url = URL.createObjectURL(response.data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a fake data URL
      const url = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQABgAIAAAAIQD...';
      
      set({ isLoading: false });
      return url;
    } catch (error) {
      console.error(`Error exporting report ${reportId} to Excel:`, error);
      set({
        error: `Failed to export report ${reportId} to Excel`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useReportStore;