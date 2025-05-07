-- RackOptix Rack Schema Extension

-- Rack Types table (if not already created)
CREATE TABLE IF NOT EXISTS rack_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    specifications JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default rack types
INSERT INTO rack_types (name, description, specifications) VALUES
('selective', 'Standard selective pallet rack', '{
    "max_height": 40,
    "max_beam_length": 144,
    "max_load_per_level": 5000,
    "min_beam_spacing": 4,
    "depth_options": [42, 48],
    "beam_height_options": [4, 5, 6],
    "upright_width_options": [3, 4],
    "features": ["adjustable_levels", "single_deep"]
}'),
('drive-in', 'Drive-in/drive-through rack', '{
    "max_height": 35,
    "max_depth": 240,
    "max_load_per_level": 4000,
    "min_beam_spacing": 6,
    "depth_options": [96, 144, 192, 240],
    "beam_height_options": [5, 6],
    "upright_width_options": [4, 5],
    "features": ["high_density", "lifo_storage", "shared_rails"]
}'),
('push-back', 'Push-back pallet rack', '{
    "max_height": 35,
    "max_depth": 144,
    "max_load_per_level": 3000,
    "min_beam_spacing": 6,
    "depth_options": [96, 120, 144],
    "beam_height_options": [5, 6],
    "upright_width_options": [4, 5],
    "features": ["high_density", "lifo_storage", "cart_system", "inclined_rails"]
}'),
('pallet-flow', 'Pallet flow rack', '{
    "max_height": 35,
    "max_depth": 240,
    "max_load_per_level": 3000,
    "min_beam_spacing": 6,
    "depth_options": [96, 144, 192, 240],
    "beam_height_options": [5, 6],
    "upright_width_options": [4, 5],
    "features": ["high_density", "fifo_storage", "inclined_rails", "roller_system"]
}'),
('cantilever', 'Cantilever rack', '{
    "max_height": 30,
    "max_arm_length": 72,
    "max_load_per_arm": 2500,
    "min_arm_spacing": 12,
    "arm_length_options": [36, 48, 60, 72],
    "column_height_options": [120, 144, 180, 240],
    "base_depth_options": [24, 36, 48],
    "features": ["no_front_columns", "adjustable_arms", "long_item_storage"]
}'),
('carton-flow', 'Carton flow rack', '{
    "max_height": 25,
    "max_depth": 144,
    "max_load_per_level": 1500,
    "min_beam_spacing": 4,
    "depth_options": [36, 48, 72, 96],
    "beam_height_options": [3, 4, 5],
    "upright_width_options": [3, 4],
    "features": ["high_density", "fifo_storage", "carton_storage", "inclined_shelves"]
}'),
('mobile', 'Mobile pallet rack', '{
    "max_height": 30,
    "max_length": 120,
    "max_load_per_section": 30000,
    "min_beam_spacing": 4,
    "depth_options": [42, 48],
    "beam_height_options": [4, 5, 6],
    "upright_width_options": [3, 4],
    "features": ["high_density", "movable_bases", "reduced_aisles", "motorized_system"]
}');

-- Layouts table (if not already created)
CREATE TABLE IF NOT EXISTS layouts (
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
CREATE INDEX IF NOT EXISTS idx_layouts_facility_id ON layouts(facility_id);
CREATE INDEX IF NOT EXISTS idx_layouts_status ON layouts(status);

-- Racks table (if not already created)
CREATE TABLE IF NOT EXISTS racks (
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
CREATE INDEX IF NOT EXISTS idx_racks_layout_id ON racks(layout_id);
CREATE INDEX IF NOT EXISTS idx_racks_rack_type_id ON racks(rack_type_id);
CREATE INDEX IF NOT EXISTS idx_racks_location ON racks USING GIST(location);

-- Bays table (if not already created)
CREATE TABLE IF NOT EXISTS bays (
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
CREATE INDEX IF NOT EXISTS idx_bays_rack_id ON bays(rack_id);

-- Aisles table (if not already created)
CREATE TABLE IF NOT EXISTS aisles (
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
CREATE INDEX IF NOT EXISTS idx_aisles_layout_id ON aisles(layout_id);
CREATE INDEX IF NOT EXISTS idx_aisles_equipment_id ON aisles(equipment_id);
CREATE INDEX IF NOT EXISTS idx_aisles_path ON aisles USING GIST(path);

-- Locations table (if not already created)
CREATE TABLE IF NOT EXISTS locations (
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
CREATE INDEX IF NOT EXISTS idx_locations_rack_id ON locations(rack_id);
CREATE INDEX IF NOT EXISTS idx_locations_bay_id ON locations(bay_id);

-- Product Assignments table (if not already created)
CREATE TABLE IF NOT EXISTS product_assignments (
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
CREATE INDEX IF NOT EXISTS idx_product_assignments_layout_id ON product_assignments(layout_id);
CREATE INDEX IF NOT EXISTS idx_product_assignments_product_id ON product_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_assignments_location_id ON product_assignments(location_id);

-- Optimization Jobs table (if not already created)
CREATE TABLE IF NOT EXISTS optimization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    parameters JSONB NOT NULL,
    results JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_job_type CHECK (job_type IN ('elevation', 'aisle', 'slotting', 'layout'))
);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_layout_id ON optimization_jobs(layout_id);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_status ON optimization_jobs(status);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_job_type ON optimization_jobs(job_type);