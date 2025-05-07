-- RackOptix Database Schema

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_created_by ON projects(created_by_user_id);

-- Facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    clear_height FLOAT NOT NULL,
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facilities_project_id ON facilities(project_id);
CREATE INDEX idx_facilities_boundary ON facilities USING GIST(boundary);

-- Zones table
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    purpose VARCHAR(50),
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_zones_facility_id ON zones(facility_id);
CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary);

-- Obstructions table
CREATE TABLE obstructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    shape GEOMETRY(POLYGON, 4326) NOT NULL,
    height FLOAT NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_obstructions_facility_id ON obstructions(facility_id);
CREATE INDEX idx_obstructions_shape ON obstructions USING GIST(shape);
CREATE INDEX idx_obstructions_type ON obstructions(type);

-- Product Categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES product_categories(id),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    length FLOAT NOT NULL,
    width FLOAT NOT NULL,
    height FLOAT NOT NULL,
    weight FLOAT NOT NULL,
    velocity_class VARCHAR(10) NOT NULL,
    storage_method VARCHAR(50) NOT NULL,
    stackable BOOLEAN NOT NULL DEFAULT FALSE,
    handling_limitations JSONB,
    environmental_reqs JSONB,
    monthly_throughput INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dimensions CHECK (length > 0 AND width > 0 AND height > 0),
    CONSTRAINT valid_weight CHECK (weight > 0)
);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_velocity_class ON products(velocity_class);
CREATE INDEX idx_products_storage_method ON products(storage_method);

-- Equipment Types table
CREATE TABLE equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES equipment_types(id),
    name VARCHAR(100) NOT NULL,
    reach_height FLOAT NOT NULL,
    min_aisle_width FLOAT NOT NULL,
    max_aisle_width FLOAT NOT NULL,
    turning_radius FLOAT NOT NULL,
    lift_capacity FLOAT NOT NULL,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_reach_height CHECK (reach_height > 0),
    CONSTRAINT valid_aisle_width CHECK (min_aisle_width > 0 AND max_aisle_width >= min_aisle_width),
    CONSTRAINT valid_turning_radius CHECK (turning_radius > 0),
    CONSTRAINT valid_lift_capacity CHECK (lift_capacity > 0)
);
CREATE INDEX idx_equipment_type_id ON equipment(type_id);

-- Rack Types table
CREATE TABLE rack_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    specifications JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Layouts table
CREATE TABLE layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    parameters JSONB,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'))
);
CREATE INDEX idx_layouts_facility_id ON layouts(facility_id);
CREATE INDEX idx_layouts_status ON layouts(status);

-- Racks table
CREATE TABLE racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    rack_type_id UUID NOT NULL REFERENCES rack_types(id),
    location GEOMETRY(POLYGON, 4326) NOT NULL,
    orientation FLOAT NOT NULL DEFAULT 0,
    height FLOAT NOT NULL,
    length FLOAT NOT NULL,
    depth FLOAT NOT NULL,
    bays INTEGER NOT NULL,
    configuration JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dimensions CHECK (height > 0 AND length > 0 AND depth > 0),
    CONSTRAINT valid_bays CHECK (bays > 0)
);
CREATE INDEX idx_racks_layout_id ON racks(layout_id);
CREATE INDEX idx_racks_rack_type_id ON racks(rack_type_id);
CREATE INDEX idx_racks_location ON racks USING GIST(location);

-- Bays table
CREATE TABLE bays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    width FLOAT NOT NULL,
    beam_elevations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_width CHECK (width > 0),
    UNIQUE (rack_id, position)
);
CREATE INDEX idx_bays_rack_id ON bays(rack_id);

-- Aisles table
CREATE TABLE aisles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id),
    path GEOMETRY(LINESTRING, 4326) NOT NULL,
    width FLOAT NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_width CHECK (width > 0)
);
CREATE INDEX idx_aisles_layout_id ON aisles(layout_id);
CREATE INDEX idx_aisles_equipment_id ON aisles(equipment_id);
CREATE INDEX idx_aisles_path ON aisles USING GIST(path);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    bay_id UUID NOT NULL REFERENCES bays(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    position INTEGER NOT NULL,
    elevation FLOAT NOT NULL,
    dimensions JSONB NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_elevation CHECK (elevation >= 0),
    UNIQUE (rack_id, bay_id, level, position)
);
CREATE INDEX idx_locations_rack_id ON locations(rack_id);
CREATE INDEX idx_locations_bay_id ON locations(bay_id);

-- Product Assignments table
CREATE TABLE product_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    UNIQUE (layout_id, location_id)
);
CREATE INDEX idx_product_assignments_layout_id ON product_assignments(layout_id);
CREATE INDEX idx_product_assignments_product_id ON product_assignments(product_id);
CREATE INDEX idx_product_assignments_location_id ON product_assignments(location_id);

-- Optimization Jobs table
CREATE TABLE optimization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    layout_id UUID REFERENCES layouts(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    parameters JSONB NOT NULL,
    results JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_job_type CHECK (job_type IN ('layout_generation', 'elevation_optimization', 'aisle_optimization', 'sku_slotting', 'full_optimization'))
);
CREATE INDEX idx_optimization_jobs_facility_id ON optimization_jobs(facility_id);
CREATE INDEX idx_optimization_jobs_layout_id ON optimization_jobs(layout_id);
CREATE INDEX idx_optimization_jobs_status ON optimization_jobs(status);
CREATE INDEX idx_optimization_jobs_job_type ON optimization_jobs(job_type);

-- Optimization Constraints table
CREATE TABLE optimization_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_job_id UUID NOT NULL REFERENCES optimization_jobs(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_hard_constraint BOOLEAN NOT NULL DEFAULT TRUE,
    weight FLOAT,
    parameters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_weight CHECK (is_hard_constraint OR (weight IS NOT NULL AND weight > 0))
);
CREATE INDEX idx_optimization_constraints_job_id ON optimization_constraints(optimization_job_id);
CREATE INDEX idx_optimization_constraints_type ON optimization_constraints(constraint_type);