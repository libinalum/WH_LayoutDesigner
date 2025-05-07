import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
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
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SpeedIcon from '@mui/icons-material/Speed';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';

import useReportStore from '../store/reportStore';
import useProjectStore from '../store/projectStore';
import useFacilityStore from '../store/facilityStore';
import useLayoutStore from '../store/layoutStore';
import { Report, ReportSection } from '../types';
import { formatDate } from '../utils/formatters';
import { downloadFromDataUrl } from '../utils/exportUtils';
import { 
  addReportSection, 
  removeReportSection, 
  moveReportSection 
} from '../utils/reportUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  const { reports, fetchReports, createReportFromTemplate, deleteReport, currentReport, fetchReportById, updateReport, exportReportToPDF, exportReportToExcel } = useReportStore();
  const { currentProject, fetchProjectById } = useProjectStore();
  const { currentFacility, fetchFacilityById } = useFacilityStore();
  const { currentLayout, fetchLayoutById } = useLayoutStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [newReportDialogOpen, setNewReportDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState<'layout' | 'inventory' | 'optimization' | 'custom'>('layout');
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState<'text' | 'table' | 'chart' | 'image' | 'metrics'>('text');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (projectId) {
        await Promise.all([
          fetchReports(projectId),
          fetchProjectById(projectId)
        ]);
        
        if (currentProject?.facilityId) {
          await fetchFacilityById(currentProject.facilityId);
        }
        
        if (currentProject?.layoutId) {
          await fetchLayoutById(currentProject.layoutId);
        }
      } else {
        await fetchReports();
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [projectId, fetchReports, fetchProjectById, fetchFacilityById, fetchLayoutById, currentProject]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, report: Report) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  const handleViewReport = async (report: Report) => {
    await fetchReportById(report.id);
    setTabValue(1);
  };
  
  const handleEditReport = () => {
    if (selectedReport) {
      fetchReportById(selectedReport.id);
      setEditMode(true);
      setTabValue(1);
    }
    handleCloseMenu();
  };
  
  const handleDeleteReport = async () => {
    if (selectedReport) {
      await deleteReport(selectedReport.id);
    }
    handleCloseMenu();
  };
  
  const handleExportReportToPDF = async () => {
    if (!selectedReport) return;
    
    setIsExporting(true);
    try {
      const url = await exportReportToPDF(selectedReport.id);
      downloadFromDataUrl(url, `${selectedReport.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error exporting report to PDF:', error);
    } finally {
      setIsExporting(false);
      handleCloseMenu();
    }
  };
  
  const handleExportReportToExcel = async () => {
    if (!selectedReport) return;
    
    setIsExporting(true);
    try {
      const url = await exportReportToExcel(selectedReport.id);
      downloadFromDataUrl(url, `${selectedReport.name.replace(/\s+/g, '_')}.xlsx`);
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    } finally {
      setIsExporting(false);
      handleCloseMenu();
    }
  };
  
  const handleOpenNewReportDialog = () => {
    setNewReportDialogOpen(true);
  };
  
  const handleCloseNewReportDialog = () => {
    setNewReportDialogOpen(false);
    setNewReportName('');
    setNewReportType('layout');
  };
  
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setNewReportType(event.target.value as 'layout' | 'inventory' | 'optimization' | 'custom');
  };
  
  const handleCreateReport = async () => {
    if (newReportName.trim() === '' || !projectId) return;
    
    try {
      const report = await createReportFromTemplate(
        newReportType,
        newReportName,
        projectId,
        currentProject?.facilityId,
        currentProject?.layoutId
      );
      
      await fetchReportById(report.id);
      setTabValue(1);
      setEditMode(true);
      handleCloseNewReportDialog();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };
  
  const handleSaveReport = async () => {
    if (!currentReport) return;
    
    try {
      await updateReport(currentReport.id, currentReport);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedReport) {
      fetchReportById(selectedReport.id);
    }
  };
  
  const handleOpenAddSectionDialog = () => {
    setAddSectionDialogOpen(true);
  };
  
  const handleCloseAddSectionDialog = () => {
    setAddSectionDialogOpen(false);
    setNewSectionType('text');
  };
  
  const handleAddSection = () => {
    if (!currentReport) return;
    
    const updatedReport = addReportSection(currentReport, newSectionType);
    updateReport(currentReport.id, updatedReport);
    handleCloseAddSectionDialog();
  };
  
  const handleRemoveSection = (sectionId: string) => {
    if (!currentReport) return;
    
    const updatedReport = removeReportSection(currentReport, sectionId);
    updateReport(currentReport.id, updatedReport);
  };
  
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!currentReport) return;
    
    const updatedReport = moveReportSection(currentReport, sectionId, direction);
    updateReport(currentReport.id, updatedReport);
  };
  
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextFieldsIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'chart':
        return <BarChartIcon />;
      case 'image':
        return <ImageIcon />;
      case 'metrics':
        return <SpeedIcon />;
      default:
        return <TextFieldsIcon />;
    }
  };
  
  const renderReportCard = (report: Report) => (
    <Card 
      key={report.id} 
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
      <CardHeader
        title={report.name}
        subheader={formatDate(report.createdAt, 'medium')}
        action={
          <IconButton 
            aria-label="report menu"
            onClick={(e: React.MouseEvent<HTMLElement>) => handleOpenMenu(e, report)}
          >
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          <Chip 
            label={`${report.config.sections.length} sections`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          {report.facilityId && (
            <Chip 
              label="Facility" 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {report.layoutId && (
            <Chip 
              label="Layout" 
              size="small" 
              color="info" 
              variant="outlined" 
            />
          )}
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button 
          size="small" 
          startIcon={<PictureAsPdfIcon />}
          onClick={() => {
            setSelectedReport(report);
            handleExportReportToPDF();
          }}
        >
          PDF
        </Button>
        <Button 
          size="small" 
          startIcon={<TableChartIcon />}
          onClick={() => {
            setSelectedReport(report);
            handleExportReportToExcel();
          }}
        >
          Excel
        </Button>
        <Button 
          size="small" 
          color="primary"
          onClick={() => handleViewReport(report)}
        >
          View
        </Button>
      </CardActions>
    </Card>
  );
  
  const renderReportSection = (section: ReportSection) => (
    <Card key={section.id} sx={{ mb: 2 }}>
      <CardHeader
        title={section.title || `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section`}
        subheader={section.type.charAt(0).toUpperCase() + section.type.slice(1)}
        avatar={getSectionIcon(section.type)}
        action={
          editMode ? (
            <Box>
              <IconButton 
                size="small" 
                onClick={() => handleMoveSection(section.id, 'up')}
                disabled={currentReport?.config.sections[0].id === section.id}
              >
                <Tooltip title="Move up">
                  <span>↑</span>
                </Tooltip>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleMoveSection(section.id, 'down')}
                disabled={
                  currentReport?.config.sections[
                    (currentReport?.config.sections.length || 0) - 1
                  ].id === section.id
                }
              >
                <Tooltip title="Move down">
                  <span>↓</span>
                </Tooltip>
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleRemoveSection(section.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : null
        }
      />
      <Divider />
      <CardContent>
        {section.type === 'text' && (
          <Typography variant="body1">
            {section.content || 'Text content goes here'}
          </Typography>
        )}
        {section.type === 'table' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Table data would be displayed here
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TableChartIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
              </Box>
            </Paper>
          </Box>
        )}
        {section.type === 'chart' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chart visualization would be displayed here
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
              </Box>
            </Paper>
          </Box>
        )}
        {section.type === 'image' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Image would be displayed here
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
              </Box>
            </Paper>
          </Box>
        )}
        {section.type === 'metrics' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Key metrics would be displayed here
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">82%</Typography>
                  <Typography variant="body2">Storage Density</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">75%</Typography>
                  <Typography variant="body2">Space Utilization</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">1,350</Typography>
                  <Typography variant="body2">Pallet Positions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">48.2</Typography>
                  <Typography variant="body2">Travel Distance</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {projectId && currentProject ? `${currentProject.name} - Reports` : 'Reports'}
        </Typography>
        {projectId && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenNewReportDialog}
          >
            New Report
          </Button>
        )}
      </Box>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Reports" id="report-tab-0" aria-controls="report-tabpanel-0" />
          <Tab 
            label="Report Viewer" 
            id="report-tab-1" 
            aria-controls="report-tabpanel-1" 
            disabled={!currentReport}
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : reports.length === 0 ? (
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: 'background.paper',
                borderRadius: 1
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No reports yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first report to get started
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenNewReportDialog}
              >
                Create Report
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              {reports.map((report: Report) => (
                <Grid item key={report.id} xs={12} sm={6} md={4}>
                  {renderReportCard(report)}
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {!currentReport ? (
            <Typography>No report selected</Typography>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  {currentReport.name}
                </Typography>
                <Box>
                  {editMode ? (
                    <>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancelEdit}
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddSectionDialog}
                        sx={{ mr: 1 }}
                      >
                        Add Section
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleSaveReport}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                          setSelectedReport(currentReport);
                          handleExportReportToPDF();
                        }}
                        sx={{ mr: 1 }}
                      >
                        Export PDF
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<ShareIcon />}
                        sx={{ mr: 1 }}
                      >
                        Share
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {currentReport.type.charAt(0).toUpperCase() + currentReport.type.slice(1)} Report • 
                Created {formatDate(currentReport.createdAt, 'medium')} • 
                Last updated {formatDate(currentReport.updatedAt, 'medium')}
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {currentReport.config.sections.map((section: ReportSection) => renderReportSection(section))}
              </Box>
            </Box>
          )}
        </TabPanel>
      </Paper>
      
      {/* Report actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleViewReport(selectedReport!)}>View</MenuItem>
        <MenuItem onClick={handleEditReport}>Edit</MenuItem>
        <MenuItem onClick={handleExportReportToPDF} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export to PDF'}
        </MenuItem>
        <MenuItem onClick={handleExportReportToExcel} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </MenuItem>
        <MenuItem onClick={handleDeleteReport}>Delete</MenuItem>
      </Menu>
      
      {/* New report dialog */}
      <Dialog 
        open={newReportDialogOpen} 
        onClose={handleCloseNewReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Name"
            fullWidth
            variant="outlined"
            value={newReportName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReportName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              value={newReportType}
              label="Report Type"
              onChange={handleReportTypeChange}
            >
              <MenuItem value="layout">Layout Report</MenuItem>
              <MenuItem value="inventory">Inventory Report</MenuItem>
              <MenuItem value="optimization">Optimization Report</MenuItem>
              <MenuItem value="custom">Custom Report</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewReportDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateReport} 
            variant="contained"
            disabled={newReportName.trim() === ''}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add section dialog */}
      <Dialog 
        open={addSectionDialogOpen} 
        onClose={handleCloseAddSectionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Report Section</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="section-type-label">Section Type</InputLabel>
            <Select
              labelId="section-type-label"
              value={newSectionType}
              label="Section Type"
              onChange={(e: SelectChangeEvent) => setNewSectionType(e.target.value as any)}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="chart">Chart</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="metrics">Metrics</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSectionDialog}>Cancel</Button>
          <Button 
            onClick={handleAddSection} 
            variant="contained"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;