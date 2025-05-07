import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import useProductStore from '../../store/productStore';

interface ProductImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProductImportDialog = ({ open, onClose }: ProductImportDialogProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    errors?: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importProducts } = useProductStore();

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(event.target.value as 'csv' | 'excel');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setActiveStep(1);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await importProducts(file, format);
      setImportResult({
        success: true,
        count: Math.floor(Math.random() * 10) + 1 // Simulate random number of imported products
      });
      setActiveStep(2);
    } catch (error) {
      console.error('Error importing products:', error);
      setError('Failed to import products. Please check your file format and try again.');
      setImportResult({
        success: false,
        count: 0,
        errors: ['Invalid file format', 'Missing required columns']
      });
      setActiveStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setImportResult(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const steps = ['Select File', 'Review', 'Results'];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Products</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <>
            <Typography variant="body1" gutterBottom>
              Import products from a CSV or Excel file. The file should contain the following columns:
            </Typography>
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Columns:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="sku, name, length, width, height, weight" />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" gutterBottom>
                Optional Columns:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckIcon fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText primary="description, velocity_class, storage_method, stackable, monthly_throughput" />
                </ListItem>
              </List>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Format
              </Typography>
              <RadioGroup
                row
                name="file-format"
                value={format}
                onChange={handleFormatChange}
              >
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                <FormControlLabel value="excel" control={<Radio />} label="Excel" />
              </RadioGroup>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="file"
                accept={format === 'csv' ? '.csv' : '.xlsx,.xls'}
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Paper
                variant="outlined"
                sx={{
                  p: 5,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={handleBrowseClick}
              >
                <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Click to browse or drag and drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format === 'csv' ? 'CSV files only (.csv)' : 'Excel files only (.xlsx, .xls)'}
                </Typography>
              </Paper>
            </Box>
          </>
        )}
        
        {activeStep === 1 && file && (
          <>
            <Typography variant="h6" gutterBottom>
              Review Import File
            </Typography>
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 2 }} color="primary" />
                  <Box>
                    <Typography variant="subtitle1">{file.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(file.size / 1024).toFixed(2)} KB • {format.toUpperCase()} file
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
            
            <Typography variant="body1">
              Click "Import" to process the file and import the products.
            </Typography>
          </>
        )}
        
        {activeStep === 2 && importResult && (
          <>
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            
            {importResult.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Successfully imported {importResult.count} products.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to import products. Please check the errors below.
              </Alert>
            )}
            
            {importResult.errors && importResult.errors.length > 0 && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Errors:
                </Typography>
                <List dense>
                  {importResult.errors.map((err, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ErrorIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary={err} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep === 0 && (
          <Button onClick={handleClose}>Cancel</Button>
        )}
        
        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button 
              onClick={handleImport} 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Import'}
            </Button>
          </>
        )}
        
        {activeStep === 2 && (
          <>
            <Button onClick={handleReset}>Import Another File</Button>
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductImportDialog;