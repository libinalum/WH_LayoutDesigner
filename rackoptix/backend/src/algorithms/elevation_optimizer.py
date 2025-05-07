"""
Elevation Profile Optimizer for RackOptix.

This module implements algorithms for optimizing beam elevations in rack bays
based on SKU dimensions and equipment reach capabilities.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple

import numpy as np
from ortools.sat.python import cp_model

from ..models.equipment import Equipment
from ..models.product import Product
from ..models.layout import Rack, Bay

logger = logging.getLogger(__name__)


class ElevationProfileOptimizer:
    """
    Optimizes beam elevations for rack bays based on SKU dimensions and equipment capabilities.
    
    This optimizer uses constraint programming to determine the optimal placement of beams
    to maximize storage capacity while ensuring accessibility and compliance with constraints.
    """
    
    def __init__(self):
        """Initialize the elevation profile optimizer."""
        logger.info("Elevation Profile Optimizer initialized")
    
    def optimize(
        self,
        rack: Rack,
        products: List[Product],
        equipment: Equipment,
        constraints: Dict[str, Any] = None,
        time_limit_seconds: int = 30
    ) -> List[float]:
        """
        Optimize beam elevations for a rack given SKUs and equipment.
        
        Args:
            rack: The rack to optimize
            products: List of products that will be stored in the rack
            equipment: The material handling equipment used to access the rack
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of optimized beam elevations in feet/meters
        """
        logger.info(f"Optimizing elevations for rack: {rack.id}")
        
        # Default constraints if none provided
        if constraints is None:
            constraints = {
                "min_clearance": 6.0,  # 6 inches/cm clearance above pallets
                "min_beam_spacing": 12.0,  # 12 inches/cm minimum between beams
                "max_levels": 4,  # Maximum 4 levels per bay
            }
        
        # Extract product heights
        product_heights = [product.height for product in products]
        if not product_heights:
            logger.warning("No products provided for elevation optimization")
            return []
        
        # Calculate max height based on equipment reach
        max_height = equipment.reach_height
        
        try:
            # Use constraint programming to find optimal elevations
            return self._solve_with_cp(
                product_heights=product_heights,
                max_height=max_height,
                constraints=constraints,
                time_limit_seconds=time_limit_seconds
            )
        except Exception as e:
            logger.error(f"Error in constraint programming solver: {e}")
            # Fall back to heuristic method if CP fails
            logger.info("Falling back to heuristic method")
            return self._solve_with_heuristic(
                product_heights=product_heights,
                max_height=max_height,
                constraints=constraints
            )
    
    def _solve_with_cp(
        self,
        product_heights: List[float],
        max_height: float,
        constraints: Dict[str, Any],
        time_limit_seconds: int = 30
    ) -> List[float]:
        """
        Solve the elevation optimization problem using constraint programming.
        
        Args:
            product_heights: List of product heights
            max_height: Maximum height constraint (equipment reach)
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of optimized beam elevations in feet/meters
        """
        logger.info("Solving elevation optimization with constraint programming")
        
        # Extract constraints
        min_clearance = constraints.get("min_clearance", 6.0)
        min_beam_spacing = constraints.get("min_beam_spacing", 12.0)
        max_levels = constraints.get("max_levels", 4)
        
        # Convert to integer values (in mm) for CP solver
        max_height_mm = int(max_height * 304.8)  # Convert feet to mm
        min_clearance_mm = int(min_clearance * 25.4)  # Convert inches to mm
        min_beam_spacing_mm = int(min_beam_spacing * 25.4)  # Convert inches to mm
        product_heights_mm = [int(h * 25.4) for h in product_heights]  # Convert inches to mm
        
        # Find max product height
        max_product_height_mm = max(product_heights_mm) if product_heights_mm else 0
        
        # Create CP model
        model = cp_model.CpModel()
        
        # Create variables for beam elevations (in mm)
        # First beam is always at floor level (0)
        beam_elevations = [0]
        for i in range(1, max_levels + 1):
            # Create variable for beam i
            beam_var = model.NewIntVar(
                min_beam_spacing_mm,  # Minimum elevation
                max_height_mm,  # Maximum elevation
                f'beam_{i}'
            )
            beam_elevations.append(beam_var)
        
        # Add constraints
        
        # Beams must be in ascending order
        for i in range(1, max_levels):
            model.Add(beam_elevations[i] < beam_elevations[i+1])
        
        # Minimum spacing between beams based on product heights
        for i in range(max_levels):
            model.Add(
                beam_elevations[i+1] - beam_elevations[i] >= 
                max_product_height_mm + min_clearance_mm
            )
        
        # Maximum height constraint
        model.Add(beam_elevations[max_levels] <= max_height_mm)
        
        # Objective: Maximize number of levels while minimizing wasted space
        # We want to fit as many levels as possible within the height constraint
        # while ensuring each level has just enough space for the tallest product
        
        # First, maximize the number of usable levels
        usable_levels = []
        for i in range(max_levels):
            # A level is usable if it has enough space for the tallest product
            is_usable = model.NewBoolVar(f'is_usable_{i}')
            model.Add(
                beam_elevations[i+1] - beam_elevations[i] >= 
                max_product_height_mm + min_clearance_mm
            ).OnlyEnforceIf(is_usable)
            usable_levels.append(is_usable)
        
        # Objective: maximize number of usable levels
        model.Maximize(sum(usable_levels))
        
        # Set time limit
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = time_limit_seconds
        
        # Solve the model
        status = solver.Solve(model)
        
        # Process results
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            # Extract solution
            result = [0.0]  # First beam at floor level
            for i in range(1, max_levels + 1):
                # Convert back to feet
                elevation_feet = solver.Value(beam_elevations[i]) / 304.8
                result.append(elevation_feet)
            
            logger.info(f"Found optimal elevations: {result}")
            return result
        else:
            logger.warning(f"CP solver failed with status: {status}")
            raise RuntimeError("Constraint programming solver failed to find a solution")
    
    def _solve_with_heuristic(
        self,
        product_heights: List[float],
        max_height: float,
        constraints: Dict[str, Any]
    ) -> List[float]:
        """
        Solve the elevation optimization problem using a simple heuristic approach.
        
        This is a fallback method when the constraint programming solver fails.
        
        Args:
            product_heights: List of product heights
            max_height: Maximum height constraint (equipment reach)
            constraints: Additional constraints for the optimization
            
        Returns:
            List of optimized beam elevations in feet/meters
        """
        logger.info("Solving elevation optimization with heuristic method")
        
        # Extract constraints
        min_clearance = constraints.get("min_clearance", 6.0) / 12.0  # Convert to feet
        min_beam_spacing = constraints.get("min_beam_spacing", 12.0) / 12.0  # Convert to feet
        max_levels = constraints.get("max_levels", 4)
        
        # Find max product height
        max_product_height = max(product_heights) if product_heights else 0
        
        # Calculate level height (product height + clearance)
        level_height = max_product_height + min_clearance
        
        # Ensure level height is at least the minimum beam spacing
        level_height = max(level_height, min_beam_spacing)
        
        # Calculate how many levels can fit within max height
        num_levels = min(max_levels, int(max_height / level_height))
        
        # Create evenly spaced elevations
        elevations = [i * level_height for i in range(num_levels + 1)]
        
        logger.info(f"Heuristic elevations: {elevations}")
        return elevations