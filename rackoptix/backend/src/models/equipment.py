"""
Equipment model for RackOptix.

This module defines the data structures for representing material handling equipment.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class EquipmentType:
    """
    Represents a category of material handling equipment.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""  # e.g., "reach truck", "forklift", "turret truck"
    description: str = ""


@dataclass
class Equipment:
    """
    Represents a specific equipment model with operational parameters.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    type_id: str = ""
    name: str = ""
    
    # Operational parameters
    reach_height: float = 0.0  # Maximum reach height in feet/meters
    min_aisle_width: float = 0.0  # Minimum aisle width in feet/meters
    max_aisle_width: float = 0.0  # Maximum recommended aisle width in feet/meters
    turning_radius: float = 0.0  # Turning radius in feet/meters
    lift_capacity: float = 0.0  # Maximum lift capacity in pounds/kg
    
    # Additional specifications
    specifications: Dict[str, Any] = field(default_factory=dict)
    
    def can_reach(self, height: float) -> bool:
        """
        Check if the equipment can reach a specific height.
        
        Args:
            height: Height in feet/meters
            
        Returns:
            True if the equipment can reach the height, False otherwise
        """
        return height <= self.reach_height
    
    def can_lift(self, weight: float) -> bool:
        """
        Check if the equipment can lift a specific weight.
        
        Args:
            weight: Weight in pounds/kg
            
        Returns:
            True if the equipment can lift the weight, False otherwise
        """
        return weight <= self.lift_capacity
    
    def get_aisle_width_range(self) -> tuple[float, float]:
        """
        Get the range of supported aisle widths.
        
        Returns:
            Tuple of (min_aisle_width, max_aisle_width) in feet/meters
        """
        return (self.min_aisle_width, self.max_aisle_width)