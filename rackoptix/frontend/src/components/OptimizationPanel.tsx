import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Slider,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import { Layout, Rack } from '../store/layoutStore';

interface OptimizationPanelProps {
  layout: Layout | null;
  onRunOptimization: (type: string, params: any) => Promise<any>;
  isOptimizing: boolean;
}

const OptimizationPanel: FC<OptimizationPanelProps> = ({ 
  layout, 
  onRunOptimization,
  isOptimizing
}) => {
  const [optimizationType, setOptimizationType] = useState<string>('elevation');
  const [selectedRackId, setSelectedRackId] = useState<string>('');
  const [minClearance, setMinClearance] = useState<number>(6);
  const [maxLevels, setMaxLevels] = useState<number>(4);
  const [minBeamSpacing, setMinBeamSpacing] = useState<number>(12);
  const [aisleWidth, setAisleWidth] = useState<number>(10);
  const [equipmentType, setEquipmentType] = useState<string>('forklift');
  const [velocityWeighting, setVelocityWeighting] = useState<number>(70);
  const [accessibilityWeighting, setAccessibilityWeighting] = useState<number>(30);
  const [optimizeForDensity, setOptimizeForDensity] = useState<boolean>(true);
  const [optimizeForAccessibility, setOptimizeForAccessibility] = useState<boolean>(true);
  const [optimizeForThroughput, setOptimizeForThroughput] = useState<boolean>(false);
  
  // Handle optimization type change
  const handleOptimizationTypeChange = (event: any) => {
    setOptimizationType(event.target.value);
  };
  
  // Handle rack selection change
  const handleRackSelectionChange = (event: any) => {
    setSelectedRackId(event.target.value);
  };
  
  // Handle run optimization
  const handleRunOptimization = async () => {
    let params: any = {};
    
    switch (optimizationType) {
      case 'elevation':
        params = {
          rack_id: selectedRackId,
          constraints: {
            min_clearance: minClearance,
            min_beam_spacing: minBeamSpacing,
            max_levels: maxLevels
          }
        };
        break;
        
      case 'aisle':
        params = {
          equipment_type: equipmentType,
          min_aisle_width: aisleWidth,
          optimize_for_density: optimizeForDensity,
          optimize_for_accessibility: optimizeForAccessibility
        };
        break;
        
      case 'slotting':
        params = {
          velocity_weighting: velocityWeighting / 100,
          accessibility_weighting: accessibilityWeighting / 100,
          optimize_for_throughput: optimizeForThroughput
        };
        break;
        
      case 'layout':
        params = {
          optimize_for_density: optimizeForDensity,
          optimize_for_accessibility: optimizeForAccessibility,
          optimize_for_throughput: optimizeForThroughput
        };
        break;
    }
    
    await onRunOptimization(optimizationType, params);
  };
  
  if (!layout) {
    return (
      <Typography variant="body1">
        Select a layout to run optimization
      </Typography>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Layout Optimization
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Optimization Type</InputLabel>
        <Select
          value={optimizationType}
          label="Optimization Type"
          onChange={handleOptimizationTypeChange}
        >
          <MenuItem value="elevation">Beam Elevation Optimization</MenuItem>
          <MenuItem value="aisle">Aisle Width Optimization</MenuItem>
          <MenuItem value="slotting">SKU Slotting Optimization</MenuItem>
          <MenuItem value="layout">Overall Layout Optimization</MenuItem>
        </Select>
      </FormControl>
      
      {/* Elevation Optimization */}
      {optimizationType === 'elevation' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Beam Elevation Optimization
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Optimizes the beam heights in a rack to maximize storage capacity while ensuring proper clearance for products.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Rack</InputLabel>
            <Select
              value={selectedRackId}
              label="Select Rack"
              onChange={handleRackSelectionChange}
            >
              {layout.racks.map((rack: Rack) => (
                <MenuItem key={rack.id} value={rack.id}>
                  {`Rack ${rack.id.split('-')[1]} (${rack.rack_type_id})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min Clearance (in)"
                type="number"
                value={minClearance}
                onChange={(e) => setMinClearance(Number(e.target.value))}
                size="small"
                InputProps={{ inputProps: { min: 0, step: 1 } }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min Beam Spacing (in)"
                type="number"
                value={minBeamSpacing}
                onChange={(e) => setMinBeamSpacing(Number(e.target.value))}
                size="small"
                InputProps={{ inputProps: { min: 0, step: 1 } }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Max Levels"
                type="number"
                value={maxLevels}
                onChange={(e) => setMaxLevels(Number(e.target.value))}
                size="small"
                InputProps={{ inputProps: { min: 1, max: 10, step: 1 } }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Aisle Optimization */}
      {optimizationType === 'aisle' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Aisle Width Optimization
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Optimizes aisle widths based on equipment specifications and operational requirements.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Equipment Type</InputLabel>
            <Select
              value={equipmentType}
              label="Equipment Type"
              onChange={(e) => setEquipmentType(e.target.value as string)}
            >
              <MenuItem value="forklift">Counterbalance Forklift</MenuItem>
              <MenuItem value="reach">Reach Truck</MenuItem>
              <MenuItem value="narrow">Narrow Aisle Truck</MenuItem>
              <MenuItem value="vna">Very Narrow Aisle Truck</MenuItem>
              <MenuItem value="agv">Automated Guided Vehicle</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Minimum Aisle Width (ft)
            </Typography>
            <Slider
              value={aisleWidth}
              onChange={(_, newValue) => setAisleWidth(newValue as number)}
              min={6}
              max={16}
              step={0.5}
              marks={[
                { value: 6, label: '6 ft' },
                { value: 10, label: '10 ft' },
                { value: 16, label: '16 ft' }
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForDensity}
                  onChange={(e) => setOptimizeForDensity(e.target.checked)}
                />
              }
              label="Optimize for Storage Density"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForAccessibility}
                  onChange={(e) => setOptimizeForAccessibility(e.target.checked)}
                />
              }
              label="Optimize for Accessibility"
            />
          </Box>
        </Paper>
      )}
      
      {/* SKU Slotting Optimization */}
      {optimizationType === 'slotting' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            SKU Slotting Optimization
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Optimizes the placement of products within the storage locations based on velocity and dimensions.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Velocity vs. Accessibility Weighting
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs>
                <Slider
                  value={velocityWeighting}
                  onChange={(_, newValue) => {
                    setVelocityWeighting(newValue as number);
                    setAccessibilityWeighting(100 - (newValue as number));
                  }}
                  min={0}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  {velocityWeighting}% / {accessibilityWeighting}%
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Velocity vs. Accessibility Weighting
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForThroughput}
                  onChange={(e) => setOptimizeForThroughput(e.target.checked)}
                />
              }
              label="Optimize for Throughput"
            />
            
            <Tooltip title="Prioritizes throughput over storage density">
              <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
            </Tooltip>
          </Box>
        </Paper>
      )}
      
      {/* Layout Optimization */}
      {optimizationType === 'layout' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Layout Optimization
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Optimizes the entire layout considering all aspects: rack placement, aisle widths, and beam elevations.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Optimization Goals
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForDensity}
                  onChange={(e) => setOptimizeForDensity(e.target.checked)}
                />
              }
              label="Optimize for Storage Density"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForAccessibility}
                  onChange={(e) => setOptimizeForAccessibility(e.target.checked)}
                />
              }
              label="Optimize for Accessibility"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={optimizeForThroughput}
                  onChange={(e) => setOptimizeForThroughput(e.target.checked)}
                />
              }
              label="Optimize for Throughput"
            />
          </Box>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Advanced Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Clearance (in)"
                    type="number"
                    value={minClearance}
                    onChange={(e) => setMinClearance(Number(e.target.value))}
                    size="small"
                    InputProps={{ inputProps: { min: 0, step: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Beam Spacing (in)"
                    type="number"
                    value={minBeamSpacing}
                    onChange={(e) => setMinBeamSpacing(Number(e.target.value))}
                    size="small"
                    InputProps={{ inputProps: { min: 0, step: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Levels"
                    type="number"
                    value={maxLevels}
                    onChange={(e) => setMaxLevels(Number(e.target.value))}
                    size="small"
                    InputProps={{ inputProps: { min: 1, max: 10, step: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Equipment Type</InputLabel>
                    <Select
                      value={equipmentType}
                      label="Equipment Type"
                      onChange={(e) => setEquipmentType(e.target.value as string)}
                    >
                      <MenuItem value="forklift">Counterbalance Forklift</MenuItem>
                      <MenuItem value="reach">Reach Truck</MenuItem>
                      <MenuItem value="narrow">Narrow Aisle Truck</MenuItem>
                      <MenuItem value="vna">Very Narrow Aisle Truck</MenuItem>
                      <MenuItem value="agv">Automated Guided Vehicle</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}
      
      <Button
        variant="contained"
        color="primary"
        startIcon={isOptimizing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
        onClick={handleRunOptimization}
        disabled={isOptimizing || 
          (optimizationType === 'elevation' && !selectedRackId) ||
          layout.racks.length === 0}
        fullWidth
      >
        {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
      </Button>
    </Box>
  );
};

export default OptimizationPanel;