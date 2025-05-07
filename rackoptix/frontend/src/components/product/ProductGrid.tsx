import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  CardMedia
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import useProductStore from '../../store/productStore';
import { Product } from '../../store/productStore';

interface ProductGridProps {
  products: Product[];
  onEdit: (id: string) => void;
  isLoading: boolean;
}

const ProductGrid = ({ products, onEdit, isLoading }: ProductGridProps) => {
  const { deleteProduct } = useProductStore();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const getVelocityColor = (velocityClass: 'A' | 'B' | 'C') => {
    switch (velocityClass) {
      case 'A':
        return 'success';
      case 'B':
        return 'primary';
      case 'C':
        return 'default';
      default:
        return 'default';
    }
  };

  const getVelocityBackgroundColor = (velocityClass: 'A' | 'B' | 'C') => {
    switch (velocityClass) {
      case 'A':
        return 'rgba(46, 125, 50, 0.1)';
      case 'B':
        return 'rgba(25, 118, 210, 0.1)';
      case 'C':
        return 'rgba(158, 158, 158, 0.1)';
      default:
        return 'transparent';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: getVelocityBackgroundColor(product.velocity_class)
            }}
          >
            <CardMedia
              component="img"
              height="140"
              image={`https://source.unsplash.com/random/300x200/?warehouse,product&sig=${product.id}`}
              alt={product.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0 }}>
                  {product.name}
                </Typography>
                <Chip 
                  label={`Class ${product.velocity_class}`} 
                  color={getVelocityColor(product.velocity_class) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SKU: {product.sku}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Dimensions: {product.length}×{product.width}×{product.height}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Weight: {product.weight} lbs
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={product.storage_method} 
                  variant="outlined"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Monthly: {product.monthly_throughput}
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Tooltip title="View Details">
                <IconButton size="small">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(product.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDelete(product.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;