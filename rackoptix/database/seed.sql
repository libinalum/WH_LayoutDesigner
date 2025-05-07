-- RackOptix Seed Data

-- Insert a default user
INSERT INTO users (id, username, email, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@rackoptix.com',
    TRUE
);

-- Insert a default project
INSERT INTO projects (id, name, description, created_by_user_id)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Project',
    'A demonstration project with sample data',
    '00000000-0000-0000-0000-000000000001'
);

-- Insert a default facility
INSERT INTO facilities (
    id,
    project_id,
    name,
    description,
    clear_height,
    boundary,
    metadata
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Chicago Distribution Center',
    'Main distribution facility for Midwest region',
    32.5,
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[0,0],[0,500],[800,500],[800,0],[0,0]]]}'),
    '{"address": "123 Warehouse Blvd, Chicago, IL", "square_footage": 400000, "year_built": 2010, "sprinkler_type": "ESFR"}'
);

-- Insert sample obstructions
INSERT INTO obstructions (
    facility_id,
    type,
    shape,
    height,
    properties
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'column',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[150,150],[150,152],[152,152],[152,150],[150,150]]]}'),
    32.5,
    '{"material": "concrete", "cross_section": "square"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'column',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[250,150],[250,152],[252,152],[252,150],[250,150]]]}'),
    32.5,
    '{"material": "concrete", "cross_section": "square"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'column',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[350,150],[350,152],[352,152],[352,150],[350,150]]]}'),
    32.5,
    '{"material": "concrete", "cross_section": "square"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'dock',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[0,250],[0,270],[20,270],[20,250],[0,250]]]}'),
    0.0,
    '{"dock_number": 1, "door_type": "standard"}'
);

-- Insert product categories
INSERT INTO product_categories (id, name, description)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Electronics',
    'Consumer electronic products'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Furniture',
    'Home and office furniture'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Apparel',
    'Clothing and accessories'
);

-- Insert sample products
INSERT INTO products (
    category_id,
    sku,
    name,
    description,
    length,
    width,
    height,
    weight,
    velocity_class,
    storage_method,
    stackable,
    handling_limitations,
    environmental_reqs,
    monthly_throughput
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'ELEC-001',
    'Smartphone X1',
    'Latest model smartphone with 6.5-inch display',
    6.5,
    3.0,
    0.35,
    0.45,
    'A',
    'case',
    TRUE,
    '{"fragile": true, "high_value": true}',
    '{"temperature_controlled": true, "humidity_range": [20, 60]}',
    5000
),
(
    '00000000-0000-0000-0000-000000000001',
    'ELEC-002',
    'Laptop Pro',
    '15-inch professional laptop',
    15.0,
    10.0,
    1.0,
    4.5,
    'B',
    'case',
    TRUE,
    '{"fragile": true, "high_value": true}',
    '{"temperature_controlled": true, "humidity_range": [20, 60]}',
    2000
),
(
    '00000000-0000-0000-0000-000000000002',
    'FURN-001',
    'Office Chair',
    'Ergonomic office chair with adjustable height',
    24.0,
    24.0,
    36.0,
    25.0,
    'C',
    'pallet',
    FALSE,
    '{}',
    '{}',
    500
),
(
    '00000000-0000-0000-0000-000000000003',
    'APRL-001',
    'T-Shirt Basic',
    'Cotton t-shirt, various sizes',
    12.0,
    8.0,
    1.0,
    0.3,
    'A',
    'tote',
    TRUE,
    '{}',
    '{}',
    8000
);

-- Insert equipment types
INSERT INTO equipment_types (id, name, description)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Reach Truck',
    'Electric reach truck for narrow aisle operations'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Counterbalance Forklift',
    'Standard counterbalance forklift for general warehouse operations'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Turret Truck',
    'Very narrow aisle (VNA) turret truck for high-density storage'
);

-- Insert equipment
INSERT INTO equipment (
    type_id,
    name,
    reach_height,
    min_aisle_width,
    max_aisle_width,
    turning_radius,
    lift_capacity,
    specifications
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'RT-5000',
    30.0,
    8.0,
    10.0,
    6.5,
    3500,
    '{"power_source": "electric", "battery_life": "8 hours", "max_speed": 7.5, "width": 4.0, "length": 8.5, "height": 7.5}'
),
(
    '00000000-0000-0000-0000-000000000002',
    'CB-3000',
    20.0,
    12.0,
    14.0,
    8.0,
    5000,
    '{"power_source": "propane", "max_speed": 10.0, "width": 5.0, "length": 9.0, "height": 7.0}'
),
(
    '00000000-0000-0000-0000-000000000003',
    'VNA-8000',
    40.0,
    6.0,
    7.0,
    0.0,
    2500,
    '{"power_source": "electric", "battery_life": "10 hours", "max_speed": 6.0, "width": 4.5, "length": 9.0, "height": 7.5, "guidance_system": "wire"}'
);

