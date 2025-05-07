"""
Unit tests for the Facility model.
"""

import pytest
from src.models.facility import Facility


@pytest.mark.unit
@pytest.mark.model
class TestFacility:
    """Test cases for the Facility model."""

    def test_facility_creation(self):
        """Test that a facility can be created with valid parameters."""
        facility = Facility(
            id="test-facility-1",
            name="Test Facility",
            length=100.0,
            width=80.0,
            height=12.0,
            units="ft",
            boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
        )
        
        assert facility.id == "test-facility-1"
        assert facility.name == "Test Facility"
        assert facility.length == 100.0
        assert facility.width == 80.0
        assert facility.height == 12.0
        assert facility.units == "ft"
        assert len(facility.boundary) == 5
        assert facility.area == 8000.0  # 100 * 80
        
    def test_facility_with_obstructions(self):
        """Test that a facility can be created with obstructions."""
        facility = Facility(
            id="test-facility-2",
            name="Test Facility with Obstructions",
            length=100.0,
            width=80.0,
            height=12.0,
            units="ft",
            boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
            obstructions=[
                {
                    "type": "column",
                    "geometry": [(10, 10), (11, 10), (11, 11), (10, 11), (10, 10)],
                },
                {
                    "type": "wall",
                    "geometry": [(20, 0), (20, 30), (21, 30), (21, 0), (20, 0)],
                },
            ],
        )
        
        assert len(facility.obstructions) == 2
        assert facility.obstructions[0]["type"] == "column"
        assert facility.obstructions[1]["type"] == "wall"
        
    def test_facility_with_zones(self):
        """Test that a facility can be created with zones."""
        facility = Facility(
            id="test-facility-3",
            name="Test Facility with Zones",
            length=100.0,
            width=80.0,
            height=12.0,
            units="ft",
            boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
            zones=[
                {
                    "id": "zone-1",
                    "name": "Receiving",
                    "geometry": [(0, 0), (20, 0), (20, 80), (0, 80), (0, 0)],
                },
                {
                    "id": "zone-2",
                    "name": "Storage",
                    "geometry": [(20, 0), (80, 0), (80, 80), (20, 80), (20, 0)],
                },
            ],
        )
        
        assert len(facility.zones) == 2
        assert facility.zones[0]["id"] == "zone-1"
        assert facility.zones[0]["name"] == "Receiving"
        assert facility.zones[1]["id"] == "zone-2"
        assert facility.zones[1]["name"] == "Storage"
        
    def test_facility_validation(self):
        """Test that facility validation works correctly."""
        # Invalid boundary (not closed)
        with pytest.raises(ValueError):
            Facility(
                id="invalid-facility",
                name="Invalid Facility",
                length=100.0,
                width=80.0,
                height=12.0,
                units="ft",
                boundary=[(0, 0), (100, 0), (100, 80), (0, 80)],  # Not closed
            )
            
        # Invalid dimensions (negative)
        with pytest.raises(ValueError):
            Facility(
                id="invalid-facility",
                name="Invalid Facility",
                length=-100.0,  # Negative length
                width=80.0,
                height=12.0,
                units="ft",
                boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
            )
            
    def test_facility_usable_area(self):
        """Test calculation of usable area (total area minus obstructions)."""
        facility = Facility(
            id="test-facility-4",
            name="Test Facility for Area Calculation",
            length=100.0,
            width=80.0,
            height=12.0,
            units="ft",
            boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
            obstructions=[
                {
                    "type": "column",
                    "geometry": [(10, 10), (11, 10), (11, 11), (10, 11), (10, 10)],
                },  # 1 sq ft
                {
                    "type": "wall",
                    "geometry": [(20, 0), (20, 30), (21, 30), (21, 0), (20, 0)],
                },  # 30 sq ft
            ],
        )
        
        # Total area is 8000 sq ft, obstructions take up 31 sq ft
        assert facility.usable_area == pytest.approx(7969.0)
        
    def test_facility_to_dict(self):
        """Test conversion of facility to dictionary."""
        facility = Facility(
            id="test-facility-5",
            name="Test Facility",
            length=100.0,
            width=80.0,
            height=12.0,
            units="ft",
            boundary=[(0, 0), (100, 0), (100, 80), (0, 80), (0, 0)],
        )
        
        facility_dict = facility.to_dict()
        assert isinstance(facility_dict, dict)
        assert facility_dict["id"] == "test-facility-5"
        assert facility_dict["name"] == "Test Facility"
        assert facility_dict["length"] == 100.0
        assert facility_dict["width"] == 80.0
        assert facility_dict["height"] == 12.0
        assert facility_dict["units"] == "ft"
        assert "boundary" in facility_dict
        assert "area" in facility_dict