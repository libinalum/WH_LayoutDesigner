"""
Unit tests for the Layout model.
"""

import pytest
from src.models.layout import Layout


@pytest.mark.unit
@pytest.mark.model
class TestLayout:
    """Test cases for the Layout model."""

    def test_layout_creation(self):
        """Test that a layout can be created with valid parameters."""
        layout = Layout(
            id="test-layout-1",
            name="Test Layout",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
                {
                    "id": "rack-2",
                    "type": "selective",
                    "x": 25,
                    "y": 25,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
        )
        
        assert layout.id == "test-layout-1"
        assert layout.name == "Test Layout"
        assert layout.facility_id == "facility-1"
        assert len(layout.racks) == 2
        assert layout.racks[0]["id"] == "rack-1"
        assert layout.racks[1]["id"] == "rack-2"
        
    def test_layout_with_aisles(self):
        """Test that a layout can be created with aisles."""
        layout = Layout(
            id="test-layout-2",
            name="Test Layout with Aisles",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
            aisles=[
                {
                    "id": "aisle-1",
                    "name": "Aisle 1",
                    "width": 10,
                    "path": [(25, 5), (65, 5)],
                },
                {
                    "id": "aisle-2",
                    "name": "Aisle 2",
                    "width": 10,
                    "path": [(25, 20), (65, 20)],
                },
            ],
        )
        
        assert len(layout.aisles) == 2
        assert layout.aisles[0]["id"] == "aisle-1"
        assert layout.aisles[0]["name"] == "Aisle 1"
        assert layout.aisles[1]["id"] == "aisle-2"
        assert layout.aisles[1]["name"] == "Aisle 2"
        
    def test_layout_with_product_assignments(self):
        """Test that a layout can be created with product assignments."""
        layout = Layout(
            id="test-layout-3",
            name="Test Layout with Product Assignments",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
            product_assignments=[
                {
                    "product_id": "product-1",
                    "rack_id": "rack-1",
                    "bay": 1,
                    "level": 1,
                    "quantity": 10,
                },
                {
                    "product_id": "product-2",
                    "rack_id": "rack-1",
                    "bay": 2,
                    "level": 1,
                    "quantity": 8,
                },
            ],
        )
        
        assert len(layout.product_assignments) == 2
        assert layout.product_assignments[0]["product_id"] == "product-1"
        assert layout.product_assignments[0]["rack_id"] == "rack-1"
        assert layout.product_assignments[1]["product_id"] == "product-2"
        assert layout.product_assignments[1]["rack_id"] == "rack-1"
        
    def test_layout_validation(self):
        """Test that layout validation works correctly."""
        # Invalid rack (missing required fields)
        with pytest.raises(ValueError):
            Layout(
                id="invalid-layout",
                name="Invalid Layout",
                facility_id="facility-1",
                racks=[
                    {
                        "id": "rack-1",
                        # Missing type, x, y, etc.
                    },
                ],
            )
            
        # Invalid aisle (missing required fields)
        with pytest.raises(ValueError):
            Layout(
                id="invalid-layout",
                name="Invalid Layout",
                facility_id="facility-1",
                racks=[
                    {
                        "id": "rack-1",
                        "type": "selective",
                        "x": 25,
                        "y": 10,
                        "length": 40,
                        "width": 4,
                        "height": 20,
                        "orientation": 0,
                        "levels": 4,
                        "bays": 10,
                    },
                ],
                aisles=[
                    {
                        "id": "aisle-1",
                        # Missing name, width, path
                    },
                ],
            )
            
    def test_layout_metrics(self):
        """Test calculation of layout metrics."""
        layout = Layout(
            id="test-layout-4",
            name="Test Layout for Metrics",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
                {
                    "id": "rack-2",
                    "type": "selective",
                    "x": 25,
                    "y": 25,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
        )
        
        # Total rack footprint: 2 racks * (40 * 4) = 320 sq ft
        assert layout.total_rack_footprint == 320
        
        # Total storage volume: 2 racks * (40 * 4 * 20) = 6400 cubic ft
        assert layout.total_storage_volume == 6400
        
        # Total pallet positions: 2 racks * 4 levels * 10 bays = 80
        assert layout.total_pallet_positions == 80
        
    def test_layout_to_dict(self):
        """Test conversion of layout to dictionary."""
        layout = Layout(
            id="test-layout-5",
            name="Test Layout",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
        )
        
        layout_dict = layout.to_dict()
        assert isinstance(layout_dict, dict)
        assert layout_dict["id"] == "test-layout-5"
        assert layout_dict["name"] == "Test Layout"
        assert layout_dict["facility_id"] == "facility-1"
        assert len(layout_dict["racks"]) == 1
        assert layout_dict["racks"][0]["id"] == "rack-1"
        assert "total_rack_footprint" in layout_dict
        assert "total_storage_volume" in layout_dict
        assert "total_pallet_positions" in layout_dict
        
    def test_layout_rack_collision_detection(self):
        """Test detection of rack collisions."""
        layout = Layout(
            id="test-layout-6",
            name="Test Layout for Collision Detection",
            facility_id="facility-1",
            racks=[
                {
                    "id": "rack-1",
                    "type": "selective",
                    "x": 25,
                    "y": 10,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
                {
                    "id": "rack-2",
                    "type": "selective",
                    "x": 25,
                    "y": 25,
                    "length": 40,
                    "width": 4,
                    "height": 20,
                    "orientation": 0,
                    "levels": 4,
                    "bays": 10,
                },
            ],
        )
        
        # These racks don't collide
        assert not layout.has_rack_collisions()
        
        # Add a colliding rack
        layout.racks.append({
            "id": "rack-3",
            "type": "selective",
            "x": 25,  # Same x as rack-1
            "y": 10,  # Same y as rack-1
            "length": 40,
            "width": 4,
            "height": 20,
            "orientation": 0,
            "levels": 4,
            "bays": 10,
        })
        
        # Now there should be a collision
        assert layout.has_rack_collisions()