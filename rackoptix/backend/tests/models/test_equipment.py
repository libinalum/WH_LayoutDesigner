"""
Unit tests for the Equipment model.
"""

import pytest
from src.models.equipment import Equipment


@pytest.mark.unit
@pytest.mark.model
class TestEquipment:
    """Test cases for the Equipment model."""

    def test_equipment_creation(self):
        """Test that equipment can be created with valid parameters."""
        equipment = Equipment(
            id="test-equipment-1",
            name="Test Reach Truck",
            type="reach_truck",
            max_height=30,
            min_aisle_width=8.5,
            units="ft",
            turning_radius=6.0,
        )
        
        assert equipment.id == "test-equipment-1"
        assert equipment.name == "Test Reach Truck"
        assert equipment.type == "reach_truck"
        assert equipment.max_height == 30
        assert equipment.min_aisle_width == 8.5
        assert equipment.units == "ft"
        assert equipment.turning_radius == 6.0
        
    def test_equipment_validation(self):
        """Test that equipment validation works correctly."""
        # Invalid equipment type
        with pytest.raises(ValueError):
            Equipment(
                id="invalid-equipment",
                name="Invalid Equipment",
                type="invalid_type",  # Invalid type
                max_height=30,
                min_aisle_width=8.5,
                units="ft",
                turning_radius=6.0,
            )
            
        # Invalid max_height (negative)
        with pytest.raises(ValueError):
            Equipment(
                id="invalid-equipment",
                name="Invalid Equipment",
                type="reach_truck",
                max_height=-30,  # Negative height
                min_aisle_width=8.5,
                units="ft",
                turning_radius=6.0,
            )
            
        # Invalid min_aisle_width (negative)
        with pytest.raises(ValueError):
            Equipment(
                id="invalid-equipment",
                name="Invalid Equipment",
                type="reach_truck",
                max_height=30,
                min_aisle_width=-8.5,  # Negative aisle width
                units="ft",
                turning_radius=6.0,
            )
            
    def test_equipment_with_optional_parameters(self):
        """Test that equipment can be created with optional parameters."""
        equipment = Equipment(
            id="test-equipment-2",
            name="Test Counterbalance Forklift",
            type="counterbalance",
            max_height=20,
            min_aisle_width=12.0,
            units="ft",
            turning_radius=8.0,
            max_capacity=5000,  # Optional parameter
            max_reach=10.0,     # Optional parameter
            cost_per_hour=75.0, # Optional parameter
        )
        
        assert equipment.max_capacity == 5000
        assert equipment.max_reach == 10.0
        assert equipment.cost_per_hour == 75.0
        
    def test_equipment_to_dict(self):
        """Test conversion of equipment to dictionary."""
        equipment = Equipment(
            id="test-equipment-3",
            name="Test Reach Truck",
            type="reach_truck",
            max_height=30,
            min_aisle_width=8.5,
            units="ft",
            turning_radius=6.0,
        )
        
        equipment_dict = equipment.to_dict()
        assert isinstance(equipment_dict, dict)
        assert equipment_dict["id"] == "test-equipment-3"
        assert equipment_dict["name"] == "Test Reach Truck"
        assert equipment_dict["type"] == "reach_truck"
        assert equipment_dict["max_height"] == 30
        assert equipment_dict["min_aisle_width"] == 8.5
        assert equipment_dict["units"] == "ft"
        assert equipment_dict["turning_radius"] == 6.0
        
    def test_equipment_unit_conversion(self):
        """Test unit conversion for equipment dimensions."""
        # Create equipment with feet
        equipment_feet = Equipment(
            id="test-equipment-4a",
            name="Test Reach Truck in Feet",
            type="reach_truck",
            max_height=30,
            min_aisle_width=8.5,
            units="ft",
            turning_radius=6.0,
        )
        
        # Create equivalent equipment with inches
        equipment_inches = Equipment(
            id="test-equipment-4b",
            name="Test Reach Truck in Inches",
            type="reach_truck",
            max_height=30 * 12,  # 360 inches
            min_aisle_width=8.5 * 12,  # 102 inches
            units="in",
            turning_radius=6.0 * 12,  # 72 inches
        )
        
        # Heights should be equivalent when accounting for unit conversion
        assert equipment_feet.max_height_inches == equipment_inches.max_height
        assert equipment_feet.min_aisle_width_inches == equipment_inches.min_aisle_width
        assert equipment_feet.turning_radius_inches == equipment_inches.turning_radius
        
    def test_equipment_compatibility(self):
        """Test equipment compatibility with rack heights."""
        equipment = Equipment(
            id="test-equipment-5",
            name="Test Reach Truck",
            type="reach_truck",
            max_height=30,
            min_aisle_width=8.5,
            units="ft",
            turning_radius=6.0,
        )
        
        # Equipment should be compatible with racks shorter than max_height
        assert equipment.is_compatible_with_height(25.0)
        
        # Equipment should not be compatible with racks taller than max_height
        assert not equipment.is_compatible_with_height(35.0)
        
        # Edge case: exactly at max_height
        assert equipment.is_compatible_with_height(30.0)
        
    def test_equipment_aisle_requirements(self):
        """Test equipment aisle width requirements."""
        equipment = Equipment(
            id="test-equipment-6",
            name="Test Counterbalance Forklift",
            type="counterbalance",
            max_height=20,
            min_aisle_width=12.0,
            units="ft",
            turning_radius=8.0,
        )
        
        # Aisle should be wide enough
        assert equipment.is_aisle_width_sufficient(14.0)
        
        # Aisle should not be wide enough
        assert not equipment.is_aisle_width_sufficient(10.0)
        
        # Edge case: exactly at min_aisle_width
        assert equipment.is_aisle_width_sufficient(12.0)