# RackOptix - Warehouse Layout Optimization System

![RackOptix Logo](docs/images/logo.png)

## Overview

RackOptix is a comprehensive warehouse layout optimization system designed to help logistics professionals create efficient warehouse layouts, optimize rack configurations, and manage product slotting. The system uses advanced optimization algorithms to maximize storage capacity, improve space utilization, and enhance operational efficiency.

## Features

- **Facility Definition**: Draw and define warehouse facilities with zones and obstructions
- **Product Management**: Manage product catalogs with dimensions, weights, and storage requirements
- **Equipment Configuration**: Configure material handling equipment with specifications
- **Layout Optimization**: Generate and optimize warehouse layouts based on constraints
- **Rack Elevation Optimization**: Optimize rack elevations for efficient storage
- **Product Slotting**: Optimize product placement for efficient picking
- **3D Visualization**: Visualize warehouse layouts in 3D
- **Reporting**: Generate comprehensive reports on layouts and optimizations
- **Export Capabilities**: Export layouts to CAD, 3D models, and other formats
- **Collaboration**: Share and collaborate on layouts with team members

## Architecture

RackOptix follows a microservices architecture with the following components:

1. **Backend Optimization Engine**: Python-based service that handles the core optimization algorithms
2. **API Layer**: Node.js/Express service that provides RESTful endpoints for the frontend
3. **Frontend Application**: React/TypeScript application that provides the user interface
4. **Database**: PostgreSQL with PostGIS extension for spatial data storage

## Technology Stack

### Backend
- Python 3.9+
- Google OR-Tools for constraint programming and optimization
- NumPy and Pandas for data manipulation
- FastAPI for API endpoints
- PostgreSQL with PostGIS for data storage

### API
- Node.js 18+
- TypeScript
- Express.js
- Sequelize ORM
- WebSockets for real-time communication

### Frontend
- React 18+
- TypeScript
- Material UI for components
- Konva.js for 2D canvas manipulation
- Three.js for 3D visualization
- Zustand for state management
- Vite for fast development and building

### DevOps
- Docker for containerization
- Kubernetes for orchestration
- GitHub Actions for CI/CD
- Prometheus and Grafana for monitoring
- EFK stack for logging

## Getting Started

### Prerequisites

- Docker and Docker Compose for local development
- Kubernetes for production deployment
- PostgreSQL 14+ with PostGIS extension
- Node.js 18+
- Python 3.9+

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/rackoptix.git
   cd rackoptix
   ```

2. **Set up the environment**:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   POSTGRES_USER=rackoptix
   POSTGRES_PASSWORD=rackoptix_password
   POSTGRES_DB=rackoptix
   
   # API Configuration
   API_PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   
   # Backend Configuration
   BACKEND_PORT=8000
   
   # Frontend Configuration
   FRONTEND_PORT=3001
   ```

3. **Start the services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Initialize the database**:
   ```bash
   docker-compose exec db /bin/bash -c "cd /docker-entrypoint-initdb.d && ./run_migrations.sh"
   ```

5. **Access the application**:
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - Backend: http://localhost:8000
   - Database: localhost:5432

### Production Deployment

For production deployment, refer to the [Deployment Guide](docs/deployment_guide.md).

## Documentation

### Developer Documentation

- [Developer Guide](docs/developer_guide.md): Comprehensive guide for developers
- [API Reference](docs/api_reference.md): Detailed documentation for all API endpoints
- [Deployment Guide](docs/deployment_guide.md): Guide for deploying the application

### User Documentation

- [User Guide](docs/user_guide.md): Comprehensive guide for using the application

## Testing

### Running Backend Tests

```bash
cd backend
python -m pytest
```

### Running API Tests

```bash
cd api
npm test
```

### Running Frontend Tests

```bash
cd frontend
npm test
```

### Running End-to-End Tests

```bash
cd e2e
npm test
```

## Contributing

We welcome contributions to RackOptix! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is proprietary software. All rights reserved.

## Contact

For questions or support, please contact [support@rackoptix.com](mailto:support@rackoptix.com).