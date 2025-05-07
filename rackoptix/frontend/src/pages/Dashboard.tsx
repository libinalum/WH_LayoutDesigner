import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import ForkliftIcon from '@mui/icons-material/Forklift';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AssessmentIcon from '@mui/icons-material/Assessment';

import useProjectStore from '../store/projectStore';
import useFacilityStore from '../store/facilityStore';
import { formatDate } from '../utils/formatters';
import { Project } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, createProjectFromTemplate, deleteProject } = useProjectStore();
  const { facilities, fetchFacilities } = useFacilityStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchFacilities()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchProjects, fetchFacilities]);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  const handleOpenProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };
  
  const handleEditProject = () => {
    if (selectedProject) {
      navigate(`/projects/${selectedProject.id}/edit`);
    }
    handleCloseMenu();
  };
  
  const handleDeleteProject = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id);
    }
    handleCloseMenu();
  };
  
  const handleOpenNewProjectDialog = () => {
    setNewProjectDialogOpen(true);
  };
  
  const handleCloseNewProjectDialog = () => {
    setNewProjectDialogOpen(false);
    setNewProjectName('');
    setNewProjectDescription('');
    setSelectedTemplate('');
    setSelectedFacility('');
  };
  
  const handleTemplateChange = (event: SelectChangeEvent) => {
    setSelectedTemplate(event.target.value);
  };
  
  const handleFacilityChange = (event: SelectChangeEvent) => {
    setSelectedFacility(event.target.value);
  };
  
  const handleCreateProject = async () => {
    if (newProjectName.trim() === '') return;
    
    try {
      if (selectedTemplate) {
        await createProjectFromTemplate(selectedTemplate, newProjectName);
      } else {
        await createProject({
          name: newProjectName,
          description: newProjectDescription,
          status: 'active',
          facilityId: selectedFacility || undefined,
          owner: 'current-user'
        });
      }
      
      handleCloseNewProjectDialog();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };
  
  const getProjectIcon = (project: Project) => {
    if (project.tags?.includes('distribution')) {
      return <WarehouseIcon fontSize="large" />;
    } else if (project.tags?.includes('fulfillment')) {
      return <InventoryIcon fontSize="large" />;
    } else if (project.tags?.includes('expansion')) {
      return <ViewInArIcon fontSize="large" />;
    } else {
      return <FolderIcon fontSize="large" />;
    }
  };
  
  const renderProjectCard = (project: Project) => (
    <Card 
      key={project.id} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea onClick={() => handleOpenProject(project)} sx={{ flexGrow: 1 }}>
        {project.thumbnail ? (
          <CardMedia
            component="img"
            height="140"
            image={project.thumbnail}
            alt={project.name}
          />
        ) : (
          <Box 
            sx={{ 
              height: 140, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'action.hover'
            }}
          >
            {getProjectIcon(project)}
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography gutterBottom variant="h6" component="div" noWrap>
              {project.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                handleOpenMenu(e, project);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {project.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {project.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Updated {formatDate(project.updatedAt, 'relative')}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Chip 
          label={project.status} 
          size="small"
          color={
            project.status === 'active' ? 'primary' : 
            project.status === 'completed' ? 'success' : 
            'default'
          }
        />
        <Box>
          {project.metrics && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                navigate(`/projects/${project.id}/reports`);
              }}
            >
              <AssessmentIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Card>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenNewProjectDialog}
        >
          New Project
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Projects
        </Typography>
        {isLoading ? (
          <Typography>Loading projects...</Typography>
        ) : projects.length === 0 ? (
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'background.paper',
              borderRadius: 1
            }}
          >
            <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first project to get started
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenNewProjectDialog}
            >
              Create Project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project: Project) => (
              <Grid item key={project.id} xs={12} sm={6} md={4} lg={3}>
                {renderProjectCard(project)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Project actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEditProject}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteProject}>Delete</MenuItem>
      </Menu>
      
      {/* New project dialog */}
      <Dialog 
        open={newProjectDialogOpen} 
        onClose={handleCloseNewProjectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProjectDescription}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Template (Optional)</InputLabel>
            <Select
              value={selectedTemplate}
              label="Template (Optional)"
              onChange={handleTemplateChange}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="distribution-center">Distribution Center</MenuItem>
              <MenuItem value="fulfillment-center">Fulfillment Center</MenuItem>
              <MenuItem value="cold-storage">Cold Storage</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Facility (Optional)</InputLabel>
            <Select
              value={selectedFacility}
              label="Facility (Optional)"
              onChange={handleFacilityChange}
            >
              <MenuItem value="">None</MenuItem>
              {facilities.map((facility: any) => (
                <MenuItem key={facility.id} value={facility.id?.toString() || ''}>
                  {facility.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewProjectDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={newProjectName.trim() === ''}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;