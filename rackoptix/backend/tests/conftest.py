"""
Test fixtures for RackOptix backend tests.
This module provides common fixtures used across multiple test modules.
"""

import os
import pytest
import tempfile
import numpy as np
import pandas as pd
from unittest.mock import MagicMock

from src.models.facility import Facility
from src.models.product import Product
from src.models.equipment import Equipment
from src.models.layout import Layout
from src.core.engine import OptimizationEngine


@pytest.fixture
def sample_facility():
    """Create a sample facility for testing."""
    return Facility(
        id="test-facility-1",
        name="Test Facility",
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
                "type": "column",
                "geometry": [(10, 70), (11, 70), (11, 71), (10, 71), (10, 70)],
            },
        ],
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


@pytest.fixture
def sample_products():
    """Create a sample list of products for testing."""
    return [
        Product(
            id="product-1",
            name="Product 1",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        ),
        Product(
            id="product-2",
            name="Product 2",
            length=40,
            width=48,
            height=36,
            weight=800,
            units="in",
            velocity_class="B",
            storage_requirements=["standard"],
        ),
        Product(
            id="product-3",
            name="Product 3",
            length=40,
            width=48,
            height=24,
            weight=500,
            units="in",
            velocity_class="C",
            storage_requirements=["standard"],
        ),
    ]


@pytest.fixture
def sample_equipment():
    """Create a sample list of equipment for testing."""
    return [
        Equipment(
            id="equipment-1",
            name="Reach Truck",
            type="reach_truck",
            max_height=30,
            min_aisle_width=8.5,
            units="ft",
            turning_radius=6.0,
        ),
        Equipment(
            id="equipment-2",
            name="Counterbalance Forklift",
            type="counterbalance",
            max_height=20,
            min_aisle_width=12.0,
            units="ft",
            turning_radius=8.0,
        ),
    ]


@pytest.fixture
def sample_layout():
    """Create a sample layout for testing."""
    return Layout(
        id="layout-1",
        name="Test Layout",
        facility_id="test-facility-1",
        racks=[
            {
                "id": "rack-1",
                "type": "selective",
                "x": 25,
                "y": 10,
                "length": 40,
                "width": 4,
                "height": 20,
                "orientation": 0,
                "levels": 4,
                "bays": 10,
            },
            {
                "id": "rack-2",
                "type": "selective",
                "x": 25,
                "y": 25,
                "length": 40,
                "width": 4,
                "height": 20,
                "orientation": 0,
                "levels": 4,
                "bays": 10,
            },
        ],
        aisles=[
            {
                "id": "aisle-1",
                "name": "Aisle 1",
                "width": 10,
                "path": [(25, 5), (65, 5)],
            },
            {
                "id": "aisle-2",
                "name": "Aisle 2",
                "width": 10,
                "path": [(25, 20), (65, 20)],
            },
        ],
    )


@pytest.fixture
def mock_db():
    """Create a mock database connection."""
    return MagicMock()


@pytest.fixture
def optimization_engine(sample_facility, sample_products, sample_equipment, mock_db):
    """Create an optimization engine instance for testing."""
    engine = OptimizationEngine(db=mock_db)
    engine.set_facility(sample_facility)
    engine.set_products(sample_products)
    engine.set_equipment(sample_equipment)
    return engine


@pytest.fixture
def temp_output_dir():
    """Create a temporary directory for test outputs."""
    with tempfile.TemporaryDirectory() as tmpdirname:
        yield tmpdirname