# RackOptix Deployment Guide

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Deployment Options](#deployment-options)
4. [Local Deployment with Docker Compose](#local-deployment-with-docker-compose)
5. [Cloud Deployment with Kubernetes](#cloud-deployment-with-kubernetes)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Security Considerations](#security-considerations)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup and Recovery](#backup-and-recovery)
11. [Scaling](#scaling)
12. [Troubleshooting](#troubleshooting)

## Introduction

This guide provides instructions for deploying the RackOptix warehouse layout optimization system in various environments. RackOptix consists of multiple components that work together to provide a complete solution:

1. **Backend Optimization Engine**: Python-based service that handles the core optimization algorithms.
2. **API Layer**: Node.js/Express service that provides RESTful endpoints for the frontend.
3. **Frontend Application**: React/TypeScript application that provides the user interface.
4. **Database**: PostgreSQL with PostGIS extension for spatial data storage.

## System Requirements

### Minimum Requirements

- **CPU**: 4 cores
- **Memory**: 8 GB RAM
- **Storage**: 20 GB
- **Database**: PostgreSQL 14+ with PostGIS extension
- **Operating System**: Linux (Ubuntu 20.04+, CentOS 8+), macOS, or Windows Server 2019+
- **Container Runtime**: Docker 20.10+ or Kubernetes 1.22+

### Recommended Requirements

- **CPU**: 8+ cores
- **Memory**: 16+ GB RAM
- **Storage**: 50+ GB SSD
- **Database**: PostgreSQL 14+ with PostGIS extension
- **Operating System**: Linux (Ubuntu 22.04+, CentOS 9+)
- **Container Runtime**: Docker 20.10+ or Kubernetes 1.25+

## Deployment Options

RackOptix supports several deployment options:

1. **Local Deployment with Docker Compose**: Suitable for development, testing, and small-scale deployments.
2. **Cloud Deployment with Kubernetes**: Recommended for production deployments, providing scalability, high availability, and automated management.
3. **Hybrid Deployment**: Components can be deployed across different environments as needed.

## Local Deployment with Docker Compose

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/rackoptix.git
   cd rackoptix
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   POSTGRES_USER=rackoptix
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=rackoptix
   
   # API Configuration
   API_PORT=3000
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret
   
   # Backend Configuration
   BACKEND_PORT=8000
   
   # Frontend Configuration
   FRONTEND_PORT=80
   ```

3. **Build and Start the Services**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Initialize the Database**:
   ```bash
   docker-compose exec db /bin/bash -c "cd /docker-entrypoint-initdb.d && ./run_migrations.sh"
   ```

5. **Verify the Deployment**:
   - Frontend: http://localhost
   - API: http://localhost:3000
   - Backend: http://localhost:8000
   - Database: localhost:5432

### Stopping the Services

```bash
docker-compose down
```

### Updating the Services

```bash
git pull
docker-compose build
docker-compose up -d
```

## Cloud Deployment with Kubernetes

### Prerequisites

- Kubernetes 1.22+
- kubectl
- Helm 3+
- Container registry access (e.g., Docker Hub, Google Container Registry, Amazon ECR)

### Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/rackoptix.git
   cd rackoptix
   ```

2. **Build and Push Docker Images**:
   ```bash
   # Set your container registry
   export REGISTRY=your-registry.com/rackoptix
   
   # Build and push backend image
   docker build -t $REGISTRY/backend:latest ./backend
   docker push $REGISTRY/backend:latest
   
   # Build and push API image
   docker build -t $REGISTRY/api:latest ./api
   docker push $REGISTRY/api:latest
   
   # Build and push frontend image
   docker build -t $REGISTRY/frontend:latest ./frontend
   docker push $REGISTRY/frontend:latest
   ```

3. **Update Kubernetes Manifests**:
   Edit the Kubernetes manifests in the `kubernetes` directory to use your container registry:
   ```bash
   cd kubernetes
   
   # Update image references
   sed -i "s|\${REGISTRY}|$REGISTRY|g" backend.yaml api.yaml frontend.yaml
   sed -i "s|\${TAG}|latest|g" backend.yaml api.yaml frontend.yaml
   ```

4. **Create Kubernetes Secrets**:
   ```bash
   # Create a namespace for RackOptix
   kubectl apply -f namespace.yaml
   
   # Create secrets
   kubectl create secret generic rackoptix-secrets \
     --namespace=rackoptix \
     --from-literal=POSTGRES_USER=rackoptix \
     --from-literal=POSTGRES_PASSWORD=your_secure_password \
     --from-literal=JWT_SECRET=your_jwt_secret \
     --from-literal=DATABASE_URL=postgres://rackoptix:your_secure_password@rackoptix-db:5432/rackoptix
   ```

5. **Deploy the Application**:
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f configmap.yaml
   kubectl apply -f database.yaml
   kubectl apply -f backend.yaml
   kubectl apply -f api.yaml
   kubectl apply -f frontend.yaml
   kubectl apply -f monitoring.yaml
   ```

6. **Initialize the Database**:
   ```bash
   # Wait for the database pod to be ready
   kubectl wait --for=condition=ready pod -l app=rackoptix,component=database --namespace=rackoptix
   
   # Run migrations
   kubectl exec -it $(kubectl get pod -l app=rackoptix,component=database -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- /bin/bash -c "cd /docker-entrypoint-initdb.d && ./run_migrations.sh"
   ```

7. **Configure Ingress**:
   ```bash
   # Apply ingress configuration
   kubectl apply -f ingress.yaml
   ```

8. **Verify the Deployment**:
   ```bash
   kubectl get pods -n rackoptix
   kubectl get services -n rackoptix
   kubectl get ingress -n rackoptix
   ```

### Updating the Deployment

```bash
# Build and push new images
docker build -t $REGISTRY/backend:latest ./backend
docker push $REGISTRY/backend:latest
docker build -t $REGISTRY/api:latest ./api
docker push $REGISTRY/api:latest
docker build -t $REGISTRY/frontend:latest ./frontend
docker push $REGISTRY/frontend:latest

# Restart deployments to use new images
kubectl rollout restart deployment/rackoptix-backend -n rackoptix
kubectl rollout restart deployment/rackoptix-api -n rackoptix
kubectl rollout restart deployment/rackoptix-frontend -n rackoptix
```

## Database Setup

RackOptix requires PostgreSQL with the PostGIS extension for spatial data storage.

### Manual Database Setup

1. **Install PostgreSQL and PostGIS**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y postgresql postgresql-contrib postgis
   
   # CentOS/RHEL
   sudo yum install -y postgresql postgresql-server postgresql-contrib postgis
   sudo postgresql-setup initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database and User**:
   ```bash
   sudo -u postgres psql -c "CREATE USER rackoptix WITH PASSWORD 'your_secure_password';"
   sudo -u postgres psql -c "CREATE DATABASE rackoptix OWNER rackoptix;"
   sudo -u postgres psql -d rackoptix -c "CREATE EXTENSION postgis;"
   ```

3. **Run Migrations**:
   ```bash
   cd database
   ./run_migrations.sh
   ```

### Database Migrations

Database migrations are managed using SQL scripts in the `database/migrations` directory. The `run_migrations.sh` script applies these migrations in order.

To run migrations manually:

```bash
cd database
./run_migrations.sh
```

## Environment Configuration

RackOptix components are configured using environment variables. Here are the key environment variables for each component:

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to listen on | 8000 |
| DATABASE_URL | PostgreSQL connection string | postgres://rackoptix:rackoptix_password@localhost:5432/rackoptix |
| LOG_LEVEL | Logging level (debug, info, warning, error) | info |

### API

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to listen on | 3000 |
| NODE_ENV | Environment (development, production) | production |
| DATABASE_URL | PostgreSQL connection string | postgres://rackoptix:rackoptix_password@localhost:5432/rackoptix |
| OPTIMIZATION_ENGINE_URL | URL of the backend optimization engine | http://localhost:8000 |
| JWT_SECRET | Secret for JWT token generation | (no default, must be set) |
| LOG_LEVEL | Logging level (debug, info, warning, error) | info |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| API_URL | URL of the API | http://localhost:3000 |
| NODE_ENV | Environment (development, production) | production |

## Security Considerations

### Authentication and Authorization

RackOptix uses JSON Web Tokens (JWT) for authentication. The JWT secret should be kept secure and rotated periodically.

### Database Security

- Use strong passwords for database users
- Restrict database access to only the necessary services
- Enable SSL for database connections in production

### Network Security

- Use HTTPS for all external communication
- Configure firewalls to restrict access to only necessary ports
- Use network policies in Kubernetes to control pod-to-pod communication

### Secrets Management

- Use Kubernetes Secrets or a dedicated secrets management solution (e.g., HashiCorp Vault) for storing sensitive information
- Avoid storing secrets in code or configuration files
- Rotate secrets periodically

## Monitoring and Logging

RackOptix includes monitoring and logging infrastructure:

### Prometheus and Grafana

Prometheus is used for metrics collection, and Grafana for visualization.

To access Grafana:
1. Get the Grafana service URL:
   ```bash
   kubectl get svc grafana -n rackoptix
   ```
2. Access Grafana at the provided URL
3. Log in with the default credentials (admin/admin)
4. Change the password when prompted

### Elasticsearch, Fluentd, and Kibana (EFK Stack)

The EFK stack is used for log collection, storage, and visualization.

To access Kibana:
1. Get the Kibana service URL:
   ```bash
   kubectl get svc kibana -n rackoptix
   ```
2. Access Kibana at the provided URL
3. Create an index pattern for the logs
4. Explore the logs using the Discover tab

## Backup and Recovery

### Database Backup

1. **Manual Backup**:
   ```bash
   pg_dump -Fc -U rackoptix -d rackoptix > rackoptix_backup.dump
   ```

2. **Scheduled Backup with Kubernetes CronJob**:
   ```yaml
   apiVersion: batch/v1
   kind: CronJob
   metadata:
     name: rackoptix-db-backup
     namespace: rackoptix
   spec:
     schedule: "0 2 * * *"  # Run at 2 AM every day
     jobTemplate:
       spec:
         template:
           spec:
             containers:
             - name: backup
               image: postgres:14
               command:
               - /bin/sh
               - -c
               - pg_dump -Fc -h rackoptix-db -U rackoptix -d rackoptix > /backup/rackoptix_$(date +%Y%m%d).dump
               env:
               - name: PGPASSWORD
                 valueFrom:
                   secretKeyRef:
                     name: rackoptix-secrets
                     key: POSTGRES_PASSWORD
               volumeMounts:
               - name: backup-volume
                 mountPath: /backup
             volumes:
             - name: backup-volume
               persistentVolumeClaim:
                 claimName: rackoptix-backup-pvc
             restartPolicy: OnFailure
   ```

### Database Recovery

1. **Manual Recovery**:
   ```bash
   pg_restore -d rackoptix rackoptix_backup.dump
   ```

2. **Recovery in Kubernetes**:
   ```bash
   kubectl exec -it $(kubectl get pod -l app=rackoptix,component=database -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- pg_restore -d rackoptix /backup/rackoptix_20250101.dump
   ```

## Scaling

### Horizontal Scaling

RackOptix components can be scaled horizontally to handle increased load:

1. **Scaling in Kubernetes**:
   ```bash
   # Scale the API to 3 replicas
   kubectl scale deployment rackoptix-api -n rackoptix --replicas=3
   
   # Scale the backend to 3 replicas
   kubectl scale deployment rackoptix-backend -n rackoptix --replicas=3
   
   # Scale the frontend to 3 replicas
   kubectl scale deployment rackoptix-frontend -n rackoptix --replicas=3
   ```

2. **Automatic Scaling with HPA**:
   RackOptix includes Horizontal Pod Autoscaler (HPA) configurations for automatic scaling based on CPU and memory usage.

### Database Scaling

For high-availability and performance, consider using PostgreSQL replication:

1. **Primary-Replica Setup**:
   Configure a primary PostgreSQL server with one or more replicas for read operations.

2. **Connection Pooling**:
   Use PgBouncer or similar tools for connection pooling to improve database performance.

## Troubleshooting

### Common Issues

#### Database Connection Issues

**Symptoms**: Services cannot connect to the database, connection timeout errors.

**Solutions**:
- Verify that the database is running: `kubectl get pods -n rackoptix`
- Check database logs: `kubectl logs -l app=rackoptix,component=database -n rackoptix`
- Verify connection string in environment variables
- Check network policies and firewall rules

#### API Connection Issues

**Symptoms**: Frontend cannot connect to the API, API connection errors.

**Solutions**:
- Verify that the API is running: `kubectl get pods -n rackoptix`
- Check API logs: `kubectl logs -l app=rackoptix,component=api -n rackoptix`
- Verify API URL in frontend configuration
- Check network policies and firewall rules

#### Backend Connection Issues

**Symptoms**: API cannot connect to the backend, optimization fails.

**Solutions**:
- Verify that the backend is running: `kubectl get pods -n rackoptix`
- Check backend logs: `kubectl logs -l app=rackoptix,component=backend -n rackoptix`
- Verify backend URL in API configuration
- Check network policies and firewall rules

### Viewing Logs

```bash
# View backend logs
kubectl logs -l app=rackoptix,component=backend -n rackoptix

# View API logs
kubectl logs -l app=rackoptix,component=api -n rackoptix

# View frontend logs
kubectl logs -l app=rackoptix,component=frontend -n rackoptix

# View database logs
kubectl logs -l app=rackoptix,component=database -n rackoptix
```

### Debugging Pods

```bash
# Get a shell in a backend pod
kubectl exec -it $(kubectl get pod -l app=rackoptix,component=backend -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- /bin/bash

# Get a shell in an API pod
kubectl exec -it $(kubectl get pod -l app=rackoptix,component=api -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- /bin/bash

# Get a shell in a frontend pod
kubectl exec -it $(kubectl get pod -l app=rackoptix,component=frontend -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- /bin/bash

# Get a shell in the database pod
kubectl exec -it $(kubectl get pod -l app=rackoptix,component=database -n rackoptix -o jsonpath="{.items[0].metadata.name}") -n rackoptix -- /bin/bash
```

### Restarting Services

```bash
# Restart the backend
kubectl rollout restart deployment/rackoptix-backend -n rackoptix

# Restart the API
kubectl rollout restart deployment/rackoptix-api -n rackoptix

# Restart the frontend
kubectl rollout restart deployment/rackoptix-frontend -n rackoptix

# Restart the database (StatefulSet)
kubectl rollout restart statefulset/rackoptix-db -n rackoptix