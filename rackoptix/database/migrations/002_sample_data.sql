-- RackOptix Database Migration: 002_sample_data.sql
-- Sample data for demonstration and testing purposes

-- Sample users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@rackoptix.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiC4rFU4W', 'Admin', 'User', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'demo', 'demo@rackoptix.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiC4rFU4W', 'Demo', 'User', 'user'),
    ('33333333-3333-3333-3333-333333333333', 'manager', 'manager@rackoptix.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiC4rFU4W', 'Manager', 'User', 'manager');

-- Sample projects
INSERT INTO projects (id, name, description, owner_id, template, status)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'Distribution Center Demo', 'Sample distribution center project for demonstration', '11111111-1111-1111-1111-111111111111', 'distribution_center', 'active'),
    ('55555555-5555-5555-5555-555555555555', 'Fulfillment Center Example', 'Example fulfillment center layout', '22222222-2222-2222-2222-222222222222', 'fulfillment_center', 'active'),
    ('66666666-6666-6666-6666-666666666666', 'Cold Storage Facility', 'Cold storage warehouse layout', '33333333-3333-3333-3333-333333333333', 'cold_storage', 'active');

-- Sample facilities
INSERT INTO facilities (id, project_id, name, length, width, height, units, boundary)
VALUES
    ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Main Distribution Center', 500, 300, 40, 'ft', 
     ST_GeomFromText('POLYGON((0 0, 500 0, 500 300, 0 300, 0 0))', 4326)),
    ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Fulfillment Center', 400, 250, 35, 'ft', 
     ST_GeomFromText('POLYGON((0 0, 400 0, 400 250, 0 250, 0 0))', 4326)),
    ('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'Cold Storage Warehouse', 300, 200, 30, 'ft', 
     ST_GeomFromText('POLYGON((0 0, 300 0, 300 200, 0 200, 0 0))', 4326));

-- Sample zones
INSERT INTO zones (facility_id, name, geometry, purpose)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'Receiving', 
     ST_GeomFromText('POLYGON((0 0, 100 0, 100 300, 0 300, 0 0))', 4326), 'receiving'),
    ('77777777-7777-7777-7777-777777777777', 'Storage', 
     ST_GeomFromText('POLYGON((100 0, 400 0, 400 300, 100 300, 100 0))', 4326), 'storage'),
    ('77777777-7777-7777-7777-777777777777', 'Shipping', 
     ST_GeomFromText('POLYGON((400 0, 500 0, 500 300, 400 300, 400 0))', 4326), 'shipping'),
    ('88888888-8888-8888-8888-888888888888', 'Receiving', 
     ST_GeomFromText('POLYGON((0 0, 80 0, 80 250, 0 250, 0 0))', 4326), 'receiving'),
    ('88888888-8888-8888-8888-888888888888', 'Storage', 
     ST_GeomFromText('POLYGON((80 0, 320 0, 320 250, 80 250, 80 0))', 4326), 'storage'),
    ('88888888-8888-8888-8888-888888888888', 'Shipping', 
     ST_GeomFromText('POLYGON((320 0, 400 0, 400 250, 320 250, 320 0))', 4326), 'shipping');

-- Sample obstructions
INSERT INTO obstructions (facility_id, type, geometry, height)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'column', 
     ST_GeomFromText('POLYGON((50 50, 52 50, 52 52, 50 52, 50 50))', 4326), 40),
    ('77777777-7777-7777-7777-777777777777', 'column', 
     ST_GeomFromText('POLYGON((50 100, 52 100, 52 102, 50 102, 50 100))', 4326), 40),
    ('77777777-7777-7777-7777-777777777777', 'column', 
     ST_GeomFromText('POLYGON((50 150, 52 150, 52 152, 50 152, 50 150))', 4326), 40),
    ('77777777-7777-7777-7777-777777777777', 'column', 
     ST_GeomFromText('POLYGON((50 200, 52 200, 52 202, 50 202, 50 200))', 4326), 40),
    ('77777777-7777-7777-7777-777777777777', 'column', 
     ST_GeomFromText('POLYGON((50 250, 52 250, 52 252, 50 252, 50 250))', 4326), 40);

