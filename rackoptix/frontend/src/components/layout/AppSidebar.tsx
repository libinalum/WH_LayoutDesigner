import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import ForkliftIcon from '@mui/icons-material/Forklift';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import SettingsIcon from '@mui/icons-material/Settings';

interface AppSidebarProps {
  open: boolean;
}

const DRAWER_WIDTH = 240;

const AppSidebar: FC<AppSidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Facility Editor', icon: <WarehouseIcon />, path: '/facility' },
    { text: 'Product Manager', icon: <InventoryIcon />, path: '/products' },
    { text: 'Equipment Manager', icon: <ForkliftIcon />, path: '/equipment' },
    { text: 'Layout Optimizer', icon: <ViewInArIcon />, path: '/layout' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/logo.png" 
              alt="RackOptix Logo" 
              style={{ width: 120, opacity: 0.7 }} 
            />
          </Box>
          <Box sx={{ textAlign: 'center', mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
            Version 0.1.0
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AppSidebar;