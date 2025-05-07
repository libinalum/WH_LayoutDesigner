import { FC, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Rack } from '../store/layoutStore';

interface RackConfigPanelProps {
  rack: Rack;
  onUpdate: (id: string, updates: Partial<Rack>) => void;
  onDelete: (id: string) => void;
}

const RackConfigPanel: FC<RackConfigPanelProps> = ({ rack, onUpdate, onDelete }) => {
  const [rackType, setRackType] = useState<string>('');
  const [beamLevels, setBeamLevels] = useState<number>(3);
  const [beamElevations, setBeamElevations] = useState<number[]>([]);
  const [firstBeamHeight, setFirstBeamHeight] = useState<number>(6);
  const [beamSpacing, setBeamSpacing] = useState<number>(6);
  const [rackHeight, setRackHeight] = useState<number>(20);
  const [rackLength, setRackLength] = useState<number>(96);
  const [rackDepth, setRackDepth] = useState<number>(48);
  const [bayCount, setBayCount] = useState<number>(3);
  const [bayWidth, setBayWidth] = useState<number>(32);
  
  // Initialize state from rack
  useEffect(() => {
    if (rack) {
      setRackType(rack.rack_type_id);
      setRackHeight(rack.height);
      setRackLength(rack.length);
      setRackDepth(rack.depth);
      setBayCount(rack.bays);
      setBayWidth(rack.length / rack.bays);
      
      // Configuration
      if (rack.configuration) {
        setBeamLevels(rack.configuration.beam_levels || 3);
        setFirstBeamHeight(rack.configuration.first_beam_height || 6);
        setBeamSpacing(rack.configuration.beam_height || 6);
        
        // Beam elevations
        if (rack.configuration.beam_elevations) {
          setBeamElevations(rack.configuration.beam_elevations);
        } else {
          // Generate default beam elevations
          const elevations = [0];
          for (let i = 1; i <= beamLevels; i++) {
            elevations.push(firstBeamHeight + (i - 1) * beamSpacing);
          }
          setBeamElevations(elevations);
        }
      }
    }
  }, [rack]);
  
  // Update rack when configuration changes
  const handleUpdateRack = () => {
    // Calculate beam elevations if not explicitly set
    let updatedElevations = beamElevations;
    if (beamElevations.length !== beamLevels + 1) {
      updatedElevations = [0];
      for (let i = 1; i <= beamLevels; i++) {
        updatedElevations.push(firstBeamHeight + (i - 1) * beamSpacing);
      }
    }
    
    // Calculate bay width based on rack length and bay count
    const calculatedBayWidth = rackLength / bayCount;
    
    const updatedRack: Partial<Rack> = {
      rack_type_id: rackType,
      height: rackHeight,
      length: rackLength,
      depth: rackDepth,
      bays: bayCount,
      configuration: {
        ...rack.configuration,
        beam_levels: beamLevels,
        first_beam_height: firstBeamHeight,
        beam_height: beamSpacing,
        beam_elevations: updatedElevations,
        bay_width: calculatedBayWidth
      }
    };
    
    onUpdate(rack.id, updatedRack);
  };
  
  // Handle beam level change
  const handleBeamLevelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBeamLevels = parseInt(event.target.value);
    setBeamLevels(newBeamLevels);
    
    // Update beam elevations
    const newElevations = [0];
    for (let i = 1; i <= newBeamLevels; i++) {
      newElevations.push(firstBeamHeight + (i - 1) * beamSpacing);
    }
    setBeamElevations(newElevations);
  };
  
  // Handle first beam height change
  const handleFirstBeamHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFirstBeamHeight = parseFloat(event.target.value);
    setFirstBeamHeight(newFirstBeamHeight);
    
    // Update beam elevations
    const newElevations = [0];
    for (let i = 1; i <= beamLevels; i++) {
      newElevations.push(newFirstBeamHeight + (i - 1) * beamSpacing);
    }
    setBeamElevations(newElevations);
  };
  
  // Handle beam spacing change
  const handleBeamSpacingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBeamSpacing = parseFloat(event.target.value);
    setBeamSpacing(newBeamSpacing);
    
    // Update beam elevations
    const newElevations = [0];
    for (let i = 1; i <= beamLevels; i++) {
      newElevations.push(firstBeamHeight + (i - 1) * newBeamSpacing);
    }
    setBeamElevations(newElevations);
  };
  
  // Handle bay count change
  const handleBayCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBayCount = parseInt(event.target.value);
    setBayCount(newBayCount);
    setBayWidth(rackLength / newBayCount);
  };
  
  // Handle rack length change
  const handleRackLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRackLength = parseFloat(event.target.value);
    setRackLength(newRackLength);
    setBayWidth(newRackLength / bayCount);
  };
  
  // Get rack type name
  const getRackTypeName = (typeId: string) => {
    const rackTypes: Record<string, string> = {
      'selective': 'Selective Rack',
      'drive-in': 'Drive-In Rack',
      'push-back': 'Push-Back Rack',
      'pallet-flow': 'Pallet Flow Rack',
      'cantilever': 'Cantilever Rack',
      'carton-flow': 'Carton Flow Rack',
      'mobile': 'Mobile Rack'
    };
    
    return rackTypes[typeId] || typeId;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rack Configuration
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {/* Rack Type */}
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Rack Type</InputLabel>
            <Select
              value={rackType}
              label="Rack Type"
              onChange={(e) => setRackType(e.target.value)}
            >
              <MenuItem value="selective">Selective Rack</MenuItem>
              <MenuItem value="drive-in">Drive-In Rack</MenuItem>
              <MenuItem value="push-back">Push-Back Rack</MenuItem>
              <MenuItem value="pallet-flow">Pallet Flow Rack</MenuItem>
              <MenuItem value="cantilever">Cantilever Rack</MenuItem>
              <MenuItem value="carton-flow">Carton Flow Rack</MenuItem>
              <MenuItem value="mobile">Mobile Rack</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Dimensions */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Dimensions
          </Typography>
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Height (ft)"
            type="number"
            value={rackHeight}
            onChange={(e) => setRackHeight(parseFloat(e.target.value))}
            size="small"
            InputProps={{ inputProps: { min: 1, step: 0.5 } }}
          />
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Length (ft)"
            type="number"
            value={rackLength}
            onChange={handleRackLengthChange}
            size="small"
            InputProps={{ inputProps: { min: 1, step: 0.5 } }}
          />
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Depth (ft)"
            type="number"
            value={rackDepth}
            onChange={(e) => setRackDepth(parseFloat(e.target.value))}
            size="small"
            InputProps={{ inputProps: { min: 1, step: 0.5 } }}
          />
        </Grid>
        
        {/* Bay Configuration */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Bay Configuration
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Number of Bays"
            type="number"
            value={bayCount}
            onChange={handleBayCountChange}
            size="small"
            InputProps={{ inputProps: { min: 1, max: 20, step: 1 } }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Bay Width (ft)"
            type="number"
            value={bayWidth.toFixed(2)}
            disabled
            size="small"
          />
        </Grid>
        
        {/* Beam Configuration */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Beam Configuration
          </Typography>
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Beam Levels"
            type="number"
            value={beamLevels}
            onChange={handleBeamLevelsChange}
            size="small"
            InputProps={{ inputProps: { min: 1, max: 10, step: 1 } }}
          />
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="First Beam (ft)"
            type="number"
            value={firstBeamHeight}
            onChange={handleFirstBeamHeightChange}
            size="small"
            InputProps={{ inputProps: { min: 0, step: 0.5 } }}
          />
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Beam Spacing (ft)"
            type="number"
            value={beamSpacing}
            onChange={handleBeamSpacingChange}
            size="small"
            InputProps={{ inputProps: { min: 1, step: 0.5 } }}
          />
        </Grid>
        
        {/* Beam Elevations */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Beam Elevations (ft)
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflow: 'auto' }}>
            <List dense>
              {beamElevations.map((elevation, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`Level ${index}: ${elevation.toFixed(2)} ft`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(rack.id)}
            >
              Delete Rack
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateRack}
            >
              Update Rack
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RackConfigPanel;