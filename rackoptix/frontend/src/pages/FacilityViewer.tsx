import { FC, useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  Divider,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import useFacilityStore from '../store/facilityStore';
import FacilityViewer3D from '../components/FacilityViewer3D';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 1, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const FacilityViewer: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentFacility, fetchFacilityById } = useFacilityStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const loadFacility = async () => {
      if (id) {
        try {
          await fetchFacilityById(id);
        } catch (error) {
          console.error('Error loading facility:', error);
        }
      }
      setLoading(false);
    };
    
    loadFacility();
  }, [id, fetchFacilityById]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleBackToEditor = () => {
    navigate('/facility');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentFacility) {
    return (
      <Box>
        <Typography variant="h5" color="error" gutterBottom>
          Facility not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToEditor}
        >
          Back to Editor
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          {currentFacility.name}
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToEditor}
            sx={{ mr: 1 }}
          >
            Back to Editor
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={handleBackToEditor}
          >
            Edit Facility
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: 600, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="viewer tabs">
                <Tab label="3D View" id="tab-0" />
                <Tab label="2D View" id="tab-1" />
                <Tab label="Metrics" id="tab-2" />
              </Tabs>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value={tabValue} index={0}>
                <FacilityViewer3D facility={currentFacility} width={750} height={500} />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="body1">
                  2D view coming soon...
                </Typography>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="body1">
                  Facility metrics coming soon...
                </Typography>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Facility Details
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Clear Height
              </Typography>
              <Typography variant="body1">
                {currentFacility.clear_height} ft
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Area
              </Typography>
              <Typography variant="body1">
                {currentFacility.metadata?.square_footage || 'Not specified'} sq ft
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Obstructions
              </Typography>
              <Typography variant="body1">
                {currentFacility.obstructions?.length || 0} total
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Zones
              </Typography>
              <Typography variant="body1">
                {currentFacility.metadata?.zones?.length || 0} total
              </Typography>
            </Box>
            
            {currentFacility.metadata?.address && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">
                  Address
                </Typography>
                <Typography variant="body1">
                  {currentFacility.metadata.address}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FacilityViewer;