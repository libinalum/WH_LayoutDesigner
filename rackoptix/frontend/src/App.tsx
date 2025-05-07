import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import AppHeader from '@components/layout/AppHeader';
import AppSidebar from '@components/layout/AppSidebar';
import Dashboard from '@pages/Dashboard';
import FacilityEditor from '@pages/FacilityEditor';
import FacilityViewer from '@pages/FacilityViewer';
import ProductManager from '@pages/ProductManager';
import EquipmentManager from '@pages/EquipmentManager';
import LayoutOptimizer from '@pages/LayoutOptimizer';
import Settings from '@pages/Settings';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppHeader toggleSidebar={toggleSidebar} />
      <AppSidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: sidebarOpen ? '240px' : 0,
          transition: 'margin 0.2s',
          overflow: 'auto',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/facility" element={<FacilityEditor />} />
          <Route path="/facility/:id" element={<FacilityViewer />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/equipment" element={<EquipmentManager />} />
          <Route path="/layout" element={<LayoutOptimizer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;