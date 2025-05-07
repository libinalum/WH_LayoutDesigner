"""
End-to-end tests for key user workflows in the RackOptix application.
"""

import pytest
import time
import json
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.mark.e2e
class TestFacilityCreationWorkflow:
    """Test the end-to-end workflow for creating a facility."""

    def test_facility_creation_workflow(self, client):
        """Test the complete facility creation workflow."""
        # Step 1: Create a new facility
        facility_data = {
            "name": "E2E Test Facility",
            "length": 200.0,
            "width": 100.0,
            "height": 30.0,
            "units": "ft",
            "boundary": [(0, 0), (200, 0), (200, 100), (0, 100), (0, 0)],
        }
        
        response = client.post("/api/facilities", json=facility_data)
        assert response.status_code == 201
        facility = response.json()
        facility_id = facility["id"]
        
        # Step 2: Add zones to the facility
        zones_data = [
            {
                "name": "Receiving",
                "geometry": [(0, 0), (50, 0), (50, 100), (0, 100), (0, 0)],
            },
            {
                "name": "Storage",
                "geometry": [(50, 0), (150, 0), (150, 100), (50, 100), (50, 0)],
            },
            {
                "name": "Shipping",
                "geometry": [(150, 0), (200, 0), (200, 100), (150, 100), (150, 0)],
            },
        ]
        
        for zone in zones_data:
            response = client.post(f"/api/facilities/{facility_id}/zones", json=zone)
            assert response.status_code == 201
        
        # Step 3: Add obstructions to the facility
        obstructions_data = [
            {
                "type": "column",
                "geometry": [(25, 25), (26, 25), (26, 26), (25, 26), (25, 25)],
            },
            {
                "type": "column",
                "geometry": [(25, 75), (26, 75), (26, 76), (25, 76), (25, 75)],
            },
            {
                "type": "wall",
                "geometry": [(100, 0), (100, 20), (101, 20), (101, 0), (100, 0)],
            },
        ]
        
        for obstruction in obstructions_data:
            response = client.post(f"/api/facilities/{facility_id}/obstructions", json=obstruction)
            assert response.status_code == 201
        
        # Step 4: Verify the complete facility
        response = client.get(f"/api/facilities/{facility_id}")
        assert response.status_code == 200
        complete_facility = response.json()
        
        assert complete_facility["name"] == "E2E Test Facility"
        assert len(complete_facility["zones"]) == 3
        assert len(complete_facility["obstructions"]) == 3
        
        # Return the facility ID for use in other tests
        return facility_id


@pytest.mark.e2e
class TestProductManagementWorkflow:
    """Test the end-to-end workflow for managing products."""

    def test_product_management_workflow(self, client):
        """Test the complete product management workflow."""
        # Step 1: Create multiple products
        products_data = [
            {
                "name": "Product A",
                "length": 40,
                "width": 48,
                "height": 48,
                "weight": 1000,
                "units": "in",
                "velocity_class": "A",
                "storage_requirements": ["standard"],
            },
            {
                "name": "Product B",
                "length": 40,
                "width": 48,
                "height": 36,
                "weight": 800,
                "units": "in",
                "velocity_class": "B",
                "storage_requirements": ["standard"],
            },
            {
                "name": "Product C",
                "length": 40,
                "width": 48,
                "height": 24,
                "weight": 500,
                "units": "in",
                "velocity_class": "C",
                "storage_requirements": ["standard"],
            },
        ]
        
        product_ids = []
        for product in products_data:
            response = client.post("/api/products", json=product)
            assert response.status_code == 201
            product_ids.append(response.json()["id"])
        
        # Step 2: Create a product category
        category_data = {
            "name": "Standard Products",
            "description": "Regular stock items",
        }
        
        response = client.post("/api/product-categories", json=category_data)
        assert response.status_code == 201
        category_id = response.json()["id"]
        
        # Step 3: Assign products to the category
        for product_id in product_ids:
            response = client.post(f"/api/product-categories/{category_id}/products/{product_id}")
            assert response.status_code == 200
        
        # Step 4: Update a product
        updated_product = products_data[0].copy()
        updated_product["name"] = "Updated Product A"
        updated_product["weight"] = 1200
        
        response = client.put(f"/api/products/{product_ids[0]}", json=updated_product)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Product A"
        assert response.json()["weight"] == 1200
        
        # Step 5: Verify all products in the category
        response = client.get(f"/api/product-categories/{category_id}/products")
        assert response.status_code == 200
        category_products = response.json()
        
        assert len(category_products) == 3
        assert any(p["name"] == "Updated Product A" for p in category_products)
        
        # Return the product IDs for use in other tests
        return product_ids


