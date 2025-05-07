// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  facilityId?: string;
  layoutId?: string;
  metrics?: Record<string, any>;
  thumbnail?: string;
  tags?: string[];
  owner?: string;
  collaborators?: string[];
}

// Report types
export interface Report {
  id: string;
  name: string;
  type: 'layout' | 'inventory' | 'optimization' | 'custom';
  projectId: string;
  facilityId?: string;
  layoutId?: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  config: ReportConfig;
}

export interface ReportConfig {
  sections: ReportSection[];
  template: string;
  paperSize: string;
  orientation: string;
  showHeader: boolean;
  showFooter: boolean;
  showPageNumbers: boolean;
  customStyles?: Record<string, any>;
}

export interface ReportSection {
  id: string;
  type: string;
  title?: string;
  content?: any;
  options?: Record<string, any>;
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'dxf' | 'dwg' | 'skp' | 'obj' | 'gltf' | 'csv' | 'xlsx' | 'png' | 'jpg';
  quality?: 'low' | 'medium' | 'high';
  scale?: number;
  includeMetadata?: boolean;
  includeLabels?: boolean;
  colorMode?: 'color' | 'grayscale' | 'blackAndWhite';
  layers?: string[];
  views?: string[];
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  measurementUnit: 'imperial' | 'metric';
  notifications: boolean;
  defaultView: 'list' | 'grid';
  shortcuts: Record<string, string>;
}

// Comment and annotation types
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  resolved: boolean;
  attachments?: string[];
  position?: {
    x: number;
    y: number;
    z?: number;
  };
}

export interface Annotation {
  id: string;
  type: 'note' | 'measurement' | 'highlight' | 'drawing';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  content: any;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  properties?: Record<string, any>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  userId: string;
}