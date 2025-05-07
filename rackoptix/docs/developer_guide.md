# RackOptix Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Backend Development](#backend-development)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Database](#database)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
12. [Monitoring and Logging](#monitoring-and-logging)
13. [Contributing Guidelines](#contributing-guidelines)
14. [Troubleshooting](#troubleshooting)

## Introduction

RackOptix is a warehouse layout optimization system designed to help users create efficient warehouse layouts, optimize rack configurations, and manage product slotting. This developer guide provides comprehensive information for developers working on the RackOptix codebase.

## Architecture Overview

RackOptix follows a microservices architecture with the following components:

1. **Backend Optimization Engine**: Python-based service that handles the core optimization algorithms.
2. **API Layer**: Node.js/Express service that provides RESTful endpoints for the frontend.
3. **Frontend Application**: React/TypeScript application that provides the user interface.
4. **Database**: PostgreSQL with PostGIS extension for spatial data storage.

The components communicate as follows:

- Frontend → API: RESTful HTTP requests and WebSocket for real-time updates
- API → Backend: HTTP requests to the optimization engine
- API → Database: SQL queries via Sequelize ORM
- Backend → Database: SQL queries via SQLAlchemy ORM

## Development Environment Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Docker and Docker Compose (for containerized development)
- Git

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/rackoptix.git
   cd rackoptix
   ```

2. **Set up the database**:
   ```bash
   # Create the database
   createdb rackoptix
   
   # Enable PostGIS extension
   psql -d rackoptix -c "CREATE EXTENSION postgis;"
   
   # Run migrations
   cd database
   ./run_migrations.sh
   ```

3. **Set up the backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up the API**:
   ```bash
   cd api
   npm install
   ```

5. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   ```

### Using Docker Compose

For a containerized development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Project Structure

```
rackoptix/
├── .github/                # GitHub Actions workflows
├── backend/                # Python optimization engine
│   ├── src/                # Source code
│   │   ├── algorithms/     # Optimization algorithms
│   │   ├── core/           # Core engine components
│   │   ├── models/         # Data models
│   │   └── main.py         # Application entry point
│   ├── tests/              # Test cases
│   └── Dockerfile          # Docker configuration
├── api/                    # Node.js API layer
│   ├── src/                # Source code
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Application entry point
│   ├── tests/              # Test cases
│   └── Dockerfile          # Docker configuration
├── frontend/               # React frontend
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main application component
│   ├── tests/              # Test cases
│   └── Dockerfile          # Docker configuration
├── database/               # Database scripts
│   ├── migrations/         # Migration scripts
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── kubernetes/             # Kubernetes manifests
├── docs/                   # Documentation
└── docker-compose.yml      # Docker Compose configuration
```

## Backend Development

The backend is a Python-based optimization engine that implements various algorithms for warehouse layout optimization.

### Key Components

- **Algorithms**: Implementations of optimization algorithms for layout generation, rack elevation optimization, aisle width optimization, and product slotting.
- **Models**: Data models representing facilities, products, equipment, and layouts.
- **Core Engine**: The main optimization engine that orchestrates the optimization process.

### Running the Backend

```bash
cd backend
python -m src.main
```

The backend will be available at http://localhost:8000.

### Adding a New Algorithm

1. Create a new file in the `src/algorithms` directory.
2. Implement the algorithm class with the required methods.
3. Register the algorithm in the core engine.
4. Add tests for the algorithm in the `tests/algorithms` directory.

## API Development

The API layer is a Node.js/Express application that provides RESTful endpoints for the frontend.

### Key Components

- **Controllers**: Handle HTTP requests and responses.
- **Services**: Implement business logic and interact with the database and backend.
- **Models**: Define data models using Sequelize ORM.
- **Routes**: Define API endpoints and map them to controllers.
- **Middleware**: Implement cross-cutting concerns like authentication, validation, and error handling.

### Running the API

```bash
cd api
npm run dev
```

The API will be available at http://localhost:3000.

### Adding a New Endpoint

1. Define the route in the appropriate file in the `src/routes` directory.
2. Implement the controller method in the `src/controllers` directory.
3. Implement the service method in the `src/services` directory if needed.
4. Add validation middleware if required.
5. Add tests for the endpoint in the `tests` directory.

## Frontend Development

The frontend is a React/TypeScript application that provides the user interface for RackOptix.

### Key Components

- **Components**: Reusable UI components.
- **Pages**: Top-level page components.
- **Store**: State management using Zustand.
- **Hooks**: Custom React hooks for shared functionality.
- **Utils**: Utility functions.

### Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3001.

### Adding a New Feature

1. Create new components in the `src/components` directory.
2. Create or update page components in the `src/pages` directory.
3. Add state management in the `src/store` directory if needed.
4. Add custom hooks in the `src/hooks` directory if needed.
5. Add tests for the components in the `tests` directory.

## Database

RackOptix uses PostgreSQL with the PostGIS extension for spatial data storage.

### Schema

The database schema includes tables for:

- Users and projects
- Facilities, zones, and obstructions
- Products and product categories
- Equipment and equipment types
- Layouts, racks, bays, aisles, and locations
- Optimization jobs and constraints
- Reports and comments

### Migrations

Database migrations are managed using SQL scripts in the `database/migrations` directory. To run migrations:

```bash
cd database
./run_migrations.sh
```

### Adding a New Migration

1. Create a new SQL file in the `database/migrations` directory with a sequential number prefix.
2. Implement the migration SQL.
3. Run the migration script.

## Testing

RackOptix includes comprehensive testing at all levels:

### Backend Tests

```bash
cd backend
pytest
```

### API Tests

```bash
cd api
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### End-to-End Tests

```bash
cd e2e
npm test
```

## Deployment

RackOptix can be deployed using Docker and Kubernetes.

### Docker Deployment

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml
kubectl apply -f kubernetes/database.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/api.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/monitoring.yaml
```

## Continuous Integration/Continuous Deployment

RackOptix uses GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/ci-cd.yaml`.

### CI/CD Pipeline

1. **Lint**: Check code quality and style.
2. **Test**: Run unit and integration tests.
3. **Build**: Build Docker images.
4. **Deploy to Development**: Deploy to the development environment on the `develop` branch.
5. **Deploy to Production**: Deploy to the production environment on release.

## Monitoring and Logging

RackOptix includes monitoring and logging infrastructure:

- **Prometheus**: Metrics collection and alerting.
- **Grafana**: Metrics visualization.
- **Elasticsearch**: Log storage and search.
- **Fluentd**: Log collection and forwarding.
- **Kibana**: Log visualization.

### Accessing Monitoring Tools

- Prometheus: http://prometheus.rackoptix.example.com
- Grafana: http://grafana.rackoptix.example.com
- Kibana: http://kibana.rackoptix.example.com

## Contributing Guidelines

### Code Style

- **Python**: Follow PEP 8 and use Black for formatting.
- **TypeScript**: Follow the ESLint configuration.
- **SQL**: Use uppercase for SQL keywords and lowercase for identifiers.

### Pull Request Process

1. Create a feature branch from `develop`.
2. Implement your changes.
3. Add tests for your changes.
4. Ensure all tests pass.
5. Submit a pull request to the `develop` branch.
6. Request a review from at least one team member.
7. Address any review comments.
8. Once approved, the PR will be merged.

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Troubleshooting

### Common Issues

#### Backend

- **Import errors**: Ensure your Python path includes the project root.
- **Database connection errors**: Check your database connection string and ensure PostgreSQL is running.

#### API

- **TypeScript errors**: Run `npm run build` to check for type errors.
- **Database connection errors**: Check your database connection string and ensure PostgreSQL is running.

#### Frontend

- **Build errors**: Check for TypeScript errors and missing dependencies.
- **API connection errors**: Ensure the API is running and the API URL is correctly configured.

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the issue tracker for similar issues.
2. Ask for help in the team chat.
3. Create a new issue with detailed information about the problem.