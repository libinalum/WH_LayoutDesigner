"""
Main entry point for the RackOptix backend.

This module provides a FastAPI application that exposes the optimization engine
through a REST API.
"""

import logging
import os
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .core.engine import OptimizationEngine
from .models.facility import Facility
from .models.layout import Layout, Rack, Aisle
from .models.equipment import Equipment
from .models.product import Product

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RackOptix Optimization Engine",
    description="API for warehouse layout optimization",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize optimization engine
engine = OptimizationEngine()

# Pydantic models for API
class OptimizationParameters(BaseModel):
    facility_id: str
    layout_id: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ElevationOptimizationParameters(BaseModel):
    layout_id: str
    rack_id: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class AisleOptimizationParameters(BaseModel):
    layout_id: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class SlottingOptimizationParameters(BaseModel):
    layout_id: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class EvaluationParameters(BaseModel):
    layout_id: str
    metrics: List[str] = Field(default_factory=list)


@app.get("/")
async def root():
    """Root endpoint that returns API information."""
    return {
        "name": "RackOptix Optimization Engine",
        "version": "0.1.0",
        "endpoints": [
            "/layouts",
            "/optimize",
            "/optimize/elevations",
            "/optimize/aisles",
            "/optimize/slotting",
            "/layouts/{layout_id}/evaluate"
        ]
    }


@app.post("/layouts")
async def generate_layout(params: OptimizationParameters):
    """
    Generate a new layout for a facility.
    
    Args:
        params: Optimization parameters
        
    Returns:
        Generated layout
    """
    try:
        # In a real implementation, this would fetch the facility, products, and equipment from a database
        # For now, we'll create dummy objects
        
        # Create dummy facility
        facility = Facility(
            id=params.facility_id,
            name="Test Facility",
            description="Test facility for layout generation",
            clear_height=32.0,
            boundary={
                "type": "Polygon",
                "coordinates": [[
                    [0, 0],
                    [0, 500],
                    [800, 500],
                    [800, 0],
                    [0, 0]
                ]]
            },
            obstructions=[]
        )
        
        # Create dummy products
        products = [
            Product(
                id=f"product-{i}",
                sku=f"SKU-{i:04d}",
                name=f"Product {i}",
                length=48,
                width=40,
                height=48,
                weight=1000,
                velocity_class="A" if i < 10 else ("B" if i < 30 else "C"),
                storage_method="pallet",
                monthly_throughput=100 if i < 10 else (50 if i < 30 else 10)
            )
            for i in range(50)
        ]
        
        # Create dummy equipment
        equipment = Equipment(
            id="equipment-1",
            type_id="forklift",
            name="Standard Forklift",
            reach_height=288,  # 24 feet
            min_aisle_width=12,  # 12 feet
            max_aisle_width=14,  # 14 feet
            turning_radius=96,  # 8 feet
            lift_capacity=4000  # 4000 lbs
        )
        
        # Generate layout
        layout = engine.optimize_layout(
            facility=facility,
            products=products,
            equipment=equipment,
            parameters=params.parameters
        )
        
        # Convert layout to dictionary for JSON response
        layout_dict = {
            "id": layout.id,
            "facility_id": layout.facility_id,
            "name": layout.name,
            "description": layout.description,
            "status": layout.status,
            "parameters": layout.parameters,
            "metrics": layout.metrics,
            "racks": [
                {
                    "id": rack.id,
                    "layout_id": rack.layout_id,
                    "rack_type_id": rack.rack_type_id,
                    "location": rack.location,
                    "orientation": rack.orientation,
                    "height": rack.height,
                    "length": rack.length,
                    "depth": rack.depth,
                    "bays": rack.bays,
                    "configuration": rack.configuration
                }
                for rack in layout.racks
            ],
            "aisles": [
                {
                    "id": aisle.id,
                    "layout_id": aisle.layout_id,
                    "path": aisle.path,
                    "width": aisle.width,
                    "properties": aisle.properties
                }
                for aisle in layout.aisles
            ]
        }
        
        return layout_dict
    
    except Exception as e:
        logger.error(f"Error generating layout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize")
