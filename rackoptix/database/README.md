# RackOptix Database

The RackOptix database is a PostgreSQL database with PostGIS extension that stores all data for the RackOptix warehouse optimization system.

## Features

- Spatial data storage and querying with PostGIS
- Comprehensive schema for warehouse layout optimization
- Support for facilities, products, equipment, and layouts
- Optimization job tracking and results storage

## Technology Stack

- PostgreSQL 14+
- PostGIS 3.2+

## Getting Started

### Prerequisites

- PostgreSQL 14 or higher with PostGIS extension
- psql command-line tool or a PostgreSQL client (e.g., pgAdmin, DBeaver)

### Installation

1. Create a new PostgreSQL database:
   ```
   createdb rackoptix
   ```

2. Enable the PostGIS extension:
   ```
   psql -d rackoptix -c "CREATE EXTENSION postgis;"
   ```

3. Run the schema creation script:
   ```
   psql -d rackoptix -f schema.sql
   ```

4. (Optional) Load sample data:
   ```
   psql -d rackoptix -f seed.sql
   ```

## Database Schema

### Core Tables

- **users**: User accounts for the system
- **projects**: Projects that group related facilities and layouts
- **facilities**: Warehouse facilities with boundaries and properties
- **zones**: Areas within facilities with specific purposes
- **obstructions**: Columns, walls, and other obstacles within facilities

### Inventory Tables

- **product_categories**: Categories for organizing products
- **products**: Product information including dimensions and handling requirements

### Equipment Tables

- **equipment_types**: Types of material handling equipment
- **equipment**: Specific equipment models with specifications
- **rack_types**: Types of storage racks with specifications

### Layout Tables

- **layouts**: Warehouse layout designs
- **racks**: Storage racks placed in layouts
- **bays**: Sections within racks
- **aisles**: Pathways between racks
- **locations**: Specific storage locations within racks
- **product_assignments**: Assignment of products to storage locations

### Optimization Tables

- **optimization_jobs**: Optimization processes and their status
- **optimization_constraints**: Constraints applied to optimization jobs

## Database Diagram

A simplified entity-relationship diagram:

```
users 1──n projects 1──n facilities 1──n layouts 1──n racks 1──n bays 1──n locations
                                      │               │
                                      │               └──n aisles
                                      │
                                      └──n obstructions
                                      
products n──1 product_categories
        │
        └──n product_assignments n──1 locations

equipment n──1 equipment_types
         │
         └──n aisles

optimization_jobs 1──n optimization_constraints
                 │
                 └──1 layouts
```

## Spatial Data

The database uses PostGIS to store and query spatial data:

- Facility boundaries (POLYGON)
- Zone boundaries (POLYGON)
- Obstruction shapes (POLYGON)
- Rack locations (POLYGON)
- Aisle paths (LINESTRING)

This allows for spatial operations such as:
- Finding racks within a specific zone
- Calculating distances between locations
- Ensuring racks don't overlap with obstructions
- Optimizing travel paths

## Maintenance

### Backup

To backup the database:

```
pg_dump -Fc rackoptix > rackoptix_backup.dump
```

### Restore

To restore from a backup:

```
pg_restore -d rackoptix rackoptix_backup.dump
```

## License

Proprietary - All rights reserved