"""
SKU Slotting Optimizer for RackOptix.

This module implements algorithms for optimizing the placement of products
within storage locations based on velocity, dimensions, and other factors.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
import random

import numpy as np
from ortools.linear_solver import pywraplp

from ..models.layout import Layout, Rack, Location
from ..models.product import Product

logger = logging.getLogger(__name__)


class SlottingOptimizer:
    """
    Optimizes the placement of products within storage locations.
    
    This optimizer assigns products to storage locations based on velocity,
    dimensions, weight, and other factors to minimize travel distance and
    maximize operational efficiency.
    """
    
    def __init__(self):
        """Initialize the slotting optimizer."""
        logger.info("SKU Slotting Optimizer initialized")
    
    def optimize(
        self,
        layout: Layout,
        products: List[Product],
        constraints: Dict[str, Any] = None,
        time_limit_seconds: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Optimize product slotting for a layout.
        
        Args:
            layout: The layout containing storage locations
            products: List of products to be slotted
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of product-to-location assignments
        """
        logger.info(f"Optimizing product slotting for layout: {layout.id}")
        
        # Default constraints if none provided
        if constraints is None:
            constraints = {
                "velocity_weighting": 0.7,
                "accessibility_weighting": 0.3,
                "optimize_for_throughput": False,
                "respect_product_dimensions": True,
                "respect_weight_limits": True,
                "group_similar_products": True
            }
        
        try:
            # Use mixed integer programming to find optimal slotting
            return self._solve_with_mip(
                layout=layout,
                products=products,
                constraints=constraints,
                time_limit_seconds=time_limit_seconds
            )
        except Exception as e:
            logger.error(f"Error in MIP solver: {e}")
            # Fall back to heuristic method if MIP fails
            logger.info("Falling back to heuristic method")
            return self._solve_with_heuristic(
                layout=layout,
                products=products,
                constraints=constraints
            )
    
    def _solve_with_mip(
        self,
        layout: Layout,
        products: List[Product],
        constraints: Dict[str, Any],
        time_limit_seconds: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Solve the slotting optimization problem using mixed integer programming.
        
        Args:
            layout: The layout containing storage locations
            products: List of products to be slotted
            constraints: Additional constraints for the optimization
            time_limit_seconds: Time limit for the optimization in seconds
            
        Returns:
            List of product-to-location assignments
        """
        logger.info("Solving slotting optimization with mixed integer programming")
        
        # Extract constraints
        velocity_weighting = constraints.get("velocity_weighting", 0.7)
        accessibility_weighting = constraints.get("accessibility_weighting", 0.3)
        optimize_for_throughput = constraints.get("optimize_for_throughput", False)
        respect_dimensions = constraints.get("respect_product_dimensions", True)
        respect_weight_limits = constraints.get("respect_weight_limits", True)
        
        # Get all available storage locations
        locations = self._get_all_locations(layout)
        
        # If no locations or products, return empty result
        if not locations or not products:
            return []
        
        # Create solver
        solver = pywraplp.Solver.CreateSolver('SCIP')
        if not solver:
            raise RuntimeError("Could not create solver")
        
        # Set time limit
        solver.SetTimeLimit(time_limit_seconds * 1000)  # milliseconds
        
        # Create variables
        # x[p][l] = 1 if product p is assigned to location l, 0 otherwise
        x = {}
        for p, product in enumerate(products):
            x[p] = {}
            for l, location in enumerate(locations):
                x[p][l] = solver.BoolVar(f'x_{p}_{l}')
        
        # Each product must be assigned to exactly one location
        for p in range(len(products)):
            solver.Add(sum(x[p][l] for l in range(len(locations))) == 1)
        
        # Each location can hold at most one product
        for l in range(len(locations)):
            solver.Add(sum(x[p][l] for p in range(len(products))) <= 1)
        
        # Add dimension constraints if needed
        if respect_dimensions:
            for p, product in enumerate(products):
                for l, location in enumerate(locations):
                    # Skip if product doesn't fit in location
                    if not self._product_fits_location(product, location):
                        solver.Add(x[p][l] == 0)
        
        # Add weight constraints if needed
        if respect_weight_limits:
            for p, product in enumerate(products):
                for l, location in enumerate(locations):
                    # Skip if product exceeds location weight limit
                    if not self._check_weight_limit(product, location):
                        solver.Add(x[p][l] == 0)
        
        # Calculate scores for each product-location pair
        scores = {}
        for p, product in enumerate(products):
            scores[p] = {}
            for l, location in enumerate(locations):
                # Calculate velocity score (higher velocity products should be more accessible)
                velocity_score = self._calculate_velocity_score(product, location)
                
                # Calculate accessibility score (based on location's accessibility)
                accessibility_score = self._calculate_accessibility_score(location)
                
                # Calculate throughput score if needed
                throughput_score = 0
                if optimize_for_throughput:
                    throughput_score = self._calculate_throughput_score(product, location)
                    # Combine scores with weights
                    scores[p][l] = (
                        velocity_weighting * velocity_score +
                        accessibility_weighting * accessibility_score +
                        0.2 * throughput_score  # Add some weight for throughput
                    )
                else:
                    # Combine scores with weights
                    scores[p][l] = (
                        velocity_weighting * velocity_score +
                        accessibility_weighting * accessibility_score
                    )
        
        # Objective: Maximize total score
        objective = solver.Objective()
        for p in range(len(products)):
            for l in range(len(locations)):
                objective.SetCoefficient(x[p][l], scores[p][l])
        objective.SetMaximization()
        
        # Solve the problem
        status = solver.Solve()
        
        # Process results
        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            # Extract solution
            result = []
            for p, product in enumerate(products):
                for l, location in enumerate(locations):
                    if x[p][l].solution_value() > 0.5:  # Assigned
                        result.append({
                            "product_id": product.id,
                            "location_id": location.id,
                            "quantity": 1  # Default quantity
                        })
            
            logger.info(f"Found optimal slotting with {len(result)} assignments")
            return result
        else:
            logger.warning(f"MIP solver failed with status: {status}")
            raise RuntimeError("Mixed integer programming solver failed to find a solution")
    
    def _solve_with_heuristic(
        self,
        layout: Layout,
        products: List[Product],
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Solve the slotting optimization problem using a heuristic approach.
        
        This is a fallback method when the MIP solver fails.
        
        Args:
            layout: The layout containing storage locations
            products: List of products to be slotted
            constraints: Additional constraints for the optimization
            
        Returns:
            List of product-to-location assignments
        """
        logger.info("Solving slotting optimization with heuristic method")
        
        # Extract constraints
        velocity_weighting = constraints.get("velocity_weighting", 0.7)
        accessibility_weighting = constraints.get("accessibility_weighting", 0.3)
        respect_dimensions = constraints.get("respect_product_dimensions", True)
        
        # Get all available storage locations
        locations = self._get_all_locations(layout)
        
        # If no locations or products, return empty result
        if not locations or not products:
            return []
        
        # Sort products by velocity (descending)
        sorted_products = sorted(
            products,
            key=lambda p: p.velocity_class if hasattr(p, 'velocity_class') else 'C',
            reverse=True
        )
        
        # Sort locations by accessibility (descending)
        sorted_locations = sorted(
            locations,
            key=lambda l: self._calculate_accessibility_score(l),
            reverse=True
        )
        
        # Assign products to locations
        assignments = []
        assigned_locations = set()
        
        for product in sorted_products:
            assigned = False
            
            for location in sorted_locations:
                if location.id in assigned_locations:
                    continue
                
                # Check if product fits in location
                if respect_dimensions and not self._product_fits_location(product, location):
                    continue
                
                # Assign product to location
                assignments.append({
                    "product_id": product.id,
                    "location_id": location.id,
                    "quantity": 1  # Default quantity
                })
                
                assigned_locations.add(location.id)
                assigned = True
                break
            
            if not assigned:
                logger.warning(f"Could not assign product {product.id} to any location")
        
        logger.info(f"Heuristic slotting found {len(assignments)} assignments")
        return assignments
    
    def _get_all_locations(self, layout: Layout) -> List[Any]:
        """
        Get all storage locations in a layout.
        
        Args:
            layout: The layout to extract locations from
            
        Returns:
            List of storage locations
        """
        # In a real implementation, this would extract actual location objects
        # For now, we'll create simplified location objects
        
        locations = []
        
        # Create locations for each rack
        for rack in layout.racks:
            rack_type = rack.rack_type_id
            bays = rack.bays
            
            # Determine number of levels based on rack configuration
            levels = rack.configuration.get('beam_levels', 3) if hasattr(rack, 'configuration') else 3
            
            # Create locations for each bay and level
            for bay in range(bays):
                for level in range(levels):
                    # Calculate position and elevation
                    position = bay
                    
                    # Get beam elevations if available
                    if hasattr(rack, 'configuration') and 'beam_elevations' in rack.configuration:
                        elevation = rack.configuration['beam_elevations'][level] if level < len(rack.configuration['beam_elevations']) else level * 6
                    else:
                        elevation = level * 6  # Default 6 feet per level
                    
                    # Create location
                    location = Location(
                        id=f"loc-{rack.id}-{bay}-{level}",
                        rack_id=rack.id,
                        bay_id=f"bay-{rack.id}-{bay}",
                        level=level,
                        position=position,
                        elevation=elevation,
                        dimensions={
                            "length": 48,  # Default pallet length
                            "width": 40,   # Default pallet width
                            "height": 6    # Default level height
                        },
                        properties={
                            "rack_type": rack_type,
                            "accessibility": self._calculate_location_accessibility(rack, bay, level)
                        }
                    )
                    
                    locations.append(location)
        
        return locations
    
    def _product_fits_location(self, product: Product, location: Any) -> bool:
        """
        Check if a product fits in a location.
        
        Args:
            product: The product to check
            location: The location to check
            
        Returns:
            True if the product fits, False otherwise
        """
        # In a real implementation, this would check actual dimensions
        # For now, we'll use a simplified approach
        
        if not hasattr(product, 'length') or not hasattr(product, 'width') or not hasattr(product, 'height'):
            return True
        
        if not hasattr(location, 'dimensions'):
            return True
        
        # Check if product dimensions fit within location dimensions
        product_length = getattr(product, 'length', 0)
        product_width = getattr(product, 'width', 0)
        product_height = getattr(product, 'height', 0)
        
        location_length = location.dimensions.get('length', 0)
        location_width = location.dimensions.get('width', 0)
        location_height = location.dimensions.get('height', 0)
        
        # Check if product fits (allowing for rotation)
        fits_normal = (
            product_length <= location_length and
            product_width <= location_width and
            product_height <= location_height
        )
        
        fits_rotated = (
            product_width <= location_length and
            product_length <= location_width and
            product_height <= location_height
        )
        
        return fits_normal or fits_rotated
    
    def _check_weight_limit(self, product: Product, location: Any) -> bool:
        """
        Check if a product's weight is within the location's weight limit.
        
        Args:
            product: The product to check
            location: The location to check
            
        Returns:
            True if the weight is acceptable, False otherwise
        """
        # In a real implementation, this would check actual weight limits
        # For now, we'll use a simplified approach
        
        if not hasattr(product, 'weight'):
            return True
        
        if not hasattr(location, 'properties') or 'weight_limit' not in location.properties:
            return True
        
        product_weight = getattr(product, 'weight', 0)
        weight_limit = location.properties.get('weight_limit', 2000)  # Default 2000 lbs
        
        return product_weight <= weight_limit
    
    def _calculate_velocity_score(self, product: Product, location: Any) -> float:
        """
        Calculate a score for a product-location pair based on velocity.
        
        Args:
            product: The product to evaluate
            location: The location to evaluate
            
        Returns:
            Velocity score (0.0 to 1.0)
        """
        # In a real implementation, this would use actual velocity data
        # For now, we'll use a simplified approach based on velocity class
        
        # Get product velocity class (A, B, C)
        velocity_class = getattr(product, 'velocity_class', 'C')
        
        # Get location accessibility
        accessibility = 0.5
        if hasattr(location, 'properties') and 'accessibility' in location.properties:
            accessibility = location.properties['accessibility']
        
        # Calculate score based on velocity class and accessibility
        if velocity_class == 'A':
            return 0.8 + (0.2 * accessibility)
        elif velocity_class == 'B':
            return 0.5 + (0.3 * accessibility)
        else:  # Class C
            return 0.2 + (0.2 * accessibility)
    
    def _calculate_accessibility_score(self, location: Any) -> float:
        """
        Calculate an accessibility score for a location.
        
        Args:
            location: The location to evaluate
            
        Returns:
            Accessibility score (0.0 to 1.0)
        """
        # In a real implementation, this would consider travel distance, height, etc.
        # For now, we'll use a simplified approach
        
        if hasattr(location, 'properties') and 'accessibility' in location.properties:
            return location.properties['accessibility']
        
        # Calculate based on level (lower levels are more accessible)
        level = getattr(location, 'level', 0)
        max_level = 5  # Assume maximum of 5 levels
        
        # Level 0 (floor) has highest accessibility, decreasing with height
        return max(0.1, 1.0 - (level / max_level) * 0.9)
    
    def _calculate_throughput_score(self, product: Product, location: Any) -> float:
        """
        Calculate a throughput score for a product-location pair.
        
        Args:
            product: The product to evaluate
            location: The location to evaluate
            
        Returns:
            Throughput score (0.0 to 1.0)
        """
        # In a real implementation, this would consider actual throughput data
        # For now, we'll use a simplified approach
        
        # Get product monthly throughput
        throughput = getattr(product, 'monthly_throughput', 0)
        
        # Get location accessibility
        accessibility = 0.5
        if hasattr(location, 'properties') and 'accessibility' in location.properties:
            accessibility = location.properties['accessibility']
        
        # Normalize throughput (assume max of 1000 units per month)
        normalized_throughput = min(1.0, throughput / 1000)
        
        # Calculate score based on throughput and accessibility
        return normalized_throughput * accessibility
    
    def _calculate_location_accessibility(self, rack: Any, bay: int, level: int) -> float:
        """
        Calculate accessibility score for a location based on its position.
        
        Args:
            rack: The rack containing the location
            bay: The bay number
            level: The level number
            
        Returns:
            Accessibility score (0.0 to 1.0)
        """
        # In a real implementation, this would consider actual layout data
        # For now, we'll use a simplified approach
        
        # Get rack type
        rack_type = getattr(rack, 'rack_type_id', 'selective')
        
        # Base accessibility by rack type
        if rack_type == 'selective':
            base_accessibility = 0.9
        elif rack_type == 'drive-in' or rack_type == 'push-back':
            base_accessibility = 0.7
        elif rack_type == 'pallet-flow':
            base_accessibility = 0.8
        else:
            base_accessibility = 0.75
        
        # Adjust for level (lower levels are more accessible)
        max_level = 5  # Assume maximum of 5 levels
        level_factor = 1.0 - (level / max_level) * 0.8
        
        # Adjust for bay position (middle bays slightly less accessible)
        total_bays = getattr(rack, 'bays', 1)
        bay_position = bay / max(1, total_bays - 1)  # 0.0 to 1.0
        bay_factor = 1.0 - 0.2 * (1.0 - 2.0 * abs(bay_position - 0.5))
        
        # Combine factors
        return base_accessibility * level_factor * bay_factor