-- Insert rack types
INSERT INTO rack_types (id, name, description, specifications)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Selective Pallet Rack',
    'Standard selective pallet racking system',
    '{
        "max_height": 480,
        "max_bay_width": 144,
        "max_depth": 48,
        "beam_types": [
            {"name": "Standard", "capacity": 5000},
            {"name": "Heavy Duty", "capacity": 8000}
        ],
        "upright_types": [
            {"name": "Standard", "capacity": 25000},
            {"name": "Heavy Duty", "capacity": 40000}
        ],
        "accessories": ["wire_decking", "pallet_supports", "row_spacers"]
    }'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Drive-In Rack',
    'High-density drive-in racking system',
    '{
        "max_height": 360,
        "max_depth": 240,
        "max_lanes": 10,
        "rail_types": [
            {"name": "Standard", "capacity": 3000},
            {"name": "Heavy Duty", "capacity": 5000}
        ],
        "upright_types": [
            {"name": "Standard", "capacity": 30000},
            {"name": "Heavy Duty", "capacity": 50000}
        ]
    }'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Push-Back Rack',
    '2-5 deep push-back racking system',
    '{
        "max_height": 360,
        "max_depth": 240,
        "max_positions": 5,
        "beam_types": [
            {"name": "Standard", "capacity": 6000},
            {"name": "Heavy Duty", "capacity": 10000}
        ],
        "cart_types": [
            {"name": "Standard", "capacity": 3000}
        ],
        "upright_types": [
            {"name": "Standard", "capacity": 30000},
            {"name": "Heavy Duty", "capacity": 50000}
        ]
    }'
);

-- Insert a sample layout
INSERT INTO layouts (
    id,
    facility_id,
    name,
    description,
    status,
    parameters,
    metrics
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Initial Layout',
    'First draft layout for Chicago Distribution Center',
    'draft',
    '{"optimization_priority": "storage_density"}',
    '{
        "pallet_positions": 1000,
        "storage_density": 0.75,
        "avg_travel_distance": 120.5,
        "throughput_capacity": 400,
        "space_utilization": 0.70
    }'
);

-- Insert sample racks
INSERT INTO racks (
    layout_id,
    rack_type_id,
    location,
    orientation,
    height,
    length,
    depth,
    bays,
    configuration
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[100,100],[100,142],[484,142],[484,100],[100,100]]]}'),
    0,
    240,
    384,
    42,
    4,
    '{"beam_type": "Standard", "upright_type": "Standard", "accessories": ["wire_decking"]}'
),
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[100,200],[100,242],[484,242],[484,200],[100,200]]]}'),
    0,
    240,
    384,
    42,
    4,
    '{"beam_type": "Standard", "upright_type": "Standard", "accessories": ["wire_decking"]}'
);

-- Insert sample bays
INSERT INTO bays (
    rack_id,
    position,
    width,
    beam_elevations
)
SELECT
    r.id,
    p.position,
    96.0,
    '[48, 96, 144, 192]'::jsonb
FROM
    racks r
CROSS JOIN
    (VALUES (0), (1), (2), (3)) AS p(position)
WHERE
    r.layout_id = '00000000-0000-0000-0000-000000000001';

-- Insert sample aisles
INSERT INTO aisles (
    layout_id,
    equipment_id,
    path,
    width,
    properties
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[100,171],[484,171]]}'),
    10.0,
    '{"direction": "bidirectional", "purpose": "picking"}'
);

-- Insert sample optimization job
INSERT INTO optimization_jobs (
    facility_id,
    layout_id,
    job_type,
    status,
    parameters,
    results,
    started_at,
    completed_at
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'layout_generation',
    'completed',
    '{
        "objectives": {
            "storage_density": 0.7,
            "travel_distance": 0.3
        },
        "equipment_types": ["reach_truck"],
        "rack_types": ["selective"],
        "time_limit": 300
    }',
    '{
        "objective_value": 0.85,
        "iterations": 1250,
        "time_taken": 287.5,
        "improvement": 0.23
    }',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '45 minutes'
);

-- Insert sample optimization constraints
INSERT INTO optimization_constraints (
    optimization_job_id,
    constraint_type,
    name,
    is_hard_constraint,
    weight,
    parameters
)
SELECT
    id,
    'clearance',
    'Minimum Aisle Clearance',
    TRUE,
    NULL,
    '{"min_clearance": 12}'::jsonb
FROM
    optimization_jobs
WHERE
    facility_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT
    id,
    'velocity_proximity',
    'Fast Movers Near Output',
    FALSE,
    0.8,
    '{"max_distance": 100}'::jsonb
FROM
    optimization_jobs
WHERE
    facility_id = '00000000-0000-0000-0000-000000000001';