"""
Layout model for RackOptix.

This module defines the data structures for representing warehouse layouts.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class Layout:
    """
    Represents a complete warehouse layout configuration.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    facility_id: str = ""
    name: str = ""
    description: str = ""
    status: str = "draft"  # e.g., "draft", "in_progress", "completed", "archived"
    parameters: Dict[str, Any] = field(default_factory=dict)
    metrics: Dict[str, Any] = field(default_factory=dict)
    
    # Relationships (not stored directly, but used for object relationships)
    racks: List["Rack"] = field(default_factory=list)
    aisles: List["Aisle"] = field(default_factory=list)
    
    def add_rack(self, rack: "Rack") -> None:
        """Add a rack to the layout."""
        self.racks.append(rack)
    
    def add_aisle(self, aisle: "Aisle") -> None:
        """Add an aisle to the layout."""
        self.aisles.append(aisle)
    
    def calculate_metrics(self) -> Dict[str, Any]:
        """
        Calculate performance metrics for the layout.
        
        Returns:
            Dictionary of metric names to values
        """
        # In a real implementation, this would calculate actual metrics
        # For now, return placeholder values
        metrics = {
            "storage_density": 0.85,  # 85% utilization
            "travel_distance": 45.6,  # Average travel distance in feet
            "space_utilization": 0.78,  # 78% of floor space utilized
            "pallet_positions": 1200,  # Total pallet positions
        }
        
        # Update the layout's metrics
        self.metrics = metrics
        
        return metrics


@dataclass
class RackType:
    """
    Represents a type of storage rack with configurable parameters.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""  # e.g., "selective", "drive-in", "push-back"
    description: str = ""
    specifications: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Rack:
    """
    Represents a storage rack within a layout.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    layout_id: str = ""
    rack_type_id: str = ""
    location: Dict[str, Any] = field(default_factory=dict)  # GeoJSON polygon
    orientation: float = 0.0  # in degrees
    height: float = 0.0  # in feet/meters
    length: float = 0.0  # in feet/meters
    depth: float = 0.0  # in feet/meters
    bays: int = 0
    configuration: Dict[str, Any] = field(default_factory=dict)
    
    # Relationships (not stored directly, but used for object relationships)
    bay_objects: List["Bay"] = field(default_factory=list)
    
    def add_bay(self, bay: "Bay") -> None:
        """Add a bay to the rack."""
        self.bay_objects.append(bay)
    
    def calculate_capacity(self) -> int:
        """
        Calculate the storage capacity of the rack in pallet positions.
        
        Returns:
            Number of pallet positions
        """
        # In a real implementation, this would calculate based on dimensions and configuration
        # For now, return a placeholder value
        return self.bays * 3  # Assuming 3 levels per bay


@dataclass
class Bay:
    """
    Represents a section of a rack.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    rack_id: str = ""
    position: int = 0
    width: float = 0.0  # in feet/meters
    beam_elevations: List[float] = field(default_factory=list)  # in feet/meters
    
    # Relationships (not stored directly, but used for object relationships)
    locations: List["Location"] = field(default_factory=list)
    
    def add_location(self, location: "Location") -> None:
        """Add a location to the bay."""
        self.locations.append(location)


@dataclass
class Aisle:
    """
    Represents a pathway between racks.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    layout_id: str = ""
    equipment_id: Optional[str] = None
    path: Dict[str, Any] = field(default_factory=dict)  # GeoJSON linestring
    width: float = 0.0  # in feet/meters
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Location:
    """
    Represents a specific storage location within a rack.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    rack_id: str = ""
    bay_id: str = ""
    level: int = 0
    position: int = 0
    elevation: float = 0.0  # in feet/meters
    dimensions: Dict[str, float] = field(default_factory=dict)  # length, width, height
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProductAssignment:
    """
    Represents the assignment of a product to a specific location.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    layout_id: str = ""
    product_id: str = ""
    location_id: str = ""
    quantity: int = 1