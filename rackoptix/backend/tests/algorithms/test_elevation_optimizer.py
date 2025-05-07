"""
Unit tests for the Elevation Optimizer algorithm.
"""

import pytest
import numpy as np
from src.algorithms.elevation_optimizer import ElevationOptimizer


@pytest.mark.unit
@pytest.mark.algorithm
class TestElevationOptimizer:
    """Test cases for the Elevation Optimizer algorithm."""

    def test_optimizer_initialization(self, sample_products, sample_equipment):
        """Test that the optimizer can be initialized with valid parameters."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        assert optimizer.max_height == 30.0
        assert optimizer.units == "ft"
        assert len(optimizer.products) == len(sample_products)
        assert optimizer.equipment.id == sample_equipment[0].id
        
    def test_optimizer_validation(self, sample_products, sample_equipment):
        """Test that optimizer validation works correctly."""
        # Invalid max_height (negative)
        with pytest.raises(ValueError):
            ElevationOptimizer(
                products=sample_products,
                equipment=sample_equipment[0],
                max_height=-30.0,  # Negative height
                units="ft",
            )
            
        # Invalid max_height (exceeds equipment capability)
        with pytest.raises(ValueError):
            ElevationOptimizer(
                products=sample_products,
                equipment=sample_equipment[0],
                max_height=40.0,  # Exceeds equipment max_height of 30
                units="ft",
            )
            
    def test_generate_elevation_profiles(self, sample_products, sample_equipment):
        """Test generation of elevation profiles."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        profiles = optimizer.generate_elevation_profiles(num_profiles=3)
        
        assert len(profiles) == 3
        
        # Each profile should be a list of levels
        for profile in profiles:
            assert isinstance(profile, list)
            
            # Each level should have a height
            for level in profile:
                assert "height" in level
                
            # Total height should not exceed max_height
            total_height = sum(level["height"] for level in profile)
            assert total_height <= optimizer.max_height
            
    def test_optimize_elevation_profile(self, sample_products, sample_equipment):
        """Test optimization of elevation profile."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Generate initial profiles
        initial_profiles = optimizer.generate_elevation_profiles(num_profiles=5)
        
        # Optimize profiles
        optimized_profile = optimizer.optimize(
            objective="storage_capacity",
            constraints={
                "max_levels": 6,
                "min_level_height": 4.0,
            },
        )
        
        assert isinstance(optimized_profile, list)
        
        # Optimized profile should have levels
        assert len(optimized_profile) > 0
        
        # Each level should have a height
        for level in optimized_profile:
            assert "height" in level
            assert level["height"] >= 4.0  # min_level_height constraint
            
        # Number of levels should not exceed max_levels constraint
        assert len(optimized_profile) <= 6
        
        # Total height should not exceed max_height
        total_height = sum(level["height"] for level in optimized_profile)
        assert total_height <= optimizer.max_height
        
    def test_evaluate_profile(self, sample_products, sample_equipment):
        """Test evaluation of an elevation profile."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Create a test profile
        test_profile = [
            {"height": 6.0},
            {"height": 6.0},
            {"height": 6.0},
            {"height": 6.0},
        ]
        
        # Evaluate the profile
        evaluation = optimizer.evaluate_profile(test_profile)
        
        assert isinstance(evaluation, dict)
        assert "storage_capacity" in evaluation
        assert "space_utilization" in evaluation
        assert "accessibility" in evaluation
        
        # Storage capacity should be positive
        assert evaluation["storage_capacity"] > 0
        
        # Space utilization should be between 0 and 1
        assert 0 <= evaluation["space_utilization"] <= 1
        
        # Accessibility should be between 0 and 1
        assert 0 <= evaluation["accessibility"] <= 1
        
    def test_optimize_with_different_objectives(self, sample_products, sample_equipment):
        """Test optimization with different objective functions."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Optimize for storage capacity
        capacity_profile = optimizer.optimize(
            objective="storage_capacity",
            constraints={"max_levels": 6},
        )
        
        # Optimize for space utilization
        utilization_profile = optimizer.optimize(
            objective="space_utilization",
            constraints={"max_levels": 6},
        )
        
        # Optimize for accessibility
        accessibility_profile = optimizer.optimize(
            objective="accessibility",
            constraints={"max_levels": 6},
        )
        
        # Optimize for balanced objective
        balanced_profile = optimizer.optimize(
            objective="balanced",
            constraints={"max_levels": 6},
        )
        
        # All profiles should be valid
        for profile in [capacity_profile, utilization_profile, accessibility_profile, balanced_profile]:
            assert isinstance(profile, list)
            assert len(profile) > 0
            assert len(profile) <= 6  # max_levels constraint
            
            # Total height should not exceed max_height
            total_height = sum(level["height"] for level in profile)
            assert total_height <= optimizer.max_height
            
    def test_performance_with_large_product_set(self, sample_equipment):
        """Test performance with a large set of products."""
        # Create a large set of products (100 products)
        large_product_set = []
        for i in range(100):
            height = np.random.uniform(24, 72)  # Random height between 24 and 72 inches
            large_product_set.append({
                "id": f"product-{i}",
                "name": f"Product {i}",
                "length": 40,
                "width": 48,
                "height": height,
                "weight": np.random.uniform(500, 2000),  # Random weight
                "units": "in",
                "velocity_class": np.random.choice(["A", "B", "C"]),  # Random velocity class
                "storage_requirements": ["standard"],
            })
            
        optimizer = ElevationOptimizer(
            products=large_product_set,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Measure time to optimize
        import time
        start_time = time.time()
        
        optimized_profile = optimizer.optimize(
            objective="balanced",
            constraints={"max_levels": 6},
        )
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Optimization should complete in a reasonable time (less than 10 seconds)
        assert execution_time < 10.0
        
        # Result should be valid
        assert isinstance(optimized_profile, list)
        assert len(optimized_profile) > 0
        
    def test_export_profile(self, sample_products, sample_equipment, temp_output_dir):
        """Test exporting an elevation profile."""
        optimizer = ElevationOptimizer(
            products=sample_products,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Generate and optimize a profile
        optimized_profile = optimizer.optimize(
            objective="balanced",
            constraints={"max_levels": 6},
        )
        
        # Export the profile
        export_path = f"{temp_output_dir}/elevation_profile.json"
        optimizer.export_profile(optimized_profile, export_path)
        
        # Verify the file was created
        import os
        assert os.path.exists(export_path)
        
        # Verify the file contains valid JSON
        import json
        with open(export_path, 'r') as f:
            exported_data = json.load(f)
            
        assert "profile" in exported_data
        assert "evaluation" in exported_data
        assert len(exported_data["profile"]) == len(optimized_profile)