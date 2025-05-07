"""
Integration tests for the RackOptix API endpoints.
"""

import json
import pytest
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def test_facility():
    """Create a test facility for API testing."""
    return {
        "name": "Test Facility",
        "length": 100.0,
        "width": 80.0,
        "height": 12.0,
        "units": "ft",
        "boundary": [(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
        "obstructions": [
            {
                "type": "column",
                "geometry": [(10, 10), (11, 10), (11, 11), (10, 11), (10, 10)],
            }
        ],
        "zones": [
            {
                "name": "Receiving",
                "geometry": [(0, 0), (20, 0), (20, 80), (0, 80), (0, 0)],
            }
        ],
    }


@pytest.fixture
def test_product():
    """Create a test product for API testing."""
    return {
        "name": "Test Product",
        "length": 40,
        "width": 48,
        "height": 48,
        "weight": 1000,
        "units": "in",
        "velocity_class": "A",
        "storage_requirements": ["standard"],
    }


@pytest.fixture
def test_equipment():
    """Create a test equipment for API testing."""
    return {
        "name": "Test Reach Truck",
        "type": "reach_truck",
        "max_height": 30,
        "min_aisle_width": 8.5,
        "units": "ft",
        "turning_radius": 6.0,
    }


@pytest.mark.integration
@pytest.mark.api
class TestFacilityEndpoints:
    """Test cases for the facility API endpoints."""

    def test_create_facility(self, client, test_facility):
        """Test creating a new facility."""
        response = client.post("/api/facilities", json=test_facility)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == test_facility["name"]
        assert data["length"] == test_facility["length"]
        assert data["width"] == test_facility["width"]
        assert data["height"] == test_facility["height"]
        
        # Store the facility ID for later tests
        return data["id"]
        
    def test_get_facilities(self, client, test_facility):
        """Test getting all facilities."""
        # First create a facility
        facility_id = self.test_create_facility(client, test_facility)
        
        # Then get all facilities
        response = client.get("/api/facilities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(facility["id"] == facility_id for facility in data)
        
    def test_get_facility(self, client, test_facility):
        """Test getting a specific facility."""
        # First create a facility
        facility_id = self.test_create_facility(client, test_facility)
        
        # Then get the facility
        response = client.get(f"/api/facilities/{facility_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == facility_id
        assert data["name"] == test_facility["name"]
        
    def test_update_facility(self, client, test_facility):
        """Test updating a facility."""
        # First create a facility
        facility_id = self.test_create_facility(client, test_facility)
        
        # Then update the facility
        updated_facility = test_facility.copy()
        updated_facility["name"] = "Updated Test Facility"
        response = client.put(f"/api/facilities/{facility_id}", json=updated_facility)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == facility_id
        assert data["name"] == "Updated Test Facility"
        
    def test_delete_facility(self, client, test_facility):
        """Test deleting a facility."""
        # First create a facility
        facility_id = self.test_create_facility(client, test_facility)
        
        # Then delete the facility
        response = client.delete(f"/api/facilities/{facility_id}")
        assert response.status_code == 204
        
        # Verify the facility is deleted
        response = client.get(f"/api/facilities/{facility_id}")
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
class TestProductEndpoints:
    """Test cases for the product API endpoints."""

    def test_create_product(self, client, test_product):
        """Test creating a new product."""
        response = client.post("/api/products", json=test_product)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == test_product["name"]
        assert data["length"] == test_product["length"]
        assert data["width"] == test_product["width"]
        assert data["height"] == test_product["height"]
        
        # Store the product ID for later tests
        return data["id"]
        
    def test_get_products(self, client, test_product):
        """Test getting all products."""
        # First create a product
        product_id = self.test_create_product(client, test_product)
        
        # Then get all products
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(product["id"] == product_id for product in data)
        
    def test_get_product(self, client, test_product):
        """Test getting a specific product."""
        # First create a product
        product_id = self.test_create_product(client, test_product)
        
        # Then get the product
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == test_product["name"]
        
    def test_update_product(self, client, test_product):
        """Test updating a product."""
        # First create a product
        product_id = self.test_create_product(client, test_product)
        
        # Then update the product
        updated_product = test_product.copy()
        updated_product["name"] = "Updated Test Product"
        response = client.put(f"/api/products/{product_id}", json=updated_product)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == "Updated Test Product"
        
    def test_delete_product(self, client, test_product):
        """Test deleting a product."""
        # First create a product
        product_id = self.test_create_product(client, test_product)
        
        # Then delete the product
        response = client.delete(f"/api/products/{product_id}")
        assert response.status_code == 204
        
        # Verify the product is deleted
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
class TestEquipmentEndpoints:
    """Test cases for the equipment API endpoints."""

    def test_create_equipment(self, client, test_equipment):
        """Test creating new equipment."""
        response = client.post("/api/equipment", json=test_equipment)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == test_equipment["name"]
        assert data["type"] == test_equipment["type"]
        assert data["max_height"] == test_equipment["max_height"]
        
        # Store the equipment ID for later tests
        return data["id"]
        
    def test_get_equipment_list(self, client, test_equipment):
        """Test getting all equipment."""
        # First create equipment
        equipment_id = self.test_create_equipment(client, test_equipment)
        
        # Then get all equipment
        response = client.get("/api/equipment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(equipment["id"] == equipment_id for equipment in data)
        
    def test_get_equipment(self, client, test_equipment):
        """Test getting specific equipment."""
        # First create equipment
        equipment_id = self.test_create_equipment(client, test_equipment)
        
        # Then get the equipment
        response = client.get(f"/api/equipment/{equipment_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == equipment_id
        assert data["name"] == test_equipment["name"]
        
    def test_update_equipment(self, client, test_equipment):
        """Test updating equipment."""
        # First create equipment
        equipment_id = self.test_create_equipment(client, test_equipment)
        
        # Then update the equipment
        updated_equipment = test_equipment.copy()
        updated_equipment["name"] = "Updated Test Equipment"
        response = client.put(f"/api/equipment/{equipment_id}", json=updated_equipment)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == equipment_id
        assert data["name"] == "Updated Test Equipment"
        
    def test_delete_equipment(self, client, test_equipment):
        """Test deleting equipment."""
        # First create equipment
        equipment_id = self.test_create_equipment(client, test_equipment)
        
        # Then delete the equipment
        response = client.delete(f"/api/equipment/{equipment_id}")
        assert response.status_code == 204
        
        # Verify the equipment is deleted
        response = client.get(f"/api/equipment/{equipment_id}")
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
class TestOptimizationEndpoints:
    """Test cases for the optimization API endpoints."""

    def test_generate_layout(self, client, test_facility, test_equipment):
        """Test generating a new layout."""
        # First create a facility and equipment
        facility_response = client.post("/api/facilities", json=test_facility)
        facility_id = facility_response.json()["id"]
        
        equipment_response = client.post("/api/equipment", json=test_equipment)
        equipment_id = equipment_response.json()["id"]
        
        # Then generate a layout
        layout_request = {
            "facility_id": facility_id,
            "equipment_id": equipment_id,
            "optimization_parameters": {
                "aisle_width": 10.0,
                "rack_type": "selective",
                "max_height": 20.0,
                "objective": "storage_capacity",
            }
        }
        
        response = client.post("/api/optimization/generate", json=layout_request)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "facility_id" in data
        assert data["facility_id"] == facility_id
        assert "racks" in data
        assert len(data["racks"]) > 0
        
        # Store the layout ID for later tests
        return data["id"]
        
    def test_optimize_layout(self, client, test_facility, test_equipment):
        """Test optimizing an existing layout."""
        # First create a layout
        layout_id = self.test_generate_layout(client, test_facility, test_equipment)
        
        # Then optimize the layout
        optimization_request = {
            "layout_id": layout_id,
            "objective": "space_utilization",
            "constraints": {
                "min_aisle_width": 9.0,
                "max_height": 25.0,
            }
        }
        
        response = client.post("/api/optimization/optimize", json=optimization_request)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["id"] == layout_id
        assert "metrics" in data
        assert "space_utilization" in data["metrics"]
        
    def test_optimize_elevations(self, client, test_facility, test_equipment, test_product):
        """Test optimizing rack elevations."""
        # First create necessary objects
        facility_response = client.post("/api/facilities", json=test_facility)
        facility_id = facility_response.json()["id"]
        
        equipment_response = client.post("/api/equipment", json=test_equipment)
        equipment_id = equipment_response.json()["id"]
        
        product_response = client.post("/api/products", json=test_product)
        product_id = product_response.json()["id"]
        
        # Generate a layout
        layout_request = {
            "facility_id": facility_id,
            "equipment_id": equipment_id,
            "optimization_parameters": {
                "aisle_width": 10.0,
                "rack_type": "selective",
                "max_height": 20.0,
                "objective": "storage_capacity",
            }
        }
        
        layout_response = client.post("/api/optimization/generate", json=layout_request)
        layout_id = layout_response.json()["id"]
        
        # Then optimize elevations
        elevation_request = {
            "layout_id": layout_id,
            "equipment_id": equipment_id,
            "product_ids": [product_id],
            "objective": "balanced",
            "constraints": {
                "max_levels": 6,
                "min_level_height": 4.0,
            }
        }
        
        response = client.post("/api/optimization/elevations", json=elevation_request)
        assert response.status_code == 200
        data = response.json()
        assert "layout_id" in data
        assert data["layout_id"] == layout_id
        assert "elevations" in data
        assert len(data["elevations"]) > 0
        
    def test_evaluate_layout(self, client, test_facility, test_equipment):
        """Test evaluating a layout."""
        # First create a layout
        layout_id = self.test_generate_layout(client, test_facility, test_equipment)
        
        # Then evaluate the layout
        response = client.get(f"/api/optimization/evaluate/{layout_id}")
        assert response.status_code == 200
        data = response.json()
        assert "layout_id" in data
        assert data["layout_id"] == layout_id
        assert "metrics" in data
        assert "storage_capacity" in data["metrics"]
        assert "space_utilization" in data["metrics"]
        assert "accessibility" in data["metrics"]