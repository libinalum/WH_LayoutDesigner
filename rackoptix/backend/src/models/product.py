"""
Product model for RackOptix.

This module defines the data structures for representing products/SKUs.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class ProductCategory:
    """
    Represents a grouping of similar products.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    description: str = ""


@dataclass
class Product:
    """
    Represents a stock keeping unit (SKU) with physical dimensions and handling requirements.
    """
    
    id: str = field(default_factory=lambda: str(uuid4()))
    category_id: Optional[str] = None
    sku: str = ""
    name: str = ""
    description: str = ""
    
    # Physical dimensions
    length: float = 0.0  # in inches/cm
    width: float = 0.0  # in inches/cm
    height: float = 0.0  # in inches/cm
    weight: float = 0.0  # in pounds/kg
    
    # Operational characteristics
    velocity_class: str = "C"  # A, B, C classification
    storage_method: str = "pallet"  # e.g., "pallet", "case", "tote", "each"
    stackable: bool = False
    
    # Special requirements
    handling_limitations: Dict[str, Any] = field(default_factory=dict)
    environmental_reqs: Dict[str, Any] = field(default_factory=dict)
    monthly_throughput: int = 0
    
    def get_dimensions(self) -> Tuple[float, float, float]:
        """Get the dimensions as a tuple (length, width, height)."""
        return (self.length, self.width, self.height)
    
    def get_volume(self) -> float:
        """Calculate the volume of the product in cubic inches/cm."""
        return self.length * self.width * self.height
    
    def get_density(self) -> float:
        """Calculate the density of the product (weight/volume)."""
        volume = self.get_volume()
        if volume > 0:
            return self.weight / volume
        return 0.0
    
    def is_compatible_with_location(self, location: Any) -> bool:
        """
        Check if the product is compatible with a given storage location.
        
        Args:
            location: A storage location object
            
        Returns:
            True if the product can be stored in the location, False otherwise
        """
        # In a real implementation, this would check dimensions, weight limits, etc.
        # For now, return a placeholder value
        return True