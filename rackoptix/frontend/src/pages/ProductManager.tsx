import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  Grid, 
  Paper, 
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

import useProductStore from '../store/productStore';
import ProductList from '../components/product/ProductList';
import ProductGrid from '../components/product/ProductGrid';
import ProductForm from '../components/product/ProductForm';
import ProductClassificationDialog from '../components/product/ProductClassificationDialog';
import ProductImportDialog from '../components/product/ProductImportDialog';

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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
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
    id: `product-tab-${index}`,
    'aria-controls': `product-tabpanel-${index}`,
  };
}

const ProductManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [classifyDialogOpen, setClassifyDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { 
    products, 
    categories, 
    selectedProduct, 
    isLoading, 
    error,
    fetchProducts,
    fetchCategories,
    selectProduct,
    exportProducts
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddProduct = () => {
    selectProduct(null);
    setFormOpen(true);
  };

  const handleEditProduct = (id: string) => {
    selectProduct(id);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const url = await exportProducts(format);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      handleExportClose();
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleClassifyOpen = () => {
    setClassifyDialogOpen(true);
    handleFilterClose();
  };

  const handleClassifyClose = () => {
    setClassifyDialogOpen(false);
  };

  const handleImportOpen = () => {
    setImportDialogOpen(true);
  };

  const handleImportClose = () => {
    setImportDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Box>
          <Tooltip title="Import Products">
            <IconButton onClick={handleImportOpen} sx={{ mr: 1 }}>
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Products">
            <IconButton onClick={handleExportClick} sx={{ mr: 1 }}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
          </Menu>
          <Tooltip title="Filter Products">
            <IconButton onClick={handleFilterClick} sx={{ mr: 1 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={handleClassifyOpen}>Classify by Velocity</MenuItem>
            <MenuItem onClick={handleFilterClose}>Filter by Category</MenuItem>
            <MenuItem onClick={handleFilterClose}>Filter by Dimensions</MenuItem>
          </Menu>
          <Tooltip title={viewMode === 'list' ? 'Grid View' : 'List View'}>
            <IconButton onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} sx={{ mr: 1 }}>
              {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Add Product
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
          <Tab label="All Products" {...a11yProps(0)} />
          <Tab label="A Class" {...a11yProps(1)} />
          <Tab label="B Class" {...a11yProps(2)} />
          <Tab label="C Class" {...a11yProps(3)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {viewMode === 'list' ? (
            <ProductList 
              products={products} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          ) : (
            <ProductGrid 
              products={products} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {viewMode === 'list' ? (
            <ProductList 
              products={products.filter(p => p.velocity_class === 'A')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          ) : (
            <ProductGrid 
              products={products.filter(p => p.velocity_class === 'A')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {viewMode === 'list' ? (
            <ProductList 
              products={products.filter(p => p.velocity_class === 'B')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          ) : (
            <ProductGrid 
              products={products.filter(p => p.velocity_class === 'B')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {viewMode === 'list' ? (
            <ProductList 
              products={products.filter(p => p.velocity_class === 'C')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          ) : (
            <ProductGrid 
              products={products.filter(p => p.velocity_class === 'C')} 
              onEdit={handleEditProduct} 
              isLoading={isLoading}
            />
          )}
        </TabPanel>
      </Paper>

      {/* Product Form Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <ProductForm 
            product={selectedProduct} 
            categories={categories}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Classification Dialog */}
      <ProductClassificationDialog
        open={classifyDialogOpen}
        onClose={handleClassifyClose}
      />

      {/* Import Dialog */}
      <ProductImportDialog
        open={importDialogOpen}
        onClose={handleImportClose}
      />
    </Box>
  );
};

export default ProductManager;