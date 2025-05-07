"""
Performance tests for the RackOptix optimization algorithms.
"""

import time
import pytest
import numpy as np
import pandas as pd
from src.algorithms.elevation_optimizer import ElevationOptimizer
from src.algorithms.aisle_optimizer import AisleOptimizer
from src.algorithms.slotting_optimizer import SlottingOptimizer
from src.core.engine import OptimizationEngine


@pytest.fixture
def large_facility():
    """Create a large facility for performance testing."""
    # Create a 500,000 sq ft facility (1000 x 500)
    return {
        "id": "perf-facility-1",
        "name": "Large Performance Test Facility",
        "length": 1000.0,
        "width": 500.0,
        "height": 40.0,
        "units": "ft",
        "boundary": [(0, 0), (1000, 0), (1000, 500), (0, 500), (0, 0)],
        "obstructions": [
            # Add 50 columns throughout the facility
            {
                "type": "column",
                "geometry": [(50*i, 50*j), (50*i+2, 50*j), (50*i+2, 50*j+2), (50*i, 50*j+2), (50*i, 50*j)],
            }
            for i in range(1, 11) for j in range(1, 6)
        ],
        "zones": [
            {
                "id": "zone-1",
                "name": "Receiving",
                "geometry": [(0, 0), (200, 0), (200, 500), (0, 500), (0, 0)],
            },
            {
                "id": "zone-2",
                "name": "Storage",
                "geometry": [(200, 0), (800, 0), (800, 500), (200, 500), (200, 0)],
            },
            {
                "id": "zone-3",
                "name": "Shipping",
                "geometry": [(800, 0), (1000, 0), (1000, 500), (800, 500), (800, 0)],
            },
        ],
    }


@pytest.fixture
def large_product_set():
    """Create a large set of products for performance testing."""
    # Create 1000 products with varying dimensions
    products = []
    for i in range(1000):
        height = np.random.uniform(24, 72)  # Random height between 24 and 72 inches
        products.append({
            "id": f"product-{i}",
            "name": f"Product {i}",
            "length": np.random.uniform(36, 48),  # Random length
            "width": np.random.uniform(36, 48),   # Random width
            "height": height,
            "weight": np.random.uniform(500, 2000),  # Random weight
            "units": "in",
            "velocity_class": np.random.choice(["A", "B", "C"]),  # Random velocity class
            "storage_requirements": ["standard"],
        })
    return products


@pytest.mark.performance
class TestElevationOptimizerPerformance:
    """Performance tests for the Elevation Optimizer algorithm."""

    def test_elevation_optimizer_large_dataset(self, large_product_set, sample_equipment):
        """Test elevation optimizer performance with a large dataset."""
        # Initialize the optimizer
        optimizer = ElevationOptimizer(
            products=large_product_set,
            equipment=sample_equipment[0],
            max_height=30.0,
            units="ft",
        )
        
        # Measure time to generate profiles
        start_time = time.time()
        profiles = optimizer.generate_elevation_profiles(num_profiles=10)
        generation_time = time.time() - start_time
        
        # Measure time to optimize
        start_time = time.time()
        optimized_profile = optimizer.optimize(
            objective="balanced",
            constraints={"max_levels": 6},
        )
        optimization_time = time.time() - start_time
        
        # Log performance metrics
        print(f"Elevation Optimizer Performance:")
        print(f"  - Dataset size: {len(large_product_set)} products")
        print(f"  - Profile generation time: {generation_time:.2f} seconds")
        print(f"  - Optimization time: {optimization_time:.2f} seconds")
        
        # Assert performance is within acceptable limits
        assert generation_time < 5.0, "Profile generation took too long"
        assert optimization_time < 10.0, "Optimization took too long"
        
        # Verify results are valid
        assert len(profiles) == 10
        assert len(optimized_profile) > 0
        assert len(optimized_profile) <= 6  # max_levels constraint


@pytest.mark.performance
class TestAisleOptimizerPerformance:
    """Performance tests for the Aisle Optimizer algorithm."""

    def test_aisle_optimizer_large_facility(self, large_facility, sample_equipment):
        """Test aisle optimizer performance with a large facility."""
        # Initialize the optimizer
        optimizer = AisleOptimizer(
            facility=large_facility,
            equipment=sample_equipment[0],
            min_aisle_width=8.5,
            units="ft",
        )
        
        # Measure time to generate aisle layouts
        start_time = time.time()
        aisle_layouts = optimizer.generate_aisle_layouts(num_layouts=5)
        generation_time = time.time() - start_time
        
        # Measure time to optimize
        start_time = time.time()
        optimized_layout = optimizer.optimize(
            objective="balanced",
            constraints={
                "min_cross_aisle_count": 2,
                "max_cross_aisle_count": 5,
            },
        )
        optimization_time = time.time() - start_time
        
        # Log performance metrics
        print(f"Aisle Optimizer Performance:")
        print(f"  - Facility size: {large_facility['length']} x {large_facility['width']} ft")
        print(f"  - Layout generation time: {generation_time:.2f} seconds")
        print(f"  - Optimization time: {optimization_time:.2f} seconds")
        
        # Assert performance is within acceptable limits
        assert generation_time < 10.0, "Layout generation took too long"
        assert optimization_time < 20.0, "Optimization took too long"
        
        # Verify results are valid
        assert len(aisle_layouts) == 5
        assert "aisles" in optimized_layout
        assert len(optimized_layout["aisles"]) > 0