@pytest.mark.e2e
class TestEquipmentManagementWorkflow:
    """Test the end-to-end workflow for managing equipment."""

    def test_equipment_management_workflow(self, client):
        """Test the complete equipment management workflow."""
        # Step 1: Create multiple equipment types
        equipment_types_data = [
            {
                "name": "Reach Truck",
                "description": "Standard reach truck for narrow aisles",
            },
            {
                "name": "Counterbalance Forklift",
                "description": "Standard counterbalance forklift",
            },
        ]
        
        equipment_type_ids = []
        for eq_type in equipment_types_data:
            response = client.post("/api/equipment-types", json=eq_type)
            assert response.status_code == 201
            equipment_type_ids.append(response.json()["id"])
        
        # Step 2: Create equipment for each type
        equipment_data = [
            {
                "name": "Reach Truck Model A",
                "type": "reach_truck",
                "type_id": equipment_type_ids[0],
                "max_height": 30,
                "min_aisle_width": 8.5,
                "units": "ft",
                "turning_radius": 6.0,
            },
            {
                "name": "Counterbalance Model B",
                "type": "counterbalance",
                "type_id": equipment_type_ids[1],
                "max_height": 20,
                "min_aisle_width": 12.0,
                "units": "ft",
                "turning_radius": 8.0,
            },
        ]
        
        equipment_ids = []
        for equipment in equipment_data:
            response = client.post("/api/equipment", json=equipment)
            assert response.status_code == 201
            equipment_ids.append(response.json()["id"])
        
        # Step 3: Update equipment specifications
        updated_equipment = equipment_data[0].copy()
        updated_equipment["max_height"] = 32
        updated_equipment["min_aisle_width"] = 8.0
        
        response = client.put(f"/api/equipment/{equipment_ids[0]}", json=updated_equipment)
        assert response.status_code == 200
        assert response.json()["max_height"] == 32
        assert response.json()["min_aisle_width"] == 8.0
        
        # Step 4: Verify all equipment
        response = client.get("/api/equipment")
        assert response.status_code == 200
        all_equipment = response.json()
        
        assert len(all_equipment) == 2
        assert any(e["max_height"] == 32 for e in all_equipment)
        
        # Return the equipment IDs for use in other tests
        return equipment_ids


@pytest.mark.e2e
class TestLayoutOptimizationWorkflow:
    """Test the end-to-end workflow for layout optimization."""

    def test_layout_optimization_workflow(self, client):
        """Test the complete layout optimization workflow."""
        # Step 1: Create prerequisite objects
        facility_workflow = TestFacilityCreationWorkflow()
        facility_id = facility_workflow.test_facility_creation_workflow(client)
        
        product_workflow = TestProductManagementWorkflow()
        product_ids = product_workflow.test_product_management_workflow(client)
        
        equipment_workflow = TestEquipmentManagementWorkflow()
        equipment_ids = equipment_workflow.test_equipment_management_workflow(client)
        
        # Step 2: Generate an initial layout
        layout_request = {
            "facility_id": facility_id,
            "equipment_id": equipment_ids[0],  # Use the reach truck
            "optimization_parameters": {
                "aisle_width": 10.0,
                "rack_type": "selective",
                "max_height": 30.0,
                "objective": "storage_capacity",
            }
        }
        
        response = client.post("/api/optimization/generate", json=layout_request)
        assert response.status_code == 201
        layout = response.json()
        layout_id = layout["id"]
        
        # Step 3: Optimize the layout for space utilization
        optimization_request = {
            "layout_id": layout_id,
            "objective": "space_utilization",
            "constraints": {
                "min_aisle_width": 9.0,
                "max_height": 32.0,
            }
        }
        
        response = client.post("/api/optimization/optimize", json=optimization_request)
        assert response.status_code == 200
        optimized_layout = response.json()
        
        # Step 4: Optimize rack elevations
        elevation_request = {
            "layout_id": layout_id,
            "equipment_id": equipment_ids[0],
            "product_ids": product_ids,
            "objective": "balanced",
            "constraints": {
                "max_levels": 6,
                "min_level_height": 4.0,
            }
        }
        
        response = client.post("/api/optimization/elevations", json=elevation_request)
        assert response.status_code == 200
        elevation_result = response.json()
        
        # Step 5: Optimize product slotting
        slotting_request = {
            "layout_id": layout_id,
            "product_ids": product_ids,
            "objective": "travel_time",
            "constraints": {
                "respect_velocity_classes": True,
                "max_products_per_bay": 4,
            }
        }
        
        response = client.post("/api/optimization/slotting", json=slotting_request)
        assert response.status_code == 200
        slotting_result = response.json()
        
        # Step 6: Evaluate the final layout
        response = client.get(f"/api/optimization/evaluate/{layout_id}")
        assert response.status_code == 200
        evaluation = response.json()
        
        # Verify the evaluation contains all expected metrics
        assert "storage_capacity" in evaluation["metrics"]
        assert "space_utilization" in evaluation["metrics"]
        assert "accessibility" in evaluation["metrics"]
        assert "travel_efficiency" in evaluation["metrics"]
        
        # Step 7: Export the layout
        export_request = {
            "layout_id": layout_id,
            "format": "json",
            "include_metrics": True,
        }
        
        response = client.post("/api/layouts/export", json=export_request)
        assert response.status_code == 200
        export_result = response.json()
        
        assert "layout" in export_result
        assert "metrics" in export_result
        assert "facility" in export_result
        
        # Return the layout ID for use in other tests
        return layout_id


