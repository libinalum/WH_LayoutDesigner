import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

import useEquipmentStore, { Equipment, EquipmentType } from '../../store/equipmentStore';

interface EquipmentFormProps {
  equipment: Equipment | null;
  equipmentTypes: EquipmentType[];
  onClose: () => void;
}

const EquipmentForm = ({ equipment, equipmentTypes, onClose }: EquipmentFormProps) => {
  const [formData, setFormData] = useState<Partial<Equipment>>({
    type_id: '',
    name: '',
    reach_height: 0,
    min_aisle_width: 0,
    max_aisle_width: 0,
    turning_radius: 0,
    lift_capacity: 0,
    specifications: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Additional specifications
  const [powerSource, setPowerSource] = useState('');
  const [maxSpeed, setMaxSpeed] = useState<number | ''>('');
  const [batteryLife, setBatteryLife] = useState('');
  const [fuelCapacity, setFuelCapacity] = useState('');

  const { createEquipment, updateEquipment } = useEquipmentStore();

  useEffect(() => {
    if (equipment) {
      setFormData({
        type_id: equipment.type_id,
        name: equipment.name,
        reach_height: equipment.reach_height,
        min_aisle_width: equipment.min_aisle_width,
        max_aisle_width: equipment.max_aisle_width,
        turning_radius: equipment.turning_radius,
        lift_capacity: equipment.lift_capacity,
        specifications: equipment.specifications || {}
      });
      
      // Set additional specifications
      if (equipment.specifications) {
        setPowerSource(equipment.specifications.power_source || '');
        setMaxSpeed(equipment.specifications.max_speed || '');
        setBatteryLife(equipment.specifications.battery_life || '');
        setFuelCapacity(equipment.specifications.fuel_capacity || '');
      }
    }
  }, [equipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: 0 }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'powerSource':
        setPowerSource(value);
        break;
      case 'maxSpeed':
        setMaxSpeed(value === '' ? '' : parseFloat(value));
        break;
      case 'batteryLife':
        setBatteryLife(value);
        break;
      case 'fuelCapacity':
        setFuelCapacity(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type_id) {
      newErrors.type_id = 'Equipment type is required';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.reach_height === undefined || formData.reach_height <= 0) {
      newErrors.reach_height = 'Reach height must be greater than 0';
    }
    
    if (formData.min_aisle_width === undefined || formData.min_aisle_width <= 0) {
      newErrors.min_aisle_width = 'Minimum aisle width must be greater than 0';
    }
    
    if (formData.max_aisle_width === undefined || formData.max_aisle_width <= 0) {
      newErrors.max_aisle_width = 'Maximum aisle width must be greater than 0';
    }
    
    if (formData.min_aisle_width && formData.max_aisle_width && 
        formData.min_aisle_width > formData.max_aisle_width) {
      newErrors.min_aisle_width = 'Minimum aisle width cannot be greater than maximum';
    }
    
    if (formData.turning_radius === undefined || formData.turning_radius <= 0) {
      newErrors.turning_radius = 'Turning radius must be greater than 0';
    }
    
    if (formData.lift_capacity === undefined || formData.lift_capacity <= 0) {
      newErrors.lift_capacity = 'Lift capacity must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare specifications
    const specifications: Record<string, any> = {};
    
    if (powerSource) specifications.power_source = powerSource;
    if (maxSpeed !== '') specifications.max_speed = maxSpeed;
    if (batteryLife) specifications.battery_life = batteryLife;
    if (fuelCapacity) specifications.fuel_capacity = fuelCapacity;
    
    const finalFormData = {
      ...formData,
      specifications
    };
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (equipment) {
        // Update existing equipment
        await updateEquipment(equipment.id, finalFormData);
      } else {
        // Create new equipment
        await createEquipment(finalFormData as Omit<Equipment, 'id'>);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
      setSubmitError('Failed to save equipment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.type_id}>
            <InputLabel id="equipment-type-label">Equipment Type</InputLabel>
            <Select
              labelId="equipment-type-label"
              name="type_id"
              value={formData.type_id || ''}
              onChange={handleSelectChange}
              label="Equipment Type"
            >
              <MenuItem value="">
                <em>Select a type</em>
              </MenuItem>
              {equipmentTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {errors.type_id && (
              <Typography variant="caption" color="error">
                {errors.type_id}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="name"
            label="Equipment Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Operational Parameters
          </Typography>
          <Divider />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="reach_height"
            label="Reach Height (ft)"
            type="number"
            value={formData.reach_height}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.reach_height}
            helperText={errors.reach_height}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="lift_capacity"
            label="Lift Capacity (lbs)"
            type="number"
            value={formData.lift_capacity}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.lift_capacity}
            helperText={errors.lift_capacity}
            InputProps={{ inputProps: { min: 0, step: 100 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="min_aisle_width"
            label="Minimum Aisle Width (ft)"
            type="number"
            value={formData.min_aisle_width}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.min_aisle_width}
            helperText={errors.min_aisle_width}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="max_aisle_width"
            label="Maximum Aisle Width (ft)"
            type="number"
            value={formData.max_aisle_width}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.max_aisle_width}
            helperText={errors.max_aisle_width}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="turning_radius"
            label="Turning Radius (ft)"
            type="number"
            value={formData.turning_radius}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.turning_radius}
            helperText={errors.turning_radius}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Additional Specifications
          </Typography>
          <Divider />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="power-source-label">Power Source</InputLabel>
            <Select
              labelId="power-source-label"
              name="powerSource"
              value={powerSource}
              onChange={handleSpecChange as any}
              label="Power Source"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Propane">Propane</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Gasoline">Gasoline</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="maxSpeed"
            label="Maximum Speed (mph)"
            type="number"
            value={maxSpeed}
            onChange={handleSpecChange}
            fullWidth
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        
        {powerSource === 'Electric' && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="batteryLife"
              label="Battery Life"
              value={batteryLife}
              onChange={handleSpecChange}
              fullWidth
              placeholder="e.g., 8 hours"
            />
          </Grid>
        )}
        
        {(powerSource === 'Propane' || powerSource === 'Diesel' || powerSource === 'Gasoline') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="fuelCapacity"
              label="Fuel Capacity"
              value={fuelCapacity}
              onChange={handleSpecChange}
              fullWidth
              placeholder="e.g., 33 lbs, 5 gallons"
            />
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : (equipment ? 'Update' : 'Create')}
        </Button>
      </Box>
    </Box>
  );
};

export default EquipmentForm;