async def optimize_layout(params: OptimizationParameters):
    """
    Optimize an existing layout.
    
    Args:
        params: Optimization parameters
        
    Returns:
        Optimized layout
    """
    try:
        # In a real implementation, this would fetch the layout, facility, products, and equipment from a database
        # For now, we'll create dummy objects and return a dummy response
        
        return {
            "layout_id": params.layout_id,
            "metrics": {
                "storage_density": 0.85,
                "space_utilization": 0.78,
                "pallet_positions": 1500,
                "travel_distance": 45.6,
                "accessibility_score": 0.88,
                "throughput_capacity": 120
            }
        }
    
    except Exception as e:
        logger.error(f"Error optimizing layout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize/elevations")
async def optimize_elevations(params: ElevationOptimizationParameters):
    """
    Optimize beam elevations for a rack.
    
    Args:
        params: Optimization parameters
        
    Returns:
        Optimized beam elevations
    """
    try:
        # In a real implementation, this would fetch the layout, rack, products, and equipment from a database
        # For now, we'll return a dummy response
        
        return {
            "rack_id": params.rack_id,
            "beam_elevations": [0, 6, 12, 18, 24],
            "metrics": {
                "pallet_positions": 12,
                "storage_efficiency": 0.85,
                "vertical_utilization": 0.9
            }
        }
    
    except Exception as e:
        logger.error(f"Error optimizing elevations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize/aisles")
async def optimize_aisles(params: AisleOptimizationParameters):
    """
    Optimize aisle widths for a layout.
    
    Args:
        params: Optimization parameters
        
    Returns:
        Optimized aisle widths
    """
    try:
        # In a real implementation, this would fetch the layout and equipment from a database
        # For now, we'll return a dummy response
        
        return {
            "layout_id": params.layout_id,
            "optimized_aisles": [
                {
                    "id": "aisle-1",
                    "width": 12.5
                },
                {
                    "id": "aisle-2",
                    "width": 11.0
                },
                {
                    "id": "cross-1",
                    "width": 13.0
                }
            ],
            "metrics": {
                "storage_density": 0.82,
                "space_utilization": 0.75,
                "accessibility_score": 0.88
            }
        }
    
    except Exception as e:
        logger.error(f"Error optimizing aisles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize/slotting")
async def optimize_slotting(params: SlottingOptimizationParameters):
    """
    Optimize SKU slotting for a layout.
    
    Args:
        params: Optimization parameters
        
    Returns:
        Optimized product assignments
    """
    try:
        # In a real implementation, this would fetch the layout and products from a database
        # For now, we'll return a dummy response
        
        return {
            "layout_id": params.layout_id,
            "assignments": [
                {
                    "product_id": "product-1",
                    "location_id": "loc-rack-1-0-0",
                    "quantity": 1
                },
                {
                    "product_id": "product-2",
                    "location_id": "loc-rack-1-0-1",
                    "quantity": 1
                },
                {
                    "product_id": "product-3",
                    "location_id": "loc-rack-1-1-0",
                    "quantity": 1
                }
            ],
            "metrics": {
                "slotting_efficiency": 0.85,
                "travel_efficiency": 0.78,
                "pick_rate": 85
            }
        }
    
    except Exception as e:
        logger.error(f"Error optimizing slotting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/layouts/{layout_id}/evaluate")
async def evaluate_layout(
    layout_id: str,
    metrics: Optional[str] = Query(None, description="Comma-separated list of metrics to calculate")
):
    """
    Evaluate a layout and calculate metrics.
    
    Args:
        layout_id: Layout ID
        metrics: Comma-separated list of metrics to calculate
        
    Returns:
        Evaluation results
    """
    try:
        # Parse metrics
        metrics_list = metrics.split(',') if metrics else []
        
        # In a real implementation, this would fetch the layout from a database
        # For now, we'll return a dummy response
        
        # Create dummy metrics
        all_metrics = {
            "storage_density": 0.82,
            "space_utilization": 0.75,
            "pallet_positions": 1350,
            "travel_distance": 48.2,
            "accessibility_score": 0.88,
            "throughput_capacity": 120,
            "slotting_efficiency": 0.85,
            "travel_efficiency": 0.78,
            "pick_rate": 85
        }
        
        # Filter metrics if specified
        if metrics_list:
            return {metric: all_metrics[metric] for metric in metrics_list if metric in all_metrics}
        
        return all_metrics
    
    except Exception as e:
        logger.error(f"Error evaluating layout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run server
    print("Backend: Starting RackOptix Backend...") # Added log
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)