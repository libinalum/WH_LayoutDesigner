import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField
} from '@mui/material';

import useProductStore from '../../store/productStore';

interface ProductClassificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProductClassificationDialog = ({ open, onClose }: ProductClassificationDialogProps) => {
  const [method, setMethod] = useState<'abc' | 'xyz' | 'custom'>('abc');
  const [customParams, setCustomParams] = useState({
    aPercentage: 20,
    bPercentage: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { classifyProductsByVelocity } = useProductStore();

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(event.target.value as 'abc' | 'xyz' | 'custom');
  };

  const handleCustomParamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCustomParams(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let params = {};
      
      if (method === 'custom') {
        params = {
          aPercentage: customParams.aPercentage,
          bPercentage: customParams.bPercentage
        };
      }
      
      await classifyProductsByVelocity(method, params);
      onClose();
    } catch (error) {
      console.error('Error classifying products:', error);
      setError('Failed to classify products. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Classify Products by Velocity</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" gutterBottom>
          Select a classification method to categorize products into velocity classes (A, B, C).
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <RadioGroup
              name="classification-method"
              value={method}
              onChange={handleMethodChange}
            >
              <FormControlLabel 
                value="abc" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="subtitle1">ABC Analysis</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Classifies products based on monthly throughput. Class A (top 20%), 
                      Class B (next 30%), Class C (remaining 50%).
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel 
                value="xyz" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="subtitle1">XYZ Analysis</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Classifies products based on demand variability. Class A (low variability), 
                      Class B (medium variability), Class C (high variability).
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel 
                value="custom" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="subtitle1">Custom Percentages</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Define custom percentage thresholds for classification.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        {method === 'custom' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Custom Classification Parameters
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 2, minWidth: 120 }}>
                Class A Threshold:
              </Typography>
              <TextField
                name="aPercentage"
                type="number"
                value={customParams.aPercentage}
                onChange={handleCustomParamChange}
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2">%</Typography>,
                  inputProps: { min: 1, max: 99 }
                }}
                sx={{ width: 100 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, minWidth: 120 }}>
                Class B Threshold:
              </Typography>
              <TextField
                name="bPercentage"
                type="number"
                value={customParams.bPercentage}
                onChange={handleCustomParamChange}
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2">%</Typography>,
                  inputProps: { min: 1, max: 99 }
                }}
                sx={{ width: 100 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Class C will include the remaining {100 - customParams.aPercentage - customParams.bPercentage}% of products.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Classify Products'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductClassificationDialog;