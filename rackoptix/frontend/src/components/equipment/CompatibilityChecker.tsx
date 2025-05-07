import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import useEquipmentStore, { Equipment } from '../../store/equipmentStore';
import useLayoutStore from '../../store/layoutStore';

interface CompatibilityCheckerProps {
  equipment: Equipment[];
  onClose: () => void;
}

const CompatibilityChecker = ({ equipment, onClose }: CompatibilityCheckerProps) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [selectedRackId, setSelectedRackId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    compatible: boolean;
    issues: string[];
  } | null>(null);
  
  const { checkRackCompatibility } = useEquipmentStore();
  const { currentLayout } = useLayoutStore();

  const handleEquipmentChange = (event: any) => {
    setSelectedEquipmentId(event.target.value);
    setResult(null);
  };

  const handleRackChange = (event: any) => {
    setSelectedRackId(event.target.value);
    setResult(null);
  };

  const handleCheck = async () => {
    if (!selectedEquipmentId || !selectedRackId) {
      return;
    }
    
    setIsChecking(true);
    setError(null);
    setResult(null);
    
    try {
      const compatibilityResult = await checkRackCompatibility(selectedEquipmentId, selectedRackId);
      setResult(compatibilityResult);
    } catch (error) {
      console.error('Error checking compatibility:', error);
      setError('Failed to check compatibility. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getSelectedEquipment = () => {
    return equipment.find(e => e.id === selectedEquipmentId);
  };

  const getSelectedRack = () => {
    if (!currentLayout) return null;
    return currentLayout.racks.find(r => r.id === selectedRackId);
  };

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="body1" gutterBottom>
        Check if equipment is compatible with a specific rack in the current layout.
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="equipment-select-label">Equipment</InputLabel>
            <Select
              labelId="equipment-select-label"
              value={selectedEquipmentId}
              onChange={handleEquipmentChange}
              label="Equipment"
            >
              <MenuItem value="">
                <em>Select equipment</em>
              </MenuItem>
              {equipment.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="rack-select-label">Rack</InputLabel>
            <Select
              labelId="rack-select-label"
              value={selectedRackId}
              onChange={handleRackChange}
              label="Rack"
              disabled={!currentLayout}
            >
              <MenuItem value="">
                <em>Select rack</em>
              </MenuItem>
              {currentLayout?.racks.map((rack) => (
                <MenuItem key={rack.id} value={rack.id}>
                  {`Rack ${rack.id.split('-')[1]} (${rack.rack_type_id})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleCheck}
          disabled={isChecking || !selectedEquipmentId || !selectedRackId}
        >
          {isChecking ? <CircularProgress size={24} /> : 'Check Compatibility'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Compatibility Result
            </Typography>
            <Chip 
              icon={result.compatible ? <CheckCircleIcon /> : <ErrorIcon />}
              label={result.compatible ? 'Compatible' : 'Not Compatible'}
              color={result.compatible ? 'success' : 'error'}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Equipment Specifications
              </Typography>
              
              {getSelectedEquipment() && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Reach Height" 
                      secondary={`${getSelectedEquipment()?.reach_height} ft`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Aisle Width" 
                      secondary={`${getSelectedEquipment()?.min_aisle_width}-${getSelectedEquipment()?.max_aisle_width} ft`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Turning Radius" 
                      secondary={`${getSelectedEquipment()?.turning_radius} ft`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Lift Capacity" 
                      secondary={`${getSelectedEquipment()?.lift_capacity} lbs`} 
                    />
                  </ListItem>
                </List>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Rack Specifications
              </Typography>
              
              {getSelectedRack() && (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Rack Type" 
                      secondary={getSelectedRack()?.rack_type_id} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Height" 
                      secondary={`${getSelectedRack()?.height} ft`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Length" 
                      secondary={`${getSelectedRack()?.length} ft`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Depth" 
                      secondary={`${getSelectedRack()?.depth} ft`} 
                    />
                  </ListItem>
                </List>
              )}
            </Grid>
          </Grid>
          
          {!result.compatible && result.issues.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Compatibility Issues
              </Typography>
              
              <List>
                {result.issues.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={issue} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {result.compatible && (
            <Alert severity="success" sx={{ mt: 2 }}>
              This equipment is fully compatible with the selected rack.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CompatibilityChecker;