import { Report, ReportSection } from '../types';

/**
 * Utility functions for handling reports
 */

/**
 * Generates a default report configuration based on report type
 * @param type The type of report to generate
 * @returns A default report configuration
 */
export const generateDefaultReportConfig = (type: 'layout' | 'inventory' | 'optimization' | 'custom') => {
  const baseConfig = {
    sections: [],
    template: 'standard',
    paperSize: 'letter',
    orientation: 'portrait',
    showHeader: true,
    showFooter: true,
    showPageNumbers: true,
  };

  switch (type) {
    case 'layout':
      return {
        ...baseConfig,
        sections: [
          {
            id: 'section-1',
            type: 'text',
            title: 'Layout Summary',
            content: 'This report provides an overview of the facility layout.',
          },
          {
            id: 'section-2',
            type: 'image',
            title: 'Layout Visualization',
            options: {
              caption: 'Facility layout visualization',
              width: '100%',
            },
          },
          {
            id: 'section-3',
            type: 'metrics',
            title: 'Key Metrics',
            options: {
              metrics: ['storage_density', 'space_utilization', 'pallet_positions'],
            },
          },
          {
            id: 'section-4',
            type: 'table',
            title: 'Rack Summary',
            options: {
              columns: ['Rack ID', 'Type', 'Dimensions', 'Capacity'],
            },
          },
        ],
      };
    
    case 'inventory':
      return {
        ...baseConfig,
        sections: [
          {
            id: 'section-1',
            type: 'text',
            title: 'Inventory Summary',
            content: 'This report provides an overview of the inventory.',
          },
          {
            id: 'section-2',
            type: 'table',
            title: 'Product Inventory',
            options: {
              columns: ['SKU', 'Description', 'Quantity', 'Location'],
              pagination: true,
              itemsPerPage: 20,
            },
          },
          {
            id: 'section-3',
            type: 'chart',
            title: 'Inventory by Category',
            options: {
              chartType: 'pie',
              width: '100%',
              height: '300px',
            },
          },
        ],
      };
    
    case 'optimization':
      return {
        ...baseConfig,
        sections: [
          {
            id: 'section-1',
            type: 'text',
            title: 'Optimization Results',
            content: 'This report provides the results of the optimization process.',
          },
          {
            id: 'section-2',
            type: 'metrics',
            title: 'Optimization Metrics',
            options: {
              metrics: ['storage_density', 'space_utilization', 'pallet_positions', 'travel_distance'],
              showComparison: true,
            },
          },
          {
            id: 'section-3',
            type: 'chart',
            title: 'Before vs After Comparison',
            options: {
              chartType: 'bar',
              width: '100%',
              height: '300px',
            },
          },
          {
            id: 'section-4',
            type: 'image',
            title: 'Layout Comparison',
            options: {
              caption: 'Before and after layout comparison',
              width: '100%',
            },
          },
        ],
      };
    
    case 'custom':
    default:
      return {
        ...baseConfig,
        sections: [
          {
            id: 'section-1',
            type: 'text',
            title: 'Custom Report',
            content: 'This is a custom report.',
          },
        ],
      };
  }
};

/**
 * Validates a report configuration
 * @param report The report to validate
 * @returns An object containing validation results
 */
export const validateReport = (report: Report) => {
  const errors: string[] = [];
  
  // Check required fields
  if (!report.name) {
    errors.push('Report name is required');
  }
  
  if (!report.type) {
    errors.push('Report type is required');
  }
  
  if (!report.config) {
    errors.push('Report configuration is required');
  }
  
  // Check sections
  if (!report.config.sections || report.config.sections.length === 0) {
    errors.push('Report must have at least one section');
  } else {
    report.config.sections.forEach((section, index) => {
      if (!section.type) {
        errors.push(`Section ${index + 1} must have a type`);
      }
      
      if (section.type === 'text' && !section.content) {
        errors.push(`Section ${index + 1} (text) must have content`);
      }
      
      if (section.type === 'table' && (!section.options || !section.options.columns)) {
        errors.push(`Section ${index + 1} (table) must have columns defined`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Adds a new section to a report
 * @param report The report to modify
 * @param sectionType The type of section to add
 * @param position The position to insert the section (default: end)
 * @returns The updated report
 */
export const addReportSection = (
  report: Report,
  sectionType: 'text' | 'table' | 'chart' | 'image' | 'metrics',
  position?: number
): Report => {
  const newSection: ReportSection = {
    id: `section-${Date.now()}`,
    type: sectionType,
    title: `New ${sectionType} Section`,
  };
  
  // Add type-specific defaults
  switch (sectionType) {
    case 'text':
      newSection.content = 'Enter text content here...';
      break;
    case 'table':
      newSection.options = {
        columns: ['Column 1', 'Column 2', 'Column 3'],
      };
      break;
    case 'chart':
      newSection.options = {
        chartType: 'bar',
        width: '100%',
        height: '300px',
      };
      break;
    case 'image':
      newSection.options = {
        caption: 'Image caption',
        width: '100%',
      };
      break;
    case 'metrics':
      newSection.options = {
        metrics: ['metric1', 'metric2', 'metric3'],
      };
      break;
  }
  
  const updatedSections = [...report.config.sections];
  
  if (position !== undefined && position >= 0 && position <= updatedSections.length) {
    updatedSections.splice(position, 0, newSection);
  } else {
    updatedSections.push(newSection);
  }
  
  return {
    ...report,
    config: {
      ...report.config,
      sections: updatedSections,
    },
  };
};

/**
 * Removes a section from a report
 * @param report The report to modify
 * @param sectionId The ID of the section to remove
 * @returns The updated report
 */
export const removeReportSection = (report: Report, sectionId: string): Report => {
  return {
    ...report,
    config: {
      ...report.config,
      sections: report.config.sections.filter(section => section.id !== sectionId),
    },
  };
};

/**
 * Moves a section up or down in a report
 * @param report The report to modify
 * @param sectionId The ID of the section to move
 * @param direction The direction to move ('up' or 'down')
 * @returns The updated report
 */
export const moveReportSection = (
  report: Report,
  sectionId: string,
  direction: 'up' | 'down'
): Report => {
  const sections = [...report.config.sections];
  const index = sections.findIndex(section => section.id === sectionId);
  
  if (index === -1) {
    return report;
  }
  
  if (direction === 'up' && index > 0) {
    const temp = sections[index];
    sections[index] = sections[index - 1];
    sections[index - 1] = temp;
  } else if (direction === 'down' && index < sections.length - 1) {
    const temp = sections[index];
    sections[index] = sections[index + 1];
    sections[index + 1] = temp;
  }
  
  return {
    ...report,
    config: {
      ...report.config,
      sections,
    },
  };
};