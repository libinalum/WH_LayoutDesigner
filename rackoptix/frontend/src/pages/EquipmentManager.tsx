import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  CardMedia,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import useEquipmentStore from '../store/equipmentStore';
import useLayoutStore from '../store/layoutStore';
import EquipmentForm from '../components/equipment/EquipmentForm';
import EquipmentTypeForm from '../components/equipment/EquipmentTypeForm';
import CompatibilityChecker from '../components/equipment/CompatibilityChecker';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `equipment-tab-${index}`,
    'aria-controls': `equipment-tabpanel-${index}`,
  };
}

const EquipmentManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [compatibilityCheckerOpen, setCompatibilityCheckerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  
  const { 
    equipment, 
    equipmentTypes, 
    selectedEquipment, 
    isLoading, 
    error,
    fetchEquipment,
    fetchEquipmentTypes,
    selectEquipment,
    deleteEquipment
  } = useEquipmentStore();

  const { currentLayout } = useLayoutStore();

  useEffect(() => {
    fetchEquipment();
    fetchEquipmentTypes();
  }, [fetchEquipment, fetchEquipmentTypes]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddEquipment = () => {
    selectEquipment(null);
    setEquipmentFormOpen(true);
  };

  const handleEditEquipment = (id: string) => {
    selectEquipment(id);
    setEquipmentFormOpen(true);
  };

  const handleEquipmentFormClose = () => {
    setEquipmentFormOpen(false);
  };

  const handleAddType = () => {
    setTypeFormOpen(true);
  };

  const handleTypeFormClose = () => {
    setTypeFormOpen(false);
  };

  const handleOpenCompatibilityChecker = () => {
    setCompatibilityCheckerOpen(true);
  };

  const handleCloseCompatibilityChecker = () => {
    setCompatibilityCheckerOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setEquipmentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (equipmentToDelete) {
      await deleteEquipment(equipmentToDelete);
      setDeleteConfirmOpen(false);
      setEquipmentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEquipmentToDelete(null);
  };

  const getEquipmentTypeName = (typeId: string) => {
    const type = equipmentTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Equipment Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleOpenCompatibilityChecker}
            sx={{ mr: 1 }}
            disabled={!currentLayout}
          >
            Check Compatibility
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleAddType}
            sx={{ mr: 1 }}
          >
            Add Equipment Type
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddEquipment}
          >
            Add Equipment
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Equipment" {...a11yProps(0)} />
          <Tab label="Equipment Types" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {equipment.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://source.unsplash.com/random/300x200/?forklift&sig=${item.id}`}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.name}
                    </Typography>
                    <Chip 
                      label={getEquipmentTypeName(item.type_id)} 
                      size="small" 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Reach Height: {item.reach_height} ft
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Aisle Width: {item.min_aisle_width}-{item.max_aisle_width} ft
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Turning Radius: {item.turning_radius} ft
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lift Capacity: {item.lift_capacity} lbs
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleEditEquipment(item.id)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteClick(item.id)}>Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {equipmentTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {type.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Edit</Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Equipment Form Dialog */}
      <Dialog 
        open={equipmentFormOpen} 
        onClose={handleEquipmentFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        </DialogTitle>
        <DialogContent>
          <EquipmentForm 
            equipment={selectedEquipment} 
            equipmentTypes={equipmentTypes}
            onClose={handleEquipmentFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Type Form Dialog */}
      <Dialog 
        open={typeFormOpen} 
        onClose={handleTypeFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Equipment Type</DialogTitle>
        <DialogContent>
          <EquipmentTypeForm onClose={handleTypeFormClose} />
        </DialogContent>
      </Dialog>

      {/* Compatibility Checker Dialog */}
      <Dialog 
        open={compatibilityCheckerOpen} 
        onClose={handleCloseCompatibilityChecker}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Equipment-Rack Compatibility</DialogTitle>
        <DialogContent>
          <CompatibilityChecker 
            equipment={equipment}
            onClose={handleCloseCompatibilityChecker}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this equipment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentManager;