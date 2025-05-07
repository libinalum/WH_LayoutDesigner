import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

import useEquipmentStore from '../../store/equipmentStore';

interface EquipmentTypeFormProps {
  onClose: () => void;
}

const EquipmentTypeForm = ({ onClose }: EquipmentTypeFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createEquipmentType } = useEquipmentStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
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
      await createEquipmentType({
        name,
        description
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating equipment type:', error);
      setSubmitError('Failed to create equipment type. Please try again.');
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
      
      <TextField
        name="name"
        label="Equipment Type Name"
        value={name}
        onChange={handleNameChange}
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name}
        margin="normal"
      />
      
      <TextField
        name="description"
        label="Description"
        value={description}
        onChange={handleDescriptionChange}
        fullWidth
        multiline
        rows={3}
        margin="normal"
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default EquipmentTypeForm;