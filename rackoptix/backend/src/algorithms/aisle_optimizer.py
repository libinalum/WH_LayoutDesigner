"""
Aisle Width Optimizer for RackOptix.

This module implements algorithms for optimizing aisle widths in warehouse layouts
based on equipment specifications and operational requirements.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple

import numpy as np
from ortools.sat.python import cp_model

from ..models.equipment import Equipment
from ..models.layout import Layout, Aisle

logger = logging.getLogger(__name__)


class AisleWidthOptimizer:
    """
    Optimizes aisle widths for warehouse layouts based on equipment specifications.
    
    This optimizer balances storage density with operational efficiency by determining
    the optimal aisle widths for different areas of the warehouse.
    """
    
    def __init__(self):
        """Initialize the aisle width optimizer."""
        logger.info("Aisle Width Optimizer initialized")
    
    def optimize(
        self,
        layout: Layout,
        equipment: Equipment,
        constraints: Dict[str, Any] = None,
        time_limit_seconds: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Optimize aisle widths for a layout given equipment specifications.
        
        Args:
            layout: The layout to optimize
            equipment: The material handling equipment used in the warehouse
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of optimized aisles with their widths
        """
        logger.info(f"Optimizing aisle widths for layout: {layout.id}")
        
        # Default constraints if none provided
        if constraints is None:
            constraints = {
                "min_aisle_width": equipment.min_aisle_width,
                "max_aisle_width": equipment.max_aisle_width,
                "optimize_for_density": True,
                "optimize_for_accessibility": True,
                "aisle_width_increment": 0.5  # Increment in feet
            }
        
        try:
            # Use constraint programming to find optimal aisle widths
            return self._solve_with_cp(
                layout=layout,
                equipment=equipment,
                constraints=constraints,
                time_limit_seconds=time_limit_seconds
            )
        except Exception as e:
            logger.error(f"Error in constraint programming solver: {e}")
            # Fall back to heuristic method if CP fails
            logger.info("Falling back to heuristic method")
            return self._solve_with_heuristic(
                layout=layout,
                equipment=equipment,
                constraints=constraints
            )
    
    def _solve_with_cp(
        self,
        layout: Layout,
        equipment: Equipment,
        constraints: Dict[str, Any],
        time_limit_seconds: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Solve the aisle width optimization problem using constraint programming.
        
        Args:
            layout: The layout to optimize
            equipment: The material handling equipment used
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of optimized aisles with their widths
        """
        logger.info("Solving aisle width optimization with constraint programming")
        
        # Extract constraints
        min_aisle_width = constraints.get("min_aisle_width", equipment.min_aisle_width)
        max_aisle_width = constraints.get("max_aisle_width", equipment.max_aisle_width)
        aisle_width_increment = constraints.get("aisle_width_increment", 0.5)
        optimize_for_density = constraints.get("optimize_for_density", True)
        optimize_for_accessibility = constraints.get("optimize_for_accessibility", True)
        
        # Convert to integer values (in inches) for CP solver
        min_width_inches = int(min_aisle_width * 12)
        max_width_inches = int(max_aisle_width * 12)
        increment_inches = int(aisle_width_increment * 12)
        
        # Create CP model
        model = cp_model.CpModel()
        
        # Create variables for aisle widths (in inches)
        aisle_width_vars = {}
        for i, aisle in enumerate(layout.aisles):
            aisle_id = aisle.id
            
            # Create variable for aisle width
            width_var = model.NewIntVar(
                min_width_inches,
                max_width_inches,
                f'aisle_width_{aisle_id}'
            )
            
            # Ensure width is a multiple of the increment
            model.AddModuloEquality(0, width_var, increment_inches)
            
            aisle_width_vars[aisle_id] = width_var
        
        # Add constraints for aisle types
        for aisle in layout.aisles:
            aisle_id = aisle.id
            aisle_type = aisle.properties.get("type", "standard") if aisle.properties else "standard"
            
            if aisle_type == "main":
                # Main aisles should be wider
                model.Add(aisle_width_vars[aisle_id] >= min_width_inches + 12)
            elif aisle_type == "cross":
                # Cross aisles can be narrower but still need to accommodate equipment
                model.Add(aisle_width_vars[aisle_id] >= min_width_inches)
            elif aisle_type == "staging":
                # Staging areas need extra width
                model.Add(aisle_width_vars[aisle_id] >= min_width_inches + 24)
        
        # Add constraints for adjacent rack types
        for aisle in layout.aisles:
            aisle_id = aisle.id
            adjacent_racks = self._get_adjacent_racks(layout, aisle)
            
            for rack in adjacent_racks:
                rack_type = rack.rack_type_id
                
                if rack_type == "drive-in" or rack_type == "push-back":
                    # These rack types need wider aisles for forklift access
                    model.Add(aisle_width_vars[aisle_id] >= min_width_inches + 12)
                elif rack_type == "pallet-flow":
                    # Pallet flow racks need space for loading/unloading
                    model.Add(aisle_width_vars[aisle_id] >= min_width_inches + 6)
        
        # Objective function
        objective_terms = []
        
        if optimize_for_density:
            # Minimize total aisle width (maximize density)
            for aisle_id, width_var in aisle_width_vars.items():
                # Get aisle length
                aisle = next((a for a in layout.aisles if a.id == aisle_id), None)
                if aisle:
                    # Weight by aisle length
                    aisle_length = self._calculate_aisle_length(aisle)
                    # Scale to keep values reasonable
                    weight = int(aisle_length * 10)
                    objective_terms.append(width_var * weight)
        
        if optimize_for_accessibility:
            # Maximize accessibility by preferring wider aisles
            # This conflicts with density, so we need to balance
            for aisle_id, width_var in aisle_width_vars.items():
                # Get aisle properties
                aisle = next((a for a in layout.aisles if a.id == aisle_id), None)
                if aisle:
                    # Calculate accessibility weight based on aisle type
                    aisle_type = aisle.properties.get("type", "standard") if aisle.properties else "standard"
                    
                    if aisle_type == "main":
                        weight = -50  # Strongly prefer wider main aisles
                    elif aisle_type == "staging":
                        weight = -30  # Prefer wider staging areas
                    else:
                        weight = -10  # Slightly prefer wider standard aisles
                    
                    # Add negative term to maximize (since we're minimizing the objective)
                    objective_terms.append(weight * (max_width_inches - width_var))
        
        # Set objective
        if objective_terms:
            model.Minimize(sum(objective_terms))
        
        # Set time limit
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = time_limit_seconds
        
        # Solve the model
        status = solver.Solve(model)
        
        # Process results
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            # Extract solution
            result = []
            for aisle in layout.aisles:
                aisle_id = aisle.id
                
                # Convert back to feet
                width_inches = solver.Value(aisle_width_vars[aisle_id])
                width_feet = width_inches / 12.0
                
                result.append({
                    "id": aisle_id,
                    "width": width_feet
                })
            
            logger.info(f"Found optimal aisle widths: {result}")
            return result
        else:
            logger.warning(f"CP solver failed with status: {status}")
            raise RuntimeError("Constraint programming solver failed to find a solution")
    
    def _solve_with_heuristic(
        self,
        layout: Layout,
        equipment: Equipment,
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Solve the aisle width optimization problem using a heuristic approach.
        
        This is a fallback method when the constraint programming solver fails.
        
        Args:
            layout: The layout to optimize
            equipment: The material handling equipment used
            constraints: Additional constraints for the optimization
            
        Returns:
            List of optimized aisles with their widths
        """
        logger.info("Solving aisle width optimization with heuristic method")
        
        # Extract constraints
        min_aisle_width = constraints.get("min_aisle_width", equipment.min_aisle_width)
        max_aisle_width = constraints.get("max_aisle_width", equipment.max_aisle_width)
        aisle_width_increment = constraints.get("aisle_width_increment", 0.5)
        optimize_for_density = constraints.get("optimize_for_density", True)
        
        result = []
        
        for aisle in layout.aisles:
            aisle_id = aisle.id
            aisle_type = aisle.properties.get("type", "standard") if aisle.properties else "standard"
            
            # Determine base width based on aisle type
            if aisle_type == "main":
                base_width = min_aisle_width + 2.0
            elif aisle_type == "cross":
                base_width = min_aisle_width + 1.0
            elif aisle_type == "staging":
                base_width = min_aisle_width + 3.0
            else:
                base_width = min_aisle_width + 1.0
            
            # Adjust based on adjacent rack types
            adjacent_racks = self._get_adjacent_racks(layout, aisle)
            
            for rack in adjacent_racks:
                rack_type = rack.rack_type_id
                
                if rack_type == "drive-in" or rack_type == "push-back":
                    base_width += 1.0
                elif rack_type == "pallet-flow":
                    base_width += 0.5
            
            # Adjust for density vs. accessibility
            if optimize_for_density:
                # Reduce width to increase density
                base_width = max(min_aisle_width, base_width - 0.5)
            else:
                # Increase width for better accessibility
                base_width = min(max_aisle_width, base_width + 1.0)
            
            # Round to nearest increment
            width = round(base_width / aisle_width_increment) * aisle_width_increment
            
            # Ensure within bounds
            width = max(min_aisle_width, min(max_aisle_width, width))
            
            result.append({
                "id": aisle_id,
                "width": width
            })
        
        logger.info(f"Heuristic aisle widths: {result}")
        return result
    
    def _get_adjacent_racks(self, layout: Layout, aisle: Aisle) -> List[Any]:
        """
        Get racks adjacent to an aisle.
        
        Args:
            layout: The layout containing racks
            aisle: The aisle to check
            
        Returns:
            List of adjacent racks
        """
        # In a real implementation, this would use spatial queries
        # For now, we'll use a simplified approach
        
        # Convert aisle path to a buffer
        aisle_buffer = self._create_aisle_buffer(aisle)
        
        # Find racks that intersect with the buffer
        adjacent_racks = []
        
        for rack in layout.racks:
            # Check if rack intersects with aisle buffer
            if self._check_intersection(rack, aisle_buffer):
                adjacent_racks.append(rack)
        
        return adjacent_racks
    
    def _create_aisle_buffer(self, aisle: Aisle) -> Any:
        """
        Create a buffer around an aisle path.
        
        Args:
            aisle: The aisle to buffer
            
        Returns:
            Buffer geometry
        """
        # In a real implementation, this would use proper geometry operations
        # For now, we'll return a simplified representation
        
        # Extract aisle path coordinates
        if hasattr(aisle, 'path') and hasattr(aisle.path, 'coordinates'):
            return {
                'type': 'buffer',
                'path': aisle.path.coordinates,
                'width': 10  # Buffer width in feet
            }
        
        return None
    
    def _check_intersection(self, rack: Any, aisle_buffer: Any) -> bool:
        """
        Check if a rack intersects with an aisle buffer.
        
        Args:
            rack: The rack to check
            aisle_buffer: The aisle buffer
            
        Returns:
            True if they intersect, False otherwise
        """
        # In a real implementation, this would use proper geometry operations
        # For now, we'll use a simplified approach that assumes intersection
        
        # Randomly determine intersection (for demonstration)
        # In a real implementation, this would be based on actual geometry
        return np.random.random() < 0.3
    
    def _calculate_aisle_length(self, aisle: Aisle) -> float:
        """
        Calculate the length of an aisle.
        
        Args:
            aisle: The aisle to measure
            
        Returns:
            Aisle length in feet
        """
        # In a real implementation, this would calculate the actual length
        # For now, we'll use a simplified approach
        
        if hasattr(aisle, 'path') and hasattr(aisle.path, 'coordinates'):
            coords = aisle.path.coordinates
            
            # Calculate length as sum of segment lengths
            length = 0.0
            for i in range(len(coords) - 1):
                x1, y1 = coords[i]
                x2, y2 = coords[i + 1]
                segment_length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
                length += segment_length
            
            return length
        
        # Default length if path not available
        return 50.0