-- Sample product categories
INSERT INTO product_categories (id, name, description)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electronics', 'Electronic products and components'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Apparel', 'Clothing and accessories'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Food', 'Food products'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Furniture', 'Furniture and home goods');

-- Sample products
INSERT INTO products (project_id, category_id, name, sku, length, width, height, weight, units, velocity_class, storage_requirements)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Laptop', 'ELEC-001', 15, 10, 2, 5, 'in', 'A', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Smartphone', 'ELEC-002', 6, 3, 0.5, 0.5, 'in', 'A', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tablet', 'ELEC-003', 10, 7, 0.5, 1, 'in', 'B', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'T-Shirt', 'APP-001', 12, 8, 1, 0.2, 'in', 'A', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Jeans', 'APP-002', 12, 8, 2, 1, 'in', 'B', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cereal Box', 'FOOD-001', 8, 3, 12, 1, 'in', 'A', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Canned Soup', 'FOOD-002', 4, 4, 5, 1, 'in', 'B', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Office Chair', 'FURN-001', 24, 24, 36, 25, 'in', 'C', '["standard"]'),
    ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Desk', 'FURN-002', 48, 24, 30, 50, 'in', 'C', '["standard"]');

-- Sample equipment types
INSERT INTO equipment_types (id, name, description)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Reach Truck', 'Standard reach truck for narrow aisles'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Counterbalance Forklift', 'Standard counterbalance forklift'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Order Picker', 'High-level order picker for individual item picking');

-- Sample equipment
INSERT INTO equipment (project_id, type_id, name, type, max_height, min_aisle_width, turning_radius, max_capacity, units)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Reach Truck Model A', 'reach_truck', 30, 8.5, 6.0, 3000, 'ft'),
    ('44444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Counterbalance Model B', 'counterbalance', 20, 12.0, 8.0, 5000, 'ft'),
    ('44444444-4444-4444-4444-444444444444', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'Order Picker Model C', 'order_picker', 35, 6.0, 5.0, 1000, 'ft');

-- Sample rack types
INSERT INTO rack_types (id, name, description)
VALUES
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Selective Rack', 'Standard selective pallet rack'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Drive-In Rack', 'High-density drive-in rack'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Push-Back Rack', 'Push-back pallet rack for LIFO access');

-- Sample layouts
INSERT INTO layouts (id, project_id, facility_id, name, description, status)
VALUES
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'Initial Layout', 'First draft layout', 'draft'),
    ('llllllll-llll-llll-llll-llllllllllll', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'Optimized Layout', 'Optimized for storage capacity', 'active'),
    ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'Fulfillment Layout', 'Optimized for order picking', 'active');

-- Sample racks
INSERT INTO racks (layout_id, type, type_id, x, y, length, width, height, orientation, levels, bays, geometry)
VALUES
    ('llllllll-llll-llll-llll-llllllllllll', 'selective', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 120, 50, 40, 4, 20, 0, 4, 10, 
     ST_GeomFromText('POLYGON((120 50, 160 50, 160 54, 120 54, 120 50))', 4326)),
    ('llllllll-llll-llll-llll-llllllllllll', 'selective', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 120, 70, 40, 4, 20, 0, 4, 10, 
     ST_GeomFromText('POLYGON((120 70, 160 70, 160 74, 120 74, 120 70))', 4326)),
    ('llllllll-llll-llll-llll-llllllllllll', 'selective', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 120, 90, 40, 4, 20, 0, 4, 10, 
     ST_GeomFromText('POLYGON((120 90, 160 90, 160 94, 120 94, 120 90))', 4326)),
    ('llllllll-llll-llll-llll-llllllllllll', 'selective', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 120, 110, 40, 4, 20, 0, 4, 10, 
     ST_GeomFromText('POLYGON((120 110, 160 110, 160 114, 120 114, 120 110))', 4326));

