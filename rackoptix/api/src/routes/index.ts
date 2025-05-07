/**
 * Main router for the RackOptix API.
 */

import { Router } from 'express';
import { facilityRoutes } from './facility.routes';
import { productRoutes } from './product.routes';
import { equipmentRoutes } from './equipment.routes';
import { layoutRoutes } from './layout.routes';
import { optimizationRoutes } from './optimization.routes';
import { notFoundHandler } from '../middleware/errorHandler';

// Create router
const apiRoutes = Router();

// Mount route groups
apiRoutes.use('/facilities', facilityRoutes);
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/equipment', equipmentRoutes);
apiRoutes.use('/layouts', layoutRoutes);
apiRoutes.use('/optimization', optimizationRoutes);

// API version info
apiRoutes.get('/', (req, res) => {
  res.json({
    name: 'RackOptix API',
    version: '0.1.0',
    endpoints: [
      '/facilities',
      '/products',
      '/equipment',
      '/layouts',
      '/optimization',
    ],
  });
});

// Handle 404 for any unmatched routes
apiRoutes.use(notFoundHandler);

export { apiRoutes };