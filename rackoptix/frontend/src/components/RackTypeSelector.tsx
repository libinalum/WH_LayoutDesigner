import { FC } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewArrayIcon from '@mui/icons-material/ViewArray';

/**
 * Component that provides menu items for different rack types
 */
const RackTypeSelector: FC = () => {
  return (
    <>
      <MenuItem value="selective">
        <ListItemIcon>
          <ViewColumnIcon />
        </ListItemIcon>
        <ListItemText primary="Selective Rack" />
      </MenuItem>
      
      <MenuItem value="drive-in">
        <ListItemIcon>
          <ViewWeekIcon />
        </ListItemIcon>
        <ListItemText primary="Drive-In Rack" />
      </MenuItem>
      
      <MenuItem value="push-back">
        <ListItemIcon>
          <ArrowBackIcon />
        </ListItemIcon>
        <ListItemText primary="Push-Back Rack" />
      </MenuItem>
      
      <MenuItem value="pallet-flow">
        <ListItemIcon>
          <ArrowForwardIcon />
        </ListItemIcon>
        <ListItemText primary="Pallet Flow Rack" />
      </MenuItem>
      
      <MenuItem value="cantilever">
        <ListItemIcon>
          <ViewArrayIcon />
        </ListItemIcon>
        <ListItemText primary="Cantilever Rack" />
      </MenuItem>
      
      <MenuItem value="carton-flow">
        <ListItemIcon>
          <ViewModuleIcon />
        </ListItemIcon>
        <ListItemText primary="Carton Flow Rack" />
      </MenuItem>
      
      <MenuItem value="mobile">
        <ListItemIcon>
          <ViewComfyIcon />
        </ListItemIcon>
        <ListItemText primary="Mobile Rack" />
      </MenuItem>
    </>
  );
};

export default RackTypeSelector;