import { FC, useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate, useParams } from 'react-router-dom';
import useFacilityStore from '../store/facilityStore';
import useLayoutStore from '../store/layoutStore';
import FacilityViewer3D from '../components/FacilityViewer3D';
import RackConfigPanel from '../components/RackConfigPanel';
import RackTypeSelector from '../components/RackTypeSelector';
import OptimizationPanel from '../components/OptimizationPanel';
import MetricsPanel from '../components/MetricsPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`layout-tabpanel-${index}`}
      aria-labelledby={`layout-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 1, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const LayoutOptimizer: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Stores
  const { currentFacility, fetchFacilityById } = useFacilityStore();
  const { 
    currentLayout, 
    layouts, 
    fetchLayouts, 
    fetchLayoutById, 
    createLayout, 
    updateLayout,
    deleteLayout,
    isLoading,
    error,
    selectedRack,
    selectRack,
    addRack,
    updateRack,
    deleteRack,
    runOptimization
  } = useLayoutStore();
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [drawingMode, setDrawingMode] = useState<string>('select');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [is3DView, setIs3DView] = useState(true);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  
  // Load facility and layouts
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        await fetchFacilityById(id);
        await fetchLayouts(id);
      }
    };
    
    loadData();
  }, [id, fetchFacilityById, fetchLayouts]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle drawing mode change
  const handleDrawingModeChange = (event: SelectChangeEvent) => {
    setDrawingMode(event.target.value);
  };
  
  // Handle rack selection
  const handleRackSelect = (rackId: string) => {
    selectRack(rackId);
  };
  
  // Handle rack deletion
  const handleRackDelete = (rackId: string) => {
    if (window.confirm('Are you sure you want to delete this rack?')) {
      deleteRack(rackId);
      showMessage('Rack deleted successfully', 'success');
    }
  };
  
  // Handle rack placement
  const handleRackPlacement = (position: { x: number, y: number, rotation: number }) => {
    if (!currentLayout) return;
    
    // Create a new rack based on the drawing mode (rack type)
    const newRack = {
      layout_id: currentLayout.id,
      rack_type_id: drawingMode,
      location: {
        type: 'Polygon',
        coordinates: [[
          [position.x - 48, position.y - 24],
          [position.x + 48, position.y - 24],
          [position.x + 48, position.y + 24],
          [position.x - 48, position.y + 24],
          [position.x - 48, position.y - 24]
        ]]
      },
      orientation: position.rotation,
      height: 20,
      length: 96,
      depth: 48,
      bays: 3,
      configuration: {
        beam_levels: 3,
        beam_height: 6,
        first_beam_height: 6,
        aisle_width: 10
      }
    };
    
    addRack(newRack);
    showMessage('Rack added successfully', 'success');
  };
  
  // Handle rack update
  const handleRackUpdate = (rackId: string, updates: any) => {
    updateRack(rackId, updates);
    showMessage('Rack updated successfully', 'success');
  };
  
  // Handle layout creation
  const handleCreateLayout = async () => {
    if (!currentFacility) return;
    
    const newLayout = {
      facility_id: currentFacility.id!,
      name: `Layout ${layouts.length + 1}`,
      description: 'New layout',
      status: 'draft',
      parameters: {},
      metrics: {}
    };
    
    await createLayout(newLayout);
    showMessage('Layout created successfully', 'success');
  };
  
  // Handle layout save
  const handleSaveLayout = async () => {
    if (!currentLayout) return;
    
    await updateLayout(currentLayout);
    showMessage('Layout saved successfully', 'success');
  };
  
  // Handle optimization
  const handleRunOptimization = async (optimizationType: string, params: any) => {
    if (!currentLayout) return;
    
    setOptimizationInProgress(true);
    
    try {
      await runOptimization(currentLayout.id, optimizationType, params);
      showMessage('Optimization completed successfully', 'success');
    } catch (error) {
      console.error('Optimization error:', error);
      showMessage('Optimization failed', 'error');
    } finally {
      setOptimizationInProgress(false);
    }
  };
  
  // Show snackbar message
  const showMessage = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };
  
  // Toggle 2D/3D view
  const handleToggleView = () => {
    setIs3DView(!is3DView);
  };
  
  if (!currentFacility) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Layout Optimizer
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateLayout}
            sx={{ mr: 1 }}
          >
            New Layout
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveLayout}
            disabled={!currentLayout}
          >
            Save Layout
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left side - Layout selection and tools */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Layouts
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ mb: 2, overflow: 'auto' }}>
                {layouts.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No layouts found" secondary="Create a new layout to get started" />
                  </ListItem>
                ) : (
                  layouts.map(layout => (
                    <ListItem
                      key={layout.id}
                      button
                      selected={currentLayout?.id === layout.id}
                      onClick={() => fetchLayoutById(layout.id)}
                    >
                      <ListItemText
                        primary={layout.name}
                        secondary={`Status: ${layout.status}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => deleteLayout(layout.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            )}
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Rack Tools
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Drawing Mode</InputLabel>
              <Select
                value={drawingMode}
                label="Drawing Mode"
                onChange={handleDrawingModeChange}
              >
                <MenuItem value="select">Select</MenuItem>
                <RackTypeSelector />
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Tooltip title="Rotate Rack">
                <IconButton>
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Copy Rack">
                <IconButton>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Selected">
                <IconButton color="error" disabled={!selectedRack}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CompareArrowsIcon />}
              onClick={handleToggleView}
              sx={{ mb: 2 }}
            >
              Toggle {is3DView ? '2D' : '3D'} View
            </Button>
            
            <Box sx={{ flex: 1 }} />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => setTabValue(2)}
              disabled={!currentLayout || currentLayout.racks.length === 0}
              sx={{ mt: 2 }}
            >
              Run Optimization
            </Button>
          </Paper>
        </Grid>
        
        {/* Center - Visualization */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              height: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="layout tabs">
                <Tab label="Layout" id="layout-tab-0" />
                <Tab label="Configuration" id="layout-tab-1" />
                <Tab label="Optimization" id="layout-tab-2" />
                <Tab label="Metrics" id="layout-tab-3" />
              </Tabs>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value={tabValue} index={0}>
                {currentLayout ? (
                  is3DView ? (
                    <FacilityViewer3D
                      facility={currentFacility}
                      layout={currentLayout}
                      width={600}
                      height={600}
                      onRackSelect={handleRackSelect}
                      onRackPlace={handleRackPlacement}
                      drawingMode={drawingMode}
                    />
                  ) : (
                    <Typography variant="body1">
                      2D view coming soon...
                    </Typography>
                  )
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1">
                      Select or create a layout to get started
                    </Typography>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                {selectedRack ? (
                  <RackConfigPanel
                    rack={selectedRack}
                    onUpdate={handleRackUpdate}
                    onDelete={() => handleRackDelete(selectedRack.id)}
                  />
                ) : (
                  <Typography variant="body1">
                    Select a rack to configure
                  </Typography>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <OptimizationPanel
                  layout={currentLayout}
                  onRunOptimization={handleRunOptimization}
                  isOptimizing={optimizationInProgress}
                />
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <MetricsPanel layout={currentLayout} />
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right side - Properties */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '80vh' }}>
            <Typography variant="h6" gutterBottom>
              {currentLayout ? currentLayout.name : 'Layout Properties'}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {currentLayout ? (
              <>
                <TextField
                  fullWidth
                  label="Layout Name"
                  value={currentLayout.name}
                  onChange={(e) => updateLayout({ ...currentLayout, name: e.target.value })}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  value={currentLayout.description}
                  onChange={(e) => updateLayout({ ...currentLayout, description: e.target.value })}
                  margin="normal"
                  size="small"
                  multiline
                  rows={2}
                />
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={currentLayout.status}
                    label="Status"
                    onChange={(e) => updateLayout({ ...currentLayout, status: e.target.value })}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Layout Statistics
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Racks: {currentLayout.racks.length}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pallet Positions: {currentLayout.metrics?.pallet_positions || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Storage Density: {currentLayout.metrics?.storage_density ? 
                      `${(currentLayout.metrics.storage_density * 100).toFixed(1)}%` : 
                      'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Space Utilization: {currentLayout.metrics?.space_utilization ? 
                      `${(currentLayout.metrics.space_utilization * 100).toFixed(1)}%` : 
                      'N/A'}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select or create a layout to view properties
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LayoutOptimizer;