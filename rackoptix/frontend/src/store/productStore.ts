import { create } from 'zustand';
import axios from 'axios';

// Types
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  category_id?: string;
  sku: string;
  name: string;
  description: string;
  
  // Physical dimensions
  length: number;
  width: number;
  height: number;
  weight: number;
  
  // Operational characteristics
  velocity_class: 'A' | 'B' | 'C';
  storage_method: 'pallet' | 'case' | 'tote' | 'each';
  stackable: boolean;
  
  // Special requirements
  handling_limitations?: Record<string, any>;
  environmental_reqs?: Record<string, any>;
  monthly_throughput: number;
}

// Store interface
interface ProductState {
  // State
  products: Product[];
  categories: ProductCategory[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (category: Omit<ProductCategory, 'id'>) => Promise<ProductCategory>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<ProductCategory | null>;
  deleteCategory: (id: string) => Promise<void>;
  selectProduct: (id: string | null) => void;
  
  // Classification actions
  classifyProductsByVelocity: (method: 'abc' | 'xyz' | 'custom', params?: Record<string, any>) => Promise<void>;
  
  // Import/Export actions
  importProducts: (fileData: any, format: 'csv' | 'excel') => Promise<void>;
  exportProducts: (format: 'csv' | 'excel') => Promise<string>;
}

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create store
const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/products`);
      // set({ products: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          products: [
            {
              id: 'product-1',
              sku: 'SKU001',
              name: 'Standard Pallet',
              description: 'Standard wooden pallet',
              length: 48,
              width: 40,
              height: 6,
              weight: 50,
              velocity_class: 'A',
              storage_method: 'pallet',
              stackable: true,
              monthly_throughput: 500
            },
            {
              id: 'product-2',
              sku: 'SKU002',
              name: 'Medium Box',
              description: 'Medium-sized cardboard box',
              length: 24,
              width: 18,
              height: 12,
              weight: 15,
              velocity_class: 'B',
              storage_method: 'case',
              stackable: true,
              monthly_throughput: 250
            },
            {
              id: 'product-3',
              sku: 'SKU003',
              name: 'Small Container',
              description: 'Small plastic container',
              length: 12,
              width: 10,
              height: 8,
              weight: 5,
              velocity_class: 'C',
              storage_method: 'tote',
              stackable: true,
              monthly_throughput: 100
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching products:', error);
      set({
        error: 'Failed to fetch products',
        isLoading: false
      });
    }
  },
  
  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/products/${id}`);
      // set({ selectedProduct: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        const product = get().products.find(p => p.id === id);
        if (product) {
          set({
            selectedProduct: product,
            isLoading: false
          });
        } else {
          set({
            error: `Product not found with id: ${id}`,
            isLoading: false
          });
        }
      }, 300);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      set({
        error: `Failed to fetch product ${id}`,
        isLoading: false
      });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/products/categories`);
      // set({ categories: response.data, isLoading: false });
      
      // Simulate API call
      setTimeout(() => {
        set({
          categories: [
            {
              id: 'category-1',
              name: 'Raw Materials',
              description: 'Raw materials for manufacturing'
            },
            {
              id: 'category-2',
              name: 'Finished Goods',
              description: 'Completed products ready for sale'
            },
            {
              id: 'category-3',
              name: 'Packaging',
              description: 'Packaging materials'
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        error: 'Failed to fetch categories',
        isLoading: false
      });
    }
  },
  
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/products`, productData);
      // const newProduct = response.data;
      
      // Simulate API call
      const newProduct: Product = {
        ...productData,
        id: `product-${Date.now()}`
      };
      
      set(state => ({
        products: [...state.products, newProduct],
        selectedProduct: newProduct,
        isLoading: false
      }));
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      set({
        error: 'Failed to create product',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateProduct: async (id: string, updates: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/products/${id}`, updates);
      // const updatedProduct = response.data;
      
      // Simulate API call
      const productIndex = get().products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        set({
          error: `Product not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      const updatedProduct: Product = {
        ...get().products[productIndex],
        ...updates
      };
      
      set(state => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p),
        selectedProduct: state.selectedProduct?.id === id ? updatedProduct : state.selectedProduct,
        isLoading: false
      }));
      
      return updatedProduct;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      set({
        error: `Failed to update product ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/products/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      set({
        error: `Failed to delete product ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/products/categories`, categoryData);
      // const newCategory = response.data;
      
      // Simulate API call
      const newCategory: ProductCategory = {
        ...categoryData,
        id: `category-${Date.now()}`
      };
      
      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      set({
        error: 'Failed to create category',
        isLoading: false
      });
      throw error;
    }
  },
  
  updateCategory: async (id: string, updates: Partial<ProductCategory>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.put(`${API_URL}/products/categories/${id}`, updates);
      // const updatedCategory = response.data;
      
      // Simulate API call
      const categoryIndex = get().categories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        set({
          error: `Category not found with id: ${id}`,
          isLoading: false
        });
        return null;
      }
      
      const updatedCategory: ProductCategory = {
        ...get().categories[categoryIndex],
        ...updates
      };
      
      set(state => ({
        categories: state.categories.map(c => c.id === id ? updatedCategory : c),
        isLoading: false
      }));
      
      return updatedCategory;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      set({
        error: `Failed to update category ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/products/categories/${id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      set({
        error: `Failed to delete category ${id}`,
        isLoading: false
      });
      throw error;
    }
  },
  
  selectProduct: (id: string | null) => {
    if (id === null) {
      set({ selectedProduct: null });
      return;
    }
    
    const product = get().products.find(p => p.id === id);
    set({ selectedProduct: product || null });
  },
  
  classifyProductsByVelocity: async (method, params) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`${API_URL}/products/classify`, { method, params });
      // const updatedProducts = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate classification
      let updatedProducts = [...get().products];
      
      if (method === 'abc') {
        // Sort by monthly throughput
        updatedProducts.sort((a, b) => b.monthly_throughput - a.monthly_throughput);
        
        // Assign velocity classes
        const totalProducts = updatedProducts.length;
        updatedProducts = updatedProducts.map((product, index) => {
          let velocity_class: 'A' | 'B' | 'C';
          
          if (index < totalProducts * 0.2) {
            velocity_class = 'A';
          } else if (index < totalProducts * 0.5) {
            velocity_class = 'B';
          } else {
            velocity_class = 'C';
          }
          
          return { ...product, velocity_class };
        });
      } else if (method === 'xyz') {
        // Simulate XYZ analysis (based on variability)
        // In a real implementation, this would use actual variability data
        updatedProducts = updatedProducts.map(product => {
          // Random assignment for simulation
          const rand = Math.random();
          let velocity_class: 'A' | 'B' | 'C';
          
          if (rand < 0.3) {
            velocity_class = 'A';
          } else if (rand < 0.7) {
            velocity_class = 'B';
          } else {
            velocity_class = 'C';
          }
          
          return { ...product, velocity_class };
        });
      }
      
      set({
        products: updatedProducts,
        isLoading: false
      });
    } catch (error) {
      console.error(`Error classifying products using ${method}:`, error);
      set({
        error: `Failed to classify products`,
        isLoading: false
      });
      throw error;
    }
  },
  
  importProducts: async (fileData, format) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const formData = new FormData();
      // formData.append('file', fileData);
      // formData.append('format', format);
      // const response = await axios.post(`${API_URL}/products/import`, formData);
      // const importedProducts = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate imported products
      const importedProducts: Product[] = [
        {
          id: `product-${Date.now()}-1`,
          sku: 'IMP001',
          name: 'Imported Product 1',
          description: 'Imported from file',
          length: 36,
          width: 24,
          height: 12,
          weight: 30,
          velocity_class: 'B',
          storage_method: 'pallet',
          stackable: true,
          monthly_throughput: 200
        },
        {
          id: `product-${Date.now()}-2`,
          sku: 'IMP002',
          name: 'Imported Product 2',
          description: 'Imported from file',
          length: 24,
          width: 18,
          height: 10,
          weight: 20,
          velocity_class: 'C',
          storage_method: 'case',
          stackable: false,
          monthly_throughput: 150
        }
      ];
      
      set(state => ({
        products: [...state.products, ...importedProducts],
        isLoading: false
      }));
    } catch (error) {
      console.error(`Error importing products from ${format}:`, error);
      set({
        error: `Failed to import products`,
        isLoading: false
      });
      throw error;
    }
  },
  
  exportProducts: async (format) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`${API_URL}/products/export?format=${format}`, {
      //   responseType: 'blob'
      // });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `products.${format}`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ isLoading: false });
      
      // Return a mock download URL
      return `data:application/${format === 'csv' ? 'csv' : 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'};base64,MOCK_DATA`;
    } catch (error) {
      console.error(`Error exporting products to ${format}:`, error);
      set({
        error: `Failed to export products`,
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useProductStore;