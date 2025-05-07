import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';

import useProductStore, { Product, ProductCategory } from '../../store/productStore';

interface ProductFormProps {
  product: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
}

const ProductForm = ({ product, categories, onClose }: ProductFormProps) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    name: '',
    description: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    velocity_class: 'C',
    storage_method: 'pallet',
    stackable: false,
    monthly_throughput: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createProduct, updateProduct } = useProductStore();

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        length: product.length,
        width: product.width,
        height: product.height,
        weight: product.weight,
        velocity_class: product.velocity_class,
        storage_method: product.storage_method,
        stackable: product.stackable,
        monthly_throughput: product.monthly_throughput,
        handling_limitations: product.handling_limitations,
        environmental_reqs: product.environmental_reqs
      });
    }
  }, [product]);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sku) {
      newErrors.sku = 'SKU is required';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.length === undefined || formData.length <= 0) {
      newErrors.length = 'Length must be greater than 0';
    }
    
    if (formData.width === undefined || formData.width <= 0) {
      newErrors.width = 'Width must be greater than 0';
    }
    
    if (formData.height === undefined || formData.height <= 0) {
      newErrors.height = 'Height must be greater than 0';
    }
    
    if (formData.weight === undefined || formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (product) {
        // Update existing product
        await updateProduct(product.id, formData);
      } else {
        // Create new product
        await createProduct(formData as Omit<Product, 'id'>);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError('Failed to save product. Please try again.');
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
          <TextField
            name="sku"
            label="SKU"
            value={formData.sku}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.sku}
            helperText={errors.sku}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleSelectChange}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Physical Dimensions
          </Typography>
          <Divider />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            name="length"
            label="Length"
            type="number"
            value={formData.length}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.length}
            helperText={errors.length}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="width"
            label="Width"
            type="number"
            value={formData.width}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.width}
            helperText={errors.width}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="height"
            label="Height"
            type="number"
            value={formData.height}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.height}
            helperText={errors.height}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="weight"
            label="Weight (lbs)"
            type="number"
            value={formData.weight}
            onChange={handleNumberChange}
            fullWidth
            required
            error={!!errors.weight}
            helperText={errors.weight}
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Operational Characteristics
          </Typography>
          <Divider />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="velocity-class-label">Velocity Class</InputLabel>
            <Select
              labelId="velocity-class-label"
              name="velocity_class"
              value={formData.velocity_class}
              onChange={handleSelectChange}
              label="Velocity Class"
            >
              <MenuItem value="A">Class A (Fast Moving)</MenuItem>
              <MenuItem value="B">Class B (Medium Moving)</MenuItem>
              <MenuItem value="C">Class C (Slow Moving)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="storage-method-label">Storage Method</InputLabel>
            <Select
              labelId="storage-method-label"
              name="storage_method"
              value={formData.storage_method}
              onChange={handleSelectChange}
              label="Storage Method"
            >
              <MenuItem value="pallet">Pallet</MenuItem>
              <MenuItem value="case">Case</MenuItem>
              <MenuItem value="tote">Tote</MenuItem>
              <MenuItem value="each">Each</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="stackable"
                checked={formData.stackable}
                onChange={handleCheckboxChange}
              />
            }
            label="Stackable"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="monthly_throughput"
            label="Monthly Throughput"
            type="number"
            value={formData.monthly_throughput}
            onChange={handleNumberChange}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
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
          {isSubmitting ? <CircularProgress size={24} /> : (product ? 'Update' : 'Create')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductForm;