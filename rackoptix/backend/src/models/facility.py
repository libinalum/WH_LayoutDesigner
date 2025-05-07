"""
Facility model for RackOptix.

This module defines the data structures for representing warehouse facilities.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class Facility:
    """
    Represents a warehouse facility with physical boundaries and properties.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    description: str = ""
    clear_height: float = 0.0  # in feet/meters
    boundary: Dict[str, Any] = field(default_factory=dict)  # GeoJSON polygon
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Relationships (not stored directly, but used for object relationships)
    obstructions: List["Obstruction"] = field(default_factory=list)
    zones: List["Zone"] = field(default_factory=list)
    
    def add_obstruction(self, obstruction: "Obstruction") -> None:
        """Add an obstruction to the facility."""
        self.obstructions.append(obstruction)
    
    def add_zone(self, zone: "Zone") -> None:
        """Add a zone to the facility."""
        self.zones.append(zone)
    
    def get_area(self) -> float:
        """Calculate the total area of the facility in square feet/meters."""
        # In a real implementation, this would calculate the area from the boundary polygon
        # For now, return a placeholder value
        return 10000.0  # 10,000 sq ft/m


@dataclass
class Obstruction:
    """
    Represents a physical obstruction within a facility (column, wall, dock, etc.).
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    facility_id: str = ""
    type: str = ""  # e.g., "column", "wall", "dock"
    shape: Dict[str, Any] = field(default_factory=dict)  # GeoJSON polygon
    height: float = 0.0  # in feet/meters
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Zone:
    """
    Represents a designated area within a facility with a specific purpose.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    facility_id: str = ""
    name: str = ""
    purpose: str = ""  # e.g., "receiving", "shipping", "storage"
    boundary: Dict[str, Any] = field(default_factory=dict)  # GeoJSON polygon
    properties: Dict[str, Any] = field(default_factory=dict)