@pytest.mark.performance
class TestSlottingOptimizerPerformance:
    """Performance tests for the Slotting Optimizer algorithm."""

    def test_slotting_optimizer_large_dataset(self, large_product_set, sample_layout):
        """Test slotting optimizer performance with a large dataset."""
        # Initialize the optimizer
        optimizer = SlottingOptimizer(
            products=large_product_set,
            layout=sample_layout,
            units="ft",
        )
        
        # Measure time to generate slotting plans
        start_time = time.time()
        slotting_plans = optimizer.generate_slotting_plans(num_plans=3)
        generation_time = time.time() - start_time
        
        # Measure time to optimize
        start_time = time.time()
        optimized_plan = optimizer.optimize(
            objective="travel_time",
            constraints={
                "max_products_per_bay": 4,
                "respect_velocity_classes": True,
            },
        )
        optimization_time = time.time() - start_time
        
        # Log performance metrics
        print(f"Slotting Optimizer Performance:")
        print(f"  - Dataset size: {len(large_product_set)} products")
        print(f"  - Plan generation time: {generation_time:.2f} seconds")
        print(f"  - Optimization time: {optimization_time:.2f} seconds")
        
        # Assert performance is within acceptable limits
        assert generation_time < 15.0, "Plan generation took too long"
        assert optimization_time < 30.0, "Optimization took too long"
        
        # Verify results are valid
        assert len(slotting_plans) == 3
        assert "assignments" in optimized_plan
        assert len(optimized_plan["assignments"]) > 0


@pytest.mark.performance
class TestOptimizationEnginePerformance:
    """Performance tests for the Optimization Engine."""

    def test_end_to_end_optimization(self, large_facility, large_product_set, sample_equipment):
        """Test end-to-end optimization performance."""
        # Create a mock database
        mock_db = pytest.MockFixture().MagicMock()
        
        # Initialize the optimization engine
        engine = OptimizationEngine(db=mock_db)
        engine.set_facility(large_facility)
        engine.set_products(large_product_set)
        engine.set_equipment(sample_equipment[0])
        
        # Measure time for end-to-end optimization
        start_time = time.time()
        result = engine.optimize_layout(
            optimization_parameters={
                "objective": "balanced",
                "aisle_width": 10.0,
                "rack_type": "selective",
                "max_height": 30.0,
                "constraints": {
                    "min_cross_aisle_count": 2,
                    "max_cross_aisle_count": 5,
                    "max_levels": 6,
                    "respect_velocity_classes": True,
                },
            }
        )
        total_time = time.time() - start_time
        
        # Log performance metrics
        print(f"End-to-End Optimization Performance:")
        print(f"  - Facility size: {large_facility['length']} x {large_facility['width']} ft")
        print(f"  - Product count: {len(large_product_set)}")
        print(f"  - Total optimization time: {total_time:.2f} seconds")
        
        # Assert performance is within acceptable limits
        assert total_time < 60.0, "End-to-end optimization took too long"
        
        # Verify results are valid
        assert "layout" in result
        assert "metrics" in result
        assert "racks" in result["layout"]
        assert "aisles" in result["layout"]
        assert len(result["layout"]["racks"]) > 0
        assert len(result["layout"]["aisles"]) > 0


@pytest.mark.performance
class TestScalabilityAnalysis:
    """Scalability analysis for the optimization algorithms."""

    def test_elevation_optimizer_scalability(self, sample_equipment):
        """Test how elevation optimizer scales with increasing product counts."""
        # Test with different product set sizes
        product_counts = [10, 100, 500, 1000]
        generation_times = []
        optimization_times = []
        
        for count in product_counts:
            # Create product set of specified size
            products = []
            for i in range(count):
                height = np.random.uniform(24, 72)
                products.append({
                    "id": f"product-{i}",
                    "name": f"Product {i}",
                    "length": 40,
                    "width": 48,
                    "height": height,
                    "weight": np.random.uniform(500, 2000),
                    "units": "in",
                    "velocity_class": np.random.choice(["A", "B", "C"]),
                    "storage_requirements": ["standard"],
                })
                
            # Initialize optimizer
            optimizer = ElevationOptimizer(
                products=products,
                equipment=sample_equipment[0],
                max_height=30.0,
                units="ft",
            )
            
            # Measure generation time
            start_time = time.time()
            optimizer.generate_elevation_profiles(num_profiles=3)
            generation_times.append(time.time() - start_time)
            
            # Measure optimization time
            start_time = time.time()
            optimizer.optimize(
                objective="balanced",
                constraints={"max_levels": 6},
            )
            optimization_times.append(time.time() - start_time)
        
        # Log scalability results
        print(f"Elevation Optimizer Scalability:")
        for i, count in enumerate(product_counts):
            print(f"  - {count} products:")
            print(f"    - Generation time: {generation_times[i]:.2f} seconds")
            print(f"    - Optimization time: {optimization_times[i]:.2f} seconds")
        
        # Create a DataFrame for analysis
        scalability_data = pd.DataFrame({
            'product_count': product_counts,
            'generation_time': generation_times,
            'optimization_time': optimization_times
        })
        
        # Calculate scaling factors
        scalability_data['generation_scaling'] = scalability_data['generation_time'] / scalability_data['generation_time'].iloc[0]
        scalability_data['optimization_scaling'] = scalability_data['optimization_time'] / scalability_data['optimization_time'].iloc[0]
        
        # Verify scaling is sub-quadratic (O(n log n) or better)
        # For each 10x increase in data, time should increase by less than 100x
        for i in range(1, len(product_counts)):
            if product_counts[i] / product_counts[0] >= 10:
                assert scalability_data['optimization_scaling'].iloc[i] < (product_counts[i] / product_counts[0]) ** 2, \
                    f"Optimization algorithm scales worse than O(n²) for {product_counts[i]} products"