@pytest.mark.e2e
class TestReportGenerationWorkflow:
    """Test the end-to-end workflow for report generation."""

    def test_report_generation_workflow(self, client):
        """Test the complete report generation workflow."""
        # Step 1: Create a layout through the optimization workflow
        layout_workflow = TestLayoutOptimizationWorkflow()
        layout_id = layout_workflow.test_layout_optimization_workflow(client)
        
        # Step 2: Generate a layout summary report
        summary_report_request = {
            "layout_id": layout_id,
            "report_type": "layout_summary",
            "title": "Layout Summary Report",
            "description": "Summary of layout metrics and configuration",
        }
        
        response = client.post("/api/reports", json=summary_report_request)
        assert response.status_code == 201
        summary_report = response.json()
        summary_report_id = summary_report["id"]
        
        # Step 3: Generate a rack inventory report
        inventory_report_request = {
            "layout_id": layout_id,
            "report_type": "rack_inventory",
            "title": "Rack Inventory Report",
            "description": "Detailed inventory of all racks in the layout",
        }
        
        response = client.post("/api/reports", json=inventory_report_request)
        assert response.status_code == 201
        inventory_report = response.json()
        inventory_report_id = inventory_report["id"]
        
        # Step 4: Generate an optimization comparison report
        # First, create a second layout to compare
        layout_request = {
            "facility_id": layout_workflow.facility_id,  # Use the same facility
            "equipment_id": layout_workflow.equipment_ids[1],  # Use different equipment
            "optimization_parameters": {
                "aisle_width": 12.0,  # Different aisle width
                "rack_type": "selective",
                "max_height": 20.0,  # Different max height
                "objective": "accessibility",  # Different objective
            }
        }
        
        response = client.post("/api/optimization/generate", json=layout_request)
        assert response.status_code == 201
        second_layout_id = response.json()["id"]
        
        # Now create the comparison report
        comparison_report_request = {
            "layout_ids": [layout_id, second_layout_id],
            "report_type": "optimization_comparison",
            "title": "Layout Comparison Report",
            "description": "Comparison of two different layout optimizations",
        }
        
        response = client.post("/api/reports", json=comparison_report_request)
        assert response.status_code == 201
        comparison_report = response.json()
        comparison_report_id = comparison_report["id"]
        
        # Step 5: Export a report to PDF
        export_request = {
            "report_id": summary_report_id,
            "format": "pdf",
            "include_charts": True,
        }
        
        response = client.post("/api/reports/export", json=export_request)
        assert response.status_code == 200
        # The response should contain a URL to download the PDF
        assert "download_url" in response.json()
        
        # Step 6: Verify all reports
        response = client.get("/api/reports")
        assert response.status_code == 200
        all_reports = response.json()
        
        assert len(all_reports) >= 3
        assert any(r["id"] == summary_report_id for r in all_reports)
        assert any(r["id"] == inventory_report_id for r in all_reports)
        assert any(r["id"] == comparison_report_id for r in all_reports)