-- Sample aisles
INSERT INTO aisles (layout_id, name, width, path)
VALUES
    ('llllllll-llll-llll-llll-llllllllllll', 'Aisle 1', 10, 
     ST_GeomFromText('LINESTRING(120 60, 160 60)', 4326)),
    ('llllllll-llll-llll-llll-llllllllllll', 'Aisle 2', 10, 
     ST_GeomFromText('LINESTRING(120 80, 160 80)', 4326)),
    ('llllllll-llll-llll-llll-llllllllllll', 'Aisle 3', 10, 
     ST_GeomFromText('LINESTRING(120 100, 160 100)', 4326));

-- Sample optimization jobs
INSERT INTO optimization_jobs (project_id, layout_id, type, status, parameters, results, started_at, completed_at)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'layout_generation', 'completed', 
     '{"objective": "storage_capacity", "aisle_width": 10.0, "rack_type": "selective", "max_height": 20.0}',
     '{"metrics": {"storage_capacity": 1200, "space_utilization": 0.85, "accessibility": 0.9}}',
     NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours'),
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'elevation_optimization', 'completed', 
     '{"objective": "balanced", "constraints": {"max_levels": 6, "min_level_height": 4.0}}',
     '{"metrics": {"storage_capacity": 1250, "space_utilization": 0.87, "accessibility": 0.88}}',
     NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours'),
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'slotting_optimization', 'completed', 
     '{"objective": "travel_time", "constraints": {"respect_velocity_classes": true, "max_products_per_bay": 4}}',
     '{"metrics": {"travel_efficiency": 0.92, "pick_efficiency": 0.88}}',
     NOW() - INTERVAL '20 hours', NOW() - INTERVAL '19 hours');

-- Sample reports
INSERT INTO reports (project_id, layout_id, type, title, description, content)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'layout_summary', 'Layout Summary Report', 
     'Summary of layout metrics and configuration',
     '{"metrics": {"storage_capacity": 1250, "space_utilization": 0.87, "accessibility": 0.88, "travel_efficiency": 0.92}}'),
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'rack_inventory', 'Rack Inventory Report', 
     'Detailed inventory of all racks in the layout',
     '{"rack_count": 4, "bay_count": 40, "total_positions": 160, "total_volume": 12800}'),
    ('44444444-4444-4444-4444-444444444444', 'llllllll-llll-llll-llll-llllllllllll', 'optimization_comparison', 'Optimization Comparison Report', 
     'Comparison of different optimization scenarios',
     '{"scenarios": [{"name": "Base", "metrics": {"storage_capacity": 1200}}, {"name": "Optimized", "metrics": {"storage_capacity": 1250}}]}');

-- Sample comments
INSERT INTO comments (user_id, layout_id, content, x, y, z)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'llllllll-llll-llll-llll-llllllllllll', 'Consider adding cross-aisles for better accessibility', 140, 75, 0),
    ('22222222-2222-2222-2222-222222222222', 'llllllll-llll-llll-llll-llllllllllll', 'The rack height might be too tall for the equipment', 130, 60, 15),
    ('33333333-3333-3333-3333-333333333333', 'llllllll-llll-llll-llll-llllllllllll', 'We should optimize this area for faster picking', 150, 100, 5);

-- Sample versions
INSERT INTO versions (layout_id, version_number, data, created_by)
VALUES
    ('llllllll-llll-llll-llll-llllllllllll', 1, 
     '{"racks": 2, "aisles": 1, "metrics": {"storage_capacity": 600}}',
     '11111111-1111-1111-1111-111111111111'),
    ('llllllll-llll-llll-llll-llllllllllll', 2, 
     '{"racks": 4, "aisles": 3, "metrics": {"storage_capacity": 1250}}',
     '11111111-1111-1111-1111-111111111111');